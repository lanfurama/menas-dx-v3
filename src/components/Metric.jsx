import { T } from '../constants/index.js';
import { Icon } from './Icon.jsx';

export const Metric = ({ icon, label, value, sub, idx = 0 }) => (
  <div className={`card fu fu${idx}`} style={{ position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: -25, right: -25, width: 80, height: 80, borderRadius: "50%", background: `${T.accent}08` }} />
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${T.accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={icon} s={16} c={T.accent} />
      </div>
      <span style={{ fontSize: 11, color: T.textSec, fontWeight: 500 }}>{label}</span>
    </div>
    <div className="counter">{value}</div>
    {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{sub}</div>}
  </div>
);
