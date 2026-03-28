# 2. Nhóm chức năng Khách hàng (Customer)

## 2.1 Đặt hàng & Sản phẩm

### Base URL
`/api/v1`

---

## Products API

### GET /api/v1/products
**Mô tả**: Danh sách sản phẩm (hỗ trợ filter theo category, tìm kiếm)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string (UUID) | No | Lọc theo danh mục |
| search | string | No | Tìm kiếm theo tên/mô tả |
| page | number | No | Trang (default: 1) |
| limit | number | No | Số lượng/trang (default: 10, max: 100) |

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": 99.99,
    "thumbnail": "string"
  }
]
```

---

## Stores API

### GET /api/v1/stores
**Mô tả**: Danh sách các chi nhánh gần nhất

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | No | Vĩ độ hiện tại |
| lng | number | No | Kinh độ hiện tại |
| radiusKm | number | No | Bán kính tìm kiếm (default: 10km) |
| page | number | No | Trang (default: 1) |
| limit | number | No | Số lượng/trang (default: 10) |

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "address": "string",
    "lat": 10.7769,
    "lng": 106.7009,
    "hotline": "string",
    "isActive": true
  }
]
```

---

## Orders API

### POST /api/v1/orders
**Mô tả**: Tạo đơn hàng mới

**Request Body:**
```json
{
  "storeId": "string (UUID)",
  "type": "DINE_IN | TAKEAWAY | DELIVERY",
  "items": [
    {
      "productId": "string (UUID)",
      "quantity": 1,
      "options": [
        {
          "optionId": "string (UUID)",
          "quantity": 1
        }
      ]
    }
  ],
  "note": "string (optional)",
  "deliveryAddress": "string (for DELIVERY type)",
  "deliveryPhone": "string (for DELIVERY type)",
  "paymentMethod": "CASH | CARD | MOMO | VNPAY | BANK_TRANSFER",
  "voucherCodes": ["string"] (optional)
}
```

**Response:**
```json
{
  "store": {
    "name": "string",
    "address": "string"
  },
  "customer": {
    "name": "string",
    "phone": "string",
    "address": "string"
  },
  "status": "PENDING",
  "type": "DINE_IN | TAKEAWAY | DELIVERY",
  "subtotal": 100.00,
  "serviceFee": 10.00,
  "tax": 11.00,
  "discount": 0.00,
  "total": 121.00,
  "note": "string",
  "createdBy": {
    "name": "string"
  },
  "createdAt": "2024-03-28T12:00:00Z",
  "orderCode": "ORD20240328001"
}
```

---

### GET /api/v1/orders/history
**Mô tả**: Xem lịch sử đơn hàng

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | string (UUID) | No | Lọc theo khách hàng |
| status | string | No | Lọc theo trạng thái |
| page | number | No | Trang (default: 1) |
| limit | number | No | Số lượng/trang (default: 10) |

**Response:**
```json
[
  {
    "orderCode": "string",
    "total": 121.00,
    "address": "string",
    "updatedAt": "2024-03-28T12:00:00Z",
    "status": "PENDING | CONFIRMED | PREPARING | READY | COMPLETED | CANCELLED | REFUNDED"
  }
]
```

---

### GET /api/v1/orders/:id
**Mô tả**: Chi tiết đơn hàng và trạng thái hiện tại

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | ID đơn hàng |

**Response:**
```json
{
  "store": {
    "name": "string",
    "address": "string"
  },
  "customer": {
    "name": "string",
    "phone": "string",
    "address": "string"
  },
  "status": "PENDING",
  "type": "DINE_IN | TAKEAWAY | DELIVERY",
  "subtotal": 100.00,
  "serviceFee": 10.00,
  "tax": 11.00,
  "discount": 0.00,
  "total": 121.00,
  "note": "string",
  "createdBy": {
    "name": "string"
  },
  "createdAt": "2024-03-28T12:00:00Z",
  "orderCode": "ORD20240328001",
  "orderItems": [
    {
      "name": "string",
      "price": 50.00,
      "quantity": 2,
      "discount": 0,
      "tax": 0,
      "note": "string"
    }
  ]
}
```

---

## Trạng thái đơn hàng (Order Status)

| Status | Mô tả |
|--------|-------|
| NEW | Mới tạo |
| PENDING | Đang chờ xử lý |
| CONFIRMED | Đã xác nhận |
| PREPARING | Đang pha chế |
| READY | Sẵn sàng |
| COMPLETED | Hoàn thành |
| CANCELLED | Đã hủy |
| REFUNDED | Đã hoàn tiền |

## Loại đơn hàng (Order Type)

| Type | Mô tả |
|------|-------|
| DINE_IN | Dùng tại chỗ |
| TAKEAWAY | Mang đi |
| DELIVERY | Giao hàng |

## Phương thức thanh toán (Payment Method)

| Method | Mô tả |
|--------|-------|
| CASH | Tiền mặt |
| CARD | Thẻ tín dụng/Ghi nợ |
| MOMO | Ví MoMo |
| VNPAY | VNPAY |
| BANK_TRANSFER | Chuyển khoản ngân hàng |

---

## Cấu trúc tính toán giá (Price Calculation)

```
Subtotal = Tổng giá sản phẩm × Số lượng
Service Fee = Subtotal × 10%
Tax = (Subtotal + Service Fee) × 10%
Discount = Giảm giá từ voucher
Total = Subtotal + Service Fee + Tax - Discount
```

---

## Kiến trúc triển khai

### DTOs
- `DTOs/product.dto.js` - Product DTOs
- `DTOs/order.dto.js` - Order DTOs
- `DTOs/store.dto.js` - Store DTOs

### Service Layer
- `services/Interfaces/IProduct.service.js` - Product Service Interface
- `services/product.service.js` - Product Service Implementation
- `services/Interfaces/IOrder.service.js` - Order Service Interface
- `services/order.service.js` - Order Service Implementation
- `services/Interfaces/IStore.service.js` - Store Service Interface
- `services/store.service.js` - Store Service Implementation

### Repository Layer
- `repositories/product.repository.js` - Product Repository
- `repositories/order.repository.js` - Order Repository
- `repositories/store.repository.js` - Store Repository

### Controller Layer
- `controllers/product.controller.js` - Product Controller
- `controllers/order.controller.js` - Order Controller
- `controllers/store.controller.js` - Store Controller

### Routes
- `routes/product.router.js` - Product Routes
- `routes/order.router.js` - Order Routes
- `routes/store.router.js` - Store Routes

### Enums
- `enums/order.status.enum.js` - Order Status, Type, Payment Method Enums

---

## Nguyên tắc triển khai

### 1. Requirement-Driven Development
- Chỉ implement API mà người dùng yêu cầu
- Không thêm API "phòng khi cần"
- Dừng lại khi yêu cầu đã hoàn thành

### 2. Minimal Implementation
- Một endpoint = một nhu cầu cụ thể của người dùng
- Không thêm tính năng ngoài yêu cầu
- Không endpoint "bonus"

### 3. Clean Code
- Xóa code không sử dụng ngay lập tức
- Giữ controller và routes tối thiểu
- Xóa method và endpoint không cần thiết

### 4. Enum Usage
- Sử dụng enums thay vì hardcoded strings
- Đặt enums trong `/enums/` directory
- Import và sử dụng enums trong DTOs, services, controllers
- Không bao giờ dùng magic strings

### 5. Architecture Pattern
- **Dependency Injection**: Inject dependencies qua constructor
- **Repository Pattern**: Repository extends BaseRepository
- **Service Pattern**: Service extends Interface
- **DTO Pattern**: DTOs cho validation và transformation
- **Transaction Support**: Repository hỗ trợ transaction client

---

## Mã đơn hàng (Order Code)

Định dạng: `ORD` + `YYYYMMDD` + `###`

Ví dụ: `ORD20240328001`

- `ORD` - Prefix đơn hàng
- `20240328` - Ngày tạo (28/03/2024)
- `001` - Số thứ tự trong ngày (tự động tăng)
