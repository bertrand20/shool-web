-- Greenfield Academy database setup and seed data.
-- Run this file from the repository root with the MySQL client:
--   mysql -u root -p < backend/models/seed.sql
--
-- It creates the database tables and inserts the demo records in dependency order.

SOURCE backend/models/schema.sql;
SOURCE backend/models/migration.sql;
SOURCE backend/models/new_modules.sql;
SOURCE backend/models/20260922_school_identity.sql;
SOURCE backend/models/20260922_security_hardening.sql;
SOURCE backend/models/20260922_public_demo_content.sql;
