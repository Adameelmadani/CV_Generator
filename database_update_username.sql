-- ============================================================
-- database_update_username.sql
-- Migration: Add username column to users table
-- Run this ONCE on an existing cv_craft database.
-- ============================================================

USE cv_craft;

-- 1. Add the username column (nullable first so existing rows are not rejected)
ALTER TABLE users
    ADD COLUMN username VARCHAR(50) NULL UNIQUE AFTER email;

-- 2. Back-fill existing users with a generated username based on their email
--    e.g. "john.doe@example.com" -> "john.doe_1"
UPDATE users u
JOIN (
    SELECT id,
           CONCAT(
               LOWER(REGEXP_REPLACE(SUBSTRING_INDEX(email, '@', 1), '[^a-zA-Z0-9_]', '_')),
               '_',
               id
           ) AS generated_username
    FROM users
    WHERE username IS NULL
) gen ON u.id = gen.id
SET u.username = gen.generated_username
WHERE u.username IS NULL;

-- 3. Now enforce NOT NULL constraint
ALTER TABLE users
    MODIFY COLUMN username VARCHAR(50) NOT NULL;

-- 4. Add explicit unique index (already implied by UNIQUE on column, but explicit is cleaner)
-- Skip if it already exists (MySQL will error if duplicate index name)
ALTER TABLE users
    ADD UNIQUE INDEX idx_users_username (username);

-- 5. Verify
SELECT id, email, username FROM users LIMIT 20;
