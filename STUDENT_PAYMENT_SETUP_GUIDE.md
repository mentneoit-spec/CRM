# Student Payment System - Setup Guide

## Quick Setup

### Step 1: Get Razorpay Credentials

1. Go to https://razorpay.com
2. Sign up or log in
3. Go to Settings → API Keys
4. Copy your **Key ID** and **Key Secret**

### Step 2: Configure Backend

Edit `gravity-crm/backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_SECRET=xxxxxxxxxxxxxxxx
```

### Step 3: Configure Frontend

Edit `gravity-crm/frontend/.env`:

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

### Step 4: Restart Services

```bash
# Backend
cd gravity-crm/backend
npm start

# Frontend (in another terminal)
cd gravity-crm/frontend
npm start
```

## Testing Payment Flow

### Test Credentials (Razorpay Sandbox)

Use these test cards in Razorpay checkout:

**Visa Card:**
- Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

**UPI:**
- Any UPI ID (e.g., test@razorpay)

### Test Steps

1. Login as Student
2. Go to Fees page
3. Click "Pay" on any pending fee
4. Enter amount (e.g., ₹1000)
5. Click "Pay Now"
6. Razorpay checkout opens
7. Use test card details
8. Complete payment
9. Fees page auto-refreshes
10. Fee status changes to "Paid ✓"

## Troubleshooting

### Payment Dialog Not Opening

**Issue:** Razorpay script not loading
**Solution:** 
- Check browser console for errors
- Verify `REACT_APP_RAZORPAY_KEY_ID` is set in `.env`
- Restart frontend server

### Payment Verification Failed

**Issue:** "Invalid payment signature"
**Solution:**
- Verify `RAZORPAY_SECRET` is correct in backend `.env`
- Check that both Key ID and Secret match
- Restart backend server

### Fees Not Updating After Payment

**Issue:** Page doesn't refresh after payment
**Solution:**
- Check browser console for API errors
- Verify student is authenticated
- Check network tab for `/student/fees` request
- Verify backend is running on port 5001

### Razorpay Checkout Not Appearing

**Issue:** Payment dialog shows but checkout doesn't open
**Solution:**
- Check if `window.Razorpay` is defined
- Verify Razorpay script loaded (check Network tab)
- Check browser console for JavaScript errors
- Try in incognito mode (ad blockers might interfere)

## Production Deployment

### Before Going Live

1. **Switch to Live Keys**
   - Get live Key ID and Secret from Razorpay
   - Update `.env` files with live credentials

2. **Enable HTTPS**
   - Razorpay requires HTTPS in production
   - Update API URLs to use HTTPS

3. **Test Thoroughly**
   - Test with real payment methods
   - Test error scenarios
   - Test on different devices/browsers

4. **Set Up Webhooks** (Optional)
   - Configure Razorpay webhooks for payment notifications
   - Endpoint: `POST /api/webhooks/razorpay`

5. **Monitor Payments**
   - Check payment logs regularly
   - Monitor failed payments
   - Set up alerts for payment issues

## Payment Flow Diagram

```
Student Portal
    ↓
[Fees Page] → Click "Pay"
    ↓
[Payment Dialog] → Enter Amount
    ↓
[Pay Now Button] → Create Payment Order
    ↓
Backend: POST /api/student/payments
    ↓
Razorpay: Create Order
    ↓
[Razorpay Checkout] → Student Enters Card/UPI
    ↓
Razorpay: Process Payment
    ↓
Backend: POST /api/student/payments/verify
    ↓
Verify Signature & Update Status
    ↓
Frontend: Auto-Refresh Fees
    ↓
[Fees Page] → Status Updated to "Paid ✓"
```

## API Response Examples

### Successful Payment Creation

```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "data": {
    "paymentId": "clm1a2b3c4d5e6f7g8h9i0j",
    "razorpayOrderId": "order_1a2b3c4d5e6f7g",
    "amount": 5000,
    "studentId": "clm1a2b3c4d5e6f7g8h9i0j",
    "studentName": "John Doe"
  }
}
```

### Successful Payment Verification

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "id": "clm1a2b3c4d5e6f7g8h9i0j",
    "transactionId": "pay_1a2b3c4d5e6f7g",
    "amount": 5000,
    "status": "completed",
    "paidAt": "2024-03-21T10:30:00.000Z",
    "studentId": "clm1a2b3c4d5e6f7g8h9i0j",
    "collegeId": "clm1a2b3c4d5e6f7g8h9i0j"
  }
}
```

## Support

For issues:
1. Check browser console for errors
2. Check backend logs
3. Verify Razorpay credentials
4. Check network requests in DevTools
5. Review error messages in payment dialog

## Security Notes

✅ All payments are verified with Razorpay signature
✅ Student identity verified before payment
✅ College isolation enforced (multi-tenancy)
✅ Payment amounts validated on backend
✅ HTTPS required for production
✅ Sensitive data not logged

## FAQ

**Q: Can students pay partial fees?**
A: Yes, they can enter any amount from ₹1 to pending amount.

**Q: What happens if payment fails?**
A: Payment status remains "pending", student can retry.

**Q: Can students see payment history?**
A: Yes, at `/student/payments` endpoint.

**Q: Are payments instant?**
A: Yes, fees update immediately after verification.

**Q: Can parents also pay?**
A: Yes, parents have similar payment system at `/parent/payments`.

**Q: What payment methods are supported?**
A: All methods supported by Razorpay (Cards, UPI, Wallets, etc.)

**Q: Is there a transaction fee?**
A: Razorpay charges standard processing fees (varies by method).
