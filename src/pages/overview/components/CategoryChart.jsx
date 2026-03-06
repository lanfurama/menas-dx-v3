import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { T, ic, CL, tooltipStyle } from '../../../constants/index.js';
import { Section } from '../../../components/Section.jsx';
import { ExportBtn } from '../../../components/ExportBtn.jsx';
import { formatValue, formatNumber } from '../../../utils/format.js';
import { useBreakpoint } from '../../../hooks/useBreakpoint.js';

const tt = tooltipStyle;

export const CategoryChart = memo(({ data, dbOn, canExport }) => {
  const isMobile = useBreakpoint(768);

  return (
    <div className="card fu" style={{ marginBottom: 16 }}>
      <Section icon={ic.package} title="Top danh mục bán chạy" sql={!!dbOn}>
        <ExportBtn
          canExport={canExport}
          data={data.map((c) => ({ DanhMuc: c.name, DoanhThu: c.revenue, SoDon: c.orders }))}
          filename="top_categories"
        />
      </Section>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
          gap: 16,
        }}
      >
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 180}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
            <XAxis
              type="number"
              stroke={T.textMuted}
              fontSize={10}
              tickFormatter={(v) => formatValue(v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke={T.textMuted}
              fontSize={11}
              width={isMobile ? 90 : 75}
            />
            <Tooltip {...tt} formatter={(v) => formatValue(v)} />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]} name="Doanh thu">
              {data.map((_, i) => (
                <Cell key={i} fill={CL[i % CL.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.map((c, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: i < data.length - 1 ? '1px solid ' + T.cardBorder + '50' : 'none',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: CL[i % CL.length],
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>
                  {formatNumber(c.orders)} đơn
                </div>
              </div>
              <div className="counter" style={{ fontSize: 13 }}>
                {formatValue(c.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

CategoryChart.displayName = 'CategoryChart';
