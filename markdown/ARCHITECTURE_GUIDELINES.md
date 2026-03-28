# Architecture Guidelines

## Overview
This document outlines the architectural patterns and conventions for building APIs in this Express.js food application. The goal is to maintain consistency, testability, and scalability through proper dependency injection and interface-based design.

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

### 2. Interface-Based Design
**All services** must extend their corresponding interfaces
**All repositories** must extend their corresponding interfaces
**Interfaces** define contracts and throw errors for unimplemented methods

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
  async create(dto) {
    // Implementation
  }
}
```

## Directory Structure

```
├── controllers/
│   ├── [entity].controller.js
│   └── base.controller.js
├── services/
│   ├── Interfaces/
│   │   └── I[entity].service.js
│   ├── [entity].service.js
│   └── base.service.js
├── repositories/
│   ├── Interfaces/
│   │   └── I[entity].repository.js
│   ├── [entity].repository.js
│   └── base.repository.js
├── DTOs/
│   ├── [entity].dto.js
│   └── [entity].response.dto.js
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
**Extend** corresponding interfaces
**Use repositories** for data access
**Handle transactions** and complex operations

```javascript
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
      const entity = await tx.any.create({
        data: dto,
        include: { relations: true }
      });
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
**Extend** corresponding interfaces
**Extend BaseRepository** for common CRUD operations
**Encapsulate** database-specific queries

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
}
```

## Interface Contracts

### Service Interface Rules
**All service interfaces** must be in `services/Interfaces/` directory
**Naming convention**: `I[EntityName].service.js`
**Methods** should throw `ERR_METHOD_NOT_IMPLEMENTED`
**Include** all public methods that the service will implement
**Standard CRUD methods**: `create`, `findAll`, `findById`, `update`, `delete`
**Add** custom methods as needed for specific business logic

### Repository Interface Rules
**All repository interfaces** must be in `repositories/Interfaces/` directory
**Naming convention**: `I[EntityName].repository.js`
**Methods** should throw descriptive error messages
**Include** all custom methods beyond base CRUD operations
**Focus** on data access patterns specific to the entity

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
**Controllers**: `[entity].controller.js`
**Services**: `[entity].service.js`
**Repositories**: `[entity].repository.js`
**Interfaces**: `I[Entity].service.js` or `I[Entity].repository.js`
**DTOs**: `[entity].dto.js` (contains all DTOs for the entity)

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

1. **Create Interface First**
**Define service interface** in `services/Interfaces/` following standard CRUD pattern
**Define repository interface** if needed in `repositories/Interfaces/`

2. **Implement Repository**
**Create repository class** extending BaseRepository
**Implement all interface methods**
**Add custom queries** specific to entity needs

3. **Implement Service**
**Create service class** extending interface
**Inject dependencies** via constructor (preferred)
**Implement business logic** with proper error handling
**Include validation** and transaction management
**Ensure repositories support transaction clients**

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
**Ensure proper initialization order**
**Test the complete flow** including transactions

## Example Flow

```
Request → Controller (validates DTO) → Service (business logic) → Repository (data access) → Database
```

This architecture ensures:
**Separation of Concerns**: Each layer has specific responsibilities
**Testability**: Easy to mock dependencies
**Maintainability**: Clear structure and conventions
**Scalability**: Easy to add new features following the same patterns
