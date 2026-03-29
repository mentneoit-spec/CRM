# Payment System - Quick Start Testing Guide

**Status**: ✅ READY TO TEST

---

## Quick Links

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001
- **API Docs**: See PAYMENT_SYSTEM_COMPLETE_STATUS.md

---

## Test in 5 Minutes

### 1. Login (30 seconds)
```
URL: http://localhost:3000
Email: rohan.singh@student.edu
Password: 4
```

### 2. Go to Fees (10 seconds)
- Click "Fees" in the student menu
- You should see fees with "Pay" buttons

### 3. Click Pay (20 seconds)
- Click "Pay" button next to any fee
- Enter amount (e.g., 100)
- Click "Pay Now"

### 4. Complete Payment (2 minutes)
- Razorpay checkout opens
- Use test card: `4111 1111 1111 1111`
- Expiry: `12/25`
- CVV: `123`
- OTP: Any 6 digits
- Click "Pay"

### 5. Verify Success (30 seconds)
- Success message appears
- Fees page auto-refreshes
- Payment status updates

---

## Test Credentials

| Field | Value |
|-------|-------|
| Email | rohan.singh@student.edu |
| Password | 4 |
| Name | Rohan Singh |

---

## Test Card

| Field | Value |
|-------|-------|
| Card | 4111 1111 1111 1111 |
| Expiry | 12/25 |
| CVV | 123 |
| OTP | Any 6 digits |

---

## What to Verify

- ✅ Login successful
- ✅ Fees page loads with data
- ✅ Pay buttons visible
- ✅ Payment dialog opens
- ✅ Amount input works
- ✅ Razorpay checkout opens
- ✅ Payment completes
- ✅ Success message shows
- ✅ Fees page refreshes
- ✅ Payment status updates

---

## Backend Status

```
✅ Backend: Running on port 5001
✅ Frontend: Running on port 3000
✅ Database: Connected
✅ Razorpay: Configured
✅ Payment Creation: Working
✅ Payment Verification: Ready
```

---

## If Something Goes Wrong

### Payment dialog doesn't open
- Check browser console for errors
- Verify Razorpay script loaded
- Check network tab for API calls

### Razorpay checkout doesn't open
- Verify `REACT_APP_RAZORPAY_KEY_ID` in frontend `.env`
- Check browser console for Razorpay errors
- Verify internet connection

### Payment fails
- Use correct test card: `4111 1111 1111 1111`
- Verify expiry: `12/25`
- Verify CVV: `123`
- Try different OTP

### Fees don't update after payment
- Refresh page manually
- Check backend logs for errors
- Verify payment verification endpoint

---

## Backend Logs

To check backend logs:
```bash
# Terminal ID: 11
# Check for errors or payment responses
```

---

## API Testing (Optional)

### Create Payment
```bash
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rohan.singh@student.edu", "password": "4"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

curl -X POST http://localhost:5001/api/student/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount": 100, "feeType": "Tuition"}'
```

### Get Fees
```bash
curl -X GET http://localhost:5001/api/student/fees \
  -H "Authorization: Bearer $TOKEN"
```

---

## Success Indicators

✅ Payment creation returns 201 status  
✅ Razorpay order ID generated  
✅ Payment dialog opens  
✅ Razorpay checkout loads  
✅ Payment completes successfully  
✅ Fees page auto-refreshes  
✅ Payment status updates to "Paid"  

---

## Next Steps After Testing

1. Test with different students
2. Test with different fee types
3. Test partial payments
4. Test payment history
5. Test error scenarios
6. Test with different amounts

---

**Ready to test?** Go to http://localhost:3000 and login!

