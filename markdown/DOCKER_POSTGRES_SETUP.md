# Docker Postgres setup (local)

This repo expects:

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foodapp`

## Start Postgres with Docker Compose

From repo root:

```bash
docker compose up -d
```

Check health/logs:

```bash
docker compose ps
docker compose logs -f db
```

## Generate Prisma client + migrate

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

## Stop

```bash
docker compose down
```

# Run
docker exec -it foodapp psql -U postgres -d foodapp

# Load entities to docker
pnpm prisma migrate dev --name init_db

* Search
 User: \dt iam.*
 Food: \dt catalog.*
Find all tables : \dt *.*