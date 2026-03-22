# Student Fees Page - Visual Guide 🎨

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STUDENT FEES PAGE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ Total Fees   │  │ Pending Amt  │  │ Amount Paid  │  │ Payment %    ││
│  │   ₹6,500     │  │   ₹6,500     │  │     ₹0       │  │    0%        ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                          │
│  Fees by Category                                                        │
│                                                                          │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐│
│  │ TUITION                    3 fees│  │ TRANSPORT                  3 fees││
│  ├─────────────────────────────────┤  ├─────────────────────────────────┤│
│  │ Progress: ████░░░░░░░░░░░░░░░░ 0%│  │ Progress: ████░░░░░░░░░░░░░░░░ 0%││
│  │                                 │  │                                 ││
│  │ Total: ₹5,000  Pending: ₹5,000  │  │ Total: ₹1,000  Pending: ₹1,000  ││
│  │                                 │  │                                 ││
│  │ ┌─────────────────────────────┐ │  │ ┌─────────────────────────────┐ ││
│  │ │ ₹5,000 [Pending] 4/15/2026  │ │  │ │ ₹1,000 [Pending] 4/15/2026  │ ││
│  │ │                    [Pay]    │ │  │ │                    [Pay]    │ ││
│  │ └─────────────────────────────┘ │  │ └─────────────────────────────┘ ││
│  │                                 │  │                                 ││
│  │        [Pay ₹5,000]              │  │        [Pay ₹1,000]              ││
│  └─────────────────────────────────┘  └─────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────┐                                    │
│  │ ACTIVITY                   3 fees│                                    │
│  ├─────────────────────────────────┤                                    │
│  │ Progress: ████░░░░░░░░░░░░░░░░ 0%│                                    │
│  │                                 │                                    │
│  │ Total: ₹500    Pending: ₹500    │                                    │
│  │                                 │                                    │
│  │ ┌─────────────────────────────┐ │                                    │
│  │ │ ₹500 [Pending] 4/15/2026    │ │                                    │
│  │ │                    [Pay]    │ │                                    │
│  │ └─────────────────────────────┘ │                                    │
│  │                                 │                                    │
│  │        [Pay ₹500]                │                                    │
│  └─────────────────────────────────┘                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Summary Cards

### Card 1: Total Fees
```
┌─────────────────────────────┐
│ Total Fees                  │
│ ₹6,500                      │
│ (Purple Gradient)           │
└─────────────────────────────┘
```

### Card 2: Pending Amount
```
┌─────────────────────────────┐
│ Pending Amount              │
│ ₹6,500                      │
│ (Red Gradient)              │
└─────────────────────────────┘
```

### Card 3: Amount Paid
```
┌─────────────────────────────┐
│ Amount Paid                 │
│ ₹0                          │
│ (Blue Gradient)             │
└─────────────────────────────┘
```

### Card 4: Payment Progress
```
┌─────────────────────────────┐
│ Payment Progress            │
│ 0%                          │
│ (Green Gradient)            │
└─────────────────────────────┘
```

## Fee Category Card

```
┌──────────────────────────────────────────────────────────────┐
│ TUITION                                              3 fees   │ ← Header
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Payment Progress                                        0%   │ ← Progress
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                              │
│ ┌──────────────────────────┐  ┌──────────────────────────┐  │
│ │ Total Amount             │  │ Pending                  │  │ ← Amounts
│ │ ₹5,000                   │  │ ₹5,000                   │  │
│ └──────────────────────────┘  └──────────────────────────┘  │
│                                                              │
│ Individual Fees:                                             │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ₹5,000  [Pending]  Due: 4/15/2026        [Pay Button]   │ │ ← Fee Item
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ₹5,000  [Paid]     Due: 4/15/2026                        │ │ ← Paid Fee
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ₹5,000  [Overdue]  Due: 3/15/2026        [Pay Button]   │ │ ← Overdue
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│              [Pay ₹5,000 for Tuition]                        │ ← Pay All
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Status Indicators

### Paid Status
```
✓ [Paid]
Green chip with check circle icon
```

### Pending Status
```
⏱ [Pending]
Orange chip with clock icon
```

### Overdue Status
```
⚠ [Overdue]
Red chip with warning icon
```

## Payment Dialog

```
┌─────────────────────────────────────────┐
│ Payment Details                         │
├─────────────────────────────────────────┤
│                                         │
│ Fee Type                                │
│ Tuition                                 │
│                                         │
│ Amount to Pay                           │
│ ₹5,000                                  │
│                                         │
│ Due Date                                │
│ 4/15/2026                               │
│                                         │
│ ℹ Online payments are not configured   │
│   for the Student portal. Please        │
│   contact the office or use the Parent  │
│   portal to make payments.              │
│                                         │
├─────────────────────────────────────────┤
│ [Close]                    [Pay Now]    │
└─────────────────────────────────────────┘
```

## Color Scheme

### Gradients
- **Purple**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Red**: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`
- **Blue**: `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`
- **Green**: `linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)`

### Status Colors
- **Success (Paid)**: Green (#4caf50)
- **Warning (Pending)**: Orange (#ff9800)
- **Error (Overdue)**: Red (#f44336)

## Typography

### Headings
- Page Title: `h5` (24px, bold)
- Card Title: `h6` (20px, bold)
- Amount: `h5` or `h6` (bold)

### Body Text
- Labels: `body2` (14px)
- Details: `body1` (16px)
- Captions: `caption` (12px)

## Spacing

- Container padding: 32px (py: 4)
- Grid spacing: 24px (spacing: 3)
- Card padding: 24px (CardContent: pt: 3)
- Box padding: 12px (p: 1.5)

## Responsive Breakpoints

### Mobile (< 600px)
- 1 column layout
- Full-width cards
- Stacked summary cards

### Tablet (600px - 960px)
- 2 columns for fees
- 2 columns for summary (2x2 grid)

### Desktop (> 960px)
- 2 columns for fees
- 4 columns for summary (1x4 grid)

## Interactive Elements

### Buttons
- **Pay Button**: Small, contained, with credit card icon
- **Pay All Button**: Full width, large, with gradient background
- **Close Button**: Text button in dialog

### Hover Effects
- Fee items: Background color change to #fafafa
- Buttons: Opacity change on hover

### Loading State
- Circular progress spinner centered on page

## Accessibility

- Semantic HTML structure
- ARIA labels on buttons
- Color contrast meets WCAG standards
- Keyboard navigation support
- Touch-friendly button sizes (44px minimum)

## Summary

The Student Fees page features:
- ✅ Beautiful gradient cards
- ✅ Clear status indicators
- ✅ Organized by fee type
- ✅ Progress visualization
- ✅ Responsive design
- ✅ Clean typography
- ✅ Intuitive layout
- ✅ Payment options

---

**Visual Design**: Modern, clean, and user-friendly
**Color Scheme**: Gradient-based with status indicators
**Layout**: Responsive grid with card-based design
**Status**: Complete and ready to use ✅
