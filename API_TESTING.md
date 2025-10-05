# API Testing Guide for Staff Management

## Overview
The Staff Management component now includes proper Authorization headers for all API calls. These endpoints require Admin role authentication.

## Authentication
All API calls now include the Authorization header:
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

## API Endpoints

### Staff Management

#### 1. Get All Staff
```bash
curl --location --request GET 'http://localhost:3002/staff' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```

#### 2. Create New Staff Member
```bash
curl --location --request POST 'http://localhost:3002/staff' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE' \
--data-raw '{
    "name": "John Doe",
    "responsibility": "Head Chef",
    "offDay": "Sunday",
    "restTime": "2:00 PM - 3:00 PM",
    "salary": 50000
}'
```

#### 3. Update Staff Member
```bash
curl --location --request PUT 'http://localhost:3002/staff/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE' \
--data-raw '{
    "name": "John Smith",
    "responsibility": "Executive Chef",
    "offDay": "Monday",
    "restTime": "1:00 PM - 2:00 PM",
    "salary": 60000
}'
```

#### 4. Delete Staff Member
```bash
curl --location --request DELETE 'http://localhost:3002/staff/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```

### Expense Management

#### 1. Get All Expenses
```bash
curl --location --request GET 'http://localhost:3002/expenses' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```

#### 2. Create New Expense
```bash
curl --location --request POST 'http://localhost:3002/expenses' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE' \
--data-raw '{
    "category": "Ingredients",
    "amount": 1500.00,
    "description": "Fresh vegetables for this week"
}'
```

#### 3. Update Expense
```bash
curl --location --request PUT 'http://localhost:3002/expenses/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE' \
--data-raw '{
    "category": "Equipment",
    "amount": 2500.00,
    "description": "New kitchen equipment"
}'
```

#### 4. Delete Expense
```bash
curl --location --request DELETE 'http://localhost:3002/expenses/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```

## Error Handling

### 403 Forbidden
- **Cause**: Missing or invalid Authorization header
- **Solution**: Ensure you're using a valid admin token
- **Example**: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 401 Unauthorized
- **Cause**: Token expired or invalid
- **Solution**: Re-authenticate and get a new token

### 404 Not Found
- **Cause**: Resource doesn't exist
- **Solution**: Check the ID in the URL

## Testing Steps

1. **Login as Admin** to get a valid token
2. **Copy the token** from the response
3. **Replace `YOUR_ADMIN_TOKEN_HERE`** in the curl commands
4. **Test each endpoint** to ensure proper authentication

## Frontend Changes Made

### StaffManagement.js Updates:
- ✅ Added `useAuth` import
- ✅ Added `token` from auth context
- ✅ Updated all API calls with Authorization header
- ✅ Fixed 403 errors for staff and expenses endpoints

### API Calls Updated:
- `fetchStaff()` - GET /staff
- `createStaff()` - POST /staff  
- `updateStaff()` - PUT /staff/:id
- `deleteStaff()` - DELETE /staff/:id
- `fetchExpenses()` - GET /expenses
- `createExpense()` - POST /expenses
- `updateExpense()` - PUT /expenses/:id
- `deleteExpense()` - DELETE /expenses/:id

## Security Notes

- All endpoints now require Admin role authentication
- Tokens should be stored securely in the frontend
- Tokens should be refreshed when they expire
- Never expose tokens in client-side code or logs
