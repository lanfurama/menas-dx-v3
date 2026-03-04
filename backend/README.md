# Backend API Server

## Kiến trúc

Backend có 2 loại database:
1. **Config Database** (`menas_dx_config`): Database chứa các config (db_config, ai_config, zalo_config)
2. **External Database**: Database bên ngoài được config trong table `db_config`

Backend chỉ cần .env để connect đến Config Database. Config của External Database được lưu trong table `db_config`.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Cấu hình `.env` ở root directory (không phải trong backend/):
```bash
# Backend sẽ đọc từ .env ở root
# Thêm các biến CONFIG_DB_* vào .env ở root:
CONFIG_DB_HOST=localhost
CONFIG_DB_PORT=5432
CONFIG_DB_NAME=menas_dx_config
CONFIG_DB_USER=postgres
CONFIG_DB_PASSWORD=your_password
CONFIG_DB_SSL=false
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

3. Đảm bảo Config Database đã được tạo:
```bash
psql -U postgres -f ../database/quick_setup.sql
```

## Run

```bash
# Development (với auto-reload)
npm run dev

# Production
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## API Endpoints

### Database Config
- `GET /api/db/config` - Lấy config database đang active
- `POST /api/db/config` - Lưu config database
- `POST /api/db/test` - Test kết nối database

### AI Config
- `GET /api/ai/configs` - Lấy tất cả AI configs
- `GET /api/ai/config` - Lấy AI config mặc định
- `PUT /api/ai/config/:modelId` - Cập nhật AI config

### Zalo Config
- `GET /api/zalo/config` - Lấy Zalo config
- `GET /api/zalo/templates` - Lấy danh sách templates

### Health Check
- `GET /api/health` - Kiểm tra server status
