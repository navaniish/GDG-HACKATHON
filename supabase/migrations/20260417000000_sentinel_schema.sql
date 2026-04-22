-- SENTINEL-X INITIAL SCHEMA MIGRATION
-- Generates architectural lookup tables for Digital Twins and telemetry arrays for Crisis Engine.

-- 1. Tenants (Building Schemas)
CREATE TABLE tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    layout_schema JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crisis Incidents (Telemetry & SOS Archiving)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE crisis_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    type TEXT NOT NULL,
    room TEXT NOT NULL,
    severity TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast telemetry queries
CREATE INDEX idx_crisis_created_at ON crisis_incidents(created_at DESC);

-- 3. SEED INITIAL HOTEL DATA
-- This establishes the exact realistic cutaway matrix we run in the backend.
INSERT INTO tenants (id, name, layout_schema) VALUES (
    'hotel_01', 
    'Grand Hyatt Mock', 
    '{
        "type": "commercial_hotel",
        "floors": 3,
        "zones": ["lobby", "guest_rooms", "utility", "evac_corridors"],
        "crowd_density": "medium",
        "risk_level": "nominal",
        "structural_integrity": 99.4
    }'::jsonb
);
