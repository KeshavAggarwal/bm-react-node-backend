# RevenueCat Payment Implementation Guide

## 🎯 Overview

This document explains the secure payment flow using RevenueCat for biodata PDF generation.

## 🏗️ Architecture: Webhook-First Approach

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Android   │      │   Backend   │      │ RevenueCat  │      │ Google Play │
│     App     │      │    (API)    │      │  (Webhook)  │      │   Billing   │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
      │                      │                     │                     │
      │  1. Fill Form        │                     │                     │
      │─────────────────────>│                     │                     │
      │                      │                     │                     │
      │  2. POST /biodata/create                   │                     │
      │     {tId, fd, imagePath, channel}          │                     │
      │<─────────────────────│                     │                     │
      │  Returns: {id, app_user_id}                │                     │
      │                      │                     │                     │
      │  3. Initiate Purchase│                     │                     │
      │     with app_user_id │                     │                     │
      │─────────────────────────────────────────────────────────────────>│
      │                      │                     │                     │
      │  4. User Pays        │                     │                     │
      │<─────────────────────────────────────────────────────────────────│
      │                      │                     │                     │
      │                      │  5. Webhook: NON_RENEWING_PURCHASE        │
      │                      │<────────────────────│                     │
      │                      │  POST /webhook/revenuecat                 │
      │                      │  - Verify signature │                     │
      │                      │  - Parse app_user_id│                     │
      │                      │  - Update DB        │                     │
      │                      │  - Mark as PAID     │                     │
      │                      │                     │                     │
      │  6. Poll Status      │                     │                     │
      │─────────────────────>│                     │                     │
      │  GET /biodata/:id/status                   │                     │
      │<─────────────────────│                     │                     │
      │  Returns: {payment_status, pdf_ready}      │                     │
      │                      │                     │                     │
      │  7. Download PDF     │                     │                     │
      │─────────────────────>│                     │                     │
      │  GET /biodata/:id/download                 │                     │
      │<─────────────────────│                     │                     │
      │  Returns: PDF Stream │                     │                     │
```

## 📋 API Endpoints

### 1. Create Biodata Entry

**Endpoint:** `POST /biodata/create`

**Authentication:** Required (Firebase JWT)

**Request Body:**
```json
{
  "tId": "eg1",
  "fd": {
    "name": "John Doe",
    "age": 25,
    // ... other form fields
  },
  "imagePath": "https://example.com/photo.jpg",
  "channel": "ANDROID",
  "amount": 99,
  "currency": "INR"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "app_user_id": "firebase_uid_507f1f77bcf86cd799439011"
  },
  "error": null
}
```

**Important:** Use `app_user_id` when initiating RevenueCat purchase!

---

### 2. Check Payment Status (Polling)

**Endpoint:** `GET /biodata/:id/status`

**Authentication:** Required (Firebase JWT)

**Response:**
```json
{
  "status": true,
  "data": {
    "payment_status": "PAYMENT_SUCCESS",
    "pdf_ready": true,
    "transaction_id": "GPA.1234-5678-9012-34567"
  },
  "error": null
}
```

**Usage:**
- Poll every 2-3 seconds after payment initiated
- Stop polling when `pdf_ready: true`
- Timeout after 30-60 seconds

---

### 3. Download PDF

**Endpoint:** `GET /biodata/:id/download`

**Authentication:** Required (Firebase JWT)

**Response:** PDF file stream

**Security:**
- Only works if `payment_status === "PAYMENT_SUCCESS"`
- User must own the biodata entry
- Returns 403 if payment not completed

---

### 4. RevenueCat Webhook (Internal)

**Endpoint:** `POST /webhook/revenuecat`

**Authentication:** Webhook signature verification

**Handled Events:**
- `NON_RENEWING_PURCHASE` - One-time purchase completed

**Webhook Payload:**
```json
{
  "event": {
    "type": "NON_RENEWING_PURCHASE",
    "app_user_id": "firebase_uid_507f1f77bcf86cd799439011",
    "transaction_id": "GPA.1234-5678-9012-34567",
    "product_id": "biodata_pdf_basic",
    "price": 99,
    "currency": "INR",
    "purchased_at_ms": 1701234567890
  }
}
```

---

## 🔧 Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```bash
# RevenueCat Webhook Secret
# Get this from RevenueCat Dashboard > Integrations > Webhooks
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. RevenueCat Dashboard Configuration

1. Go to RevenueCat Dashboard
2. Navigate to **Project Settings > Integrations > Webhooks**
3. Add new webhook:
   - **URL:** `https://your-backend-url.com/api/webhook/revenuecat`
   - **Events to send:** Select `NON_RENEWING_PURCHASE`
   - **Copy the webhook secret** and add to `.env`

### 3. Server Configuration

Ensure your server can receive POST requests from RevenueCat:
- No authentication required (signature verification handles security)
- Should return 200 even on errors (prevents retry storms)

---

## 📱 Android Implementation

### Step 1: Create Biodata Entry

```kotlin
// After user fills form
val response = apiService.createBiodata(
    tId = templateId,
    fd = formData,
    imagePath = imageUri,
    channel = "ANDROID"
)

val biodataId = response.data.id
val appUserId = response.data.app_user_id

// Store these locally
prefs.biodataId = biodataId
```

### Step 2: Initiate RevenueCat Purchase

```kotlin
// Configure RevenueCat with the app_user_id
Purchases.configure(
    context = context,
    apiKey = "your_revenuecat_api_key",
    appUserID = appUserId  // Use the app_user_id from API response
)

// Fetch offerings and purchase
Purchases.sharedInstance.getOfferingsWith { offerings ->
    offerings.current?.availablePackages?.firstOrNull()?.let { pkg ->
        Purchases.sharedInstance.purchaseWith(
            PurchaseParams.Builder(activity, pkg).build()
        ) { transaction, customerInfo ->
            if (customerInfo.entitlements["biodata_pdf"]?.isActive == true) {
                // Purchase successful, start polling
                startPollingPaymentStatus(biodataId)
            }
        }
    }
}
```

### Step 3: Poll Payment Status

```kotlin
suspend fun pollPaymentStatus(biodataId: String): Boolean {
    val maxAttempts = 30  // 30 attempts
    val delayMs = 2000L   // 2 seconds between attempts
    
    repeat(maxAttempts) { attempt ->
        val response = apiService.getBiodataStatus(biodataId)
        
        if (response.data.pdf_ready) {
            return true  // Payment confirmed!
        }
        
        if (attempt < maxAttempts - 1) {
            delay(delayMs)
        }
    }
    
    return false  // Timeout
}
```

### Step 4: Download PDF

```kotlin
// After payment confirmed
val pdfUrl = "/biodata/$biodataId/download"
// Use your HTTP client to download and save PDF
```

---

## 🔒 Security Features

### 1. Webhook Signature Verification
- Uses HMAC-SHA256 to verify webhook authenticity
- Prevents fake payment notifications
- Rejects unauthorized webhook calls

### 2. User Ownership Verification
- Every endpoint checks user owns the biodata
- Firebase UID stored with each entry
- Cannot access other users' data

### 3. Payment Status Checks
- PDF download ONLY works after payment confirmed
- Status checked in database (not client-side)
- No way to bypass payment

### 4. Idempotency
- Duplicate webhooks handled gracefully
- Transaction IDs prevent double-processing
- Safe to retry failed requests

---

## 🧪 Testing

### Test Webhook Locally

```bash
# 1. Use ngrok to expose local server
ngrok http 3000

# 2. Add ngrok URL to RevenueCat webhook settings
https://abc123.ngrok.io/api/webhook/revenuecat

# 3. Make a test purchase
# 4. Check logs to see webhook received
```

### Test Signature Verification

```javascript
const crypto = require('crypto');

const payload = JSON.stringify(webhookData);
const secret = process.env.REVENUECAT_WEBHOOK_SECRET;

const hmac = crypto.createHmac('sha256', secret);
hmac.update(payload);
const signature = hmac.digest('hex');

console.log('Expected signature:', signature);
```

---

## 📊 Database Schema Updates

New fields added to `UserBioData` model:

```typescript
{
  // ... existing fields ...
  
  // RevenueCat specific fields
  revenuecat_transaction_id: string | null,
  revenuecat_app_user_id: string | null,
  revenuecat_product_id: string | null,
  revenuecat_webhook_received_at: Date | null,
  revenuecat_webhook_event_type: string | null,
  revenuecat_webhook_payload: Record<string, any> | null,
  
  // PDF tracking
  pdf_generated: boolean,
  pdf_generated_at: Date | null
}
```

---

## 🐛 Troubleshooting

### Webhook Not Received

1. **Check RevenueCat Dashboard:**
   - Go to Event History
   - Verify event was sent
   - Check response status

2. **Check Server Logs:**
   - Look for "📥 RevenueCat webhook received"
   - Verify no errors in processing

3. **Verify Webhook URL:**
   - Must be publicly accessible
   - HTTPS recommended
   - Check firewall settings

### Payment Status Not Updating

1. **Check app_user_id format:**
   - Must be: `userId_biodataId`
   - Verify correct ID used in RevenueCat

2. **Check database:**
   ```javascript
   db.userbiodatas.find({ _id: "biodataId" })
   // Check payment_status and revenuecat_transaction_id
   ```

3. **Verify webhook processed:**
   - Check `revenuecat_webhook_received_at` field
   - Should be populated after webhook

### PDF Download Fails

1. **Check payment status:**
   ```bash
   GET /biodata/:id/status
   # Verify payment_status === "PAYMENT_SUCCESS"
   ```

2. **Check user ownership:**
   - Verify correct Firebase token
   - Check user_id matches

3. **Check template_id:**
   - Verify template exists
   - Check template rendering logs

---

## 📈 Monitoring

### Key Metrics to Track

1. **Webhook Success Rate:**
   - Count webhooks received
   - Check for processing errors
   - Monitor retry attempts

2. **Payment Conversion:**
   - Track: Created → Paid → Downloaded
   - Identify drop-off points

3. **Processing Time:**
   - Webhook receipt to DB update
   - PDF generation time

### Logging

The implementation includes comprehensive logging:

```
📥 RevenueCat webhook received
📝 Event type: NON_RENEWING_PURCHASE
💳 Transaction ID: GPA.1234-5678-9012-34567
👤 App User ID: userId_biodataId
📦 Product ID: biodata_pdf_basic
🔍 Looking for biodata ID: 507f1f77bcf86cd799439011
✅ Updating payment status for biodata: 507f1f77bcf86cd799439011
🎉 Payment successfully processed for biodata: 507f1f77bcf86cd799439011
```

---

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] RevenueCat webhook URL set
- [ ] Webhook secret added to `.env`
- [ ] HTTPS enabled on server
- [ ] Firewall allows RevenueCat IPs
- [ ] MongoDB indexes created
- [ ] Logging configured
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] Test purchase completed
- [ ] Webhook signature verified
- [ ] Android app tested end-to-end

---

## 💡 Best Practices

1. **Always use app_user_id:** Don't rely on client-side payment verification
2. **Poll with timeout:** Don't poll forever, timeout after 60 seconds
3. **Handle errors gracefully:** Show user-friendly messages
4. **Log everything:** Webhooks, payments, errors for debugging
5. **Test with sandbox:** Use RevenueCat sandbox for testing
6. **Monitor webhooks:** Set up alerts for failed webhooks
7. **Keep webhook payload:** Store full payload for audit trail

---

## 📞 Support

For issues or questions:
1. Check logs first
2. Review this documentation
3. Test with RevenueCat sandbox
4. Contact RevenueCat support if webhook issues

---

**Last Updated:** December 3, 2025
**Version:** 1.0.0

