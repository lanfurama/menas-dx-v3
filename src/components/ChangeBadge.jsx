import { T } from '../constants/index.js';
import { pctChange } from '../utils/format.js';

export const ChangeBadge = ({ cur, prev }) => {
  const v = pctChange(cur, prev);
  if (v === null) return null;
  const up = Number(v) >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: up ? T.success : T.danger }}>
      {up ? "▲" : "▼"} {Math.abs(Number(v))}%
      <span style={{ fontWeight: 400, color: T.textMuted, marginLeft: 2 }}>vs cùng kỳ</span>
    </span>
  );
};
