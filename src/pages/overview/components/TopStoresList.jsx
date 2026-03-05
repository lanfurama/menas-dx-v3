import { memo } from 'react';
import { T, ic } from '../../../constants/index.js';
import { Section } from '../../../components/Section.jsx';
import { ExportBtn } from '../../../components/ExportBtn.jsx';
import { formatValue, formatNumber } from '../../../utils/format.js';

export const TopStoresList = memo(({ data, dbOn, canExport }) => {
  return (
    <div className="card fu fu3">
      <Section icon={ic.map} title="Top cửa hàng" sql={!!dbOn}>
        <ExportBtn canExport={canExport} data={data.map((s) => ({ CuaHang: s.store_name, DoanhThu: s.revenue, SoDon: s.orders }))} filename="top_stores" />
      </Section>
      {data.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < data.length - 1 ? '1px solid ' + T.cardBorder + '50' : 'none' }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: T.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: T.accent }}>{i + 1}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.store_name}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>{formatNumber(s.orders)} đơn</div>
          </div>
          <span className="counter" style={{ fontSize: 14 }}>{formatValue(s.revenue)}</span>
        </div>
      ))}
    </div>
  );
});

TopStoresList.displayName = 'TopStoresList';
