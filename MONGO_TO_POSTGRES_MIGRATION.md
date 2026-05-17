# MongoDB to PostgreSQL Migration

This backend now runs on PostgreSQL.

## Prerequisites

1. Local PostgreSQL is running.
2. `DATABASE_URL` points to local Postgres (already set to `postgresql:///petrol_pump_mgmt` in `.env`).
3. You have a working Mongo source URI.

## Environment variables

Required:

- `MONGO_SOURCE_URI` (preferred) or `MONGO_URI` (fallback)

Optional:

- `MONGO_SOURCE_DB` (if DB name is not present in URI)
- `MIGRATION_TRUNCATE=true|false` (default: `true`)

## Run migration

```bash
cd "/Users/aryangautam/Documents/Petrol pump management/amarneerfuelstationbackend"
MONGO_SOURCE_URI="<your-mongo-uri>" npm run migrate:mongo
```

To keep existing Postgres rows and append:

```bash
MONGO_SOURCE_URI="<your-mongo-uri>" MIGRATION_TRUNCATE=false npm run migrate:mongo
```

## Notes

- Script file: `src/scripts/migrateMongoToPostgres.ts`
- It migrates users, logs, employees, attendance, machines, fuel tests, shifts, tank master, tanks, fuel rates, sales, credit accounts, payments, and finance entries.
- Employee and machine references are remapped automatically in attendance/fuel test rows.
