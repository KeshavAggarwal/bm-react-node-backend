# 🚀 Deployment Checklist - RevenueCat Payment Integration

## ✅ What Was Implemented

### Backend Changes

#### 1. **Database Model Updates** (`src/models/userBioData.ts`)
- ✅ Added RevenueCat-specific fields:
  - `revenuecat_transaction_id`
  - `revenuecat_app_user_id`
  - `revenuecat_product_id`
  - `revenuecat_webhook_received_at`
  - `revenuecat_webhook_event_type`
  - `revenuecat_webhook_payload`
  - `pdf_generated`
  - `pdf_generated_at`

#### 2. **New Webhook Route** (`src/routes/webhook.ts`)
- ✅ Handles RevenueCat `NON_RENEWING_PURCHASE` events
- ✅ Verifies webhook signatures (HMAC-SHA256)
- ✅ Parses `app_user_id` to link payment to biodata
- ✅ Updates payment status in database
- ✅ Prevents duplicate processing
- ✅ Comprehensive logging

#### 3. **Updated Biodata Routes** (`src/routes/biodata.ts`)
- ✅ `POST /biodata/create` - Returns `app_user_id` for RevenueCat
- ✅ `GET /biodata/:id/status` - Poll payment status
- ✅ `GET /biodata/:id/download` - Secure PDF download (payment required)
- ✅ All routes include proper authentication and validation

#### 4. **Documentation**
- ✅ `REVENUECAT_IMPLEMENTATION.md` - Complete implementation guide
- ✅ `API_QUICK_REFERENCE.md` - Quick API reference
- ✅ This deployment checklist

---

## 📋 Pre-Deployment Tasks

### 1. Environment Configuration

**Add to your `.env` file:**

```bash
# Required: Get from RevenueCat Dashboard > Integrations > Webhooks
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret_here
```

**To get the webhook secret:**
1. Login to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Go to **Project Settings** > **Integrations** > **Webhooks**
3. Click **+ New Webhook**
4. Enter your webhook URL (see step 2 below)
5. Select event: **Non Renewing Purchase**
6. Copy the **Webhook Secret** that's generated
7. Paste into your `.env` file

---

### 2. RevenueCat Webhook Setup

**Configure webhook in RevenueCat:**

| Field | Value |
|-------|-------|
| **Webhook URL** | `https://your-domain.com/api/webhook/revenuecat` |
| **Events** | ✅ Non Renewing Purchase |
| **Authorization** | (Leave empty - signature verification used) |

**Important Notes:**
- URL must be **publicly accessible** (not localhost)
- Use **HTTPS** in production
- RevenueCat will send test webhook immediately after setup

---

### 3. MongoDB Migrations

**No explicit migration needed** - Mongoose will handle new fields automatically.

**However, verify indexes are created:**

```javascript
// Optional: Run in MongoDB shell to verify indexes
db.userbiodatas.getIndexes()

// Should see indexes on:
// - user_id
// - revenuecat_transaction_id
```

---

### 4. Server Configuration

**Ensure server accepts webhooks:**

- ✅ Route `/api/webhook/revenuecat` is accessible
- ✅ POST requests allowed
- ✅ No rate limiting on webhook endpoint (or whitelist RevenueCat IPs)
- ✅ Body parser configured for JSON

---

## 🧪 Testing Before Production

### 1. Test Create Biodata API

```bash
curl -X POST http://localhost:3000/api/biodata/create \
  -H "Authorization: Bearer YOUR_TEST_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tId": "eg1",
    "fd": {"name": "Test User", "age": "25"},
    "imagePath": null,
    "channel": "ANDROID",
    "amount": 99,
    "currency": "INR"
  }'
```

**Expected Response:**
```json
{
  "status": true,
  "data": {
    "id": "...",
    "app_user_id": "firebase_uid_..."
  }
}
```

---

### 2. Test Webhook (Manual)

```bash
# Generate test signature
node -e "
const crypto = require('crypto');
const payload = JSON.stringify({
  event: {
    type: 'NON_RENEWING_PURCHASE',
    app_user_id: 'testuser_BIODATA_ID_HERE',
    transaction_id: 'test_txn_123',
    product_id: 'test_product',
    price: 99,
    currency: 'INR',
    purchased_at_ms: Date.now()
  }
});
const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
const hmac = crypto.createHmac('sha256', secret);
hmac.update(payload);
console.log('Signature:', hmac.digest('hex'));
console.log('Payload:', payload);
"

# Send test webhook
curl -X POST http://localhost:3000/api/webhook/revenuecat \
  -H "Content-Type: application/json" \
  -H "X-RevenueCat-Signature: SIGNATURE_FROM_ABOVE" \
  -d 'PAYLOAD_FROM_ABOVE'
```

---

### 3. Test Status Polling

```bash
curl http://localhost:3000/api/biodata/BIODATA_ID/status \
  -H "Authorization: Bearer YOUR_TEST_FIREBASE_TOKEN"
```

**Expected (before payment):**
```json
{
  "status": true,
  "data": {
    "payment_status": "PAYMENT_INITIATED",
    "pdf_ready": false,
    "transaction_id": null
  }
}
```

**Expected (after webhook):**
```json
{
  "status": true,
  "data": {
    "payment_status": "PAYMENT_SUCCESS",
    "pdf_ready": true,
    "transaction_id": "test_txn_123"
  }
}
```

---

### 4. Test PDF Download

```bash
# Should fail if not paid
curl http://localhost:3000/api/biodata/UNPAID_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: 403 Forbidden

# Should work if paid
curl http://localhost:3000/api/biodata/PAID_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o test.pdf
# Expected: PDF file downloaded
```

---

### 5. Test End-to-End (with RevenueCat Sandbox)

1. **Create biodata** via API
2. **Get app_user_id** from response
3. **Configure RevenueCat** with sandbox API key
4. **Make test purchase** using sandbox account
5. **Verify webhook received** (check server logs)
6. **Poll status** until `pdf_ready: true`
7. **Download PDF** successfully

---

## 🔍 Monitoring & Logging

### Check These Logs After Deployment

**Webhook received:**
```
📥 RevenueCat webhook received
📝 Event type: NON_RENEWING_PURCHASE
💳 Transaction ID: GPA.1234...
👤 App User ID: userId_biodataId
```

**Payment processed:**
```
✅ Updating payment status for biodata: 507f...
🎉 Payment successfully processed for biodata: 507f...
```

**PDF generated:**
```
🎯 Generating PDF for biodata: 507f...
✅ PDF generated successfully for biodata: 507f...
```

**Errors to watch:**
```
❌ Invalid webhook signature
❌ Biodata not found for ID: ...
❌ Transaction already processed: ...
```

---

## 🔒 Security Verification

Before going live, verify:

- [ ] Webhook signature verification is enabled
- [ ] `REVENUECAT_WEBHOOK_SECRET` is set in production env
- [ ] Firebase authentication is required on all endpoints
- [ ] Users can only access their own biodata
- [ ] PDF download checks payment status
- [ ] HTTPS is enabled in production
- [ ] Environment variables are not committed to git

---

## 📊 Database Queries for Monitoring

```javascript
// Check recent payments
db.userbiodatas.find({
  payment_status: "PAYMENT_SUCCESS",
  revenuecat_webhook_received_at: {
    $gte: new Date(Date.now() - 24*60*60*1000) // Last 24 hours
  }
}).count()

// Check pending payments
db.userbiodatas.find({
  payment_status: "PAYMENT_INITIATED",
  created_on: {
    $gte: new Date(Date.now() - 60*60*1000) // Last hour
  }
}).count()

// Check failed/stuck payments (created > 1 hour ago, still pending)
db.userbiodatas.find({
  payment_status: "PAYMENT_INITIATED",
  created_on: {
    $lt: new Date(Date.now() - 60*60*1000)
  }
})

// Check duplicate transactions
db.userbiodatas.aggregate([
  { $match: { revenuecat_transaction_id: { $ne: null } } },
  { $group: { _id: "$revenuecat_transaction_id", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

---

## 🚨 Rollback Plan

If something goes wrong:

1. **Webhook issues:**
   - Disable webhook in RevenueCat Dashboard
   - Fix and redeploy
   - Re-enable webhook

2. **Database issues:**
   - No migration needed, safe to rollback code
   - New fields will be ignored by old code

3. **Payment not processing:**
   - Users can retry payment
   - Webhook will fire again
   - Idempotency prevents duplicates

---

## ✅ Final Deployment Checklist

### Pre-Deploy
- [ ] Code reviewed and tested locally
- [ ] Environment variables configured
- [ ] RevenueCat webhook URL configured
- [ ] Webhook secret obtained and stored securely
- [ ] Database indexes verified
- [ ] Unit tests passing (if applicable)

### Deploy
- [ ] Deploy code to production
- [ ] Verify server is running
- [ ] Check logs for startup errors
- [ ] Test webhook endpoint is accessible

### Post-Deploy
- [ ] Make test purchase with sandbox
- [ ] Verify webhook received and processed
- [ ] Check database updated correctly
- [ ] Test PDF download works
- [ ] Monitor logs for first hour
- [ ] Test with real purchase (if possible)

### Android App
- [ ] Update API endpoints if changed
- [ ] Configure production RevenueCat API key
- [ ] Test create → purchase → poll → download flow
- [ ] Test error handling (no payment, timeout, etc.)
- [ ] Deploy to beta testers
- [ ] Monitor crash reports

---

## 📞 Support & Troubleshooting

**If webhook not received:**
1. Check RevenueCat Event History
2. Verify webhook URL is correct
3. Check server logs
4. Test webhook manually

**If payment not updating:**
1. Check `app_user_id` format
2. Verify biodata ID exists
3. Check webhook signature
4. Review server logs

**If PDF download fails:**
1. Verify payment status is "PAYMENT_SUCCESS"
2. Check user authentication
3. Verify template exists
4. Check server logs

---

## 📚 Additional Resources

- [RevenueCat Documentation](https://docs.revenuecat.com)
- [RevenueCat Webhook Guide](https://docs.revenuecat.com/docs/webhooks)
- [MongoDB Indexes](https://docs.mongodb.com/manual/indexes/)
- [Firebase Auth](https://firebase.google.com/docs/auth)

---

**Ready to deploy?** Follow this checklist step by step! 🎉

**Last Updated:** December 3, 2025
**Version:** 1.0.0

