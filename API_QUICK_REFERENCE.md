# Biodata API Quick Reference

## 🔑 Authentication

All endpoints (except webhook) require Firebase JWT token in header:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

---

## 📍 Endpoints

### 1. Create Biodata (Before Payment)

```http
POST /api/biodata/create
Content-Type: application/json
Authorization: Bearer <firebase_token>

{
  "tId": "eg1",
  "fd": { /* form data object */ },
  "imagePath": "https://example.com/image.jpg",
  "channel": "ANDROID",
  "amount": 99,
  "currency": "INR"
}
```

**Response (201):**
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

**Use `app_user_id` when calling RevenueCat!**

---

### 2. Check Payment Status (Polling)

```http
GET /api/biodata/:id/status
Authorization: Bearer <firebase_token>
```

**Response (200):**
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

**Payment Status Values:**
- `PAYMENT_INITIATED` - Just created, not paid yet
- `PAYMENT_SUCCESS` - Paid, PDF ready
- `PAYMENT_ERROR` - Payment failed

---

### 3. Download PDF

```http
GET /api/biodata/:id/download
Authorization: Bearer <firebase_token>
```

**Response (200):** PDF file stream

**Response (403) if not paid:**
```json
{
  "status": false,
  "data": null,
  "error": {
    "message": "Payment not completed. Cannot download PDF.",
    "code": 403
  }
}
```

---

### 4. List User's Biodata

```http
GET /api/biodata
Authorization: Bearer <firebase_token>
```

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "template_id": "eg1",
      "form_data": "...",
      "image_path": "...",
      "created_on": "2025-12-03T10:00:00.000Z"
    }
  ],
  "error": null
}
```

---

### 5. Get Specific Biodata

```http
GET /api/biodata/:id
Authorization: Bearer <firebase_token>
```

**Response (200):**
```json
{
  "status": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "template_id": "eg1",
    "form_data": "...",
    "image_path": "...",
    "created_on": "2025-12-03T10:00:00.000Z"
  },
  "error": null
}
```

---

### 6. RevenueCat Webhook (Internal)

```http
POST /api/webhook/revenuecat
Content-Type: application/json
X-RevenueCat-Signature: <hmac_signature>

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

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "biodata_id": "507f1f77bcf86cd799439011",
  "transaction_id": "GPA.1234-5678-9012-34567"
}
```

---

## 🔄 Complete Flow

```
1. POST /api/biodata/create
   └─> Get: { id, app_user_id }

2. Configure RevenueCat with app_user_id
   └─> User completes payment

3. Webhook fires automatically
   └─> Backend updates payment status

4. Poll: GET /api/biodata/:id/status
   └─> Wait for: pdf_ready === true

5. Download: GET /api/biodata/:id/download
   └─> Get PDF file
```

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (payment not completed) |
| 404 | Not found (biodata doesn't exist or doesn't belong to user) |
| 500 | Internal server error |

---

## 🔒 Security Notes

1. **Always authenticate:** All endpoints require Firebase token
2. **User isolation:** Can only access own biodata
3. **Payment required:** Cannot download PDF without payment
4. **Webhook verified:** Signature checked on all webhooks

---

## 📱 Android Example

```kotlin
// 1. Create biodata
val response = api.createBiodata(
    tId = "eg1",
    fd = formData,
    imagePath = imageUri,
    channel = "ANDROID"
)
val biodataId = response.data.id
val appUserId = response.data.app_user_id

// 2. Configure RevenueCat
Purchases.configure(context, apiKey, appUserID = appUserId)

// 3. Make purchase
Purchases.sharedInstance.purchaseWith(params) { ... }

// 4. Poll status
suspend fun waitForPayment(id: String): Boolean {
    repeat(30) {
        val status = api.getBiodataStatus(id)
        if (status.data.pdf_ready) return true
        delay(2000)
    }
    return false
}

// 5. Download PDF
val pdfUrl = "/api/biodata/$biodataId/download"
```

---

## 🧪 Testing with cURL

```bash
# 1. Create biodata
curl -X POST http://localhost:3000/api/biodata/create \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tId": "eg1",
    "fd": {"name": "Test User"},
    "imagePath": null,
    "channel": "ANDROID"
  }'

# 2. Check status
curl http://localhost:3000/api/biodata/BIODATA_ID/status \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# 3. Download PDF (only works if paid)
curl http://localhost:3000/api/biodata/BIODATA_ID/download \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -o biodata.pdf
```

---

## 🌍 Environment Setup

Required environment variables:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/biodata-app

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-key.json

# RevenueCat
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret
```

Get webhook secret from: **RevenueCat Dashboard > Integrations > Webhooks**

---

**Last Updated:** December 3, 2025

