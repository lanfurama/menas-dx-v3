import { ic, T } from '../constants/index.js';

export function transformPredictionsData(dbOn, apiData, error, demoData, predM, extSignals) {
  if (dbOn && apiData && !error) {
    return {
      forecast: (apiData.forecast || []).map(f => ({
        month: f.month || 'T1',
        rev: Number(f.revenue) / 1e9 || 0,
        prevRev: Number(f.prevRevenue) / 1e9 || 0,
        orders: parseInt(f.orders, 10) || 0,
        newCust: parseInt(f.newCustomers, 10) || 0,
        churn: parseInt(f.churnRisk, 10) || 0,
      })),
      kpis: {
        totalRevenue: Number(apiData.totalRevenue) || 0,
        totalOrders: parseInt(apiData.totalOrders, 10) || 0,
        totalNew: parseInt(apiData.totalNewCustomers, 10) || 0,
        totalChurn: parseInt(apiData.totalChurnRisk, 10) || 0,
      },
      events: apiData.events || [],
      insights: apiData.insights || [],
    };
  }

  // Demo data
  const months = ["T6", "T7", "T8", "T9", "T10", "T11", "T12", "T1", "T2", "T3", "T4", "T5"];
  const baseRevs = [7.8, 8.1, 7.5, 8.3, 8.8, 9.5, 10.2, 12.5, 7.2, 8.0, 8.4, 8.9];
  const forecast = [];
  
  for (let i = 0; i < Math.min(predM, 12); i++) {
    const evts = extSignals.events.filter(e => {
      const em = new Date(e.date).getMonth();
      const fm = (5 + i + 1) % 12;
      return em === fm;
    });
    const boost = evts.reduce((s, e) => 
      s + (e.impact === "very_high" ? 0.4 : e.impact === "high" ? 0.2 : e.impact === "medium" ? 0.1 : 0.03), 0
    );
    const rev = baseRevs[i % 12] * (1 + boost) * (0.95 + Math.random() * 0.1);
    const orders = Math.round(rev * 380 + Math.random() * 200);
    const newCust = Math.round(420 + Math.random() * 180 + (boost > 0.1 ? 150 : 0));
    const churn = Math.round(280 - boost * 200 + Math.random() * 80);
    forecast.push({
      month: months[i % 12],
      rev: +rev.toFixed(1),
      orders,
      newCust,
      churn,
      events: evts,
      prevRev: baseRevs[i % 12] * 0.88
    });
  }

  const totalRev = forecast.reduce((s, f) => s + f.rev, 0);
  const totalOrders = forecast.reduce((s, f) => s + f.orders, 0);
  const totalNew = forecast.reduce((s, f) => s + f.newCust, 0);
  const totalChurn = forecast.reduce((s, f) => s + f.churn, 0);

  const now = new Date("2025-06-01");
  const end = new Date(now);
  end.setMonth(end.getMonth() + predM);
  const predEvents = extSignals.events.filter(e => {
    const d = new Date(e.date);
    return d >= now && d <= end;
  });

  const insights = [
    {
      c: T.danger,
      t: `${totalChurn.toLocaleString("vi-VN")} KH churn risk trong ${predM === 1 ? "1 tháng" : predM === 3 ? "Quý" : `${predM} tháng`}`,
      d: "Gửi ZNS win-back + offer cá nhân hoá. Ưu tiên KH At Risk có LTV > 15M.",
      ic2: ic.alert
    },
    {
      c: T.success,
      t: `Doanh thu dự báo tăng ${((totalRev / (predM * 8.5) - 1) * 100).toFixed(0)}% nhờ mùa lễ hội`,
      d: predEvents.length > 0
        ? `Sự kiện: ${predEvents.slice(0, 2).map(e => e.name).join(", ")}. Tăng stock thực phẩm & quà tặng.`
        : "Không có sự kiện lớn, tập trung retention.",
      ic2: ic.trend
    },
    {
      c: T.info,
      t: `Thời tiết ảnh hưởng danh mục: ${extSignals.weather.slice(0, Math.min(predM, 2)).map(w => w.impact).join("; ")}`,
      d: "Điều chỉnh inventory theo dự báo thời tiết. Đồ uống & đông lạnh peak mùa nóng.",
      ic2: ic.alert
    },
    {
      c: T.warning,
      t: "Đối thủ mở rộng — cần tăng loyalty retention",
      d: "CPI tăng 3.2% + đối thủ mới = áp lực. Đề xuất: Flash sale, tăng rewards points x2.",
      ic2: ic.target
    },
    {
      c: T.purple,
      t: "Xu hướng healthy food +35% — cơ hội mở rộng",
      d: "Cross-sell organic/healthy cho KH VIP. Thêm danh mục mới trong 90 ngày tới.",
      ic2: ic.package
    },
  ];

  return {
    forecast,
    kpis: {
      totalRevenue: totalRev,
      totalOrders,
      totalNew,
      totalChurn,
    },
    events: predEvents,
    insights,
  };
}
