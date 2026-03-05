export const formatValue = (n) => {
  if (!n && n !== 0) return "—";
  const v = Number(n);
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v.toLocaleString("vi-VN");
};

export const formatNumber = (n) => (n != null && n !== "") ? Number(n).toLocaleString("vi-VN") : "—";

export const pctChange = (cur, prev) => {
  if (!prev || !cur) return null;
  return ((cur - prev) / prev * 100).toFixed(1);
};
