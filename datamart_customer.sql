CREATE TABLE IF NOT EXISTS public.datamart_customer (
  MaTheKHTT VARCHAR(50),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  loyalty_tier VARCHAR(100),
  status VARCHAR(50),
  MaHD VARCHAR(50),
  NgayHD TIMESTAMP,
  ThanhTienBan NUMERIC(18,2),
  store_name VARCHAR(255)
);
