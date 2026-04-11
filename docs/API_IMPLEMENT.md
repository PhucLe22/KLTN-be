# Quy trình triển khai API trong FoodApp

## Tổng quan
Dựa trên pattern hiện tại của hệ thống (Auth, Product, Store modules), đây là quy trình chuẩn để implement một API mới.

---

## Quy trình 7 bước

### Bước 1: Định nghĩa Route (`routes/`)

```javascript
// routes/example.routes.js
import express from "express";
import { exampleController } from "../controllers/example.controller.js";

const exampleRouter = express.Router();

/**
 * @route   POST /api/v1/examples/:type
 * @desc    Mô tả API
 * @access  Public/Private
 */
exampleRouter.post("/:type", exampleController.create);

export default exampleRouter;
```

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
import { createExampleSchema } from "../contracts/input/example.schema.js";
import { ExampleMapper } from "../mappers/example.mapper.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";

class ExampleController extends BaseController {
  constructor() {
    super(exampleService);
  }

  create = asyncHandler(async (req, res) => {
    // 1. Validate input
    const { type } = createExampleSchema.params.parse(req.params);
    const body = createExampleSchema.body.parse(req.body);
    
    // 2. Gọi service
    const result = await this.service.create(type, body);
    
    // 3. Transform output (nếu có Mapper)
    const formatted = ExampleMapper.toResponse(result);
    
    // 4. Trả response
    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data: formatted
    });
  });

  getAll = asyncHandler(async (req, res) => {
    // Validate query
    const query = createExampleSchema.query.parse(req.query);
    
    // Gọi service
    const result = await this.service.findAll(query);
    
    // Transform output (hoặc dùng trực tiếp output schema)
    const formattedItems = result.items.map(item => 
      exampleOutputSchema.parse(item)
    );
    
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
| **Route** | `routes/` | Định nghĩa endpoint + HTTP method |
| **Contract (Input)** | `contracts/input/` | Validate `req.params`, `req.query`, `req.body` |
| **Contract (Output)** | `contracts/output/` | Định nghĩa format response |
| **Repository** | `repositories/` | Truy vấn DB (kế thừa BaseRepository) |
| **Service** | `services/` | Logic nghiệp vụ (kế thừa BaseService) |
| **Mapper** | `mappers/` | Transform data trước khi trả về (optional) |
| **Controller** | `controllers/` | Điều phối: validate → service → mapper → response |

---

## Best Practices

### 1. Controller nên mỏng
```javascript
// ❌ BAD - Logic trong Controller
getAll = async (req, res) => {
  const items = await this.repository.findMany();
  const formatted = items.map(x => ({ ...x, price: Number(x.price) }));
  return res.json(formatted);
};

// ✅ GOOD - Chỉ điều phối
getAll = asyncHandler(async (req, res) => {
  const query = inputSchema.query.parse(req.query);
  const result = await this.service.findAll(query);
  const formatted = result.items.map(item => outputSchema.parse(item));
  return this.success(res, { data: formatted, meta: result.meta });
});
```

### 2. Service không biết về HTTP
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

### 3. Repository chỉ data access
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

### 4. Sử dụng Middleware để validate (Optional)
Nếu muốn Controller sạch hơn, có thể tạo validation middleware:

```javascript
// middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  req.validated = schema.parse(req.body); // hoặc req.query, req.params
  next();
};

// routes/example.routes.js
import { validate } from "../middlewares/validate.js";
import { createExampleSchema } from "../contracts/input/example.schema.js";

exampleRouter.post("/", 
  validate(createExampleSchema.body),
  exampleController.create
);
```

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
- [ ] Contract input schema đã được tạo và validate trong Controller
- [ ] Contract output schema đã được tạo (nếu cần)
- [ ] Repository kế thừa BaseRepository
- [ ] Service kế thừa BaseService
- [ ] Mapper đã được tạo (nếu cần transform phức tạp)
- [ ] Controller chỉ điều phối, không chứa logic phức tạp
- [ ] Response format thống nhất với BaseController.success()
- [ ] Error handling sử dụng httpExceptions
- [ ] JSDoc comment đã được thêm cho route
