# Database Seeding Guide

This guide explains how to seed the database with initial data for the FoodApp project.

## Available Seeders

### 1. Manager Seeder

Creates a manager account with a store for testing purposes.

**File:** `prisma/seed-manager.js`

**What it creates:**
- Store (code: "MAIN", name: "Main Store")
- User account (email: "manager@foodapp.com", password: "manager123")
- Staff profile with MANAGER role

**How to run:**
```bash
node prisma/seed-manager.js
```

**Login credentials:**
- Email: `manager@foodapp.com`
- Password: `manager123`

---

### 2. Products Seeder

Creates categories, products, and options for the menu.

**File:** `prisma/seed-products.js`

**What it creates:**
- Categories (Coffee, Drinks)
- Size OptionGroup (S, M, L)
- 10 Products with size options:
  - Coffee: Espresso, Americano, Cappuccino, Latte, Mocha, Cold Brew
  - Drinks: Trà Đào Cam Sả, Sinh Tố Bơ, Nước Ép Cam, Yogurt Trái Cây

**How to run:**
```bash
node prisma/seed-products.js
```

---

## Running All Seeders

To seed the entire database with all initial data:

```bash
# Run manager seeder first (required for staff accounts)
node prisma/seed-manager.js

# Run products seeder
node prisma/seed-products.js
```

---

## Checking Seeded Data

### List Users
```bash
node prisma/list-users.js
```

### List Products
```bash
node prisma/list-products.js
```

---

## Notes

- The seeders use `upsert` operations, so running them multiple times won't create duplicates
- The manager seeder checks if the manager account already exists before creating
- Make sure your `.env` file is configured with the correct `DATABASE_URL` before running seeders
- Seeders automatically disconnect from the database when done

---

## Troubleshooting

**Error: "Cannot connect to database"**
- Check your `.env` file
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct

**Error: "Manager account already exists"**
- This is normal - the seeder skips creation if the account exists
- To reset, delete the manager account manually or use Prisma Studio
