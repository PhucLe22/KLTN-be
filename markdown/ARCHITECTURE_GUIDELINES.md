# Architecture Guidelines

## Overview
This document outlines the architectural patterns and conventions for building APIs in this Express.js food application. The goal is to maintain consistency, testability, and scalability through proper dependency injection and repository-based design.

## Core Principles

### 1. Dependency Injection Pattern
**Controllers** should not directly instantiate services or repositories
**Prefer Constructor Injection** over Setter Injection for better type safety
**Use Setter Injection** only for resolving circular dependencies
**All dependencies** should be injected from outside the class

```javascript
export class AnyController {
  constructor(anyService) {
    this.anyService = anyService;
  }
}

export class AnyController {
  #anyService;
  
  setAnyService(anyService) {
    this.#anyService = anyService;
  }
}

export class AnyController {
  #anyService;
  
  setAnyService(anyService) {
    this.#anyService = anyService;
  }
}
```

### 2. Repository-Based Design
**Services** use repositories for data access
**Repositories** extend BaseRepository for common operations
**Services extend interfaces** for contract definition
**Repositories** encapsulate database-specific logic

## Directory Structure

The application follows a **role-based folder structure** organized by user type:

```
├── controllers/
│   ├── auth.controller.js (shared)
│   ├── base.controller.js
│   ├── customer/
│   │   ├── customer-order.controller.js
│   │   └── customer-product.controller.js
│   ├── staff/
│   │   ├── staff-order.controller.js
│   │   ├── staff-product.controller.js
│   │   └── staff-delivery.controller.js
│   └── admin/
│       ├── admin-store.controller.js
│       ├── admin-staff.controller.js
│       └── admin-report.controller.js
├── services/
│   ├── base.service.js
│   ├── Interfaces/
│   │   └── I[entity].service.js
│   ├── auth.service.js
│   ├── customer/
│   │   ├── customer-order.service.js
│   │   └── customer-product.service.js
│   ├── staff/
│   │   ├── staff-order.service.js
│   │   ├── staff-product.service.js
│   │   └── staff-delivery.service.js
│   └── admin/
│       ├── admin-store.service.js
│       ├── admin-staff.service.js
│       └── admin-report.service.js
├── repositories/
│   ├── base.repository.js
│   ├── user.repository.js
│   ├── customer/
│   │   ├── customer-order.repository.js
│   │   └── customer-product.repository.js
│   ├── staff/
│   │   ├── staff-order.repository.js
│   │   └── staff-product.repository.js
│   └── admin/
│       ├── admin-store.repository.js
│       └── admin-staff.repository.js
├── routes/
│   ├── index.js (main router)
│   ├── auth.router.js (shared)
│   ├── customer/
│   │   ├── order.router.js
│   │   └── product.router.js
│   ├── staff/
│   │   ├── order.router.js
│   │   ├── product.router.js
│   │   └── delivery.router.js
│   └── admin/
│       ├── store.router.js
│       ├── staff.router.js
│       └── report.router.js
├── DTOs/
│   ├── [entity].dto.js
└── models/
    └── [entity].model.js
```

## API Creation Rules

### 1. Controller Pattern
**Controllers** should be thin and only handle HTTP concerns
**Use dependency injection** for services
**Return standardized responses** using base controller methods
**Use DTOs** for validation and transformation

```javascript
export class AnyController extends BaseController {
  constructor(anyService) {
    super();
    this.anyService = anyService;
  }
  
  // Alternative: Setter injection (only for circular dependencies)
  // #anyService;
  // setAnyService(anyService) {
  //   this.#anyService = anyService;
  // }
  
  async create(req, res, next) {
    try {
      const validatedData = createDto.parse(req.body);
      const result = await this.#anyService.create(validatedData);
      return this.created(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  async findAll(req, res, next) {
    try {
      const { query } = req;
      const result = await this.#anyService.findAll(query);
      return this.ok(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.#anyService.findById(id);
      return this.ok(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateDto.parse(req.body);
      const result = await this.#anyService.update(id, validatedData);
      return this.ok(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.#anyService.delete(id);
      return this.noContent(res);
    } catch (error) {
      next(error);
    }
  }
}
```

### 2. Service Pattern
**Services** contain business logic
**Extend service interfaces** for contract definition
**Use repositories** for data access
**Handle transactions** and complex operations

```javascript
// Interface definition
export class IAnyService {
  async create(dto) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }
  
  async findAll(query) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }
  
  async findById(id) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }
  
  async update(id, dto) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }
  
  async delete(id) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED");
  }
}

// Implementation
export class AnyService extends IAnyService {
  constructor(prisma, anyRepo) {
    super();
    this.prisma = prisma;
    this.anyRepo = anyRepo;
  }

  async create(dto) {
    // Business logic implementation
    const existing = await this.anyRepo.findOne({
      where: { uniqueField: dto.uniqueField }
    });
    if (existing) throw new ConflictException("Entity already exists");

    return await this.prisma.$transaction(async (tx) => {
      const entity = await this.anyRepo.create(dto, tx);
      return entity;
    });
  }

  async findAll(query) {
    const { page = 1, limit = 10, search, filters } = query;
    return await this.anyRepo.findAll({
      page,
      limit,
      query: {
        ...filters,
        ...(search && { name: { contains: search, mode: 'insensitive' } })
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    const entity = await this.anyRepo.findById(id);
    if (!entity) throw new NotFoundException("Entity not found");
    return entity;
  }

  async update(id, dto) {
    await this.findById(id); // Verify existence
    return await this.anyRepo.update(id, dto);
  }

  async delete(id) {
    await this.findById(id); // Verify existence
    await this.anyRepo.delete(id);
  }
}
```

### 3. Repository Pattern
**Repositories** handle data access logic
**Extend BaseRepository** for common CRUD operations
**Encapsulate** database-specific queries
**No interface layer** - direct implementation
**Support transaction clients** for consistency

```javascript
export class AnyRepository extends BaseRepository {
  constructor(prismaModel) {
    super(prismaModel);
  }

  async findByUniqueField(value) {
    return await this.model.findFirst({
      where: { uniqueField: value },
      include: { relations: true }
    });
  }

  async findWithRelations(query) {
    return await this.model.findMany({
      where: query,
      include: { 
        relations: true,
        nestedRelations: true
      }
    });
  }

  async findActive(query) {
    return await this.model.findMany({
      where: {
        ...query,
        isActive: true
      },
      include: { relations: true }
    });
  }

  // Support transaction clients
  async create(data, tx = null) {
    const client = tx || this.model;
    return await client.create({ data });
  }

  async createWithItems(orderData, items, tx = null) {
    const client = tx || this.model;
    return await client.create({
      data: {
        ...orderData,
        items: {
          create: items
        }
      },
      include: {
        items: true,
        relations: true
      }
    });
  }
}
```

## Service & Repository Contracts

### Service Interface Rules
**All service interfaces** must be in `services/Interfaces/` directory
**Naming convention**: `I[EntityName].service.js`
**Methods** should throw `ERR_METHOD_NOT_IMPLEMENTED`
**Include** all public methods that the service will implement
**Standard CRUD methods**: `create`, `findAll`, `findById`, `update`, `delete`
**Add** custom methods as needed for specific business logic

### Repository Implementation Rules
**All repositories** must be in `repositories/` directory
**Naming convention**: `[EntityName].repository.js`
**Extend BaseRepository** for common CRUD operations
**Add custom methods** for entity-specific queries
**Support transaction clients** with optional tx parameter
**Focus** on data access patterns specific to the entity
**No interface layer** - direct implementation

### Standard BaseRepository Methods
BaseRepository provides these methods out of the box:
- `findAll({ page, limit, query, orderBy })`
- `findById(id)`
- `findOne(query)`
- `create(data)`
- `update(id, data)`
- `delete(id)`
- `findMany(query)`

### Custom Repository Methods
Add entity-specific methods like:
- `findByUniqueField(value)`
- `findWithRelations(query)`
- `findActive(query)`
- `createWithItems(data, items, tx)`
- `generateOrderCode(storeId)`

## DTO (Data Transfer Object) Rules
**Use DTOs** for input validation and transformation
**Place DTOs** in `DTOs/` directory
**Use validation libraries** like Zod for schema validation
**Transform** data before reaching service layer
**Namespace DTOs by entity** in single files for better organization
**Use descriptive names**: `[entity].dto.js`

```javascript
// Example: user.dto.js - All user-related DTOs in one file
export const createUserDto = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6)
});

export const updateUserDto = createUserDto.partial();

export const userResponseDto = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date()
});

export const userQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional()
});
```

## Transaction Management
**Critical Rule**: Repositories must support transaction clients
**When using transactions**, pass the transaction client to repository methods
**This ensures** all operations within the transaction use the same connection

```javascript
// WRONG - Repository methods won't be in transaction
async createWithTransaction(dto) {
  return await this.prisma.$transaction(async (tx) => {
    const entity = await tx.entity.create({ data: dto });
    const related = await this.relatedRepo.create({ entityId: entity.id }); // Uses wrong connection
    return { entity, related };
  });
}

async createWithTransaction(dto) {
  return await this.prisma.$transaction(async (tx) => {
    const entity = await tx.entity.create({ data: dto });
    const related = await this.relatedRepo.create({ entityId: entity.id }, tx); // Uses transaction
    return { entity, related };
  });
}

// Repository implementation must support optional transaction client
async create(data, tx = null) {
  const client = tx || this.model;
  return await client.create({ data });
}
```

## Error Handling
**Use custom exception classes** from error controller
**Standardize** error messages and codes
**Handle errors** at appropriate layers (controller for HTTP errors, service for business errors)

## File Naming Conventions

**Controllers**: `[role]-[entity].controller.js` (e.g., `customer-order.controller.js`)

**Services**: `[role]-[entity].service.js` (e.g., `admin-store.service.js`)

**Service Interfaces**: `I[Entity].service.js` (e.g., `IOrder.service.js`)

**Repositories**: `[role]-[entity].repository.js` (e.g., `staff-order.repository.js`)

**Routes**: `[entity].router.js` (e.g., `order.router.js`)

**DTOs**: `[entity].dto.js` (contains all DTOs for the entity)

### Role-Based Organization Rules

**Customer**: Public-facing endpoints for customers
- Controllers: `controllers/customer/customer-[entity].controller.js`
- Services: `services/customer/customer-[entity].service.js`
- Repositories: `repositories/customer/customer-[entity].repository.js`
- Routes: `routes/customer/[entity].router.js`

**Staff**: Internal endpoints for staff members (requires authentication + staff role)
- Controllers: `controllers/staff/staff-[entity].controller.js`
- Services: `services/staff/staff-[entity].service.js`
- Repositories: `repositories/staff/staff-[entity].repository.js`
- Routes: `routes/staff/[entity].router.js`

**Admin**: Administrative endpoints for administrators (requires authentication + admin role)
- Controllers: `controllers/admin/admin-[entity].controller.js`
- Services: `services/admin/admin-[entity].service.js`
- Repositories: `repositories/admin/admin-[entity].repository.js`
- Routes: `routes/admin/[entity].router.js`

## Standard CRUD Operations
**Every entity API** should implement these standard operations:

### Endpoints
`POST /api/[entity]` **Create new entity**
`GET /api/[entity]` **Get all entities** with pagination and filtering
`GET /api/[entity]/:id` **Get entity** by ID
`PUT /api/[entity]/:id` **Update entity**
`DELETE /api/[entity]/:id` **Delete entity**

### Service Methods
`create(dto)` **Create new entity** with validation
`findAll(query)` **Get paginated list** with search/filter
`findById(id)` **Get single entity** by ID
`update(id, dto)` **Update existing entity**
`delete(id)` **Delete entity** (soft/hard delete)

## Implementation Checklist

When creating a new API endpoint:

1. **Create Service Interface First**
**Define service interface** in `services/Interfaces/` following standard CRUD pattern
**Include all custom methods** needed for the service

2. **Create Repository**
**Create repository class** extending BaseRepository
**Implement custom methods** specific to entity needs
**Ensure transaction support** with optional tx parameter

3. **Implement Service**
**Create service class** extending the interface
**Inject dependencies** via constructor (preferred)
**Implement business logic** with proper error handling
**Include validation** and transaction management
**Use repositories** for all data access

4. **Create Controller**
**Create controller** extending BaseController
**Use constructor injection** for services (preferred)
**Implement all CRUD endpoints**
**Add proper error handling** and response formatting
**Use setter injection** only for circular dependencies

5. **Create DTOs**
**Define all DTOs** for an entity in a single `[entity].dto.js` file
**Include create, update, response, and query DTOs**
**Use Zod** for schema validation

6. **Create Routes**
**Define RESTful routes** following standard patterns
**Connect routes** to controller methods
**Add middleware** for authentication/authorization if needed

7. **Wire Dependencies**
**In your main app setup**, inject all dependencies
**Use constructor injection** as the default pattern
**Handle circular dependencies** with setter injection if needed

```javascript
// WRONG - Building APIs "just in case"
orderRouter.get("/admin/all-orders", adminController.getAllOrders);
orderRouter.get("/admin/stats/detailed", adminController.getDetailedStats);
orderRouter.get("/admin/export/csv", adminController.exportToCSV);

// RIGHT - Only what users need
orderRouter.post("/", orderController.create);
orderRouter.get("/staff/orders", orderController.getStaffOrders);
orderRouter.get("/staff/orders/:id", orderController.getStaffOrderById);
orderRouter.patch("/staff/orders/:id/status", orderController.updateStaffOrderStatus);
```

### 2. Single Responsibility Implementation
**One endpoint = one specific user need**
**No extra features beyond requirements**
**No "bonus" endpoints**
**No future-proofing APIs**

### 3. Clean Code Principle
**Remove unused code immediately**
**Keep controllers and routes minimal**
**Delete unnecessary methods and endpoints**
**Maintain lean, focused codebases**

### 4. Enum Usage Rule
**ALWAYS use enums** instead of hardcoded strings for status, types, and constants
**Place enums** in `/enums/` directory with descriptive names
**Use consistent naming**: `[category].enum.js` or `[entity].status.enum.js`
**Import and use enums** in DTOs, services, and controllers
**Never use magic strings** or hardcoded values

```javascript
// WRONG - Hardcoded strings
status: 'PENDING'
type: 'DINE_IN'

// RIGHT - Using enums
import { OrderStatus, OrderType } from '../enums/order.status.enum.js';

status: OrderStatus.PENDING
type: OrderType.DINE_IN
```

### 5. Implementation Checklist - API Focused
When creating a new API endpoint:

1. **Verify User Requirement First**
**Confirm exact user need** before writing any code
**Document the single requirement** clearly
**Get approval on scope** before implementation

2. **Implement Only What's Required**
**Create minimal DTOs** for the specific endpoint
**Implement only required service methods**
**Create only the controller method needed**
**Add only the route requested**

3. **Review and Remove Extras**
**Check for any extra methods** that weren't requested
**Remove unused imports and dependencies**
**Delete any "just in case" code**
**Keep implementation focused**

4. **Test Only Required Functionality**
**Test the exact user requirement**
**No extra test cases** for unrequested features
**Verify response format** matches user needs

### 6. Golden Rules
- **If user didn't ask for it, don't build it**
- **One requirement = one implementation**
- **Stop when requirement is complete**
- **No "helpful" extra features**
- **Always ask: "Did the user request this?"**

## Example Flow

```
User Requirement → API Design → Minimal Implementation → Testing → Done
```

This architecture ensures:
**Separation of Concerns**: Each layer has specific responsibilities
**Testability**: Easy to mock dependencies
**Maintainability**: Clear structure and conventions
**Scalability**: Easy to add new features following the same patterns
**Efficiency**: No unnecessary code or endpoints
**Focus**: Only implement what users actually require
**Simplicity**: Clean, minimal implementations
