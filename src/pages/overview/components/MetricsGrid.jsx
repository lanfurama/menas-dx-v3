import { memo } from 'react';
import { ic } from '../../../constants/index.js';
import { Metric } from '../../../components/Metric.jsx';
import { formatValue, formatNumber } from '../../../utils/format.js';

export const MetricsGrid = memo(({ overview, totalRev, totalOrders }) => {
  const o = overview;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
      <Metric icon={ic.users} label="Tổng KH" value={formatNumber(o.total_customers)} sub={o.active_customers != null ? `${formatNumber(o.active_customers)} active` : undefined} idx={1} />
      <Metric icon={ic.cart} label="AOV" value={formatValue(o.avg_order_value)} sub="Giá trị TB / đơn" idx={2} />
      <Metric icon={ic.star} label="KH mới tháng" value={o.new_this_month != null ? formatNumber(o.new_this_month) : '—'} idx={3} />
      <Metric icon={ic.trend} label="Doanh thu" value={formatValue(totalRev)} sub={`${formatNumber(totalOrders)} đơn`} idx={4} />
    </div>
  );
});

MetricsGrid.displayName = 'MetricsGrid';
