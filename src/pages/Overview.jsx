import { useState, useEffect } from 'react';
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart
} from 'recharts';
import { T, ic, CL, tooltipStyle } from '../constants/index.js';
import { Section } from '../components/Section.jsx';
import { Metric } from '../components/Metric.jsx';
import { ExportBtn } from '../components/ExportBtn.jsx';
import { formatValue, formatNumber } from '../utils/format.js';
import { dbApi } from '../services/api.js';

const tt = tooltipStyle;

function useOverview(dbOn, refetchKey) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dbOn) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    dbApi.getOverview()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Lỗi tải dữ liệu');
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [dbOn, refetchKey]);

  return { data, loading, error };
}

export function Overview({ dbOn, demoData, canExport, refetchKey }) {
  const { data: apiData, loading, error } = useOverview(dbOn, refetchKey);

  const dash = (() => {
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
  })();

  const o = dash.overview;
  const totalRev = o.total_revenue ?? (dash.revenueByMonth?.reduce((s, r) => s + (r.revenue || 0), 0) * 1e6) ?? 0;
  const totalOrders = o.total_orders ?? dash.revenueByMonth?.reduce((s, r) => s + (r.orders || 0), 0) ?? 0;

  if (dbOn && loading) {
    return (
      <div className="fu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
        <div className="spin" />
        <span style={{ marginLeft: 12, color: T.textSec }}>Đang tải dữ liệu từ database...</span>
      </div>
    );
  }

  if (dbOn && error) {
    return (
      <div className="fu card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ color: T.danger, marginBottom: 8 }}>Không tải được dữ liệu</div>
        <div style={{ fontSize: 12, color: T.textSec }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="fu">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <Metric icon={ic.users} label="Tổng KH" value={formatNumber(o.total_customers)} sub={o.active_customers != null ? `${formatNumber(o.active_customers)} active` : undefined} idx={1} />
        <Metric icon={ic.cart} label="AOV" value={formatValue(o.avg_order_value)} sub="Giá trị TB / đơn" idx={2} />
        <Metric icon={ic.star} label="KH mới tháng" value={o.new_this_month != null ? formatNumber(o.new_this_month) : '—'} idx={3} />
        <Metric icon={ic.trend} label="Doanh thu" value={formatValue(totalRev)} sub={`${formatNumber(totalOrders)} đơn`} idx={4} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', gap: 12, marginBottom: 16 }}>
        <div className="card fu fu2">
          <Section icon={ic.trend} title="Doanh thu & Đơn hàng" sql={!!dbOn} />
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={dash.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
              <XAxis dataKey="month" stroke={T.textMuted} fontSize={11} />
              <YAxis yAxisId="l" stroke={T.textMuted} fontSize={11} />
              <YAxis yAxisId="r" orientation="right" stroke={T.textMuted} fontSize={11} />
              <Tooltip {...tt} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="l" type="monotone" dataKey="revenue" fill={T.accent + '25'} stroke={T.accent} strokeWidth={2} name="Doanh thu (triệu)" />
              <Bar yAxisId="r" dataKey="orders" fill={T.info + '70'} radius={[3, 3, 0, 0]} name="Đơn hàng" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="card fu fu3">
          <Section icon={ic.target} title="Phân khúc" sql={!!dbOn} />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={dash.segmentation} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {dash.segmentation.map((e, i) => (
                  <Cell key={i} fill={e.color || CL[i % CL.length]} />
                ))}
              </Pie>
              <Tooltip {...tt} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {dash.segmentation.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color || CL[i], display: 'inline-block' }} />
                  <span style={{ color: T.text }}>{s.name}</span>
                </div>
                <span style={{ color: T.textMuted, fontWeight: 700 }}>{formatNumber(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card fu" style={{ marginBottom: 16 }}>
        <Section icon={ic.package} title="Top danh mục bán chạy" sql={!!dbOn}>
          <ExportBtn canExport={canExport} data={dash.catPerf.map((c) => ({ DanhMuc: c.name, DoanhThu: c.revenue, SoDon: c.orders }))} filename="top_categories" />
        </Section>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dash.catPerf} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
              <XAxis type="number" stroke={T.textMuted} fontSize={10} tickFormatter={(v) => formatValue(v)} />
              <YAxis type="category" dataKey="name" stroke={T.textMuted} fontSize={11} width={75} />
              <Tooltip {...tt} formatter={(v) => formatValue(v)} />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]} name="Doanh thu">
                {dash.catPerf.map((_, i) => (
                  <Cell key={i} fill={CL[i % CL.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dash.catPerf.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < dash.catPerf.length - 1 ? '1px solid ' + T.cardBorder + '50' : 'none' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CL[i % CL.length], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>{formatNumber(c.orders)} đơn</div>
                </div>
                <div className="counter" style={{ fontSize: 13 }}>{formatValue(c.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card fu fu3">
          <Section icon={ic.map} title="Top cửa hàng" sql={!!dbOn}>
            <ExportBtn canExport={canExport} data={dash.topStores.map((s) => ({ CuaHang: s.store_name, DoanhThu: s.revenue, SoDon: s.orders }))} filename="top_stores" />
          </Section>
          {dash.topStores.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < dash.topStores.length - 1 ? '1px solid ' + T.cardBorder + '50' : 'none' }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: T.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: T.accent }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.store_name}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{formatNumber(s.orders)} đơn</div>
              </div>
              <span className="counter" style={{ fontSize: 14 }}>{formatValue(s.revenue)}</span>
            </div>
          ))}
        </div>
        <div className="card fu fu4">
          <Section icon={ic.bar} title="Nguồn dữ liệu" sql={!!dbOn} />
          <div style={{ padding: '12px 0', fontSize: 13, color: T.textSec }}>
            {dbOn ? (
              <>Lấy từ <strong style={{ color: T.success }}>database bên ngoài</strong> theo cấu hình đã lưu trong <strong>db_config</strong> (datamart_customer, datamart_transaction).</>
            ) : (
              <>Đang dùng <strong style={{ color: T.warning }}>dữ liệu demo</strong>. Cài đặt → Lưu cấu hình DB để lấy dữ liệu từ database bên ngoài.</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
