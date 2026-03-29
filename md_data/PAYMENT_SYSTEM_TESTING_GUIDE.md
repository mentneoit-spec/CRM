# Payment System Testing Guide

## 🎯 QUICK START

### Prerequisites
- Backend running on port 5001
- Frontend running on port 3000
- Student logged in
- Razorpay test credentials configured

### Test Card Details
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: 12/25
- **CVV**: 123
- **OTP**: 123456 (if prompted)

---

## 📋 TEST SCENARIOS

### Test 1: Partial Payment (₹1 of ₹5000)
1. Login as student
2. Go to Fees page
3. Click "Pay" on any pending fee
4. Enter amount: `1`
5. Click "Pay Now"
6. Complete Razorpay checkout with test card
7. **Expected Results**:
   - ✅ Payment successful message
   - ✅ Receipt auto-downloads
   - ✅ Fee card shows "Remaining: ₹4999"
   - ✅ Fee card shows "Paid: ₹1"
   - ✅ Progress bar updates
   - ✅ Recent payment appears in dashboard

### Test 2: Full Payment
1. Go to Fees page
2. Click "Pay" on a fee with ₹100 pending
3. Enter amount: `100`
4. Click "Pay Now"
5. Complete payment
6. **Expected Results**:
   - ✅ Fee status changes to "Paid"
   - ✅ Remaining amount shows ₹0
   - ✅ Pay button disappears
   - ✅ Progress bar shows 100%

### Test 3: Multiple Partial Payments
1. Pay ₹500 on a ₹5000 fee
2. Pay ₹1000 on same fee
3. Pay ₹3500 on same fee
4. **Expected Results**:
   - ✅ Each payment updates remaining amount
   - ✅ All payments visible in dashboard
   - ✅ Final status shows "Paid"
   - ✅ Progress bar reaches 100%

### Test 4: Receipt Download
1. Complete a payment
2. Go to StudentDashboard
3. Find recent payment in "Recent Payments" section
4. Click download button (📥)
5. **Expected Results**:
   - ✅ PDF downloads automatically
   - ✅ Filename: `receipt-{paymentId}.pdf`
   - ✅ PDF contains:
     - Receipt number
     - Student name & ID
     - Fee type
     - Amount paid
     - Transaction ID
     - Payment date/time

### Test 5: Error Handling
1. Try to pay ₹0
   - **Expected**: Error message "Amount must be between ₹1 and ₹X"
2. Try to pay more than pending
   - **Expected**: Error message "Amount must be between ₹1 and ₹X"
3. Try to pay negative amount
   - **Expected**: Error message "Amount must be a positive number"

### Test 6: Payment Progress Display
1. Go to Fees page
2. Check summary cards:
   - Total Fees: ₹X
   - Pending Amount: ₹Y
   - Amount Paid: ₹Z
   - Payment Progress: X%
3. Make a payment
4. **Expected Results**:
   - ✅ All values update correctly
   - ✅ Progress percentage increases
   - ✅ Pending amount decreases

### Test 7: Dashboard Recent Payments
1. Complete 3 payments
2. Go to StudentDashboard
3. Check "Recent Payments" section
4. **Expected Results**:
   - ✅ Shows last 5 payments
   - ✅ Each shows amount, fee type, date
   - ✅ Status badge shows "Completed"
   - ✅ Download button available for each

### Test 8: Fee Category Progress
1. Go to Fees page
2. Look at fee category cards
3. Check progress bar for each category
4. Make a payment in one category
5. **Expected Results**:
   - ✅ Progress bar updates for that category
   - ✅ Amount details update
   - ✅ Individual fee cards update

---

## 🔍 VERIFICATION CHECKLIST

### Frontend
- [ ] FeesPage loads without errors
- [ ] Payment dialog opens correctly
- [ ] Amount input validates properly
- [ ] Razorpay checkout opens
- [ ] Success message appears after payment
- [ ] Receipt auto-downloads
- [ ] Fees data refreshes
- [ ] StudentDashboard shows recent payments
- [ ] Download receipt button works
- [ ] Progress bars update in real-time

### Backend
- [ ] Payment creation endpoint returns 201
- [ ] Payment verification endpoint returns 200
- [ ] Receipt download endpoint returns PDF
- [ ] All payments filtered by collegeId
- [ ] All payments filtered by studentId
- [ ] Razorpay signature verified correctly
- [ ] PDF receipt generated successfully
- [ ] No console errors

### Database
- [ ] Payment records created
- [ ] Payment status updated to 'completed'
- [ ] Payment linked to correct fee
- [ ] Payment linked to correct student
- [ ] Payment linked to correct college

---

## 📊 EXPECTED DATABASE STATE

After completing Test 1 (₹1 payment on ₹5000 fee):

```
Payment Record:
{
  id: "uuid",
  transactionId: "razorpay_order_id",
  paymentMethod: "razorpay",
  amount: 1,
  status: "completed",
  studentId: "student_id",
  collegeId: "college_id",
  feeId: "fee_id",
  razorpayPaymentId: "razorpay_payment_id",
  paymentDate: "2026-03-22T10:30:00Z",
  notes: "Hostel Fees"
}

Fee Record (Updated):
{
  id: "fee_id",
  amount: 5000,
  paidAmount: 1,
  pendingAmount: 4999,
  status: "partial"
}
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot find module 'pdfkit'"
**Solution**: Run `npm install pdfkit` in backend directory

### Issue: Receipt not downloading
**Solution**: Check browser console for errors, verify payment ID is correct

### Issue: "Razorpay not configured"
**Solution**: Verify `.env` has `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET`

### Issue: Payment verification fails
**Solution**: Check Razorpay credentials, verify signature calculation

### Issue: Fees not updating after payment
**Solution**: Check `feeId` is being passed correctly, verify fee belongs to student

### Issue: Recent payments not showing in dashboard
**Solution**: Check `getPaymentHistory` API returns data, verify payment status is 'completed'

---

## 📱 BROWSER CONSOLE CHECKS

After payment, check console for:
- ✅ No 404 errors
- ✅ No 500 errors
- ✅ No CORS errors
- ✅ Receipt download initiated message
- ✅ No "Cannot read property" errors

---

## 🎬 DEMO FLOW

1. **Login**: Use student credentials
2. **Navigate**: Go to Fees page
3. **View**: See all fees with remaining amounts
4. **Pay**: Click Pay on any fee
5. **Enter**: Type ₹1 as test amount
6. **Checkout**: Complete Razorpay payment
7. **Verify**: See success message and auto-download
8. **Check**: Go to dashboard and see recent payment
9. **Download**: Click download button to get receipt

---

## ✅ SUCCESS CRITERIA

All tests pass when:
- ✅ Partial payments work correctly
- ✅ Remaining amounts display accurately
- ✅ Receipts auto-download
- ✅ Dashboard shows recent payments
- ✅ Progress bars update in real-time
- ✅ No console errors
- ✅ No database errors
- ✅ All data properly isolated by college

---

**Status**: Ready for Testing
**Last Updated**: March 22, 2026
