# Bulk Student Registration API

## Overview

The `bulkRegisterStudents` API allows nodal officers and admins to register multiple students at once by uploading an Excel file.

## Endpoint

```
POST /api/students/bulk-register
```

## Authentication

- **Required**: Yes (Bearer token)
- **Authorized Roles**: `nodal_officer`, `admin`

## Request Format

### Headers

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Body Parameters

- **file** (required): Excel file (.xlsx, .xls) containing student data
- **node_id** (optional): Node ID for the students. If not provided, uses the creator's node_id

## Excel File Format

The Excel file must contain the following columns (case-sensitive):

- **name**: Student's full name
- **email**: Student's email address (must be unique)
- **password**: Student's password
- **parents_name**: Parent's name
- **mobile**: Mobile number
- **address**: Student's address
- **govt_id**: Government ID (must be unique)
- **govt_id_type**: Type of government ID (e.g., Aadhar, PAN, Passport)

### Example Excel Structure

```
| name      | email           | password   | parents_name | mobile      | address        | govt_id      | govt_id_type |
|-----------|-----------------|------------|--------------|-------------|----------------|--------------|--------------|
| John Doe  | john@email.com  | Pass123!   | Jane Doe     | 9876543210  | 123 Main St    | 123456789012 | Aadhar       |
| Jane Smith| jane@email.com  | Pass456!   | Bob Smith    | 9876543211  | 456 Oak Ave    | 987654321098 | Aadhar       |
```

## Response Format

### Success Response (201 Created)

```json
{
  "message": "Bulk student registration completed",
  "results": {
    "successful": [
      {
        "rowNumber": 2,
        "email": "john@email.com",
        "name": "John Doe",
        "id": "507f1f77bcf86cd799439011"
      }
    ],
    "failed": [
      {
        "rowNumber": 3,
        "email": "jane@email.com",
        "reason": "Email already registered"
      }
    ],
    "summary": {
      "total": 2,
      "successCount": 1,
      "failureCount": 1
    }
  }
}
```

### Error Responses

**400 Bad Request** - Missing file

```json
{
  "error": "Excel file is required"
}
```

**400 Bad Request** - Invalid Excel format

```json
{
  "error": "Invalid Excel file format"
}
```

**400 Bad Request** - Missing required columns

```json
{
  "error": "Missing required columns: name, email"
}
```

**400 Bad Request** - Invalid node

```json
{
  "error": "Invalid node"
}
```

**403 Forbidden** - Insufficient permissions

```json
{
  "error": "Only nodal officers and admins can register students"
}
```

**500 Internal Server Error**

```json
{
  "error": "Error message"
}
```

## Validation Rules

Per student record:

1. All required fields must be provided
2. Email must be in valid format (e.g., user@domain.com)
3. Email must be unique across the system
4. Government ID must be unique across the system
5. Row-level errors don't stop processing of other rows

## Testing

### Step 1: Generate Test Excel File

```bash
node create-test-excel.js
```

This creates `students_test.xlsx` with sample student data.

### Step 2: Get Authentication Token

Login to get a token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'
```

### Step 3: Run Test Script

Update `TOKEN` and `NODE_ID` in `test-bulk-register.js`, then:

```bash
node test-bulk-register.js
```

## Usage Example (cURL)

```bash
curl -X POST http://localhost:3000/api/students/bulk-register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@students.xlsx" \
  -F "node_id=507f1f77bcf86cd799439012"
```

## Usage Example (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("node_id", "YOUR_NODE_ID");

const response = await fetch("/api/students/bulk-register", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log(result);
```

## Notes

- The API processes all rows even if some fail
- Each failed row includes the row number (Excel row, 1-indexed) and reason for failure
- Successful registrations are created with the specified or default node_id
- Passwords are hashed by the pre-save middleware in the User model
- The `created_by` field is automatically set to the authenticated user's ID
