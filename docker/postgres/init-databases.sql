-- Initialize integration test databases
-- This runs automatically when the container starts
SELECT 'CREATE DATABASE integration_test' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'integration_test')\gexec
SELECT 'CREATE DATABASE robochimp_integration_test' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'robochimp_integration_test')\gexec
