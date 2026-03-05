export function transformOverviewData(dbOn, apiData, error, demoData) {
  if (dbOn && apiData && !error) {
    const o = apiData.overview || {};
    return {
      overview: {
        total_customers: o.total_customers ?? 0,
        active_customers: o.active_customers ?? 0,
        new_this_month: o.new_this_month ?? null,
        avg_order_value: o.avg_order_value ?? 0,
        total_revenue: o.total_revenue ?? 0,
        total_orders: o.total_orders ?? 0
      },
      revenueByMonth: (apiData.revenueByMonth || []).map((r) => ({
        month: r.month,
        revenue: r.revenue ?? 0,
        orders: r.orders ?? 0
      })),
      topStores: apiData.topStores || [],
      catPerf: apiData.catPerf || [],
      segmentation: apiData.segmentation || []
    };
  }
  const d = demoData || {};
  const rev = d.revenueByMonth || [];
  const totalRev = rev.reduce((s, r) => s + (r.revenue || 0), 0) * 1e6;
  const totalOrd = rev.reduce((s, r) => s + (r.orders || 0), 0);
  return {
    overview: {
      ...d.overview,
      total_revenue: totalRev,
      total_orders: totalOrd
    },
    revenueByMonth: rev,
    topStores: d.topStores || [],
    catPerf: d.catPerf || [],
    segmentation: d.segmentation || []
  };
}

export function calculateTotals(dash) {
  const o = dash.overview;
  const totalRev = o.total_revenue ?? (dash.revenueByMonth?.reduce((s, r) => s + (r.revenue || 0), 0) * 1e6) ?? 0;
  const totalOrders = o.total_orders ?? dash.revenueByMonth?.reduce((s, r) => s + (r.orders || 0), 0) ?? 0;
  return { totalRev, totalOrders };
}
