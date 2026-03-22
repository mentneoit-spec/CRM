# Razorpay Payment Testing Guide - Local Setup ✅

## Configuration Complete ✅

Razorpay credentials have been configured:

**Backend (.env):**
```
RAZORPAY_KEY_ID=rzp_live_SMj9EQLZSXaW4g
RAZORPAY_SECRET=WFzMF69I6ababNYiOcGfxXlc
```

**Frontend (.env):**
```
REACT_APP_RAZORPAY_KEY_ID=rzp_live_SMj9EQLZSXaW4g
```

## Step 1: Start Backend Server

```bash
cd gravity-crm/backend
npm start
```

Expected output:
```
Server running on port 5001
Database connected
```

## Step 2: Start Frontend Server

In a new terminal:
```bash
cd gravity-crm/frontend
npm start
```

Expected output:
```
Compiled successfully!
You can now view the app in the browser at http://localhost:3000
```

## Step 3: Login as Student

1. Open http://localhost:3000
2. Click "Login"
3. Use student credentials:
   - Email: `student1@school.com`
   - Password: `Student@123`

## Step 4: Navigate to Fees Page

1. After login, you'll see the Student Dashboard
2. Click on "Fees" in the sidebar or navigation
3. You should see:
   - Summary cards (Total Fees, Pending Amount, Amount Paid, Progress)
   - Fees organized by category (Tuition, Transport, Activity)
   - Status badges (Paid ✓ / Pending ⏱ / Overdue ⚠)
   - Pay buttons on pending fees

## Step 5: Test Payment Flow

### Option A: Pay a Single Fee

1. Click "Pay" button on any pending fee
2. Payment dialog opens showing:
   - Fee Type
   - Pending Amount
   - Due Date
   - Amount input field
3. Enter amount (e.g., ₹1000)
4. Click "Pay Now"
5. Razorpay checkout modal opens

### Option B: Pay All Fees in Category

1. Scroll to any category (e.g., Tuition)
2. Click "Pay ₹X,XXX" button at bottom of category
3. Payment dialog opens
4. Enter amount
5. Click "Pay Now"

## Step 6: Complete Payment in Razorpay

When Razorpay checkout opens:

### Test Card Details (Live Mode)
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
Name: Any name
```

### Test UPI
```
UPI ID: test@razorpay
```

### Steps to Complete:
1. Select payment method (Card/UPI/etc)
2. Enter payment details
3. Click "Pay" or "Submit"
4. Payment processes
5. Success message appears

## Step 7: Verify Auto-Refresh

After successful payment:

1. Fees page automatically refreshes
2. Fee status changes to "Paid ✓" (green)
3. Progress bar updates
4. Summary cards recalculate:
   - Pending Amount decreases
   - Amount Paid increases
   - Payment Progress increases

## Expected Results

### Before Payment
```
Summary Cards:
- Total Fees: ₹60,000
- Pending Amount: ₹15,000
- Amount Paid: ₹45,000
- Payment Progress: 75%

Tuition Category:
- Payment Progress: 80%
- Total: ₹30,000
- Pending: ₹6,000
- Fee: ₹5,000 [Pending ⏱] [Pay]
```

### After Payment of ₹5,000
```
Summary Cards:
- Total Fees: ₹60,000
- Pending Amount: ₹10,000
- Amount Paid: ₹50,000
- Payment Progress: 83%

Tuition Category:
- Payment Progress: 83%
- Total: ₹30,000
- Pending: ₹1,000
- Fee: ₹5,000 [Paid ✓]
```

## Troubleshooting

### Issue: Razorpay script not loading
**Error:** "window.Razorpay is not defined"
**Solution:**
1. Check browser console (F12)
2. Verify `REACT_APP_RAZORPAY_KEY_ID` in frontend/.env
3. Restart frontend server
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Payment dialog doesn't open
**Error:** Dialog appears but checkout doesn't open
**Solution:**
1. Check browser console for errors
2. Verify Razorpay script loaded (Network tab)
3. Try in incognito mode (ad blockers might interfere)
4. Check that amount is valid (₹1 to pending amount)

### Issue: Payment verification failed
**Error:** "Payment verification failed"
**Solution:**
1. Check backend logs for errors
2. Verify `RAZORPAY_SECRET` in backend/.env
3. Verify `RAZORPAY_KEY_ID` matches
4. Restart backend server

### Issue: Fees not updating after payment
**Error:** Page doesn't refresh after payment
**Solution:**
1. Check browser console for API errors
2. Check Network tab for `/student/fees` request
3. Verify student is authenticated
4. Check backend logs for errors

### Issue: "Invalid payment signature"
**Error:** Payment verification fails with signature error
**Solution:**
1. Verify `RAZORPAY_SECRET` is correct
2. Check that key ID and secret match
3. Restart backend server
4. Try payment again

## Testing Checklist

- [ ] Backend server running on port 5001
- [ ] Frontend server running on port 3000
- [ ] Student logged in successfully
- [ ] Fees page loads with all fees visible
- [ ] Summary cards show correct totals
- [ ] Status badges display correctly
- [ ] Click "Pay" opens payment dialog
- [ ] Amount input validates correctly
- [ ] Razorpay checkout opens
- [ ] Payment can be completed with test card
- [ ] Fees page auto-refreshes after payment
- [ ] Fee status changes to "Paid ✓"
- [ ] Progress bars update
- [ ] Summary cards update
- [ ] Multiple payments work
- [ ] Partial payments work
- [ ] Error messages display correctly
- [ ] Works on mobile view
- [ ] Dark mode works
- [ ] Payment history visible

## Browser Console Checks

Open browser console (F12) and check for:

✅ No errors about Razorpay script
✅ No 404 errors for API calls
✅ No CORS errors
✅ No authentication errors
✅ Successful API responses

## Network Tab Checks

Open Network tab (F12) and check:

✅ `POST /api/student/payments` - 201 Created
✅ `POST /api/student/payments/verify` - 200 OK
✅ `GET /api/student/fees` - 200 OK
✅ Razorpay script loads successfully

## Backend Logs

Check backend console for:

✅ Payment order created successfully
✅ Payment verified successfully
✅ No database errors
✅ No authentication errors

## Testing Scenarios

### Scenario 1: Pay Full Fee
1. Fee pending: ₹5,000
2. Enter amount: ₹5,000
3. Complete payment
4. Fee status: Paid ✓
5. Pending amount: ₹0

### Scenario 2: Pay Partial Fee
1. Fee pending: ₹6,000
2. Enter amount: ₹3,000
3. Complete payment
4. Fee status: Pending ⏱
5. Pending amount: ₹3,000

### Scenario 3: Pay Multiple Fees
1. Pay first fee: ₹5,000
2. Fees page refreshes
3. Pay second fee: ₹3,000
4. Fees page refreshes
5. Both fees show Paid ✓

### Scenario 4: Error Handling
1. Enter invalid amount: ₹0
2. See error message
3. Fix amount: ₹5,000
4. Payment succeeds

## Performance Metrics

Expected times:
- Page load: < 1s
- Payment dialog open: < 500ms
- Razorpay checkout open: < 1s
- Payment processing: < 5s
- Fees refresh: < 1s

## Security Verification

✅ Student can only see own fees
✅ Student can only pay own fees
✅ Payment amount validated on backend
✅ Razorpay signature verified
✅ Multi-tenancy enforced

## Next Steps After Testing

1. **Test on Different Devices**
   - Mobile phone
   - Tablet
   - Different browsers

2. **Test Error Scenarios**
   - Network disconnection
   - Invalid payment
   - Payment timeout

3. **Test with Different Students**
   - Multiple students
   - Different fee amounts
   - Different fee types

4. **Monitor Logs**
   - Backend logs
   - Browser console
   - Network requests

5. **Prepare for Production**
   - Document any issues
   - Create runbook
   - Train team

## Support

For issues:
1. Check browser console (F12)
2. Check backend logs
3. Verify .env configuration
4. Check Network tab
5. Review troubleshooting section

## Status

✅ **READY FOR LOCAL TESTING**

Configuration complete:
- ✅ Backend .env configured
- ✅ Frontend .env configured
- ✅ Razorpay credentials added
- ✅ Payment system implemented
- ✅ Ready to test

Start testing now! 🚀
