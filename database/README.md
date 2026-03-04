# Database Configuration Schema

## Mô tả

Database này chỉ chứa các cấu hình cho hệ thống MENAS DX:
- Database connection config
- Zalo ZNS config
- AI models config

Không chứa dữ liệu business (customers, orders, etc.) vì chúng được lấy từ database khác.

## Cách chạy

```bash
# PostgreSQL
psql -U postgres -f create_config_db.sql

# Hoặc từ psql
\i create_config_db.sql
```

## Cấu trúc

### 1. `db_config`
Cấu hình kết nối database nguồn dữ liệu
- Hỗ trợ nhiều config (name)
- Chỉ 1 config active tại một thời điểm

### 2. `zalo_config`
Cấu hình Zalo Official Account và ZNS
- OA ID, App ID, Secret Key
- Access token (có thể refresh)

### 3. `zalo_templates`
Danh sách ZNS templates
- Template ID, name, type, status
- Params (JSON array)

### 4. `ai_config`
Cấu hình AI models
- Claude, GPT-4, Gemini, Local LLM
- API keys và endpoints
- Model mặc định

## Views

- `v_active_db_config` - Database config đang active
- `v_active_zalo_config` - Zalo config đang active
- `v_default_ai_config` - AI model mặc định
- `v_approved_zalo_templates` - Templates đã approved

## Notes

- Tất cả bảng có `created_at`, `updated_at` tự động
- API keys nên được encrypt trong production
- Chỉ 1 config active cho mỗi loại tại một thời điểm
