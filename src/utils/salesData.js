export function transformSalesData(dbOn, apiData, error, demoData) {
  if (dbOn && apiData && !error) {
    const demo = demoData || {};
    const apiPayments = (apiData.payments || []).map(p => ({
      method: p.method || 'Khác',
      amount: Number(p.amount) ?? 0,
      count: parseInt(p.count, 10) || 0
    }));
    return {
      catPerf: (apiData.catPerf || []).map(c => ({
        name: c.name || 'N/A',
        revenue: Number(c.revenue) ?? 0,
        orders: parseInt(c.orders, 10) || 0
      })),
      payments: apiPayments.length ? apiPayments : (demo.payments || []),
      hourly: (apiData.hourly || []).length
        ? apiData.hourly
        : Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, orders: 0 }))
    };
  }
  const d = demoData || {};
  return {
    catPerf: d.catPerf || [],
    payments: d.payments || [],
    hourly: d.hourly || Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, orders: 0 }))
  };
}
