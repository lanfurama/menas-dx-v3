// Sales page queries – catPerf, payments, hourly, discount
// Filters: dateFrom, dateTo, store, category

const buildWhere = (params) => {
  const conds = ['1=1'];
  const vals = [];
  let i = 1;
  if (params?.dateFrom) { conds.push(`"NgayGioQuet"::date >= $${i++}`); vals.push(params.dateFrom); }
  if (params?.dateTo) { conds.push(`"NgayGioQuet"::date <= $${i++}`); vals.push(params.dateTo); }
  if (params?.store) { conds.push(`"store_name" = $${i++}`); vals.push(params.store); }
  if (params?.category) { conds.push(`"category_name" = $${i++}`); vals.push(params.category); }
  if (params?.voucher) {
    conds.push(`(COALESCE(NULLIF(TRIM("MaVoucher"::text), ''), NULLIF(TRIM("LoaiVoucher"::text), ''), NULLIF(TRIM("TenVoucher"::text), '')) = $${i})`);
    vals.push(params.voucher);
    i++;
  }
  return { where: conds.join(' AND '), values: vals };
};

export const getTopCategories = (params = {}) => {
  const { where, values } = buildWhere(params);
  return { text: `
    SELECT COALESCE("category_name", 'N/A') AS name,
      COALESCE(SUM("ThanhTienBan"), 0) AS revenue,
      COALESCE(SUM("TienGiamGia"), 0) AS discount,
      COUNT(DISTINCT "MaHD") AS orders
    FROM public.datamart_transaction WHERE ${where}
    GROUP BY "category_name"
    ORDER BY revenue DESC LIMIT 10
  `, values };
};

export const getTopStores = (params = {}) => {
  const { where, values } = buildWhere(params);
  return { text: `
    SELECT COALESCE("store_name", 'N/A') AS name,
      COALESCE(SUM("ThanhTienBan"), 0) AS revenue,
      COALESCE(SUM("TienGiamGia"), 0) AS discount,
      COUNT(DISTINCT "MaHD") AS orders
    FROM public.datamart_transaction WHERE ${where}
    GROUP BY "store_name"
    ORDER BY revenue DESC LIMIT 10
  `, values };
};

export const getPaymentsByMethod = (params = {}) => {
  const { where, values } = buildWhere(params);
  return { text: `
    SELECT COALESCE("PhuongThucThanhToan", 'Khác') AS method,
      COALESCE(SUM("ThanhTienBan"), 0) AS amount,
      COUNT(DISTINCT "MaHD") AS count
    FROM public.datamart_transaction
    WHERE (${where}) AND "PhuongThucThanhToan" IS NOT NULL AND TRIM("PhuongThucThanhToan"::text) <> ''
    GROUP BY "PhuongThucThanhToan"
    ORDER BY amount DESC LIMIT 10
  `, values };
};

export const getOrdersByHour = (params = {}) => {
  const { where, values } = buildWhere(params);
  return { text: `
    SELECT EXTRACT(HOUR FROM "NgayGioQuet")::int AS h,
      COUNT(DISTINCT "MaHD") AS orders
    FROM public.datamart_transaction
    WHERE "NgayGioQuet" IS NOT NULL AND ${where}
    GROUP BY EXTRACT(HOUR FROM "NgayGioQuet")
    ORDER BY h
  `, values };
};

export const getDiscountSummary = (params = {}) => {
  const { where, values } = buildWhere(params);
  return { text: `
    SELECT COALESCE(SUM("TienGiamGia"), 0) AS total_discount,
      COALESCE(SUM("ThanhTienBan"), 0) + COALESCE(SUM("TienGiamGia"), 0) AS gross_revenue
    FROM public.datamart_transaction WHERE ${where}
  `, values };
};

/** Giảm giá theo mức tỷ lệ % (TLCKGiamGia): 0-5%, 5-10%, 10-20%, >20% */
export const getDiscountByRate = (params = {}) => {
  const { where, values } = buildWhere(params);
  return { text: `
    SELECT
      CASE
        WHEN COALESCE("TLCKGiamGia", 0) <= 5 THEN '0-5%'
        WHEN COALESCE("TLCKGiamGia", 0) <= 10 THEN '5-10%'
        WHEN COALESCE("TLCKGiamGia", 0) <= 20 THEN '10-20%'
        ELSE '>20%'
      END AS rate_band,
      COALESCE(SUM("TienGiamGia"), 0) AS amount,
      COUNT(DISTINCT "MaHD") AS orders
    FROM public.datamart_transaction
    WHERE ${where} AND COALESCE("TienGiamGia", 0) > 0
    GROUP BY 1 ORDER BY amount DESC
  `, values };
};

/** Giảm giá theo loại voucher (nếu có cột MaVoucher/LoaiVoucher/TenVoucher) */
export const getDiscountByVoucher = (params = {}) => {
  const { where, values } = buildWhere(params);
  return { text: `
    SELECT COALESCE(NULLIF(TRIM("MaVoucher"::text), ''), NULLIF(TRIM("LoaiVoucher"::text), ''), NULLIF(TRIM("TenVoucher"::text), ''), 'Không mã') AS voucher_type,
      COALESCE(SUM("TienGiamGia"), 0) AS amount,
      COUNT(DISTINCT "MaHD") AS orders
    FROM public.datamart_transaction
    WHERE ${where} AND COALESCE("TienGiamGia", 0) > 0
    GROUP BY COALESCE(NULLIF(TRIM("MaVoucher"::text), ''), NULLIF(TRIM("LoaiVoucher"::text), ''), NULLIF(TRIM("TenVoucher"::text), ''), 'Không mã')
    ORDER BY amount DESC LIMIT 15
  `, values };
};

export const getStoresForSales = () => ({
  text: `SELECT DISTINCT "store_name" FROM public.datamart_transaction WHERE "store_name" IS NOT NULL AND TRIM("store_name"::text) <> '' ORDER BY "store_name"`,
  values: []
});

export const getCategoriesForSales = () => ({
  text: `SELECT DISTINCT "category_name" FROM public.datamart_transaction WHERE "category_name" IS NOT NULL AND TRIM("category_name"::text) <> '' ORDER BY "category_name"`,
  values: []
});

/** Danh sách mã giảm giá cho filter (MaVoucher/LoaiVoucher/TenVoucher - cột nào có dùng cột đó) */
export const getVouchersForSales = () => ({
  text: `SELECT DISTINCT COALESCE(NULLIF(TRIM("MaVoucher"::text), ''), NULLIF(TRIM("LoaiVoucher"::text), ''), NULLIF(TRIM("TenVoucher"::text), '')) AS voucher_code
    FROM public.datamart_transaction
    WHERE COALESCE("TienGiamGia", 0) > 0
    ORDER BY voucher_code`,
  values: []
});
