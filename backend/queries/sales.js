// Sales page queries – catPerf, payments, hourly
// Cột phương thức thanh toán có thể là "PhuongThucThanhToan" hoặc "payment_method"; nếu không có thì API trả về [].

export const getTopCategories = () => `
  SELECT 
    COALESCE("category_name", 'N/A') AS name,
    COALESCE(SUM("ThanhTienBan"), 0) AS revenue,
    COUNT(DISTINCT "MaHD") AS orders
  FROM public.datamart_transaction
  GROUP BY "category_name"
  ORDER BY revenue DESC
  LIMIT 10
`;

/** Chỉ chạy khi bảng có cột phương thức thanh toán (vd: "PhuongThucThanhToan"). */
export const getPaymentsByMethod = () => `
  SELECT 
    COALESCE("PhuongThucThanhToan", 'Khác') AS method,
    COALESCE(SUM("ThanhTienBan"), 0) AS amount,
    COUNT(DISTINCT "MaHD") AS count
  FROM public.datamart_transaction
  WHERE "PhuongThucThanhToan" IS NOT NULL AND TRIM("PhuongThucThanhToan"::text) <> ''
  GROUP BY "PhuongThucThanhToan"
  ORDER BY amount DESC
  LIMIT 10
`;

export const getOrdersByHour = () => `
  SELECT 
    EXTRACT(HOUR FROM "NgayGioQuet")::int AS h,
    COUNT(DISTINCT "MaHD") AS orders
  FROM public.datamart_transaction
  WHERE "NgayGioQuet" IS NOT NULL
  GROUP BY EXTRACT(HOUR FROM "NgayGioQuet")
  ORDER BY h
`;
