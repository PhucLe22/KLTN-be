# FoodApp - Web + App đặt đồ uống cho quán cà phê có chi nhánh

## Mô tả và yêu cầu

Hệ thống đặt đồ uống cho quán cà phê với nhiều chi nhánh, hỗ trợ đặt hàng online, quản lý nhân viên, quản lý sản phẩm, quản lý doanh thu, giao hàng và thanh toán.

## Hệ thống hỗ trợ các chức năng

- Quản lý nhân viên
- Quản lý cửa hàng
- Quản lý sản phẩm
- Quản lý doanh thu
- Quản lý khách hàng
- Đặt hàng
- Giao hàng
- Thanh toán
- Khuyến mãi

## Actors

- **Khách hàng (Customer)**
- **Nhân viên (Staff)**
- **Admin**

## Phi chức năng

- Thanh toán nội bộ

## Use Cases Chính

### a. Customer
- Đăng ký/Đăng nhập
- Xem sản phẩm
- Đặt hàng
- Thanh toán
- Tracking order

### b. Staff
- Xem/xử lý đơn hàng
- Xem/cập nhật sản phẩm
- Giao hàng

### c. Admin
- Quản lý cửa hàng
- Quản lý nhân viên
- Quản lý khách hàng
- Quản lý doanh thu
- Quản lý khuyến mãi
- Quản lý đơn hàng
- Xem báo cáo

## Kế hoạch triển khai

### 1. Kiến trúc tổng quan hệ thống
```
Frontend -> Backend -> Database
```

### 2. Công nghệ sử dụng

#### 2.1. Frontend
- **Framework:** Next.js (React) + TypeScript
- **CSS Framework:** TailwindCSS
- **UI Lib:** Shadcn
- **Tools:** Axios, TanStack Query, ...

#### 2.2. Backend
- **Framework:** Express.js
- **API:** RESTful API
- **Architecture:** Monolith
- **Xác thực:** JWT
- **Security:** CORS, Rate limiting, Encrypt

#### 2.3. Mobile
- **Framework:** Expo (React Native)
- **CSS Framework:** TailwindCSS
- **UI Lib:** Gluestack-ui
- **Tools:** NativeWind (Convert TailwindCSS to React Native style), ...

### 3. UI Design
- Figma

### 4. Testing
- **API Test:** Postman, Supertest
- **Automation Test:** Newman
- **Unit Test:** Jest
- **End to End Test:** Maestro

### 5. AI
- Grok
- Fine-tuning

### 6. Deployment
- **Frontend:** Cloudflare, Vercel
- **Backend:** Render.com

### 7. SHIP (Delivery Optimization)

**Capacity (cần cho shipper):**
- lat, lng
- time window
- distance matrix

**Giải pháp:**
- Distribution balancing
- Scheduling
- Routing

**Time window:** Tuple (thời gian sớm nhất có thể ghé điểm đó, thời gian trễ nhất có thể ghé điểm đó) (2 cặp)

## API Documentation

### Response Structure
```typescript
{
  statusCode: number,
  message: string,
  data: [] | {},
  metadata: {
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

---

## 1. Authentication & Profile (Dùng chung) ✅

### POST /api/v1/auth/register
Đăng ký tài khoản (Khách hàng).

### POST /api/v1/auth/(public/internal)/login
Đăng nhập (Trả về JWT & Role).
```json
{
  "data": {
    "jwt": "...",
    "refreshToken": "..."
  }
}
```

### GET /api/v1/auth/profile
Lấy thông tin cá nhân.
```json
{
  "data": {
    "type": "CUSTOMER" | "STAFF" | "MANAGER" | "ADMIN",
    "customer": {
      "name": "...",
      "phone": "...",
      "email": "...",
      "tier": "...",
      "points": 0
    },
    "staff": {
      "storeInfo": {
        "id": "...",
        "name": "...",
        "address": "..."
      },
      "userInfo": {
        "email": "...",
        "phone": "...",
        "name": "...",
        "role": "..."
      },
      "managerInfo": {
        "id": "...",
        "name": "...",
        "email": "...",
        "phone": "..."
      }
    },
    "manager": {
      "storeInfo": {
        "id": "...",
        "name": "...",
        "address": "..."
      },
      "userInfo": {
        "email": "...",
        "phone": "...",
        "name": "...",
        "role": "..."
      }
    },
    "admin": {
      "userInfo": {
        "email": "...",
        "phone": "...",
        "name": "...",
        "role": "..."
      }
    }
  }
}
```

---

## 2. Nhóm chức năng Khách hàng (Customer)

### Đặt hàng & Sản phẩm

### GET /api/v1/products
Danh sách sản phẩm (hỗ trợ filter theo category, tìm kiếm).
```json
{
  "data": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "price": 0,
      "thumbnail": "..."
    }
  ]
}
```

### GET /api/v1/stores
Danh sách các chi nhánh gần nhất.
```json
{
  "data": [
    {
      "id": "...",
      "name": "...",
      "address": "...",
      "lat": 0,
      "lng": 0,
      "hotline": "...",
      "isActive": true
    }
  ]
}
```

### POST /api/v1/orders
Đặt đơn.
```json
{
  "data": {
    "store": {
      "name": "...",
      "address": "..."
    },
    "customer": {
      "name": "...",
      "phone": "...",
      "address": "..."
    },
    "status": "...",
    "type": "...",
    "subtotal": 0,
    "serviceFee": 0,
    "tax": 0,
    "discount": 0,
    "total": 0,
    "note": "...",
    "createdBy": {
      "staffName": "..."
    },
    "createdAt": "...",
    "orderCode": "..."
  }
}
```

### GET /api/v1/orders/history
Xem lịch sử đơn hàng.
```json
{
  "data": [
    {
      "orderCode": "...",
      "total": 0,
      "address": "...",
      "updatedAt": "...",
      "status": "..."
    }
  ]
}
```

### GET /api/v1/orders/:id
Chi tiết đơn hàng và trạng thái hiện tại.
```json
{
  "data": {
    "store": {
      "name": "...",
      "address": "..."
    },
    "customer": {
      "name": "...",
      "phone": "...",
      "address": "..."
    },
    "status": "...",
    "type": "...",
    "subtotal": 0,
    "serviceFee": 0,
    "tax": 0,
    "discount": 0,
    "total": 0,
    "note": "...",
    "createdBy": {
      "staffName": "..."
    },
    "createdAt": "...",
    "orderCode": "...",
    "orderItems": [
      {
        "name": "...",
        "price": 0,
        "quantity": 0,
        "discount": 0,
        "tax": 0,
        "note": "..."
      }
    ]
  }
}
```

### Thanh toán & Khuyến mãi

### GET /api/v1/promotions/available
Danh sách mã giảm giá có thể áp dụng.
```json
{
  "data": {
    "code": "...",
    "discountType": "...",
    "discountValue": 0,
    "maxUsage": 0,
    "minOrderAmount": 0,
    "maxDiscount": 0,
    "store": {
      "id": "...",
      "name": "..."
    },
    "expiredAt": "...",
    "isActive": true
  }
}
```

### POST /api/v1/payments/internal-transfer
Xử lý thanh toán nội bộ.

---

## 3. Nhóm chức năng Nhân viên (Staff)

### Đơn hàng

### POST /api/v1/staff/orders
Tạo đơn hàng mới.
```json
{
  "data": {
    "store": {
      "name": "...",
      "address": "..."
    },
    "customer": {
      "name": "...",
      "phone": "...",
      "address": "..."
    },
    "status": "...",
    "type": "...",
    "subtotal": 0,
    "serviceFee": 0,
    "tax": 0,
    "discount": 0,
    "total": 0,
    "note": "...",
    "createdBy": {
      "staffName": "..."
    },
    "createdAt": "...",
    "orderCode": "..."
  }
}
```

### GET /api/v1/staff/orders
Danh sách đơn hàng tại chi nhánh đang trực.
```json
{
  "data": [
    {
      "orderCode": "...",
      "type": "...",
      "total": 0,
      "address": "...",
      "createdBy": {
        "id": "...",
        "name": "..."
      },
      "createdAt": "...",
      "updatedAt": "...",
      "status": "...",
      "note": "..."
    }
  ]
}
```

### GET /api/v1/staff/orders/:id
Xem lịch sử đơn hàng.
```json
{
  "data": {
    "customer": {
      "name": "...",
      "phone": "...",
      "address": "..."
    },
    "status": "...",
    "type": "...",
    "subtotal": 0,
    "serviceFee": 0,
    "tax": 0,
    "discount": 0,
    "total": 0,
    "note": "...",
    "createdBy": {
      "staffName": "..."
    },
    "createdAt": "...",
    "orderCode": "...",
    "orderItems": [
      {
        "name": "...",
        "price": 0,
        "quantity": 0,
        "discount": 0,
        "tax": 0,
        "note": "..."
      }
    ]
  }
}
```

### PATCH /api/v1/staff/orders/:id/status
Cập nhật trạng thái (Chờ xác nhận -> Đang pha chế -> Sẵn sàng).

### Sản phẩm (Tại chi nhánh)

### PATCH /api/v1/staff/products/:id/stock
Cập nhật trạng thái còn hàng/hết hàng nhanh.

### Giao hàng (Shipper/Staff) (waiting)

### GET /api/v1/staff/delivery/tasks
Danh sách đơn cần giao dựa trên lộ trình được tối ưu.

### PATCH /api/v1/staff/delivery/:id/location
Cập nhật lat, lng thực tế khi giao hàng.

### PATCH
Nhận đơn hàng từ chi nhánh khác.

---

## 4. Nhóm chức năng Quản trị (Admin)

### Quản lý Hệ thống

### GET/POST/PUT/DELETE /api/v1/admin/stores
Quản lý các chi nhánh (CRUD).

### GET/POST/PUT/DELETE /api/v1/admin/staffs
Quản lý nhân sự (phân quyền, gán vào chi nhánh) (CRUD).

### GET/POST/PUT/DELETE /api/v1/admin/products
Quản lý danh mục và món ăn toàn hệ thống (CRUD).

### Doanh thu & Báo cáo

### GET /api/v1/admin/reports/revenue
Báo cáo doanh thu (theo ngày/tháng/chi nhánh).

### GET /api/v1/admin/reports/top-products
Các món bán chạy nhất.

---

## 5. Nhóm chức năng Giao hàng & Logistics (Ship)

Đây là phần chú trọng về Capacity và Routing.

### GET /api/v1/ship/matrix
Lấy Distance Matrix giữa các điểm đơn hàng.

### POST /api/v1/ship/optimize-route
Endpoint chạy thuật toán (Distribution balancing -> Scheduling).
```json
{
  "order_ids": ["..."],
  "staff_capacity": 0,
  "time_windows": [...]
}
```

### GET /api/v1/ship/schedule/:staff_id
Lịch trình di chuyển chi tiết cho từng Shipper.

---

## Documentation

For detailed implementation guides and project structure, see the [docs](./docs) folder:

- **[API_IMPLEMENT.md](./docs/API_IMPLEMENT.md)** - Guide for implementing new APIs following the project's architectural pattern
- **[STRUCTURE.md](./docs/STRUCTURE.md)** - Project structure and folder organization
- **[SEEDER_GUIDE.md](./docs/SEEDER_GUIDE.md)** - Guide for running database seeders to populate initial data

## Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL
- pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Configure DATABASE_URL in .env

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
node prisma/seed-manager.js
node prisma/seed-products.js
```

### Development

```bash
# Start development server
pnpm dev
```

Server will run on `http://localhost:5001`



## db - prisma 
npx prisma db push
pnpm run seed