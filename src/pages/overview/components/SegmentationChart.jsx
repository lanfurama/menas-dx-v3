import { memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { T, ic, CL, tooltipStyle } from '../../../constants/index.js';
import { Section } from '../../../components/Section.jsx';
import { formatNumber } from '../../../utils/format.js';

const tt = tooltipStyle;

export const SegmentationChart = memo(({ data, dbOn }) => {
  return (
    <div className="card fu fu3">
      <Section icon={ic.target} title="Phân khúc" sql={!!dbOn} />
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
            {data.map((e, i) => (
              <Cell key={i} fill={e.color || CL[i % CL.length]} />
            ))}
          </Pie>
          <Tooltip {...tt} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.map((s, i) => (
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
  );
});

SegmentationChart.displayName = 'SegmentationChart';
