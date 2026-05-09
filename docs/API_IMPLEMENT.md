# Quy trình triển khai API trong FoodApp

## Tổng quan
Dựa trên pattern hiện tại của hệ thống (Auth, Product, Store modules), đây là quy trình chuẩn để implement một API mới.

---

## Quy trình 7 bước

### Bước 1: Định nghĩa Route + Validation Middleware (`routes/`)

```javascript
// routes/example.routes.js
import express from "express";
import { exampleController } from "../controllers/example.controller.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { createExampleSchema } from "../contracts/input/example.schema.js";

const exampleRouter = express.Router();

/**
 * @route   POST /api/v1/examples/:type
 * @desc    Mô tả API
 * @access  Public/Private
 */
exampleRouter.post(
  "/:type",
  validateData({
    params: createExampleSchema.params,
    body: createExampleSchema.body,
  }),
  exampleController.create,
);

export default exampleRouter;
```

**Lưu ý:**
- Sử dụng `validateData` middleware để validate `req.params`, `req.query`, `req.body`
- Controller sẽ nhận data đã được validate, không cần validate lại
- Validation middleware throw error tự động nếu data không hợp lệ

### Bước 2: Tạo Contract Validation (`contracts/`)

#### Input Schema (Validate request)
```javascript
// contracts/input/example.schema.js
import { z } from "zod";

export const createExampleSchema = {
  params: z.object({
    type: z.enum(["TYPE_A", "TYPE_B"])
  }),
  body: z.object({
    name: z.string().min(3),
    email: z.string().email()
  }),
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional()
  })
};
```

#### Output Schema (Định nghĩa response format)
```javascript
// contracts/output/example.output.schema.js
import { z } from "zod";

export const exampleOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date()
});
```

### Bước 3: Tạo Repository (`repositories/`)

```javascript
// repositories/example.repository.js
const MODEL_NAME = "example";
import { BaseRepository } from "./base.repository.js";

class ExampleRepository extends BaseRepository {
  constructor() {
    super(MODEL_NAME);
  }
}

export const exampleRepository = new ExampleRepository();
```

**Lưu ý:**
- `BaseRepository` đã có sẵn các method: `findAll`, `findById`, `create`, `update`, `delete`
- Nếu cần custom logic, override method trong class con

### Bước 4: Tạo Service (`services/`)

```javascript
// services/example.service.js
import { BaseService } from "./base.service.js";
import { exampleRepository } from "../repositories/example.repository.js";

class ExampleService extends BaseService {
  constructor() {
    super(exampleRepository);
  }

  async create(type, data) {
    // Logic nghiệp vụ
    return await this.repository.create(data);
  }

  async findAll(query) {
    const { page = 1, limit = 10, search } = query;
    
    const where = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    return await this.repository.findAll({
      page: Number(page),
      limit: Number(limit),
      where,
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const exampleService = new ExampleService();
```

**Lưu ý:**
- Service kế thừa từ `BaseService`
- Chứa **business logic**, không truy vấn DB trực tiếp
- Có thể inject nhiều repository nếu cần (như AuthService)

### Bước 5: Tạo Mapper (Optional) (`mappers/`)

Sử dụng khi cần transform dữ liệu phức tạp trước khi trả về:

```javascript
// mappers/example.mapper.js
import { exampleOutputSchema } from "../contracts/output/example.output.schema.js";

export class ExampleMapper {
  static toResponse(data) {
    const formatted = {
      id: data.id,
      name: data.name.toUpperCase(),
      createdAt: data.createdAt
    };
    return exampleOutputSchema.parse(formatted);
  }
}
```

**Khi nào cần Mapper?**
- Khi cần gộp nhiều entity khác nhau
- Khi cần tính toán thêm field
- Khi cần format data theo yêu cầu đặc biệt

### Bước 6: Tạo Controller (`controllers/`)

```javascript
// controllers/example.controller.js
import { BaseController } from "./base.controller.js";
import { exampleService } from "../services/example.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ExampleMapper } from "../mappers/example.mapper.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";

class ExampleController extends BaseController {
  constructor() {
    super(exampleService);
  }

  create = asyncHandler(async (req, res) => {
    // Data đã được validate bởi middleware ở route
    const { type } = req.params;
    const body = req.body;

    // 1. Gọi service
    const result = await this.service.create(type, body);

    // 2. Transform output (nếu có Mapper)
    const formatted = ExampleMapper.toResponse(result);

    // 3. Trả response
    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data: formatted
    });
  });

  getAll = asyncHandler(async (req, res) => {
    // Query đã được validate bởi middleware ở route
    const query = req.query;

    // Gọi service
    const result = await this.service.findAll(query);

    // Transform output (nếu có Mapper)
    const formattedItems = ExampleMapper.toGetAllResponse(result.items);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.OK,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
      data: formattedItems,
      meta: result.meta
    });
  });
}

export const exampleController = new ExampleController();
```

**Lưu ý:**
- Controller nên **mỏng** - chỉ điều phối, không chứa logic phức tạp
- **KHÔNG validate data** - validation đã được làm ở route bằng middleware
- Controller chỉ lấy data từ `req.body`, `req.params`, `req.query` (đã validate)
- Sử dụng `asyncHandler` để wrap async function
- Sử dụng `this.success()` từ BaseController để trả response chuẩn

### Bước 7: Mount Route vào Main Router (`routes/index.js`)

```javascript
// routes/index.js
import exampleRouter from "./example.routes.js";

// Mount các domain routes vào đây
mainRouter.use("/examples", exampleRouter);
```

---

## Tóm tắt vai trò từng layer

| Layer | File | Nhiệm vụ |
|-------|------|----------|
| **Route** | `routes/` | Định nghĩa endpoint + HTTP method + Validation middleware |
| **Contract (Input)** | `contracts/input/` | Validate `req.params`, `req.query`, `req.body` |
| **Contract (Output)** | `contracts/output/` | Định nghĩa format response |
| **Repository** | `repositories/` | Truy vấn DB (kế thừa BaseRepository) |
| **Service** | `services/` | Logic nghiệp vụ (kế thừa BaseService) |
| **Mapper** | `mappers/` | Transform data trước khi trả về (optional) |
| **Controller** | `controllers/` | Điều phối: service → mapper → response (KHÔNG validate) |

---

## Best Practices

### 1. Controller KHÔNG validate data
```javascript
// ❌ BAD - Validate trong Controller
getAll = asyncHandler(async (req, res) => {
  const query = inputSchema.query.parse(req.query); // KHÔNG validate ở đây
  const result = await this.service.findAll(query);
  return this.success(res, { data: result.items, meta: result.meta });
});

// ✅ GOOD - Chỉ lấy data đã validate
getAll = asyncHandler(async (req, res) => {
  const result = await this.service.findAll(req.query); // req.query đã được middleware validate
  const formatted = ExampleMapper.toGetAllResponse(result.items);
  return this.success(res, { data: formatted, meta: result.meta });
});
```

### 2. Validation phải được làm ở Route
```javascript
// ❌ BAD - Không có validation middleware
exampleRouter.get("/", exampleController.getAll);

// ✅ GOOD - Có validation middleware
exampleRouter.get(
  "/",
  validateData({ query: getProductsSchema.query }),
  exampleController.getAll,
);
```

### 3. Service không biết về HTTP
Service không nên nhận `req` hay `res`, chỉ nhận data đã được validate:

```javascript
// ❌ BAD
async create(req) {
  return await this.repository.create(req.body);
};

// ✅ GOOD
async create(type, data) {
  return await this.repository.create(data);
}
```

### 4. Repository chỉ data access
Repository không chứa business logic, chỉ truy vấn DB:

```javascript
// ❌ BAD - Business logic trong Repository
async create(data) {
  const hashed = await bcrypt.hash(data.password);
  return await this.getModel().create({ ...data, password: hashed });
};

// ✅ GOOD - Hash trong Service
// Repository chỉ:
async create(data, tx) {
  return await this.getModel(tx).create(data);
}
```

### 5. Sử dụng Mapper cho output validation
Output validation nên được làm trong Mapper, không phải trong Controller:

```javascript
// ❌ BAD - Validate output trong Controller
getAll = asyncHandler(async (req, res) => {
  const result = await this.service.findAll(req.query);
  const formatted = result.items.map(item => outputSchema.parse(item));
  return this.success(res, { data: formatted, meta: result.meta });
});

// ✅ GOOD - Validate output trong Mapper
getAll = asyncHandler(async (req, res) => {
  const result = await this.service.findAll(req.query);
  const formatted = ExampleMapper.toGetAllResponse(result.items);
  return this.success(res, { data: formatted, meta: result.meta });
});

// mappers/example.mapper.js
static toGetAllResponse(items) {
  return items.map(item => outputSchema.parse(item));
}
```

### 6. Sử dụng enum constants cho validation messages
Validation messages phải sử dụng enum constants từ `constants/errors.js`, không dùng hardcoded strings:

```javascript
// ❌ BAD - Hardcoded error messages
export const createExampleSchema = {
  body: z.object({
    id: z.string().uuid("ID không hợp lệ"),
    name: z.string().min(1, "Tên không được để trống"),
    email: z.string().email("Email không đúng định dạng"),
  }),
};

// ✅ GOOD - Sử dụng VALIDATION_MESSAGES enum
import { VALIDATION_MESSAGES } from "../../constants/errors.js";

export const createExampleSchema = {
  body: z.object({
    id: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
    name: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
    email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
  }),
};
```

**Tại sao?**
- Dễ maintain và sửa đổi error messages ở một chỗ
- Đảm bảo consistency trong toàn bộ hệ thống
- Dễ dàng internationalization (i18n) nếu cần trong tương lai
- Tránh duplicate error messages

---

## Ví dụ thực tế: Auth API

Để tham khảo, xem file:
- `routes/auth.routes.js` - Route definition
- `controllers/auth.controller.js` - Controller implementation
- `services/auth.service.js` - Business logic
- `mappers/auth.mapper.js` - Data transformation
- `contracts/input/auth.schema.js` - Input validation
- `contracts/output/auth.output.schema.js` - Output format

---

## Checklist trước khi commit

- [ ] Route đã được định nghĩa và mounted
- [ ] **Validation middleware đã được thêm vào route** (validateData + schema)
- [ ] Contract input schema đã được tạo
- [ ] Contract output schema đã được tạo (nếu cần)
- [ ] Repository kế thừa BaseRepository
- [ ] Service kế thừa BaseService
- [ ] Mapper đã được tạo (nếu cần transform phức tạp hoặc output validation)
- [ ] **Controller KHÔNG validate data** - chỉ lấy từ req.body/req.params/req.query
- [ ] **Controller chỉ điều phối** - không chứa logic phức tạp
- [ ] Response format thống nhất với BaseController.success()
- [ ] Error handling sử dụng httpExceptions
- [ ] JSDoc comment đã được thêm cho route
