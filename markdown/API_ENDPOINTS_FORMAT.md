# API Endpoints Format

Use this document as the **standard template** to document all API routes.

Base path: `/api/v1`

---

## Standard response envelope

All endpoints return:

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {},
  "metadata": {}
}
```

### `data`
- **Object** for single resource responses
- **Array** for list responses

### `metadata.pagination` (for list endpoints)

```json
{
  "metadata": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 123,
      "totalPages": 13
    }
  }
}
```

---

## Standard error envelope

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "data": null,
  "metadata": {
    "errors": [
      { "field": "phone", "message": "Invalid phone number" }
    ]
  }
}
```

---

## Endpoint doc template (copy/paste)

### `METHOD /api/v1/<route>`

- **Name**: <short purpose>
- **Auth**: `Public` | `Bearer JWT`
- **Roles**: `customer` | `staff` | `manager` | `admin` | `ship`

#### Request

- **Headers**
  - `Authorization`: `Bearer <jwt>` (if Auth = JWT)
  - `Content-Type`: `application/json`

- **Path params**
  - `<param>`: <type> — <description>

- **Query params**
  - `<param>`: <type> — <description>
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `sortBy`: string (optional)
  - `order`: `asc|desc` (optional)

- **Request body**

```json
{
  "example": "value"
}
```

#### Response 200

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {},
  "metadata": {}
}
```

#### Response (list + pagination)

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": [],
  "metadata": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

---

## Route groups (suggested structure)

### 1) Authentication & Profile (shared)

#### `POST /auth/register`
- **Name**: Register customer account
- **Auth**: Public
- **Request body**

```json
{
  "phone": "string",
  "email": "string",
  "password": "string",
  "name": "string"
}
```

- **Response 200**

```json
{
  "statusCode": 200,
  "message": "Registered",
  "data": { "userId": "string" },
  "metadata": {}
}
```

#### `POST /auth/public/login` and `POST /auth/internal/login`
- **Name**: Login and receive JWT + role
- **Auth**: Public
- **Request body**

```json
{
  "phoneOrEmail": "string",
  "password": "string"
}
```

- **Response 200**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "jwt": "string",
    "role": "customer|staff|manager|admin|ship"
  },
  "metadata": {}
}
```

#### `GET /profile`
- **Name**: Get current user profile
- **Auth**: Bearer JWT
- **Roles**: customer, staff, manager, admin
- **Response 200 (shape)**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "customer": {
      "name": "string",
      "phone": "string",
      "email": "string",
      "tier": "BRONZE|SILVER|GOLD|PLATINUM",
      "points": 0
    },
    "staff": {
      "storeInfo": { "id": "string", "name": "string", "address": "string" },
      "userInfo": { "email": "string", "phone": "string", "name": "string", "role": "MANAGER|CASHIER|KITCHEN|OWNER" },
      "managerInfo": { "id": "string", "name": "string", "email": "string", "phone": "string" }
    },
    "manager": {
      "storeInfo": { "id": "string", "name": "string", "address": "string" },
      "userInfo": { "email": "string", "phone": "string", "name": "string", "role": "MANAGER|CASHIER|KITCHEN|OWNER" }
    },
    "admin": {
      "userInfo": { "email": "string", "phone": "string", "name": "string", "role": "string" }
    }
  },
  "metadata": {}
}
```

---

### 2) Customer

#### Products

##### `GET /products`
- **Name**: List products (filter/search)
- **Auth**: Public (or JWT if needed)
- **Query params (example)**
  - `category`: string (category id or slug)
  - `q`: string (search text)
  - `isActive`: boolean
  - `page`, `limit`
- **Response 200 (list)**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": [
    { "id": "string", "name": "string", "description": "string", "price": "decimal", "thumbnail": "string" }
  ],
  "metadata": {
    "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
  }
}
```

##### `GET /stores`
- **Name**: List nearest stores
- **Query params (example)**
  - `lat`: number
  - `lng`: number
  - `radiusKm`: number
- **Response 200 (list)**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": [
    { "id": "string", "name": "string", "address": "string", "lat": 0, "lng": 0, "hotline": "string", "isActive": true }
  ],
  "metadata": {}
}
```

#### Orders

##### `POST /orders`
- **Name**: Create order
- **Auth**: Bearer JWT (customer or staff)
- **Request body (example)**

```json
{
  "storeId": "string",
  "type": "DINE_IN|TAKEAWAY|DELIVERY",
  "note": "string",
  "items": [
    {
      "productId": "string",
      "quantity": 1,
      "note": "string",
      "options": [
        { "name": "string", "price": "decimal" }
      ]
    }
  ],
  "voucherCode": "string"
}
```

- **Response 200 (shape)**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "orderCode": "string",
    "store": { "name": "string", "address": "string" },
    "customer": { "name": "string", "phone": "string", "address": "string" },
    "status": "NEW|CONFIRMED|PREPARING|READY|COMPLETED|CANCELLED|REFUNDED",
    "type": "DINE_IN|TAKEAWAY|DELIVERY",
    "subtotal": "decimal",
    "serviceFee": "decimal",
    "tax": "decimal",
    "discount": "decimal",
    "total": "decimal",
    "note": "string",
    "createdBy": { "name": "string" },
    "createdAt": "ISO-8601"
  },
  "metadata": {}
}
```

##### `GET /orders/history`
- **Name**: Customer order history
- **Auth**: Bearer JWT (customer)
- **Response 200 (list)**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": [
    { "orderCode": "string", "total": "decimal", "address": "string", "updatedAt": "ISO-8601", "status": "string" }
  ],
  "metadata": { "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 } }
}
```

##### `GET /orders/:id`
- **Name**: Order detail + current status
- **Auth**: Bearer JWT
- **Response 200 (shape)**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "orderCode": "string",
    "store": { "name": "string", "address": "string" },
    "customer": { "name": "string", "phone": "string", "address": "string" },
    "status": "string",
    "type": "string",
    "subtotal": "decimal",
    "serviceFee": "decimal",
    "tax": "decimal",
    "discount": "decimal",
    "total": "decimal",
    "note": "string",
    "createdBy": { "name": "string" },
    "createdAt": "ISO-8601",
    "items": [
      { "name": "string", "price": "decimal", "quantity": 1, "discount": "decimal", "tax": "decimal", "note": "string" }
    ]
  },
  "metadata": {}
}
```

#### Payments & Promotions

##### `GET /promotions/available`
- **Name**: List applicable vouchers/promotions
- **Auth**: Bearer JWT (customer)
- **Query params (example)**
  - `storeId`: string
  - `orderTotal`: decimal
- **Response 200 (list)**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": [
    {
      "code": "string",
      "discountType": "PERCENT|FIXED",
      "discountValue": "decimal",
      "maxUsage": 0,
      "minOrderAmount": "decimal",
      "maxDiscount": "decimal",
      "store": { "id": "string", "name": "string" },
      "expiredAt": "ISO-8601",
      "isActive": true
    }
  ],
  "metadata": {}
}
```

##### `POST /payments/internal-transfer`
- **Name**: Internal transfer payment processing
- **Auth**: Bearer JWT
- **Request body (example)**

```json
{
  "orderId": "string",
  "amount": "decimal",
  "method": "BANK_TRANSFER"
}
```

---

### 3) Staff

#### Orders (staff)

- `GET /staff/orders`
- `GET /staff/orders/:id`
- `PATCH /staff/orders/:id/status`

Use the template above and document:
- **staff scope**: “orders at current working store”
- **status transitions** allowed (e.g. `NEW -> CONFIRMED -> PREPARING -> READY`)

#### Products (branch)

- `PATCH /staff/products/:id/stock`

Document the stock state field name you’ll use (e.g. `isActive` or `isOutOfStock`) and expected behavior.

#### Delivery tasks (shipper/staff)

- `GET /staff/delivery/tasks`
- `PATCH /staff/delivery/:id/location`

Document:
- how route optimization is consumed (order of tasks)
- location update payload: `lat`, `lng`, `timestamp`

---

### 4) Admin

Document CRUD endpoints using the template and ensure list endpoints include pagination:
- `/admin/branches`
- `/admin/staffs`
- `/admin/products`
- Reports:
  - `GET /admin/reports/revenue`
  - `GET /admin/reports/top-products`

---

### 5) Shipping & Logistics (Capacity + Routing)

#### `GET /ship/matrix`
- **Name**: Distance matrix between order points
- **Auth**: Bearer JWT
- **Roles**: ship/admin
- **Query or body (choose one and keep consistent)**

```json
{
  "points": [
    { "id": "order_or_point_id", "lat": 0, "lng": 0 }
  ]
}
```

#### `POST /ship/optimize-route`
- **Name**: Run routing optimization (balancing -> scheduling)
- **Auth**: Bearer JWT
- **Roles**: ship/admin
- **Request body (shape)**

```json
{
  "orderIds": ["string"],
  "staffCapacity": [
    { "staffId": "string", "capacity": 10 }
  ],
  "timeWindows": [
    { "orderId": "string", "start": "ISO-8601", "end": "ISO-8601" }
  ]
}
```

- **Response 200 (shape)**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "assignments": [
      {
        "staffId": "string",
        "orders": [
          { "orderId": "string", "sequence": 1, "eta": "ISO-8601" }
        ]
      }
    ]
  },
  "metadata": {}
}
```

#### `GET /ship/schedule/:staffId`
- **Name**: Detailed schedule for a shipper
- **Auth**: Bearer JWT
- **Roles**: ship/admin

