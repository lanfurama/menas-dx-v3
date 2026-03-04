-- ============================================================
-- MENAS DX v3 - Configuration Database Schema
-- Chỉ chứa các config: Database, Zalo ZNS, AI
-- ============================================================

-- Tạo database
CREATE DATABASE menas_dx_config
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'vi_VN.UTF-8'
    LC_CTYPE = 'vi_VN.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

\c menas_dx_config;

-- ============================================================
-- 1. DATABASE CONFIGURATION
-- ============================================================
CREATE TABLE db_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL DEFAULT 'default',
    host VARCHAR(255) NOT NULL,
    port VARCHAR(10) NOT NULL DEFAULT '5432',
    database VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    ssl BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT db_config_name_unique UNIQUE (name)
);

COMMENT ON TABLE db_config IS 'Cấu hình kết nối database nguồn dữ liệu';
COMMENT ON COLUMN db_config.name IS 'Tên config (có thể có nhiều config)';
COMMENT ON COLUMN db_config.is_active IS 'Config đang được sử dụng';

-- Index
CREATE INDEX idx_db_config_active ON db_config(is_active);

-- ============================================================
-- 2. ZALO ZNS CONFIGURATION
-- ============================================================
CREATE TABLE zalo_config (
    id SERIAL PRIMARY KEY,
    oa_id VARCHAR(100) NOT NULL,
    app_id VARCHAR(100) NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    access_token TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT zalo_config_oa_unique UNIQUE (oa_id)
);

COMMENT ON TABLE zalo_config IS 'Cấu hình Zalo Official Account và ZNS';
COMMENT ON COLUMN zalo_config.oa_id IS 'Zalo Official Account ID';
COMMENT ON COLUMN zalo_config.app_id IS 'Zalo App ID';
COMMENT ON COLUMN zalo_config.secret_key IS 'Zalo Secret Key';
COMMENT ON COLUMN zalo_config.access_token IS 'Access token (có thể refresh)';
COMMENT ON COLUMN zalo_config.is_active IS 'Config đang được sử dụng';

-- Index
CREATE INDEX idx_zalo_config_active ON zalo_config(is_active);

-- ============================================================
-- 3. ZALO ZNS TEMPLATES
-- ============================================================
CREATE TABLE zalo_templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('transaction', 'promotion', 'notification')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    params JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT zalo_templates_id_unique UNIQUE (template_id)
);

COMMENT ON TABLE zalo_templates IS 'Danh sách ZNS templates';
COMMENT ON COLUMN zalo_templates.template_id IS 'ID template từ Zalo';
COMMENT ON COLUMN zalo_templates.type IS 'Loại template: transaction, promotion, notification';
COMMENT ON COLUMN zalo_templates.status IS 'Trạng thái: pending, approved, rejected';
COMMENT ON COLUMN zalo_templates.params IS 'Danh sách tham số template (JSON array)';

-- Index
CREATE INDEX idx_zalo_templates_status ON zalo_templates(status);
CREATE INDEX idx_zalo_templates_type ON zalo_templates(type);

-- ============================================================
-- 4. AI CONFIGURATION
-- ============================================================
CREATE TABLE ai_config (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR(50) NOT NULL CHECK (model_id IN ('claude', 'gpt4', 'gemini', 'local')),
    model_name VARCHAR(200) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('anthropic', 'openai', 'google', 'ollama')),
    api_key TEXT NOT NULL,
    api_endpoint VARCHAR(500),
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT ai_config_model_unique UNIQUE (model_id)
);

COMMENT ON TABLE ai_config IS 'Cấu hình AI models';
COMMENT ON COLUMN ai_config.model_id IS 'ID model: claude, gpt4, gemini, local';
COMMENT ON COLUMN ai_config.provider IS 'Provider: anthropic, openai, google, ollama';
COMMENT ON COLUMN ai_config.api_key IS 'API key (encrypted trong production)';
COMMENT ON COLUMN ai_config.api_endpoint IS 'Custom endpoint (cho local LLM)';
COMMENT ON COLUMN ai_config.is_default IS 'Model mặc định được sử dụng';

-- Index
CREATE INDEX idx_ai_config_default ON ai_config(is_default);
CREATE INDEX idx_ai_config_active ON ai_config(is_active);

-- ============================================================
-- 5. TRIGGERS - Auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_db_config_updated_at BEFORE UPDATE ON db_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zalo_config_updated_at BEFORE UPDATE ON zalo_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zalo_templates_updated_at BEFORE UPDATE ON zalo_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_config_updated_at BEFORE UPDATE ON ai_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. INITIAL DATA
-- ============================================================

-- AI Config mặc định
INSERT INTO ai_config (model_id, model_name, provider, api_key, is_default, is_active, created_by)
VALUES 
    ('claude', 'Claude (Anthropic)', 'anthropic', '', true, true, 'system'),
    ('gpt4', 'GPT-4o (OpenAI)', 'openai', '', false, true, 'system'),
    ('gemini', 'Gemini Pro (Google)', 'google', '', false, true, 'system'),
    ('local', 'Local LLM (Ollama)', 'ollama', '', false, true, 'system');

-- Zalo Templates mẫu
INSERT INTO zalo_templates (template_id, name, type, status, params, description, created_by)
VALUES 
    ('t1', 'Chào mừng KH mới', 'transaction', 'approved', '["customer_name", "store_name"]', 'Template chào mừng khách hàng mới', 'system'),
    ('t2', 'Sinh nhật KH', 'promotion', 'approved', '["customer_name", "voucher_code"]', 'Template gửi lời chúc sinh nhật và voucher', 'system'),
    ('t3', 'Chăm sóc VIP', 'promotion', 'approved', '["customer_name", "tier", "offer"]', 'Template chăm sóc khách hàng VIP', 'system'),
    ('t4', 'Win-back', 'promotion', 'pending', '["customer_name", "offer"]', 'Template win-back khách hàng', 'system'),
    ('t5', 'Flash Sale', 'promotion', 'approved', '["customer_name", "discount"]', 'Template thông báo flash sale', 'system');

-- ============================================================
-- 7. VIEWS - Convenience views
-- ============================================================

-- View: Active configs
CREATE VIEW v_active_db_config AS
SELECT * FROM db_config WHERE is_active = true;

CREATE VIEW v_active_zalo_config AS
SELECT * FROM zalo_config WHERE is_active = true;

CREATE VIEW v_default_ai_config AS
SELECT * FROM ai_config WHERE is_default = true AND is_active = true LIMIT 1;

CREATE VIEW v_approved_zalo_templates AS
SELECT * FROM zalo_templates WHERE status = 'approved';

-- ============================================================
-- 8. GRANTS (tùy chọn - điều chỉnh theo user của bạn)
-- ============================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO menas_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO menas_user;

-- ============================================================
-- END
-- ============================================================
