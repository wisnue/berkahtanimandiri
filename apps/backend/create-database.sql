-- Create Database Script
-- Run this manually in your PostgreSQL client (pgAdmin, DBeaver, etc.)
-- Or run: psql -U postgres -f create-database.sql

CREATE DATABASE kth_btm
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8'
  TEMPLATE = template0;

-- Connect to the database and create extensions if needed
\c kth_btm

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can now run migrations with: npm run db:migrate
