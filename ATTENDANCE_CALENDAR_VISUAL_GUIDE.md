# Attendance Calendar - Visual Guide

## Student Dashboard Calendar

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Attendance Calendar                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  March 2026                          [◀]  [▶]             │
│                                                             │
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat                         │
│  ─────────────────────────────────────                     │
│   1    2    3    4    5    6    7                          │
│   P    P    A    P    P    L    P                          │
│                                                             │
│   8    9   10   11   12   13   14                          │
│   P    P    P    P    A    P    P                          │
│                                                             │
│  15   16   17   18   19   20   21                          │
│   P    P    P    P    P    P    S                          │
│                                                             │
│  22   23   24   25   26   27   28                          │
│   P    P    P    P    P    P    P                          │
│                                                             │
│  29   30   31                                              │
│   P    P    P                                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Legend:                                                     │
│ ■ Present  ■ Absent  ■ Leave  ■ Sick                      │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding
```
┌──────────────────────────────────────────────────────────┐
│ Status Colors                                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Present │  │ Absent  │  │ Leave   │  │ Sick    │   │
│  │ (Green) │  │ (Red)   │  │(Yellow) │  │(Orange) │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
│                                                          │
│  Background: Light shade of color                       │
│  Text: Dark shade of color                              │
│  Border: Medium shade of color                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Teacher Attendance Calendar

### Layout (Same as Student)
```
┌─────────────────────────────────────────────────────────────┐
│ Attendance Calendar                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  March 2026                          [◀]  [▶]             │
│                                                             │
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat                         │
│  ─────────────────────────────────────                     │
│   1    2    3    4    5    6    7                          │
│   P    P    A    P    P    L    P                          │
│                                                             │
│   8    9   10   11   12   13   14                          │
│   P    P    P    P    A    P    P                          │
│                                                             │
│  15   16   17   18   19   20   21                          │
│   P    P    P    P    P    P    S                          │
│                                                             │
│  22   23   24   25   26   27   28                          │
│   P    P    P    P    P    P    P                          │
│                                                             │
│  29   30   31                                              │
│   P    P    P                                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Legend:                                                     │
│ ■ Present  ■ Absent  ■ Leave  ■ Sick                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Interactive Features

### Month Navigation
```
Current View: March 2026

Click [◀] to go to February 2026
Click [▶] to go to April 2026

Navigation wraps around:
- January [◀] → December (previous year)
- December [▶] → January (next year)
```

### Calendar Cell Details
```
Each cell shows:
┌─────────┐
│    15   │  ← Day number
│    P    │  ← Status abbreviation
└─────────┘

Status Abbreviations:
P = Present
A = Absent
L = Leave
S = Sick
```

---

## Student Dashboard Integration

### Full Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Student Dashboard                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Student Profile Card                                    │ │
│ │ Name: Arjun Kumar | ID: STU001 | Class: 10-A           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Student Details Grid                                    │ │
│ │ (ID, Class, Section, Roll, Email, Phone, etc.)         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Quick Actions                                           │ │
│ │ [Homework] [Tests] [Marks] [Attendance]                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌──────────────────────┬──────────────────────────────────┐ │
│ │ Today's Homework     │ Today's Attendance              │ │
│ │ Chapter 1 - Intro    │ Status: PRESENT                 │ │
│ └──────────────────────┴──────────────────────────────────┘ │
│                                                             │
│ ┌──────────────────────┬──────────────────────────────────┐ │
│ │ Next Exam            │ Fees Due                         │ │
│ │ Math - 25 Mar 2026   │ ₹5,000                          │ │
│ └──────────────────────┴──────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Recent Payments                                         │ │
│ │ ₹1,000 - 15 Mar 2026 - Completed                       │ │
│ │ ₹2,000 - 10 Mar 2026 - Completed                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ★ ATTENDANCE CALENDAR (NEW)                             │ │
│ │                                                         │ │
│ │  March 2026                          [◀]  [▶]         │ │
│ │                                                         │ │
│ │  Sun  Mon  Tue  Wed  Thu  Fri  Sat                     │ │
│ │   1    2    3    4    5    6    7                      │ │
│ │   P    P    A    P    P    L    P                      │ │
│ │   ...                                                  │ │
│ │                                                         │ │
│ │  Legend: ■ Present ■ Absent ■ Leave ■ Sick            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Teacher Attendance Page Integration

### Full Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Teacher Attendance                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Filters                                                 │ │
│ │ [Class ▼] [Subject ▼] [Date: 2026-03-23] [Save]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Attendance Table                                        │ │
│ │ ┌──────┬──────────────┬──────────────────────────────┐ │ │
│ │ │ Roll │ Name         │ Status                       │ │ │
│ │ ├──────┼──────────────┼──────────────────────────────┤ │ │
│ │ │  1   │ Arjun Kumar  │ [Present ▼]                 │ │ │
│ │ │  2   │ Priya Sharma │ [Present ▼]                 │ │ │
│ │ │  3   │ Rahul Patel  │ [Absent ▼]                  │ │ │
│ │ │  4   │ Neha Gupta   │ [Present ▼]                 │ │ │
│ │ └──────┴──────────────┴──────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ★ ATTENDANCE CALENDAR (NEW)                             │ │
│ │                                                         │ │
│ │  March 2026                          [◀]  [▶]         │ │
│ │                                                         │ │
│ │  Sun  Mon  Tue  Wed  Thu  Fri  Sat                     │ │
│ │   1    2    3    4    5    6    7                      │ │
│ │   P    P    A    P    P    L    P                      │ │
│ │   ...                                                  │ │
│ │                                                         │ │
│ │  Legend: ■ Present ■ Absent ■ Leave ■ Sick            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Design

### Desktop (1024px+)
```
Full calendar with 7 columns (Sun-Sat)
Legend displayed horizontally
Optimal spacing and readability
```

### Tablet (768px-1023px)
```
Full calendar with 7 columns
Legend displayed horizontally
Adjusted padding and margins
```

### Mobile (< 768px)
```
Full calendar with 7 columns
Legend displayed in 2 rows
Compact spacing
Touch-friendly buttons
```

---

## User Interactions

### Viewing Attendance
1. User opens Student/Teacher Dashboard
2. Scrolls to Attendance Calendar section
3. Sees current month's attendance
4. Color-coded dates show status at a glance

### Navigating Months
1. User clicks [◀] to go to previous month
2. Calendar updates with new month's data
3. User clicks [▶] to go to next month
4. Can navigate multiple months back/forward

### Understanding Status
1. User looks at calendar
2. Sees color-coded dates
3. Refers to legend for meaning
4. Understands attendance pattern

---

## Example Scenarios

### Scenario 1: Student Checking Attendance
```
Student logs in → Goes to Dashboard → Scrolls to Calendar
Sees March 2026 with mostly green (present) dates
Notices 2 red dates (absent) and 1 yellow (leave)
Calculates: 17 present out of 20 = 85% attendance
Navigates to February to check previous month
```

### Scenario 2: Teacher Reviewing Class Attendance
```
Teacher logs in → Goes to Attendance page
Selects Class 10-A and Mathematics
Scrolls to Calendar
Sees attendance pattern for the class
Notices one student with many absences
Can drill down to individual student records
```

---

## Color Psychology

| Color | Meaning | Psychology |
|-------|---------|------------|
| Green | Present | Positive, good |
| Red | Absent | Negative, concerning |
| Yellow | Leave | Neutral, informational |
| Orange | Sick | Neutral, informational |

---

## Accessibility Features

- ✅ Color + text labels (not just color)
- ✅ Legend for color meanings
- ✅ Clear day numbers
- ✅ Keyboard navigation support
- ✅ High contrast colors
- ✅ Readable font sizes

---

**Last Updated**: March 23, 2026
**Version**: 1.0.0

