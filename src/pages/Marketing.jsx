import { useMemo } from 'react';
import { T, ic } from '../constants/index.js';
import { Section } from '../components/Section.jsx';
import { Metric } from '../components/Metric.jsx';
import { ExportBtn } from '../components/ExportBtn.jsx';
import { useMarketing } from '../hooks/useMarketing.js';
import { transformMarketingData } from '../utils/marketingData.js';

export function Marketing({ dbOn, demoData, canExport }) {
  const { data: apiData, loading, error } = useMarketing(dbOn);
  const { metrics, campaigns } = useMemo(
    () => transformMarketingData(dbOn, apiData, error, demoData),
    [dbOn, apiData, error, demoData]
  );

  if (loading && dbOn) {
    return (
      <div className="fu" style={{ padding: 24, textAlign: 'center' }}>
        <div className="spin" style={{ width: 28, height: 28, margin: '0 auto 12px', borderWidth: 3 }} />
        <div style={{ fontSize: 14, color: T.textSec }}>Đang tải dữ liệu Marketing...</div>
      </div>
    );
  }

  return (
    <div className="fu">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        <Metric icon={ic.target} label="Campaigns" value={metrics.campaigns} idx={1} />
        <Metric icon={ic.users} label="Reach" value={metrics.reach} idx={2} />
        <Metric icon={ic.trend} label="CTR" value={metrics.ctr} idx={3} />
      </div>
      <div className="card">
        <Section icon={ic.target} title="Chiến dịch" sql={!!dbOn}>
          <ExportBtn
            canExport={canExport}
            data={campaigns.map((c) => ({ Ten: c.name, Status: c.status, MucTieu: c.objective, Chi: c.spend, Reach: c.reach, CTR: c.ctr }))}
            filename="marketing_campaigns"
          />
        </Section>
        <div className="tw">
          <table>
            <thead>
              <tr>
                {['Tên', 'Status', 'Mục tiêu', 'Chi', 'Reach', 'CTR'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i} className="rh">
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>
                    <span className="badge" style={{ background: `${T.success}18`, color: T.success }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ color: T.textSec }}>{c.objective}</td>
                  <td style={{ fontWeight: 600 }}>{c.spend}</td>
                  <td>{c.reach}</td>
                  <td style={{ color: T.accent, fontWeight: 600 }}>{c.ctr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
