// Demo data - sẽ được thay thế bằng API calls sau này
export const DEMO = {
  overview: {
    total_customers: 12847,
    active_customers: 9234,
    new_this_month: 487,
    avg_order_value: 2340000,
    prev_total_customers: 11200,
    prev_active: 8100,
    prev_new_month: 412,
    prev_aov: 2180000
  },
  revenueDaily: Array.from({ length: 90 }, (_, i) => {
    const d = new Date("2025-06-01");
    d.setDate(d.getDate() - (89 - i));
    const dow = d.getDay();
    const mf = 1 + Math.sin(d.getMonth() / 12 * Math.PI * 2) * 0.3;
    const wb = (dow === 0 || dow === 6) ? 1.3 : 1;
    const rev = Math.round((180 + Math.random() * 120) * mf * wb);
    const ord = Math.round((40 + Math.random() * 30) * mf * wb);
    return {
      date: d.toISOString().slice(0, 10),
      label: d.getDate() + "/" + (d.getMonth() + 1),
      month: "T" + (d.getMonth() + 1),
      revenue: rev,
      orders: ord,
      prevRevenue: Math.round(rev * (0.78 + Math.random() * 0.12)),
      prevOrders: Math.round(ord * (0.8 + Math.random() * 0.1))
    };
  }),
  revenueByMonth: [
    { month: "T1", revenue: 4200, orders: 1200, prevRevenue: 3600, prevOrders: 1050 },
    { month: "T2", revenue: 3800, orders: 1100, prevRevenue: 3400, prevOrders: 980 },
    { month: "T3", revenue: 5100, orders: 1450, prevRevenue: 4300, prevOrders: 1200 },
    { month: "T4", revenue: 4700, orders: 1350, prevRevenue: 4100, prevOrders: 1180 },
    { month: "T5", revenue: 5600, orders: 1600, prevRevenue: 4800, prevOrders: 1350 },
    { month: "T6", revenue: 6200, orders: 1780, prevRevenue: 5300, prevOrders: 1500 },
    { month: "T7", revenue: 5900, orders: 1690, prevRevenue: 5100, prevOrders: 1420 },
    { month: "T8", revenue: 6800, orders: 1950, prevRevenue: 5700, prevOrders: 1600 },
    { month: "T9", revenue: 7200, orders: 2060, prevRevenue: 6100, prevOrders: 1750 },
    { month: "T10", revenue: 6500, orders: 1860, prevRevenue: 5600, prevOrders: 1580 },
    { month: "T11", revenue: 7800, orders: 2230, prevRevenue: 6400, prevOrders: 1820 },
    { month: "T12", revenue: 8500, orders: 2430, prevRevenue: 7000, prevOrders: 2050 },
  ],
  segmentation: [
    { name: "VIP Platinum", value: 1284, color: "#e0e0e0" },
    { name: "VIP Gold", value: 2569, color: "#c8965a" },
    { name: "Regular", value: 5141, color: "#5bb8f5" },
    { name: "Occasional", value: 2568, color: "#8888a0" },
    { name: "At Risk", value: 1285, color: "#ef5350" }
  ],
  topStores: [
    { store_name: "CH Nguyễn Huệ", revenue: 2800000000, orders: 4520 },
    { store_name: "CH Lê Lợi", revenue: 2400000000, orders: 3890 },
    { store_name: "CH Phạm Ngọc Thạch", revenue: 2100000000, orders: 3400 },
    { store_name: "CH Hai Bà Trưng", revenue: 1900000000, orders: 3100 },
    { store_name: "CH Cách Mạng T8", revenue: 1700000000, orders: 2780 }
  ],
  topProducts: [
    { product_name: "Premium A", category_name: "Thực phẩm", qty_sold: 4520, revenue: 1580000000 },
    { product_name: "Gold B", category_name: "Đồ uống", qty_sold: 3890, revenue: 1360000000 },
    { product_name: "Silver C", category_name: "Thực phẩm", qty_sold: 3400, revenue: 1190000000 }
  ],
  rfm: [
    { segment: "Champions", count: 1284, avg_recency: 12, avg_frequency: 15, avg_monetary: 45000000 },
    { segment: "Loyal", count: 2569, avg_recency: 35, avg_frequency: 8, avg_monetary: 25000000 },
    { segment: "Potential", count: 2056, avg_recency: 55, avg_frequency: 4, avg_monetary: 12000000 },
    { segment: "New", count: 1542, avg_recency: 10, avg_frequency: 1, avg_monetary: 3000000 },
    { segment: "At Risk", count: 1928, avg_recency: 120, avg_frequency: 5, avg_monetary: 18000000 },
    { segment: "Hibernating", count: 1285, avg_recency: 200, avg_frequency: 1, avg_monetary: 2000000 }
  ],
  catPerf: [
    { name: "Thực phẩm", revenue: 3200000000, orders: 8500 },
    { name: "Đồ uống", revenue: 2400000000, orders: 6200 },
    { name: "Gia vị", revenue: 1800000000, orders: 4800 },
    { name: "Snack", revenue: 1500000000, orders: 3900 },
    { name: "Đông lạnh", revenue: 1200000000, orders: 3100 }
  ],
  payments: [
    { method: "Tiền mặt", amount: 35e9, count: 15200 },
    { method: "Chuyển khoản", amount: 28e9, count: 9800 },
    { method: "Thẻ tín dụng", amount: 20e9, count: 7200 },
    { method: "Ví điện tử", amount: 12e9, count: 5400 }
  ],
  hourly: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    orders: i < 7 ? 5 + Math.random() * 15 | 0 : i < 11 ? 40 + Math.random() * 80 | 0 : i < 14 ? 80 + Math.random() * 120 | 0 : i < 17 ? 30 + Math.random() * 60 | 0 : i < 21 ? 60 + Math.random() * 100 | 0 : 10 + Math.random() * 30 | 0
  })),
  customers: [
    {
      id: "1", name: "Nguyễn Văn An", phone: "0901234567", MaTheKHTT: "KH001", loyalty_tier: "Platinum", loyalty_points: 48500,
      total_spent: 52000000, total_orders: 156, last_purchase: "2025-05-28", first_purchase: "2022-01-15", avg_basket: 333333,
      frequency_month: 4.3, top_categories: ["Thực phẩm", "Đồ uống", "Gia vị"], top_products: ["Premium A", "Gold B"],
      sentiment: "Positive", segment: "Champions", store_primary: "CH Nguyễn Huệ",
      transaction_stores: ["CH Nguyễn Huệ", "CH Lê Lợi", "CH Phạm Ngọc Thạch"], last_txn_amount: 850000,
      has_zalo: true, zalo_oa_follow: true,
      persona: { value_seg: "VIP", lifecycle: "Loyal", aov_level: "High", freq_level: "Very High" }
    },
    // Thêm các customers khác nếu cần...
  ],
  znsTemplates: [
    { id: "t1", name: "Chào mừng KH mới", type: "transaction", status: "approved", params: ["customer_name", "store_name"] },
    { id: "t2", name: "Sinh nhật KH", type: "promotion", status: "approved", params: ["customer_name", "voucher_code"] },
    { id: "t3", name: "Chăm sóc VIP", type: "promotion", status: "approved", params: ["customer_name", "tier", "offer"] },
    { id: "t4", name: "Win-back", type: "promotion", status: "pending", params: ["customer_name", "offer"] },
    { id: "t5", name: "Flash Sale", type: "promotion", status: "approved", params: ["customer_name", "discount"] }
  ],
};
