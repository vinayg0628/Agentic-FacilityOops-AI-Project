-- ─────────────────────────────────────────────────────────────────────────────
--  Agentic FacilityOps AI Platform — PostgreSQL Initialization
--  This script runs once when the Docker PostgreSQL container first starts.
-- ─────────────────────────────────────────────────────────────────────────────

-- Create the database if it does not exist (handled by POSTGRES_DB env var)
-- This file is for any additional setup: extensions, schemas, roles, etc.

-- Enable useful PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- GIN index support

-- Set timezone
SET timezone = 'UTC';

-- Optional: Create a read-only reporting role
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'facilityops_readonly') THEN
        CREATE ROLE facilityops_readonly;
        GRANT CONNECT ON DATABASE facilityops_db TO facilityops_readonly;
        GRANT USAGE ON SCHEMA public TO facilityops_readonly;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO facilityops_readonly;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO facilityops_readonly;
    END IF;
END
$$;

-- Log completion
DO $$ BEGIN RAISE NOTICE 'FacilityOps DB initialized successfully.'; END $$;
