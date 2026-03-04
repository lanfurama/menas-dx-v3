-- Quick setup - Chạy nhanh để tạo database và tables
-- Chạy: psql -U postgres -f quick_setup.sql

CREATE DATABASE menas_dx_config;
\c menas_dx_config;

-- Database Config
CREATE TABLE db_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) DEFAULT 'default',
    host VARCHAR(255),
    port VARCHAR(10) DEFAULT '5432',
    database VARCHAR(100),
    username VARCHAR(100),
    password VARCHAR(255),
    ssl BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zalo Config
CREATE TABLE zalo_config (
    id SERIAL PRIMARY KEY,
    oa_id VARCHAR(100),
    app_id VARCHAR(100),
    secret_key VARCHAR(255),
    access_token TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zalo Templates
CREATE TABLE zalo_templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) UNIQUE,
    name VARCHAR(200),
    type VARCHAR(20) CHECK (type IN ('transaction', 'promotion', 'notification')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    params JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Config
CREATE TABLE ai_config (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR(50) UNIQUE CHECK (model_id IN ('claude', 'gpt4', 'gemini', 'local')),
    model_name VARCHAR(200),
    provider VARCHAR(50) CHECK (provider IN ('anthropic', 'openai', 'google', 'ollama')),
    api_key TEXT,
    api_endpoint VARCHAR(500),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert defaults
INSERT INTO ai_config (model_id, model_name, provider, is_default) VALUES
    ('claude', 'Claude (Anthropic)', 'anthropic', true),
    ('gpt4', 'GPT-4o (OpenAI)', 'openai', false),
    ('gemini', 'Gemini Pro (Google)', 'google', false),
    ('local', 'Local LLM (Ollama)', 'ollama', false);

INSERT INTO zalo_templates (template_id, name, type, status, params) VALUES
    ('t1', 'Chào mừng KH mới', 'transaction', 'approved', '["customer_name", "store_name"]'),
    ('t2', 'Sinh nhật KH', 'promotion', 'approved', '["customer_name", "voucher_code"]'),
    ('t3', 'Chăm sóc VIP', 'promotion', 'approved', '["customer_name", "tier", "offer"]'),
    ('t4', 'Win-back', 'promotion', 'pending', '["customer_name", "offer"]'),
    ('t5', 'Flash Sale', 'promotion', 'approved', '["customer_name", "discount"]');
