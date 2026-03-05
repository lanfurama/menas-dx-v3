import { useMemo, useState } from 'react';
import { T, ic } from '../constants/index.js';
import { useOverview } from '../hooks/useOverview.js';
import { transformOverviewData, calculateTotals } from '../utils/overviewData.js';
import { MetricsGrid } from './overview/components/MetricsGrid.jsx';
import { RevenueChart } from './overview/components/RevenueChart.jsx';
import { SegmentationChart } from './overview/components/SegmentationChart.jsx';
import { CategoryChart } from './overview/components/CategoryChart.jsx';
import { TopStoresList } from './overview/components/TopStoresList.jsx';
import { DataSourceInfo } from './overview/components/DataSourceInfo.jsx';
import { Icon } from '../components/Icon.jsx';
import { Toggle } from '../components/Toggle.jsx';

export function Overview({ dbOn, demoData, canExport, refetchKey }) {
  const { data: apiData, loading, error } = useOverview(dbOn, refetchKey);

  // Time filter state
  const [timePeriod, setTimePeriod] = useState('12m');
  const [showYoY, setShowYoY] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dash = useMemo(() => transformOverviewData(dbOn, apiData, error, demoData), [dbOn, apiData, error, demoData]);
  
  // Filter revenue data based on time period
  const filteredRevenue = useMemo(() => {
    const daily = demoData?.revenueDaily || [];
    const monthly = dash.revenueByMonth || [];
    
    if (timePeriod === 'custom' && dateFrom && dateTo) {
      return daily.filter(d => d.date >= dateFrom && d.date <= dateTo);
    }
    
    const now = daily.length ? daily[daily.length - 1].date : new Date().toISOString().slice(0, 10);
    const end = new Date(now);
    
    switch (timePeriod) {
      case 'today': {
        const t = now;
        return daily.filter(d => d.date === t);
      }
      case 'yesterday': {
        const y = new Date(end);
        y.setDate(y.getDate() - 1);
        return daily.filter(d => d.date === y.toISOString().slice(0, 10));
      }
      case '7d': {
        const s = new Date(end);
        s.setDate(s.getDate() - 6);
        return daily.filter(d => d.date >= s.toISOString().slice(0, 10));
      }
      case '30d': {
        const s = new Date(end);
        s.setDate(s.getDate() - 29);
        return daily.filter(d => d.date >= s.toISOString().slice(0, 10));
      }
      case '90d': {
        const s = new Date(end);
        s.setDate(s.getDate() - 89);
        return daily.filter(d => d.date >= s.toISOString().slice(0, 10));
      }
      case '1m':
        return monthly.slice(-1);
      case '3m':
        return monthly.slice(-3);
      case '6m':
        return monthly.slice(-6);
      case 'ytd':
        return monthly;
      case '12m':
      default:
        return monthly;
    }
  }, [timePeriod, dateFrom, dateTo, dash.revenueByMonth, demoData?.revenueDaily]);
  
  const isDaily = ['today', 'yesterday', '7d', '30d', '90d', 'custom'].includes(timePeriod);
  const chartXKey = isDaily ? 'label' : 'month';
  
  const { totalRev, totalOrders } = useMemo(() => {
    const rev = filteredRevenue.reduce((s, r) => s + (r.revenue || 0), 0) * (isDaily ? 1e6 : 1e6);
    const ord = filteredRevenue.reduce((s, r) => s + (r.orders || 0), 0);
    return { totalRev: rev, totalOrders: ord };
  }, [filteredRevenue, isDaily]);

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
      {/* Time period filter bar */}
      <div className="card" style={{ padding: '12px 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: showDatePicker ? 10 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <Icon d={ic.calendar} s={15} c={T.accent} />
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Thời gian:</span>
            {[
              { v: 'today', l: 'Hôm nay' },
              { v: 'yesterday', l: 'Hôm qua' },
              { v: '7d', l: '7 ngày' },
              { v: '30d', l: '30 ngày' },
              { v: '90d', l: '90 ngày' },
              { v: '6m', l: '6 tháng' },
              { v: '12m', l: '12 tháng' },
              { v: 'ytd', l: 'YTD' },
            ].map(p => (
              <button
                key={p.v}
                className={`chip ${timePeriod === p.v ? 'on' : ''}`}
                onClick={() => {
                  setTimePeriod(p.v);
                  setShowDatePicker(false);
                }}
                style={{ padding: '3px 8px', fontSize: 10 }}
              >
                {p.l}
              </button>
            ))}
            <button
              className={`chip ${timePeriod === 'custom' ? 'on' : ''}`}
              onClick={() => {
                setTimePeriod('custom');
                setShowDatePicker(true);
              }}
              style={{ padding: '3px 8px', fontSize: 10 }}
            >
              <Icon d={ic.calendar} s={10} /> Tuỳ chọn
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: T.textSec }}>So sánh cùng kỳ:</span>
            <Toggle on={showYoY} onClick={() => setShowYoY(!showYoY)} />
          </div>
        </div>
        {/* Custom date range picker */}
        {showDatePicker && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0 2px', borderTop: `1px solid ${T.cardBorder}40`, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: T.textSec, fontWeight: 600 }}>Từ ngày:</span>
            <input
              type="date"
              className="inp"
              style={{ maxWidth: 160, fontSize: 12 }}
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
            <span style={{ fontSize: 11, color: T.textSec, fontWeight: 600 }}>Đến ngày:</span>
            <input
              type="date"
              className="inp"
              style={{ maxWidth: 160, fontSize: 12 }}
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
            {dateFrom && dateTo && (
              <span className="badge" style={{ background: `${T.accent}18`, color: T.accent }}>
                {Math.round((new Date(dateTo) - new Date(dateFrom)) / 864e5) + 1} ngày
              </span>
            )}
            {/* Quick date presets */}
            <div style={{ display: 'flex', gap: 4, marginLeft: 6 }}>
              {[
                {
                  l: 'Tuần này',
                  fn: () => {
                    const n = new Date();
                    const s = new Date(n);
                    s.setDate(n.getDate() - n.getDay() + 1);
                    setDateFrom(s.toISOString().slice(0, 10));
                    setDateTo(n.toISOString().slice(0, 10));
                  },
                },
                {
                  l: 'Tháng này',
                  fn: () => {
                    const n = new Date();
                    setDateFrom(new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10));
                    setDateTo(n.toISOString().slice(0, 10));
                  },
                },
                {
                  l: 'Quý này',
                  fn: () => {
                    const n = new Date();
                    const q = Math.floor(n.getMonth() / 3);
                    setDateFrom(new Date(n.getFullYear(), q * 3, 1).toISOString().slice(0, 10));
                    setDateTo(n.toISOString().slice(0, 10));
                  },
                },
                {
                  l: 'Năm nay',
                  fn: () => {
                    const n = new Date();
                    setDateFrom(new Date(n.getFullYear(), 0, 1).toISOString().slice(0, 10));
                    setDateTo(n.toISOString().slice(0, 10));
                  },
                },
              ].map(q => (
                <button key={q.l} className="chip" style={{ padding: '2px 7px', fontSize: 9 }} onClick={q.fn}>
                  {q.l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <MetricsGrid overview={dash.overview} totalRev={totalRev} totalOrders={totalOrders} />

      <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', gap: 12, marginBottom: 16 }}>
        <RevenueChart data={filteredRevenue} dbOn={dbOn} showYoY={showYoY} chartXKey={chartXKey} />
        <SegmentationChart data={dash.segmentation} dbOn={dbOn} />
      </div>

      <CategoryChart data={dash.catPerf} dbOn={dbOn} canExport={canExport} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TopStoresList data={dash.topStores} dbOn={dbOn} canExport={canExport} />
        <DataSourceInfo dbOn={dbOn} />
      </div>
    </div>
  );
}
