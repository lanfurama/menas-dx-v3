import { T } from '../constants/index.js';
import { Icon } from './Icon.jsx';

export const Section = ({ icon, title, sql, children }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 6 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <Icon d={icon} s={16} c={T.accent} />
      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</span>
      {sql && <span className="sql-tag">SQL</span>}
    </div>
    {children}
  </div>
);
