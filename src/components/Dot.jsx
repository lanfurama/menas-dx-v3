import { T } from '../constants/index.js';

export const Dot = ({ on, label }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: on ? `${T.success}18` : `${T.danger}18`, fontSize: 11, fontWeight: 600, color: on ? T.success : T.danger }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: on ? T.success : T.danger, ...(on ? { animation: "pulse 2s infinite" } : {}) }} />
    {label || (on ? "Connected" : "Demo")}
  </span>
);
