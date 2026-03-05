// Overview queries for datamart aggregation
// Dùng tên cột có dấu ngoặc kép vì bảng có thể tạo với tên hoa (MaTheKHTT, ThanhTienBan, ...)

export const getCustomerStats = () => `
  SELECT 
    COUNT(DISTINCT "MaTheKHTT") AS total_customers,
    COUNT(DISTINCT CASE 
      WHEN "status" IS NULL OR "status" = '' OR LOWER(COALESCE("status",'')) = 'active' 
      THEN "MaTheKHTT" 
    END) AS active_customers,
    COUNT(*) AS rows_count
  FROM public.datamart_customer
`;

export const getRevenueStats = () => `
  SELECT 
    COALESCE(SUM("ThanhTienBan"), 0) AS total_revenue,
    COUNT(DISTINCT "MaHD") AS total_orders,
    COUNT(*) AS rows_count
  FROM public.datamart_transaction
`;

export const getRevenueByMonth = () => `
  SELECT 
    TO_CHAR("NgayGioQuet"::date, 'TMM') AS month,
    EXTRACT(MONTH FROM "NgayGioQuet") AS m,
    COALESCE(SUM("ThanhTienBan"), 0) AS revenue,
    COUNT(DISTINCT "MaHD") AS orders
  FROM public.datamart_transaction
  WHERE "NgayGioQuet" IS NOT NULL
  GROUP BY TO_CHAR("NgayGioQuet"::date, 'TMM'), EXTRACT(MONTH FROM "NgayGioQuet")
  ORDER BY m
`;

export const getTopStores = () => `
  SELECT 
    COALESCE("store_name", 'N/A') AS store_name,
    COALESCE(SUM("ThanhTienBan"), 0) AS revenue,
    COUNT(DISTINCT "MaHD") AS orders
  FROM public.datamart_transaction
  GROUP BY "store_name"
  ORDER BY revenue DESC
  LIMIT 10
`;

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

export const getSegmentation = () => `
  SELECT 
    COALESCE("loyalty_tier", 'N/A') AS name,
    COUNT(DISTINCT "MaTheKHTT") AS value
  FROM public.datamart_customer
  GROUP BY "loyalty_tier"
  ORDER BY value DESC
  LIMIT 10
`;

export const getActiveCustomersFromTransactions = () => `
  SELECT COUNT(DISTINCT "MaTheKHTT") AS active_count
  FROM public.datamart_transaction
  WHERE "MaTheKHTT" IS NOT NULL
`;

export const getCustomerRevenueFallback = () => `
  SELECT 
    COALESCE(SUM("ThanhTienBan"), 0) AS total_revenue,
    COUNT(DISTINCT "MaHD") AS total_orders
  FROM public.datamart_customer
  WHERE "ThanhTienBan" IS NOT NULL
`;
