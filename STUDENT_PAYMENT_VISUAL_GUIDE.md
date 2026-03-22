# Student Payment System - Visual Guide

## What Students See

### 1. Fees Page - Overview

```
╔════════════════════════════════════════════════════════════════╗
║                         STUDENT PORTAL                         ║
║                                                                ║
║  Dashboard  Homework  Tests  Marks  Attendance  Fees  Profile  ║
╚════════════════════════════════════════════════════════════════╝

                            FEES PAGE

┌────────────────────────────────────────────────────────────────┐
│                      SUMMARY CARDS                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Total Fees   │  │ Pending      │  │ Amount Paid  │         │
│  │              │  │ Amount       │  │              │         │
│  │   ₹60,000    │  │   ₹15,000    │  │   ₹45,000    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                │
│  ┌──────────────┐                                              │
│  │ Payment      │                                              │
│  │ Progress     │                                              │
│  │    75%       │                                              │
│  └──────────────┘                                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    FEES BY CATEGORY                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ TUITION                                                  │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Payment Progress: 80%                                    │ │
│  │ Total: ₹30,000 | Pending: ₹6,000                        │ │
│  │                                                          │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/01/2024                       │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/02/2024                       │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/03/2024                       │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/04/2024                       │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/05/2024                       │ │
│  │ ₹5,000  [⏱ Pending]  Due: 01/06/2024  [Pay]             │ │
│  │                                                          │ │
│  │ [Pay ₹6,000]                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ TRANSPORT                                                │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Payment Progress: 100%                                   │ │
│  │ Total: ₹12,000 | Pending: ₹0                            │ │
│  │                                                          │ │
│  │ ₹3,000  [✓ Paid]  Due: 01/01/2024                       │ │
│  │ ₹3,000  [✓ Paid]  Due: 01/02/2024                       │ │
│  │ ₹3,000  [✓ Paid]  Due: 01/03/2024                       │ │
│  │ ₹3,000  [✓ Paid]  Due: 01/04/2024                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ACTIVITY                                                 │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Payment Progress: 50%                                    │ │
│  │ Total: ₹18,000 | Pending: ₹9,000                        │ │
│  │                                                          │ │
│  │ ₹3,000  [✓ Paid]  Due: 01/01/2024                       │ │
│  │ ₹3,000  [✓ Paid]  Due: 01/02/2024                       │ │
│  │ ₹3,000  [⏱ Pending]  Due: 01/03/2024  [Pay]             │ │
│  │ ₹3,000  [⏱ Pending]  Due: 01/04/2024  [Pay]             │ │
│  │ ₹3,000  [⏱ Pending]  Due: 01/05/2024  [Pay]             │ │
│  │ ₹3,000  [⚠ Overdue]  Due: 12/31/2023  [Pay]             │ │
│  │                                                          │ │
│  │ [Pay ₹9,000]                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2. Payment Dialog - When Student Clicks "Pay"

```
┌──────────────────────────────────────────────────────────────┐
│ Pay Fee                                                   [×] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Fee Type                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Tuition                                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Pending Amount                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ₹6,000                                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Due Date                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 01/06/2024                                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Amount to Pay (₹)                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [_____________________]  Max: ₹6,000                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ℹ You will be redirected to Razorpay to complete the      │
│    payment securely.                                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ [Cancel]  [💳 Pay Now]                                       │
└──────────────────────────────────────────────────────────────┘
```

### 3. Razorpay Checkout - Payment Methods

```
┌──────────────────────────────────────────────────────────────┐
│                    RAZORPAY CHECKOUT                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Amount: ₹6,000                                              │
│  Description: Payment for Tuition                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Select Payment Method                                  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                        │ │
│  │  [💳 Credit/Debit Card]                               │ │
│  │  [📱 UPI]                                             │ │
│  │  [🏦 Net Banking]                                     │ │
│  │  [💰 Wallet]                                          │ │
│  │  [📲 Mobile Wallet]                                   │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Pay ₹6,000]                                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4. After Successful Payment

```
┌──────────────────────────────────────────────────────────────┐
│                    PAYMENT SUCCESSFUL!                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✓ Your payment of ₹6,000 has been processed                │
│                                                              │
│  Transaction ID: pay_1a2b3c4d5e6f7g                          │
│  Date: 21 Mar 2024, 10:30 AM                                 │
│                                                              │
│  [Close]                                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                    FEES PAGE AUTO-REFRESHES

┌──────────────────────────────────────────────────────────────┐
│                      SUMMARY CARDS                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Total Fees   │  │ Pending      │  │ Amount Paid  │       │
│  │              │  │ Amount       │  │              │       │
│  │   ₹60,000    │  │   ₹9,000     │  │   ₹51,000    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐                                            │
│  │ Payment      │                                            │
│  │ Progress     │                                            │
│  │    85%       │                                            │
│  └──────────────┘                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    FEES BY CATEGORY                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ TUITION                                                │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Payment Progress: 100%                                 │ │
│  │ Total: ₹30,000 | Pending: ₹0                          │ │
│  │                                                        │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/01/2024                     │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/02/2024                     │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/03/2024                     │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/04/2024                     │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/05/2024                     │ │
│  │ ₹5,000  [✓ Paid]  Due: 01/06/2024                     │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Status Indicators

### Paid ✓ (Green)
- Fee fully paid
- Shows checkmark
- Green background
- No pay button

### Pending ⏱ (Yellow)
- Fee not yet due or partially paid
- Shows clock icon
- Yellow background
- Pay button available

### Overdue ⚠ (Red)
- Fee past due date
- Shows warning icon
- Red background
- Pay button available

## Color Scheme

### Summary Cards
- **Total Fees**: Indigo gradient (₹60,000)
- **Pending Amount**: Red gradient (₹15,000)
- **Amount Paid**: Cyan gradient (₹45,000)
- **Payment Progress**: Green gradient (75%)

### Category Cards
- **Header**: Indigo gradient
- **Progress Bar**: Indigo to indigo
- **Amount Boxes**: Light gray background
- **Fee Items**: White with hover effect

## Responsive Behavior

### Mobile (< 640px)
```
┌─────────────────┐
│ Total Fees      │
│ ₹60,000         │
└─────────────────┘
┌─────────────────┐
│ Pending Amount  │
│ ₹15,000         │
└─────────────────┘
┌─────────────────┐
│ Amount Paid     │
│ ₹45,000         │
└─────────────────┘
┌─────────────────┐
│ Payment Progress│
│ 75%             │
└─────────────────┘

[Full width category cards]
```

### Tablet (640px - 1024px)
```
┌──────────────┐ ┌──────────────┐
│ Total Fees   │ │ Pending      │
│ ₹60,000      │ │ ₹15,000      │
└──────────────┘ └──────────────┘
┌──────────────┐ ┌──────────────┐
│ Amount Paid  │ │ Payment      │
│ ₹45,000      │ │ 75%          │
└──────────────┘ └──────────────┘

[2 column category cards]
```

### Desktop (> 1024px)
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Total    │ │ Pending  │ │ Amount   │ │ Payment  │
│ ₹60,000  │ │ ₹15,000  │ │ ₹45,000  │ │ 75%      │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

[2 column category cards with full width]
```

## Dark Mode

All components support dark mode:
- Dark backgrounds
- Light text
- Proper contrast ratios
- Consistent styling

## Animations

- **Page Load**: Fade in + slide up
- **Dialog Open**: Fade in + scale
- **Progress Bar**: Smooth transition
- **Button Hover**: Color change + shadow
- **Loading Spinner**: Continuous rotation

## Accessibility

✅ Proper heading hierarchy
✅ Color not only indicator (icons + text)
✅ Keyboard navigation
✅ Screen reader friendly
✅ Touch-friendly buttons (min 44px)
✅ Proper contrast ratios

## User Journey

```
1. Student logs in
   ↓
2. Navigates to Fees page
   ↓
3. Sees all fees organized by category
   ↓
4. Sees summary with totals
   ↓
5. Clicks "Pay" on pending fee
   ↓
6. Payment dialog opens
   ↓
7. Enters amount
   ↓
8. Clicks "Pay Now"
   ↓
9. Razorpay checkout opens
   ↓
10. Selects payment method
   ↓
11. Enters payment details
   ↓
12. Completes payment
   ↓
13. Fees page auto-refreshes
   ↓
14. Fee status changes to "Paid ✓"
   ↓
15. Summary cards update
   ↓
16. Progress bars recalculate
```

## Error Scenarios

### Invalid Amount
```
┌──────────────────────────────────────────────────────────────┐
│ Amount to Pay (₹)                                            │
│ [_____________________]  Max: ₹6,000                         │
│                                                              │
│ ⚠ Amount must be between ₹1 and ₹6,000                      │
└──────────────────────────────────────────────────────────────┘
```

### Network Error
```
┌──────────────────────────────────────────────────────────────┐
│ ⚠ Failed to create payment                                   │
│   Please check your connection and try again.                │
└──────────────────────────────────────────────────────────────┘
```

### Payment Verification Failed
```
┌──────────────────────────────────────────────────────────────┐
│ ⚠ Payment verification failed                                │
│   Please contact support.                                    │
└──────────────────────────────────────────────────────────────┘
```

---

This visual guide shows exactly what students see and experience when using the payment system.
