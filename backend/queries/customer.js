// Customer queries for datamart_customer table
// Bảng này có nhiều dòng cho mỗi khách hàng (mỗi dòng là một giao dịch)
// Cần aggregate để tính tổng chi tiêu, số đơn hàng, ngày mua cuối, etc.

export const getCustomers = (limit, offset, search = '') => {
  const searchCondition = search
    ? `AND (LOWER(c."MaTheKHTT") LIKE LOWER($3) OR LOWER(c."name") LIKE LOWER($3) OR c."phone" LIKE $3)`
    : '';
  const searchValue = search ? `%${search}%` : '';
  
  return {
    text: `
      SELECT 
        c."MaTheKHTT",
        MAX(c."name") AS "name",
        MAX(c."email") AS "email",
        MAX(c."phone") AS "phone",
        MAX(c."loyalty_tier") AS "loyalty_tier",
        MAX(c."status") AS "status",
        COUNT(DISTINCT c."MaHD") AS "total_orders",
        COALESCE(SUM(c."ThanhTienBan"), 0) AS "total_spent",
        MAX(c."NgayHD") AS "last_purchase",
        MIN(c."NgayHD") AS "first_purchase",
        MAX(c."store_name") AS "store_primary",
        CASE 
          WHEN COUNT(DISTINCT c."MaHD") > 0 
          THEN ROUND(COALESCE(SUM(c."ThanhTienBan"), 0) / COUNT(DISTINCT c."MaHD"), 0)
          ELSE 0 
        END AS "avg_basket",
        CASE 
          WHEN MAX(c."NgayHD") IS NOT NULL AND MIN(c."NgayHD") IS NOT NULL
          THEN ROUND(
            COUNT(DISTINCT c."MaHD")::NUMERIC / 
            GREATEST(
              EXTRACT(EPOCH FROM (MAX(c."NgayHD") - MIN(c."NgayHD"))) / 2592000.0,
              1
            ),
            2
          )
          ELSE 0
        END AS "frequency_month"
      FROM public.datamart_customer c
      WHERE c."MaTheKHTT" IS NOT NULL
      ${searchCondition}
      GROUP BY c."MaTheKHTT"
      ORDER BY "total_spent" DESC, "last_purchase" DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `,
    values: search ? [parseInt(limit), parseInt(offset), searchValue] : [parseInt(limit), parseInt(offset)]
  };
};

export const countCustomers = (search = '') => {
  const searchCondition = search
    ? `AND (LOWER("MaTheKHTT") LIKE LOWER($1) OR LOWER("name") LIKE LOWER($1) OR "phone" LIKE $1)`
    : '';
  const searchValue = search ? `%${search}%` : '';
  
  return {
    text: `
      SELECT COUNT(DISTINCT "MaTheKHTT") 
      FROM public.datamart_customer 
      WHERE "MaTheKHTT" IS NOT NULL
      ${searchCondition}
    `,
    values: search ? [searchValue] : []
  };
};

// Lấy top categories và products cho một khách hàng từ datamart_transaction
export const getCustomerCategories = (customerId) => ({
  text: `
    SELECT 
      "category_name" AS "name",
      COUNT(DISTINCT "MaHD") AS "orders",
      SUM("ThanhTienBan") AS "revenue"
    FROM public.datamart_transaction
    WHERE "MaTheKHTT" = $1 AND "category_name" IS NOT NULL
    GROUP BY "category_name"
    ORDER BY "revenue" DESC
    LIMIT 5
  `,
  values: [customerId]
});

export const getCustomerProducts = (customerId) => ({
  text: `
    SELECT 
      "TenHH" AS "name",
      COUNT(DISTINCT "MaHD") AS "orders",
      SUM("ThanhTienBan") AS "revenue"
    FROM public.datamart_transaction
    WHERE "MaTheKHTT" = $1 AND "TenHH" IS NOT NULL
    GROUP BY "TenHH"
    ORDER BY "revenue" DESC
    LIMIT 5
  `,
  values: [customerId]
});

export const getCustomerStores = (customerId) => ({
  text: `
    SELECT DISTINCT "store_name"
    FROM public.datamart_transaction
    WHERE "MaTheKHTT" = $1 AND "store_name" IS NOT NULL
    ORDER BY "store_name"
  `,
  values: [customerId]
});
