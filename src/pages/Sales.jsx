import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area
} from 'recharts';
import { T, ic, CL, tooltipStyle } from '../constants/index.js';
import { Section } from '../components/Section.jsx';
import { ExportBtn } from '../components/ExportBtn.jsx';
import { useSales } from '../hooks/useSales.js';
import { transformSalesData } from '../utils/salesData.js';
import { formatValue } from '../utils/format.js';

const tt = tooltipStyle;

export function Sales({ dbOn, demoData, canExport }) {
  const { data: apiData, loading, error } = useSales(dbOn);
  const { catPerf, payments, hourly } = useMemo(
    () => transformSalesData(dbOn, apiData, error, demoData),
    [dbOn, apiData, error, demoData]
  );

  if (loading && dbOn) {
    return (
      <div className="fu" style={{ padding: 24, textAlign: 'center' }}>
        <div className="spin" style={{ width: 28, height: 28, margin: '0 auto 12px', borderWidth: 3 }} />
        <div style={{ fontSize: 14, color: T.textSec }}>Đang tải dữ liệu Sales...</div>
      </div>
    );
  }

  return (
    <div className="fu">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div className="card">
          <Section icon={ic.bar} title="Doanh thu danh mục" sql={!!dbOn}>
            <ExportBtn
              canExport={canExport}
              data={catPerf.map((c) => ({ DanhMuc: c.name, DoanhThu: c.revenue, SoDon: c.orders }))}
              filename="sales_categories"
            />
          </Section>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catPerf} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
              <XAxis type="number" stroke={T.textMuted} fontSize={11} tickFormatter={(v) => formatValue(v)} />
              <YAxis type="category" dataKey="name" stroke={T.textMuted} fontSize={11} width={70} />
              <Tooltip {...tt} formatter={(v) => formatValue(v)} />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]} name="Doanh thu">
                {catPerf.map((_, i) => (
                  <Cell key={i} fill={CL[i % CL.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <Section icon={ic.gift} title="Thanh toán" sql={!!dbOn} />
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={payments}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={68}
                paddingAngle={4}
                dataKey="amount"
                nameKey="method"
              >
                {payments.map((_, i) => (
                  <Cell key={i} fill={CL[i % CL.length]} />
                ))}
              </Pie>
              <Tooltip {...tt} formatter={(v) => formatValue(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {payments.map((p, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: CL[i % CL.length],
                    display: 'inline-block'
                  }}
                />
                {p.method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <Section icon={ic.clock} title="Đơn hàng theo giờ" sql={!!dbOn} />
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={hourly}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
            <XAxis dataKey="hour" stroke={T.textMuted} fontSize={10} />
            <YAxis stroke={T.textMuted} fontSize={10} />
            <Tooltip {...tt} />
            <Area type="monotone" dataKey="orders" stroke={T.accent} fill={`${T.accent}30`} strokeWidth={2} name="Đơn" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
