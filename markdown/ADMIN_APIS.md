# 4. Nhóm chức năng Admin

## Base URL
`/api/v1/admin`

**Authentication**: JWT Bearer Token required
**Authorization**: Admin role only

---

## 4.1 Quản lý chi nhánh (Branch Management)

### GET /api/v1/admin/branches
**Mô tả**: Danh sách tất cả chi nhánh

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Tìm kiếm theo tên/code/địa chỉ |
| isActive | boolean | No | Lọc theo trạng thái hoạt động |
| page | number | No | Trang (default: 1) |
| limit | number | No | Số lượng/trang (default: 10, max: 100) |

**Response:**
```json
{
  "rows": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "address": "string",
      "lat": 10.7769,
      "lng": 106.7009,
      "hotline": "string",
      "isActive": true,
      "createdAt": "2024-03-28T12:00:00Z"
    }
  ],
  "count": 0,
  "page": 1,
  "limit": 10
}
```

---

### POST /api/v1/admin/branches
**Mô tả**: Tạo chi nhánh mới

**Request Body:**
```json
{
  "code": "string (unique)",
  "name": "string",
  "address": "string",
  "lat": 10.7769,
  "lng": 106.7009,
  "hotline": "string",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "string",
  "code": "string",
  "name": "string",
  "address": "string",
  "lat": 10.7769,
  "lng": 106.7009,
  "hotline": "string",
  "isActive": true,
  "createdAt": "2024-03-28T12:00:00Z"
}
```

---

### GET /api/v1/admin/branches/:id
**Mô tả**: Chi tiết chi nhánh

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | ID chi nhánh |

**Response:**
```json
{
  "id": "string",
  "code": "string",
  "name": "string",
  "address": "string",
  "lat": 10.7769,
  "lng": 106.7009,
  "hotline": "string",
  "isActive": true,
  "createdAt": "2024-03-28T12:00:00Z"
}
```

---

### PUT /api/v1/admin/branches/:id
**Mô tả**: Cập nhật chi nhánh

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | ID chi nhánh |

**Request Body:**
```json
{
  "code": "string (optional)",
  "name": "string (optional)",
  "address": "string (optional)",
  "lat": 10.7769,
  "lng": 106.7009,
  "hotline": "string (optional)",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "string",
  "code": "string",
  "name": "string",
  "address": "string",
  "lat": 10.7769,
  "lng": 106.7009,
  "hotline": "string",
  "isActive": true,
  "createdAt": "2024-03-28T12:00:00Z"
}
```

---

### DELETE /api/v1/admin/branches/:id
**Mô tả**: Xóa chi nhánh

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | ID chi nhánh |

**Response:**
```json
{
  "statusCode": 204,
  "message": "No Content"
}
```

---

## 4.2 Quản lý nhân sự (Staff Management)

### GET /api/v1/admin/staffs
**Mô tả**: Danh sách tất cả nhân viên

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| storeId | string (UUID) | No | Lọc theo chi nhánh |
| role | string | No | Lọc theo vai trò (ADMIN/MANAGER/STAFF/SHIPPER) |
| isActive | boolean | No | Lọc theo trạng thái hoạt động |
| search | string | No | Tìm kiếm theo tên/email |
| page | number | No | Trang (default: 1) |
| limit | number | No | Số lượng/trang (default: 10, max: 100) |

**Response:**
```json
{
  "rows": [
    {
      "id": "string",
      "userId": "string",
      "storeId": "string",
      "role": "STAFF",
      "isActive": true,
      "createdAt": "2024-03-28T12:00:00Z",
      "user": {
        "email": "string",
        "phone": "string"
      },
      "store": {
        "name": "string",
        "address": "string"
      }
    }
  ],
  "count": 0,
  "page": 1,
  "limit": 10
}
```

---

### POST /api/v1/admin/staffs
**Mô tả**: Tạo nhân viên mới (phân quyền, gán vào chi nhánh)

**Request Body:**
```json
{
  "userId": "string (UUID)",
  "storeId": "string (UUID)",
  "role": "ADMIN | MANAGER | STAFF | SHIPPER",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "storeId": "string",
  "role": "STAFF",
  "isActive": true,
  "createdAt": "2024-03-28T12:00:00Z",
  "user": {
    "email": "string",
    "phone": "string"
  },
  "store": {
    "name": "string",
    "address": "string"
  }
}
```

---

### GET /api/v1/admin/staffs/:id
**Mô tả**: Chi tiết nhân viên

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | ID nhân viên |

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "storeId": "string",
  "role": "STAFF",
  "isActive": true,
  "createdAt": "2024-03-28T12:00:00Z",
  "user": {
    "email": "string",
    "phone": "string"
  },
  "store": {
    "name": "string",
    "address": "string"
  }
}
```

---

### PUT /api/v1/admin/staffs/:id
**Mô tả**: Cập nhật nhân viên (phân quyền, chuyển chi nhánh)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | ID nhân viên |

**Request Body:**
```json
{
  "storeId": "string (UUID) (optional)",
  "role": "ADMIN | MANAGER | STAFF | SHIPPER (optional)",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "storeId": "string",
  "role": "STAFF",
  "isActive": true,
  "createdAt": "2024-03-28T12:00:00Z",
  "user": {
    "email": "string",
    "phone": "string"
  },
  "store": {
    "name": "string",
    "address": "string"
  }
}
```

---

### DELETE /api/v1/admin/staffs/:id
**Mô tả**: Xóa nhân viên

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | ID nhân viên |

**Response:**
```json
{
  "statusCode": 204,
  "message": "No Content"
}
```

---

## Vai trò nhân sự (Staff Roles)

| Role | Mô tả | Quyền hạn |
|------|-------|-----------|
| ADMIN | Quản trị viên | Toàn quyền hệ thống |
| MANAGER | Quản lý chi nhánh | Quản lý đơn hàng, nhân viên tại chi nhánh |
| STAFF | Nhân viên | Tạo đơn hàng, cập nhật trạng thái |
| SHIPPER | Nhân viên giao hàng | Giao hàng, cập nhật vị trí |

---

## Mã lỗi (Error Codes)

| Status Code | Message | Mô tả |
|-------------|---------|-------|
| 401 | Unauthorized | Chưa đăng nhập |
| 403 | Forbidden | Không có quyền admin |
| 404 | Not Found | Không tìm thấy chi nhánh/nhân viên |
| 409 | Conflict | Mã chi nhánh đã tồn tại / Nhân viên đã tồn tại cho user này |
| 400 | Bad Request | Dữ liệu không hợp lệ |

---

## Kiến trúc triển khai

### DTOs
- `DTOs/branch.dto.js` - Branch DTOs
- `DTOs/staff.dto.js` - Staff DTOs

### Service Layer
- `services/Interfaces/IBranch.service.js` - Branch Service Interface
- `services/branch.service.js` - Branch Service Implementation
- `services/Interfaces/IStaff.service.js` - Staff Service Interface
- `services/staff.service.js` - Staff Service Implementation

### Repository Layer
- `repositories/branch.repository.js` - Branch Repository
- `repositories/staff.repository.js` - Staff Repository

### Controller Layer
- `controllers/branch.controller.js` - Branch Controller
- `controllers/staff.controller.js` - Staff Controller

### Routes
- `routes/admin.router.js` - Admin Routes

### Security
- **Authentication**: JWT Bearer Token
- **Authorization**: Admin role only (`authorize("admin")`)
- **Validation**: Zod DTOs
