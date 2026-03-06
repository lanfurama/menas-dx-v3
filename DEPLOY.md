# Hướng dẫn Deploy lên Server khác

## Vấn đề: API không gọi được khi chuyển sang server khác

Khi deploy lên server khác, cần cấu hình 2 biến môi trường:

### 1. Tạo/Update file `.env` ở root directory

```bash
# Frontend - URL của backend API
VITE_API_URL=http://YOUR_BACKEND_IP:3000/api

# Backend - CORS origin (cho phép frontend gọi API)
CORS_ORIGIN=http://YOUR_FRONTEND_IP:3006

# Backend - Database config
CONFIG_DB_HOST=localhost
CONFIG_DB_PORT=5432
CONFIG_DB_NAME=menas_dx_config
CONFIG_DB_USER=postgres
CONFIG_DB_PASSWORD=your_password
CONFIG_DB_SSL=false
PORT=3000
```

### 2. Thay thế các giá trị:

- `YOUR_BACKEND_IP`: IP hoặc domain của server chạy backend (ví dụ: `192.168.1.100` hoặc `api.example.com`)
- `YOUR_FRONTEND_IP`: IP hoặc domain của server chạy frontend (ví dụ: `192.168.1.100` hoặc `app.example.com`)

### 3. Ví dụ cụ thể:

**Nếu frontend và backend cùng server:**
```bash
VITE_API_URL=http://192.168.1.100:3000/api
CORS_ORIGIN=http://192.168.1.100:3006
```

**Nếu frontend và backend khác server:**
```bash
# Trên server frontend:
VITE_API_URL=http://backend-server:3000/api

# Trên server backend:
CORS_ORIGIN=http://frontend-server:3006
```

### 4. Sau khi cấu hình:

1. **Restart backend:**
```bash
cd backend
npm start
```

2. **Rebuild frontend:**
```bash
npm run build
# hoặc nếu dev mode:
npm run dev
```

### 5. Kiểm tra:

- Mở browser console, xem log `[API]` để kiểm tra URL đang gọi
- Kiểm tra backend log xem có request đến không
- Nếu có lỗi CORS, kiểm tra `CORS_ORIGIN` đã đúng chưa
