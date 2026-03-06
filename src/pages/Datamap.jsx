import { T, ic } from '../constants/index.js';
import { Section } from '../components/Section.jsx';

export function Datamap() {
  const layers = [
    { label: 'POS', sub: 'iPOS · ToPOS · KiotViet', color: T.success, icon: ic.cart },
    { label: '→', color: null },
    { label: 'OMS', sub: 'Chuẩn hóa', color: T.info, icon: ic.db },
    { label: '→', color: null },
    { label: 'DX', sub: '360° · AI', color: T.accent, icon: ic.zap },
  ];

  return (
    <div className="fu">
      <div className="card" style={{ marginBottom: 14 }}>
        <Section icon={ic.layers} title="Data Architecture" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {layers.map((s, i) =>
            s.color ? (
              <div
                key={i}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  background: T.bg,
                  border: `1px solid ${s.color}30`,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: `${s.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 4px',
                  }}
                >
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={s.icon} />
                  </svg>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{s.label}</div>
                <div style={{ fontSize: 9, color: T.textSec }}>{s.sub}</div>
              </div>
            ) : (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  color: T.textMuted,
                }}
              >
                →
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

