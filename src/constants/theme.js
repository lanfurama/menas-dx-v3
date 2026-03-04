export const T = {
  bg: "#08080d",
  surface: "#101018",
  surfaceAlt: "#16161f",
  card: "#13131c",
  cardBorder: "#23233a",
  cardHover: "#2a2a45",
  accent: "#c8965a",
  accentLight: "#e0b87a",
  accentDim: "#8a6a3a",
  success: "#3ecf8e",
  warning: "#f0c040",
  danger: "#ef5350",
  info: "#5bb8f5",
  purple: "#a78bfa",
  pink: "#f472b6",
  teal: "#2dd4bf",
  text: "#eaeaf2",
  textSec: "#8888a0",
  textMuted: "#50506a",
  white: "#fff",
  grad: "linear-gradient(135deg,#c8965a 0%,#e0b87a 50%,#c8965a 100%)",
  zaloGreen: "#0068ff",
  aiGlow: "#a78bfa",
};

export const CL = [
  T.accent, T.info, T.success, T.warning, T.danger,
  T.purple, T.pink, T.teal, "#f97316", "#6366f1"
];

export const tooltipStyle = {
  contentStyle: {
    background: T.surface,
    border: `1px solid ${T.cardBorder}`,
    borderRadius: 10,
    color: T.text,
    fontSize: 12,
    fontFamily: "'Outfit',sans-serif"
  }
};
