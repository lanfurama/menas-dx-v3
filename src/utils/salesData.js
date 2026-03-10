export function transformSalesData(dbOn, apiData, error, demoData) {
  if (dbOn && apiData && !error) {
    const apiPayments = (apiData.payments || []).map(p => ({
      method: p.method || 'Khác',
      amount: Number(p.amount) ?? 0,
      count: parseInt(p.count, 10) || 0
    }));
    return {
      catPerf: (apiData.catPerf || []).map(c => ({
        name: c.name || 'N/A',
        revenue: Number(c.revenue) ?? 0,
        discount: Number(c.discount) ?? 0,
        orders: parseInt(c.orders, 10) || 0
      })),
      storePerf: (apiData.storePerf || []).map(s => ({
        name: s.name || 'N/A',
        revenue: Number(s.revenue) ?? 0,
        discount: Number(s.discount) ?? 0,
        orders: parseInt(s.orders, 10) || 0
      })),
      payments: apiPayments,
      hourly: (apiData.hourly || []).length
        ? apiData.hourly
        : Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, orders: 0 })),
      discount: {
        ...(apiData.discount || {}),
        total: apiData.discount?.total ?? 0,
        gross_revenue: apiData.discount?.gross_revenue ?? 0,
        by_rate: apiData.discount?.by_rate || [],
        by_voucher: apiData.discount?.by_voucher || []
      },
      stores: apiData.stores || [],
      categories: apiData.categories || [],
      vouchers: apiData.vouchers || []
    };
  }
  const d = demoData || {};
  const demoDiscount = d.catPerf?.reduce((s, c) => s + (c.discount || 0), 0) ?? 0;
  const demoGross = d.catPerf?.reduce((s, c) => s + (c.revenue || 0) + (c.discount || 0), 0) ?? 0;
  const demoByRate = d.discountByRate || [
    { type: '5-10%', amount: 180000000, orders: 3200 },
    { type: '0-5%', amount: 120000000, orders: 5100 },
    { type: '10-20%', amount: 80000000, orders: 900 },
    { type: '>20%', amount: 54000000, orders: 400 }
  ];
  const demoByVoucher = d.discountByVoucher || [
    { type: 'SINHNHAT20', amount: 96000000, orders: 800 },
    { type: 'FLASH15', amount: 72000000, orders: 600 },
    { type: 'VIP10', amount: 48000000, orders: 1200 }
  ];
  return {
    catPerf: (d.catPerf || []).map(c => ({ ...c, discount: c.discount ?? 0 })),
    storePerf: (d.topStores || []).map(s => ({
      name: s.store_name || 'N/A',
      revenue: s.revenue ?? 0,
      discount: 0,
      orders: s.orders ?? 0
    })),
    payments: d.payments || [],
    hourly: d.hourly || Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, orders: 0 })),
    discount: { total: demoDiscount, gross_revenue: demoGross, by_rate: demoByRate, by_voucher: demoByVoucher },
    vouchers: d.vouchers || (d.discountByVoucher?.map(v => v.type) || ['SINHNHAT20', 'FLASH15', 'VIP10', 'KHACHMOI10']),
    stores: d.topStores?.map(s => s.store_name) || [],
    categories: [...new Set((d.catPerf || []).map(c => c.name))].filter(Boolean)
  };
}
