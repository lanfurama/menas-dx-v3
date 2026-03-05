import { memo } from 'react';
import { ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { T, ic, tooltipStyle } from '../../../constants/index.js';
import { Section } from '../../../components/Section.jsx';

const tt = tooltipStyle;

export const RevenueChart = memo(({ data, dbOn, showYoY = false, chartXKey = 'month' }) => {
  const isDaily = chartXKey === 'label';
  return (
    <div className="card fu fu2">
      <Section icon={ic.trend} title="Doanh thu & Đơn hàng" sql={!!dbOn}>
        {showYoY && <span className="badge" style={{ background: T.purple + '18', color: T.purple, fontSize: 10 }}>vs Năm trước</span>}
      </Section>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
          <XAxis
            dataKey={chartXKey}
            stroke={T.textMuted}
            fontSize={isDaily ? 9 : 11}
            angle={isDaily && data.length > 15 ? -45 : 0}
            textAnchor={isDaily && data.length > 15 ? 'end' : 'middle'}
            height={isDaily && data.length > 15 ? 50 : 30}
            interval={isDaily && data.length > 60 ? 'preserveStartEnd' : data.length > 30 ? 2 : 0}
          />
          <YAxis yAxisId="l" stroke={T.textMuted} fontSize={11} />
          <YAxis yAxisId="r" orientation="right" stroke={T.textMuted} fontSize={11} />
          <Tooltip {...tt} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area yAxisId="l" type="monotone" dataKey="revenue" fill={T.accent + '25'} stroke={T.accent} strokeWidth={2} name="Doanh thu" />
          {showYoY && <Line yAxisId="l" type="monotone" dataKey="prevRevenue" stroke={T.purple} strokeWidth={2} strokeDasharray="6 4" dot={false} name="DT cùng kỳ" />}
          <Bar yAxisId="r" dataKey="orders" fill={T.info + '70'} radius={[3, 3, 0, 0]} name="Đơn hàng" />
          {showYoY && <Line yAxisId="r" type="monotone" dataKey="prevOrders" stroke={T.info + '50'} strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Đơn cùng kỳ" />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

RevenueChart.displayName = 'RevenueChart';
