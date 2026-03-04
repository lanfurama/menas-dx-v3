# Setup Guide - Settings Page

## Backend Setup

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Setup database:**
```bash
# Tạo database và tables
psql -U postgres -f ../database/quick_setup.sql
```

3. **Configure backend .env:**
```bash
cd backend
cp .env.example .env
# Edit .env với thông tin database của bạn
```

4. **Start backend server:**
```bash
npm run dev
# Server chạy tại http://localhost:3000
```

## Frontend Setup

1. **Configure frontend .env:**
```bash
# Đảm bảo có VITE_API_URL trong .env
VITE_API_URL=http://localhost:3000/api
```

2. **Start frontend:**
```bash
npm run dev
# Frontend chạy tại http://localhost:5173
```

## Usage

1. Đăng nhập với admin account
2. Vào tab "Cài đặt"
3. Cấu hình Database và AI Model
4. Click "Test kết nối" để kiểm tra database
5. Click "Lưu cấu hình" để lưu

## API Endpoints

- `GET /api/db/config` - Lấy DB config
- `POST /api/db/config` - Lưu DB config  
- `POST /api/db/test` - Test DB connection
- `GET /api/ai/configs` - Lấy AI configs
- `GET /api/ai/config` - Lấy default AI config
- `PUT /api/ai/config/:modelId` - Update AI config
