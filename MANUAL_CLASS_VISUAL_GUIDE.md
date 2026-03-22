# Manual Class Creation - Visual Guide

## Form Layout

### Default View (Dropdown Mode)
```
┌─────────────────────────────────────────┐
│         Add Student Form                │
├─────────────────────────────────────────┤
│                                         │
│  Name                                   │
│  [Enter student's name...]              │
│                                         │
│  Class                                  │
│  ☐ Enter manually                       │
│  [Select Class ▼]                       │
│    - 10A                                │
│    - 10B                                │
│    - 12A                                │
│                                         │
│  Roll Number                            │
│  [Enter student's Roll Number...]       │
│                                         │
│  Password                               │
│  [Enter student's password...]          │
│                                         │
│  [Add]                                  │
│                                         │
└─────────────────────────────────────────┘
```

### Manual Entry View (Checkbox Checked)
```
┌─────────────────────────────────────────┐
│         Add Student Form                │
├─────────────────────────────────────────┤
│                                         │
│  Name                                   │
│  [Enter student's name...]              │
│                                         │
│  Class                                  │
│  ☑ Enter manually                       │
│  [Enter class name...]                  │
│                                         │
│  Roll Number                            │
│  [Enter student's Roll Number...]       │
│                                         │
│  Password                               │
│  [Enter student's password...]          │
│                                         │
│  [Add]                                  │
│                                         │
└─────────────────────────────────────────┘
```

## User Flow

### Flow 1: Using Dropdown (Existing Class)

```
Start
  ↓
Open Add Student Form
  ↓
Enter Name: "John Doe"
  ↓
Class Checkbox: Leave unchecked (default)
  ↓
Select Class: "10A" from dropdown
  ↓
Enter Roll Number: "1"
  ↓
Enter Password: "Test@123"
  ↓
Click "Add"
  ↓
Student Created with sclassId = "10A_ID"
  ↓
Success Message
  ↓
End
```

### Flow 2: Using Manual Entry (Custom Class)

```
Start
  ↓
Open Add Student Form
  ↓
Enter Name: "Jane Smith"
  ↓
Class Checkbox: Check "Enter manually"
  ↓
Dropdown changes to Text Input
  ↓
Type Class Name: "Advanced Class"
  ↓
Enter Roll Number: "2"
  ↓
Enter Password: "Test@123"
  ↓
Click "Add"
  ↓
Student Created with customClassName = "Advanced Class"
  ↓
Success Message
  ↓
End
```

## State Transitions

### Checkbox State Changes

```
Initial State:
- manualClass = false
- customClassName = ""
- Shows: Dropdown with classes

User Checks Checkbox:
- manualClass = true
- customClassName = ""
- Shows: Text input field
- Clears: className, sclassName

User Unchecks Checkbox:
- manualClass = false
- customClassName = ""
- Shows: Dropdown with classes
- Clears: customClassName
```

## Data Flow

### Dropdown Selection Flow

```
User selects class from dropdown
  ↓
changeHandler() called
  ↓
Find selected class in sclassesList
  ↓
Set className = class name
Set sclassName = class ID
  ↓
Form data prepared:
{
  name: "John Doe",
  rollNum: "1",
  password: "Test@123",
  sclassName: "class-id-123",
  customClassName: null
}
  ↓
Send to backend
  ↓
Backend creates student with sclassId
```

### Manual Entry Flow

```
User checks "Enter manually"
  ↓
handleManualClassToggle() called
  ↓
manualClass = true
  ↓
Show text input instead of dropdown
  ↓
User types class name
  ↓
handleCustomClassChange() called
  ↓
Set customClassName = typed value
Set className = typed value
Set sclassName = typed value
  ↓
Form data prepared:
{
  name: "Jane Smith",
  rollNum: "2",
  password: "Test@123",
  sclassName: "Advanced Class",
  customClassName: "Advanced Class"
}
  ↓
Send to backend
  ↓
Backend creates student with customClassName
```

## Backend Processing

### Dropdown Selection (sclassId)

```
Request received:
{
  sclassId: "class-id-123",
  customClassName: null
}
  ↓
Create student with:
- sclassId: "class-id-123"
- customClassName: null
  ↓
Student linked to class "10A"
  ↓
Dashboard displays: "10A"
```

### Manual Entry (customClassName)

```
Request received:
{
  sclassId: null,
  customClassName: "Advanced Class"
}
  ↓
Create student with:
- sclassId: null
- customClassName: "Advanced Class"
  ↓
Student has custom class name
  ↓
Dashboard displays: "Advanced Class"
```

## Student Dashboard Display

### For Dropdown Selection

```
Student Record:
- sclassId: "class-id-123"
- customClassName: null

Display Logic:
if (customClassName) {
  show customClassName
} else if (sclassId) {
  show class name from database
} else {
  show "--"
}

Result: Shows "10A"
```

### For Manual Entry

```
Student Record:
- sclassId: null
- customClassName: "Advanced Class"

Display Logic:
if (customClassName) {
  show customClassName
} else if (sclassId) {
  show class name from database
} else {
  show "--"
}

Result: Shows "Advanced Class"
```

## UI Components

### Checkbox with Label

```
<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <input
    type="checkbox"
    id="manualClass"
    checked={manualClass}
    onChange={handleManualClassToggle}
  />
  <label htmlFor="manualClass">
    Enter manually
  </label>
</div>
```

### Conditional Rendering

```
{manualClass ? (
  // Show text input
  <input
    type="text"
    placeholder="Enter class name..."
    value={customClassName}
    onChange={handleCustomClassChange}
  />
) : (
  // Show dropdown
  <select
    value={className}
    onChange={changeHandler}
  >
    <option>Select Class</option>
    {sclassesList.map(...)}
  </select>
)}
```

## Example Scenarios

### Scenario 1: Create 10A Student

```
Form Input:
- Name: "Student 1"
- Class: Select "10A" from dropdown
- Roll: "1"
- Password: "Test@123"

Backend:
- sclassId: "10a-id"
- customClassName: null

Dashboard:
- Shows: "10A"
```

### Scenario 2: Create Advanced Class Student

```
Form Input:
- Name: "Student 2"
- Class: Check "Enter manually", type "Advanced Class"
- Roll: "2"
- Password: "Test@123"

Backend:
- sclassId: null
- customClassName: "Advanced Class"

Dashboard:
- Shows: "Advanced Class"
```

### Scenario 3: Create Multiple Custom Classes

```
Student 1: customClassName = "Class A"
Student 2: customClassName = "Class B"
Student 3: customClassName = "Class A"

Dashboard:
- Student 1: Shows "Class A"
- Student 2: Shows "Class B"
- Student 3: Shows "Class A"

Note: Multiple students can have same custom class
```

## Validation

### Form Validation

```
Before Submit:
1. Check name is not empty
2. Check class is selected (dropdown) or entered (manual)
3. Check roll number is not empty
4. Check password is not empty

If validation fails:
- Show error message
- Prevent submission

If validation passes:
- Send to backend
- Show loading spinner
- Wait for response
```

### Backend Validation

```
Received Data:
1. Check name exists
2. Check studentId exists
3. Check collegeId exists
4. Check either sclassId or customClassName is provided
5. Check student ID is unique per college

If validation fails:
- Return error response
- Show error message to user

If validation passes:
- Create student record
- Return success response
```

---

**Visual Guide Created**: March 21, 2026  
**Purpose**: Help understand the manual class creation feature
