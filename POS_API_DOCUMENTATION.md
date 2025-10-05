# POS System API Documentation

## Overview
This document outlines the API endpoints required for the Point of Sale (POS) system integration.

## Base URL
```
http://localhost:3002
```

## API Endpoints

### 1. Menu Items Management

#### Get All Menu Items
```bash
GET /menu-items
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Paneer Butter Masala",
    "price": 180.00,
    "category": "North Indian",
    "description": "Creamy paneer in rich tomato gravy",
    "isAvailable": true
  },
  {
    "id": 2,
    "name": "Chicken Biryani",
    "price": 220.00,
    "category": "North Indian",
    "description": "Fragrant basmati rice with spiced chicken",
    "isAvailable": true
  }
]
```

#### Get Menu Item by ID
```bash
GET /menu-items/{id}
```

#### Create Menu Item
```bash
POST /menu-items
Content-Type: application/json

{
  "name": "New Dish",
  "price": 150.00,
  "category": "North Indian",
  "description": "Description of the dish",
  "isAvailable": true
}
```

#### Update Menu Item
```bash
PUT /menu-items/{id}
Content-Type: application/json

{
  "name": "Updated Dish Name",
  "price": 160.00,
  "category": "South Indian",
  "description": "Updated description",
  "isAvailable": true
}
```

#### Delete Menu Item
```bash
DELETE /menu-items/{id}
```

### 2. Orders Management

#### Create Order
```bash
POST /orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "items": [
    {
      "foodId": 1,
      "itemName": "Paneer Butter Masala",
      "quantity": 2,
      "itemTotal": 360.00
    },
    {
      "foodId": 2,
      "itemName": "Chicken Biryani",
      "quantity": 1,
      "itemTotal": 220.00
    }
  ],
  "subtotal": 580.00,
  "taxAmount": 58.00,
  "discountAmount": 0.00,
  "total": 638.00,
  "paymentMethod": "cash",
  "promoCode": null
}
```

**Response:**
```json
{
  "orderId": "ORD-001",
  "customerName": "John Doe",
  "orderDate": "2024-01-25T10:30:00Z",
  "items": [
    {
      "foodId": 1,
      "itemName": "Paneer Butter Masala",
      "quantity": 2,
      "itemTotal": 360.00
    }
  ],
  "subtotal": 580.00,
  "taxAmount": 58.00,
  "discountAmount": 0.00,
  "total": 638.00,
  "paymentMethod": "cash",
  "paymentStatus": "completed",
  "promoCode": null
}
```

#### Get All Orders
```bash
GET /orders
```

**Response:**
```json
[
  {
    "orderId": "ORD-001",
    "customerName": "John Doe",
    "orderDate": "2024-01-25T10:30:00Z",
    "total": 638.00,
    "paymentMethod": "cash",
    "paymentStatus": "completed"
  }
]
```

#### Get Order by ID
```bash
GET /orders/{orderId}
```

#### Update Order Status
```bash
PUT /orders/{orderId}/status
Content-Type: application/json

{
  "paymentStatus": "completed"
}
```

### 3. Sales Reporting

#### Get Sales Summary
```bash
GET /sales/summary?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "totalSales": 15000.00,
  "totalOrders": 45,
  "averageOrderValue": 333.33,
  "paymentMethodBreakdown": {
    "cash": 8000.00,
    "card": 5000.00,
    "upi": 2000.00
  },
  "categoryBreakdown": {
    "North Indian": 6000.00,
    "South Indian": 4000.00,
    "Chinese": 3000.00,
    "Juices": 2000.00
  }
}
```

#### Get Daily Sales Report
```bash
GET /sales/daily?date=2024-01-25
```

#### Get Category-wise Sales
```bash
GET /sales/categories?startDate=2024-01-01&endDate=2024-01-31
```

### 4. Promo Codes Management

#### Get All Promo Codes
```bash
GET /promo-codes
```

#### Create Promo Code
```bash
POST /promo-codes
Content-Type: application/json

{
  "code": "WELCOME10",
  "discountType": "percentage",
  "discountValue": 10,
  "minOrderAmount": 500,
  "maxDiscount": 100,
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31",
  "usageLimit": 100,
  "isActive": true
}
```

#### Validate Promo Code
```bash
POST /promo-codes/validate
Content-Type: application/json

{
  "code": "WELCOME10",
  "orderAmount": 600
}
```

**Response:**
```json
{
  "isValid": true,
  "discountAmount": 60,
  "message": "Promo code applied successfully"
}
```

## Database Schema

### Menu Items Table
```sql
CREATE TABLE menu_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    promo_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    food_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    item_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (food_id) REFERENCES menu_items(id)
);
```

### Promo Codes Table
```sql
CREATE TABLE promo_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2024-01-25T10:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/orders"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-01-25T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Menu item not found",
  "path": "/menu-items/999"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2024-01-25T10:30:00.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/orders"
}
```

## Frontend Integration Notes

1. **Menu Items**: The frontend will fetch menu items on component mount and display them in categories.

2. **Cart Management**: All cart operations are handled locally in the frontend state.

3. **Order Processing**: When checkout is clicked, the frontend sends the complete order data to the backend.

4. **Receipt Generation**: After successful order creation, a receipt modal is displayed with print/download options.

5. **Error Handling**: The frontend includes loading states, error messages, and fallback to mock data if API calls fail.

6. **Responsive Design**: The POS system is fully responsive and works on desktop, tablet, and mobile devices.

## Testing the APIs

You can test the APIs using the provided cURL commands or tools like Postman. Make sure the backend server is running on port 3002 before testing the frontend integration.
