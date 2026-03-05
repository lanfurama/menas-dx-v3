import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart
} from "recharts";

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════
const T = {
  bg:"#08080d",surface:"#101018",surfaceAlt:"#16161f",
  card:"#13131c",cardBorder:"#23233a",cardHover:"#2a2a45",
  accent:"#c8965a",accentLight:"#e0b87a",accentDim:"#8a6a3a",
  success:"#3ecf8e",warning:"#f0c040",danger:"#ef5350",
  info:"#5bb8f5",purple:"#a78bfa",pink:"#f472b6",teal:"#2dd4bf",
  text:"#eaeaf2",textSec:"#8888a0",textMuted:"#50506a",white:"#fff",
  grad:"linear-gradient(135deg,#c8965a 0%,#e0b87a 50%,#c8965a 100%)",
  zaloGreen:"#0068ff",aiGlow:"#a78bfa",
};
const CL=[T.accent,T.info,T.success,T.warning,T.danger,T.purple,T.pink,T.teal,"#f97316","#6366f1"];
const tt={contentStyle:{background:T.surface,border:`1px solid ${T.cardBorder}`,borderRadius:10,color:T.text,fontSize:12,fontFamily:"'Outfit',sans-serif"}};

// ═══════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════
const I=({d,s=17,c="currentColor"})=>{
  const segs=d.split(/\s(?=M)/);
  return(<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{segs.map((p,i)=><path key={i} d={p}/>)}</svg>);
};
const ic={
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  users:"M18 21v-2a4 4 0 00-4-4H10a4 4 0 00-4-4v2 M12 3a4 4 0 110 8 4 4 0 010-8z M22 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  cart:"M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6",
  target:"M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0 M12 12m-6 0a6 6 0 1012 0 6 6 0 10-12 0 M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0",
  zap:"M13 2L3 14h9l-1 8 10-12h-9l1-8",
  layers:"M12 2L2 7l10 5 10-5-10-5 M2 17l10 5 10-5 M2 12l10 5 10-5",
  settings:"M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0 M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  search:"M11 11m-8 0a8 8 0 1016 0 8 8 0 10-16 0 M21 21l-4.35-4.35",
  db:"M12 2C6.48 2 2 4.02 2 6.5V17.5C2 19.98 6.48 22 12 22S22 19.98 22 17.5V6.5C22 4.02 17.52 2 12 2 M2 6.5C2 8.98 6.48 11 12 11S22 8.98 22 6.5 M2 12C2 14.48 6.48 16.5 12 16.5S22 14.48 22 12",
  check:"M20 6L9 17l-5-5",x:"M18 6L6 18 M6 6l12 12",
  filter:"M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  send:"M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  msg:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  clock:"M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0 M12 6v6l4 2",
  trend:"M23 6l-9.5 9.5-5-5L1 18",
  bar:"M18 20V10 M12 20V4 M6 20v-6",
  gift:"M20 12v10H4V12 M2 7h20v5H2z M12 22V7",
  map:"M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4",
  download:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  alert:"M12 2L2 22h20L12 2z M12 9v4 M12 17h.01",
  play:"M5 3l14 9-14 9V3z",
  phone:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  userCheck:"M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2 M8.5 11a4 4 0 100-8 4 4 0 000 8 M17 11l2 2 4-4",
  package:"M16.5 9.4l-9-5.19 M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  dollar:"M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  repeat:"M17 1l4 4-4 4 M3 11V9a4 4 0 014-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 01-4 4H3",
  sliders:"M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  lock:"M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0",
  brain:"M12 2a7 7 0 017 7c0 3-2 5.5-4 7l-3 4-3-4c-2-1.5-4-4-4-7a7 7 0 017-7z",
  sparkle:"M12 3v18 M5.636 5.636l12.728 12.728 M3 12h18 M5.636 18.364L18.364 5.636",
  logout:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  plus:"M12 5v14 M5 12h14",
  minus:"M5 12h14",
  key:"M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  calendar:"M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4 M8 2v4 M3 10h18",
  fileText:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  clipboard:"M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2 M8 2h8a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1z",
};

// ═══════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════
const css=`
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:${T.bg}}
::-webkit-scrollbar-thumb{background:${T.cardBorder};border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:${T.accent}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 8px ${T.aiGlow}30}50%{box-shadow:0 0 20px ${T.aiGlow}50}}
@keyframes typing{0%{opacity:.3}50%{opacity:1}100%{opacity:.3}}
.fu{animation:fadeUp .45s ease both}
.fu1{animation-delay:.05s}.fu2{animation-delay:.1s}.fu3{animation-delay:.15s}.fu4{animation-delay:.2s}
.card{background:${T.card};border:1px solid ${T.cardBorder};border-radius:14px;padding:20px;transition:border-color .3s}
.card:hover{border-color:${T.cardHover}}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;transition:all .2s;white-space:nowrap}
.btn-p{background:${T.accent};color:${T.bg}}.btn-p:hover{background:${T.accentLight};transform:translateY(-1px)}
.btn-g{background:transparent;color:${T.textSec};border:1px solid ${T.cardBorder}}.btn-g:hover{border-color:${T.accent};color:${T.accent}}
.btn-d{background:${T.danger};color:#fff}
.btn-z{background:${T.zaloGreen};color:#fff}.btn-z:hover{background:#0054cc}
.btn-ai{background:linear-gradient(135deg,${T.purple},${T.pink});color:#fff}.btn-ai:hover{transform:translateY(-1px);box-shadow:0 4px 15px ${T.purple}40}
.btn-sm{padding:5px 12px;font-size:11px}
.btn[disabled]{opacity:.4;cursor:not-allowed;transform:none!important}
.inp{width:100%;padding:9px 13px;border-radius:8px;border:1px solid ${T.cardBorder};background:${T.surface};color:${T.text};font-family:'Outfit',sans-serif;font-size:13px;outline:none;transition:border-color .2s}
.inp:focus{border-color:${T.accent}}.inp::placeholder{color:${T.textMuted}}
input[type="date"].inp{color-scheme:dark}
select.inp{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238888a0' fill='none' stroke-width='1.5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
textarea.inp{min-height:60px;resize:vertical;font-size:13px;line-height:1.5;font-family:'Outfit',sans-serif}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.03em}
.tw{overflow-x:auto}
table{width:100%;border-collapse:separate;border-spacing:0 3px}
th{padding:7px 11px;font-size:10px;font-weight:700;color:${T.textMuted};text-align:left;text-transform:uppercase;letter-spacing:.07em;white-space:nowrap}
td{padding:9px 11px;font-size:13px;color:${T.text};white-space:nowrap}
tr.rh{cursor:pointer;transition:background .15s}
tr.rh:hover td{background:${T.surfaceAlt}}
tr.rh td:first-child{border-radius:8px 0 0 8px}
tr.rh td:last-child{border-radius:0 8px 8px 0}
.spin{width:18px;height:18px;border:2px solid ${T.cardBorder};border-top-color:${T.accent};border-radius:50%;animation:spin .6s linear infinite}
.tab{padding:11px 16px;background:transparent;border:none;cursor:pointer;color:${T.textMuted};font-family:'Outfit',sans-serif;font-size:12px;font-weight:500;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap}
.tab:hover{color:${T.text}}.tab.on{color:${T.accent};border-bottom-color:${T.accent};font-weight:700}
.chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid ${T.cardBorder};background:transparent;color:${T.textSec};transition:all .15s;font-family:'Outfit',sans-serif}
.chip:hover{border-color:${T.accent};color:${T.accent}}
.chip.on{background:${T.accent}20;border-color:${T.accent};color:${T.accent}}
.range-row{display:flex;align-items:center;gap:8px}.range-row .inp{max-width:120px;text-align:center}
.sql-tag{display:inline-block;padding:2px 7px;border-radius:4px;background:${T.accentDim}30;color:${T.accent};font-size:10px;font-weight:700;font-family:monospace}
.counter{font-size:28px;font-weight:800;font-family:'Libre Baskerville',serif;letter-spacing:-.02em;color:${T.text}}
.label-sm{font-size:10px;font-weight:700;color:${T.textMuted};text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:4px}
.no-access{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center}
.no-access svg{margin-bottom:16px;opacity:.3}
.chat-bubble{padding:12px 16px;border-radius:14px;max-width:85%;line-height:1.6;font-size:13px;word-wrap:break-word;white-space:pre-wrap}
.chat-user{background:${T.accent}20;color:${T.text};border-bottom-right-radius:4px;align-self:flex-end}
.chat-ai{background:${T.surfaceAlt};color:${T.text};border-bottom-left-radius:4px;align-self:flex-start;border:1px solid ${T.cardBorder}}
.typing-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:${T.purple};margin:0 2px;animation:typing 1s infinite}
.typing-dot:nth-child(2){animation-delay:.2s}.typing-dot:nth-child(3){animation-delay:.4s}
.toggle{position:relative;width:40px;height:22px;border-radius:11px;background:${T.cardBorder};cursor:pointer;transition:background .2s;border:none}
.toggle.on{background:${T.success}}
.toggle::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
.toggle.on::after{transform:translateX(18px)}
.perm-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:8px;transition:background .15s}
.perm-row:hover{background:${T.surfaceAlt}}
`;

// ═══════════════════════════════════════════════════════════════
// RBAC SYSTEM
// ═══════════════════════════════════════════════════════════════
const ROLES = {
  admin: {
    label: "Admin", color: T.danger,
    tabs: ["overview","customers","segment","sales","marketing","zalo","predictions","ai_chat","report","datamap","activity_log","settings","user_mgmt"],
    canExport: true, canEditPermissions: true, canManageUsers: true, canConfigDB: true, canConfigZalo: true, canConfigAI: true,
  },
  manager: {
    label: "Manager", color: T.warning,
    tabs: ["overview","customers","segment","sales","marketing","zalo","predictions","ai_chat","report"],
    canExport: false, canEditPermissions: false, canManageUsers: false, canConfigDB: false, canConfigZalo: false, canConfigAI: false,
  },
  viewer: {
    label: "Viewer", color: T.info,
    tabs: ["overview","sales"],
    canExport: false, canEditPermissions: false, canManageUsers: false, canConfigDB: false, canConfigZalo: false, canConfigAI: false,
  },
};

const DEFAULT_USERS = [
  { id:"u1", name:"Admin", email:"admin@menas.vn", role:"admin", status:"active", avatar:"A", permissions:{ tabs:["overview","customers","segment","sales","marketing","zalo","predictions","ai_chat","report","datamap","activity_log","settings","user_mgmt"], canExport:true }},
  { id:"u2", name:"Nguyễn Marketing", email:"marketing@menas.vn", role:"manager", status:"active", avatar:"N", permissions:{ tabs:["overview","customers","segment","marketing","zalo","ai_chat","report"], canExport:false }},
  { id:"u3", name:"Trần Sales", email:"sales@menas.vn", role:"manager", status:"active", avatar:"T", permissions:{ tabs:["overview","customers","sales","ai_chat","report"], canExport:true }},
  { id:"u4", name:"Lê Viewer", email:"viewer@menas.vn", role:"viewer", status:"active", avatar:"L", permissions:{ tabs:["overview","sales"], canExport:false }},
];

// ═══════════════════════════════════════════════════════════════
// AI MODELS CONFIG
// ═══════════════════════════════════════════════════════════════
const AI_MODELS = [
  { id:"claude", name:"Claude (Anthropic)", model:"claude-sonnet-4-20250514", provider:"anthropic", default:true, color:T.purple },
  { id:"gpt4", name:"GPT-4o (OpenAI)", model:"gpt-4o", provider:"openai", default:false, color:T.success },
  { id:"gemini", name:"Gemini Pro (Google)", model:"gemini-pro", provider:"google", default:false, color:T.info },
  { id:"local", name:"Local LLM (Ollama)", model:"llama3", provider:"ollama", default:false, color:T.warning },
];

// ═══════════════════════════════════════════════════════════════
// DEMO DATA (abbreviated)
// ═══════════════════════════════════════════════════════════════
const DEMO = {
  overview:{total_customers:12847,active_customers:9234,new_this_month:487,avg_order_value:2340000,
    prev_total_customers:11200,prev_active:8100,prev_new_month:412,prev_aov:2180000},
  // Daily data for last 90 days (pre-generated)
  revenueDaily: Array.from({length:90}, (_, i) => {
    const d = new Date("2025-06-01");
    d.setDate(d.getDate() - (89 - i));
    const dow = d.getDay();
    const mf = 1 + Math.sin(d.getMonth() / 12 * Math.PI * 2) * 0.3;
    const wb = (dow === 0 || dow === 6) ? 1.3 : 1;
    const rev = Math.round((180 + Math.random() * 120) * mf * wb);
    const ord = Math.round((40 + Math.random() * 30) * mf * wb);
    return {
      date: d.toISOString().slice(0, 10),
      label: d.getDate() + "/" + (d.getMonth() + 1),
      month: "T" + (d.getMonth() + 1),
      revenue: rev,
      orders: ord,
      prevRevenue: Math.round(rev * (0.78 + Math.random() * 0.12)),
      prevOrders: Math.round(ord * (0.8 + Math.random() * 0.1))
    };
  }),
  revenueByMonth:[
    {month:"T1",revenue:4200,orders:1200,prevRevenue:3600,prevOrders:1050},
    {month:"T2",revenue:3800,orders:1100,prevRevenue:3400,prevOrders:980},
    {month:"T3",revenue:5100,orders:1450,prevRevenue:4300,prevOrders:1200},
    {month:"T4",revenue:4700,orders:1350,prevRevenue:4100,prevOrders:1180},
    {month:"T5",revenue:5600,orders:1600,prevRevenue:4800,prevOrders:1350},
    {month:"T6",revenue:6200,orders:1780,prevRevenue:5300,prevOrders:1500},
    {month:"T7",revenue:5900,orders:1690,prevRevenue:5100,prevOrders:1420},
    {month:"T8",revenue:6800,orders:1950,prevRevenue:5700,prevOrders:1600},
    {month:"T9",revenue:7200,orders:2060,prevRevenue:6100,prevOrders:1750},
    {month:"T10",revenue:6500,orders:1860,prevRevenue:5600,prevOrders:1580},
    {month:"T11",revenue:7800,orders:2230,prevRevenue:6400,prevOrders:1820},
    {month:"T12",revenue:8500,orders:2430,prevRevenue:7000,prevOrders:2050},
  ],
  segmentation:[{name:"VIP Platinum",value:1284,color:"#e0e0e0"},{name:"VIP Gold",value:2569,color:"#c8965a"},{name:"Regular",value:5141,color:"#5bb8f5"},{name:"Occasional",value:2568,color:"#8888a0"},{name:"At Risk",value:1285,color:"#ef5350"}],
  topStores:[{store_name:"CH Nguyễn Huệ",revenue:2800000000,orders:4520},{store_name:"CH Lê Lợi",revenue:2400000000,orders:3890},{store_name:"CH Phạm Ngọc Thạch",revenue:2100000000,orders:3400},{store_name:"CH Hai Bà Trưng",revenue:1900000000,orders:3100},{store_name:"CH Cách Mạng T8",revenue:1700000000,orders:2780}],
  topProducts:[{product_name:"Premium A",category_name:"Thực phẩm",qty_sold:4520,revenue:1580000000},{product_name:"Gold B",category_name:"Đồ uống",qty_sold:3890,revenue:1360000000},{product_name:"Silver C",category_name:"Thực phẩm",qty_sold:3400,revenue:1190000000}],
  rfm:[{segment:"Champions",count:1284,avg_recency:12,avg_frequency:15,avg_monetary:45000000},{segment:"Loyal",count:2569,avg_recency:35,avg_frequency:8,avg_monetary:25000000},{segment:"Potential",count:2056,avg_recency:55,avg_frequency:4,avg_monetary:12000000},{segment:"New",count:1542,avg_recency:10,avg_frequency:1,avg_monetary:3000000},{segment:"At Risk",count:1928,avg_recency:120,avg_frequency:5,avg_monetary:18000000},{segment:"Hibernating",count:1285,avg_recency:200,avg_frequency:1,avg_monetary:2000000}],
  catPerf:[{name:"Thực phẩm",revenue:3200000000,orders:8500},{name:"Đồ uống",revenue:2400000000,orders:6200},{name:"Gia vị",revenue:1800000000,orders:4800},{name:"Snack",revenue:1500000000,orders:3900},{name:"Đông lạnh",revenue:1200000000,orders:3100}],
  payments:[{method:"Tiền mặt",amount:35e9,count:15200},{method:"Chuyển khoản",amount:28e9,count:9800},{method:"Thẻ tín dụng",amount:20e9,count:7200},{method:"Ví điện tử",amount:12e9,count:5400}],
  hourly:Array.from({length:24},(_,i)=>({hour:`${i}h`,orders:i<7?5+Math.random()*15|0:i<11?40+Math.random()*80|0:i<14?80+Math.random()*120|0:i<17?30+Math.random()*60|0:i<21?60+Math.random()*100|0:10+Math.random()*30|0})),
  customers:[
    {id:"1",name:"Nguyễn Văn An",phone:"0901234567",MaTheKHTT:"KH001",loyalty_tier:"Platinum",loyalty_points:48500,total_spent:52000000,total_orders:156,last_purchase:"2025-05-28",first_purchase:"2022-01-15",avg_basket:333333,frequency_month:4.3,top_categories:["Thực phẩm","Đồ uống","Gia vị"],top_products:["Premium A","Gold B"],sentiment:"Positive",segment:"Champions",store_primary:"CH Nguyễn Huệ",transaction_stores:["CH Nguyễn Huệ","CH Lê Lợi","CH Phạm Ngọc Thạch"],last_txn_amount:850000,has_zalo:true,zalo_oa_follow:true,
      persona:{value_seg:"VIP",lifecycle:"Loyal",aov_level:"High",freq_level:"Very High",product_persona:["Premium Buyer","Health-Conscious"],payment_persona:"Mixed (Cash + Card)",price_sens:"Quality First",shop_mission:"Weekly Stock-up",channel:"Zalo + In-store",note:"KH trung thành, luôn mua Premium. Thích tích điểm đổi quà."}},
    {id:"2",name:"Trần Thị Bình",phone:"0983777213",MaTheKHTT:"KH002",loyalty_tier:"Gold",loyalty_points:22300,total_spent:28000000,total_orders:89,last_purchase:"2025-05-27",first_purchase:"2022-06-20",avg_basket:314606,frequency_month:2.5,top_categories:["Đồ uống","Snack"],top_products:["Gold B"],sentiment:"Positive",segment:"Loyal",store_primary:"CH Lê Lợi",transaction_stores:["CH Lê Lợi","CH Hai Bà Trưng"],last_txn_amount:520000,has_zalo:true,zalo_oa_follow:true,
      persona:{value_seg:"VIP",lifecycle:"Active",aov_level:"Medium",freq_level:"High",product_persona:["Office Snacker","Quick Meal Buyer"],payment_persona:"E-wallet User",price_sens:"Balanced Shopper",shop_mission:"Quick Refill",channel:"Zalo Follower",note:"KH yêu thích khuyến mãi cuối tuần, vui vẻ. Hay mua đồ ăn vặt văn phòng."}},
    {id:"3",name:"Lê Hoàng Cường",phone:"0923456789",MaTheKHTT:"KH003",loyalty_tier:"Silver",loyalty_points:8700,total_spent:12000000,total_orders:42,last_purchase:"2025-05-20",first_purchase:"2023-03-10",avg_basket:285714,frequency_month:1.6,top_categories:["Thực phẩm"],top_products:["Premium A"],sentiment:"Neutral",segment:"Potential",store_primary:"CH Phạm Ngọc Thạch",transaction_stores:["CH Phạm Ngọc Thạch"],last_txn_amount:380000,has_zalo:true,zalo_oa_follow:false,
      persona:{value_seg:"Regular",lifecycle:"Growing",aov_level:"Medium",freq_level:"Medium",product_persona:["Basic Essentials"],payment_persona:"Cash Only",price_sens:"Price Sensitive",shop_mission:"Need-based",channel:"In-store Only",note:"KH tiềm năng, đang tăng tần suất mua. Cần nurture qua Zalo."}},
    {id:"4",name:"Phạm Thị Dung",phone:"0934567890",MaTheKHTT:"KH004",loyalty_tier:"Gold",loyalty_points:18900,total_spent:22000000,total_orders:67,last_purchase:"2025-05-25",first_purchase:"2022-09-05",avg_basket:328358,frequency_month:2.1,top_categories:["Đồ uống","Đông lạnh"],top_products:["Gold B"],sentiment:"Positive",segment:"Loyal",store_primary:"CH Hai Bà Trưng",transaction_stores:["CH Hai Bà Trưng","CH Cách Mạng T8"],last_txn_amount:620000,has_zalo:false,zalo_oa_follow:false,
      persona:{value_seg:"VIP",lifecycle:"Active",aov_level:"Medium-High",freq_level:"High",product_persona:["Frozen Food Lover","Beverage Fan"],payment_persona:"Bank Transfer",price_sens:"Value Seeker",shop_mission:"Meal Prep",channel:"In-store Only",note:"KH ổn định. Chưa kết nối Zalo - cơ hội onboard digital."}},
    {id:"5",name:"Hoàng Minh Đức",phone:"0945678901",MaTheKHTT:"KH005",loyalty_tier:"Silver",loyalty_points:5400,total_spent:8500000,total_orders:28,last_purchase:"2025-04-15",first_purchase:"2023-08-22",avg_basket:303571,frequency_month:1.3,top_categories:["Gia vị","Snack"],top_products:["Gia vị ĐB"],sentiment:"Neutral",segment:"At Risk",store_primary:"CH Cách Mạng T8",transaction_stores:["CH Cách Mạng T8","CH Nguyễn Huệ"],last_txn_amount:290000,has_zalo:true,zalo_oa_follow:true,
      persona:{value_seg:"Regular",lifecycle:"Declining",aov_level:"Low-Medium",freq_level:"Low",product_persona:["Seasoning Specialist","Snack Hunter"],payment_persona:"Cash + MoMo",price_sens:"Deal Hunter",shop_mission:"Impulse Buy",channel:"Zalo Follower",note:"KH At Risk - 46 ngày chưa mua. Cần win-back campaign gấp."}},
    {id:"6",name:"Võ Thị Hoa",phone:"0956789012",MaTheKHTT:"KH006",loyalty_tier:"Platinum",loyalty_points:55200,total_spent:68000000,total_orders:210,last_purchase:"2025-05-29",first_purchase:"2021-11-01",avg_basket:323809,frequency_month:4.8,top_categories:["Thực phẩm","Đồ uống","Gia vị","Snack"],top_products:["Premium A","Gold B","Snack P"],sentiment:"Positive",segment:"Champions",store_primary:"CH Nguyễn Huệ",transaction_stores:["CH Nguyễn Huệ","CH Lê Lợi","CH Phạm Ngọc Thạch","CH Hai Bà Trưng","CH Cách Mạng T8"],last_txn_amount:1200000,has_zalo:true,zalo_oa_follow:true,
      persona:{value_seg:"Super VIP",lifecycle:"Loyal",aov_level:"High",freq_level:"Very High",product_persona:["Premium Buyer","All-Category Shopper","Gift Buyer"],payment_persona:"Credit Card",price_sens:"Quality First",shop_mission:"Full Basket",channel:"Omni-channel",note:"Top KH #1. Mua tất cả danh mục, 5 cửa hàng. Brand Ambassador tiềm năng."}},
    {id:"7",name:"Đặng Văn Giang",phone:"0967890123",MaTheKHTT:"KH007",loyalty_tier:"Silver",loyalty_points:3200,total_spent:5200000,total_orders:15,last_purchase:"2025-03-10",first_purchase:"2024-01-15",avg_basket:346666,frequency_month:1.0,top_categories:["Đồ uống"],top_products:["Gold B"],sentiment:"At Risk",segment:"Hibernating",store_primary:"CH Lê Lợi",transaction_stores:["CH Lê Lợi"],last_txn_amount:180000,has_zalo:true,zalo_oa_follow:false,
      persona:{value_seg:"Low",lifecycle:"Churning",aov_level:"Medium",freq_level:"Very Low",product_persona:["Single Category"],payment_persona:"Cash Only",price_sens:"Price Sensitive",shop_mission:"Convenience",channel:"Passive",note:"KH Hibernating 83 ngày. Chỉ mua 1 danh mục. Cần re-engage hoặc accept churn."}},
    {id:"8",name:"Ngô Thị Lan",phone:"0978901234",MaTheKHTT:"KH008",loyalty_tier:"Gold",loyalty_points:16800,total_spent:19500000,total_orders:58,last_purchase:"2025-05-22",first_purchase:"2023-02-14",avg_basket:336206,frequency_month:2.1,top_categories:["Thực phẩm","Đông lạnh"],top_products:["Premium A"],sentiment:"Positive",segment:"Loyal",store_primary:"CH Phạm Ngọc Thạch",transaction_stores:["CH Phạm Ngọc Thạch","CH Nguyễn Huệ"],last_txn_amount:450000,has_zalo:true,zalo_oa_follow:true,
      persona:{value_seg:"VIP",lifecycle:"Active",aov_level:"Medium-High",freq_level:"High",product_persona:["Meal Prepper","Frozen Stock-up"],payment_persona:"Mixed",price_sens:"Balanced Shopper",shop_mission:"Weekly Stock-up",channel:"Zalo + In-store",note:"KH ổn định, hay mua thực phẩm + đông lạnh. Phù hợp cross-sell gia vị."}},
  ],
  znsTemplates:[{id:"t1",name:"Chào mừng KH mới",type:"transaction",status:"approved",params:["customer_name","store_name"]},{id:"t2",name:"Sinh nhật KH",type:"promotion",status:"approved",params:["customer_name","voucher_code"]},{id:"t3",name:"Chăm sóc VIP",type:"promotion",status:"approved",params:["customer_name","tier","offer"]},{id:"t4",name:"Win-back",type:"promotion",status:"pending",params:["customer_name","offer"]},{id:"t5",name:"Flash Sale",type:"promotion",status:"approved",params:["customer_name","discount"]}],
};

// ── Order History Demo Data ──
const PRODUCTS_DB=[
  {sku:"SP001",name:"Premium A",cat:"Thực phẩm",price:185000},
  {sku:"SP002",name:"Gold B",cat:"Đồ uống",price:92000},
  {sku:"SP003",name:"Silver C",cat:"Thực phẩm",price:145000},
  {sku:"SP004",name:"Gia vị ĐB",cat:"Gia vị",price:68000},
  {sku:"SP005",name:"Snack P",cat:"Snack",price:35000},
  {sku:"SP006",name:"Đông lạnh X",cat:"Đông lạnh",price:125000},
  {sku:"SP007",name:"Nước ép Y",cat:"Đồ uống",price:55000},
  {sku:"SP008",name:"Mì gói Z",cat:"Thực phẩm",price:28000},
  {sku:"SP009",name:"Sốt BBQ",cat:"Gia vị",price:42000},
  {sku:"SP010",name:"Bánh quy W",cat:"Snack",price:48000},
];
const STORES_L=["CH Nguyễn Huệ","CH Lê Lợi","CH Phạm Ngọc Thạch","CH Hai Bà Trưng","CH Cách Mạng T8"];
const PAYS=["Tiền mặt","Chuyển khoản","Thẻ tín dụng","Ví MoMo","ZaloPay"];
const genOrders=(cid,cnt,stores,ld)=>{
  const arr=[];const base=new Date(ld);
  for(let i=0;i<cnt;i++){
    const d=new Date(base);d.setDate(d.getDate()-i*Math.floor(2+Math.random()*5));
    const ni=1+Math.floor(Math.random()*5);const items=[];const used=new Set();
    for(let j=0;j<ni;j++){let pi=Math.floor(Math.random()*PRODUCTS_DB.length);while(used.has(pi))pi=Math.floor(Math.random()*PRODUCTS_DB.length);used.add(pi);const p=PRODUCTS_DB[pi];const q=1+Math.floor(Math.random()*4);items.push({sku:p.sku,name:p.name,cat:p.cat,price:p.price,qty:q,amt:p.price*q});}
    const sub=items.reduce((s,it)=>s+it.amt,0);const disc=Math.random()>0.7?Math.round(sub*(0.05+Math.random()*0.1)):0;
    arr.push({id:"DH"+cid.padStart(3,"0")+"-"+String(i+1).padStart(4,"0"),date:d.toISOString().slice(0,10),store:stores[Math.floor(Math.random()*stores.length)],pay:PAYS[Math.floor(Math.random()*PAYS.length)],items:items,sub:sub,disc:disc,total:sub-disc,status:i===0?"done":Math.random()>0.05?"done":"cancelled",pts:Math.round((sub-disc)/10000)});
  }
  return arr;
};
const DEMO_ORDERS={
  "1":genOrders("1",25,["CH Nguyễn Huệ","CH Lê Lợi","CH Phạm Ngọc Thạch"],"2025-05-28"),
  "2":genOrders("2",18,["CH Lê Lợi","CH Hai Bà Trưng"],"2025-05-27"),
  "3":genOrders("3",12,["CH Phạm Ngọc Thạch"],"2025-05-20"),
  "4":genOrders("4",15,["CH Hai Bà Trưng","CH Cách Mạng T8"],"2025-05-25"),
  "5":genOrders("5",8,["CH Cách Mạng T8","CH Nguyễn Huệ"],"2025-04-15"),
  "6":genOrders("6",30,["CH Nguyễn Huệ","CH Lê Lợi","CH Phạm Ngọc Thạch","CH Hai Bà Trưng","CH Cách Mạng T8"],"2025-05-29"),
  "7":genOrders("7",6,["CH Lê Lợi"],"2025-03-10"),
  "8":genOrders("8",14,["CH Phạm Ngọc Thạch","CH Nguyễn Huệ"],"2025-05-22"),
};

// ── External Signals for AI Predict ──
const EXT_SIGNALS = {
  events: [
    {id:"e1",name:"Tết Nguyên Đán 2026",date:"2026-01-17",type:"holiday",impact:"very_high",desc:"Nhu cầu thực phẩm, quà tặng tăng 180-250%. Peak mua sắm từ 15 ngày trước Tết."},
    {id:"e2",name:"Valentine's Day",date:"2026-02-14",type:"holiday",impact:"medium",desc:"Đồ uống, snack, quà tặng tăng 40-60%."},
    {id:"e3",name:"Giỗ Tổ Hùng Vương",date:"2026-04-12",type:"holiday",impact:"low",desc:"Nghỉ lễ 1 ngày, doanh thu giảm nhẹ 10-15%."},
    {id:"e4",name:"30/4 - 1/5",date:"2026-04-30",type:"holiday",impact:"medium",desc:"Nghỉ lễ dài, nhu cầu đông lạnh, đồ uống tăng 30%."},
    {id:"e5",name:"Back to School",date:"2026-09-01",type:"social",impact:"medium",desc:"Snack, đồ uống cho trẻ em tăng 25-35%."},
    {id:"e6",name:"Black Friday",date:"2025-11-28",type:"promo",impact:"high",desc:"Flash sale toàn hệ thống, doanh thu +120-150%."},
    {id:"e7",name:"Noel & Năm mới",date:"2025-12-25",type:"holiday",impact:"high",desc:"Quà tặng, thực phẩm nhập khẩu tăng 80-120%."},
    {id:"e8",name:"Rằm tháng 7",date:"2025-08-22",type:"holiday",impact:"low",desc:"Thực phẩm chay, trái cây tăng nhẹ."},
  ],
  weather: [
    {period:"T6/2025",condition:"Nắng nóng",temp:"34-38°C",impact:"Đồ uống +25%, đông lạnh +18%",color:"#ff9800"},
    {period:"T7/2025",condition:"Mưa nhiều",temp:"28-32°C",impact:"Delivery tăng 30%, outdoor giảm",color:"#2196f3"},
    {period:"T8/2025",condition:"Mưa bão",temp:"26-30°C",impact:"Stock-up behavior +40%",color:"#f44336"},
    {period:"T9/2025",condition:"Chuyển mùa",temp:"27-33°C",impact:"Gia vị, thực phẩm nấu +15%",color:"#4caf50"},
    {period:"T10/2025",condition:"Mát mẻ",temp:"25-30°C",impact:"Nhu cầu ổn định",color:"#9e9e9e"},
    {period:"T11/2025",condition:"Se lạnh",temp:"22-28°C",impact:"Đồ nóng, gia vị +20%",color:"#ff5722"},
    {period:"T12/2025",condition:"Lạnh",temp:"18-24°C",impact:"Mùa lễ hội + thời tiết = peak",color:"#e91e63"},
  ],
  market: [
    {title:"CPI thực phẩm tăng 3.2%",source:"GSO",date:"2025-05",impact:"negative",desc:"Giá nguyên liệu tăng, margin giảm. Cần điều chỉnh pricing."},
    {title:"Doanh số FMCG online +22%",source:"Nielsen",date:"2025-Q1",impact:"positive",desc:"Xu hướng mua online tiếp tục tăng. Tích hợp Zalo Mini App."},
    {title:"Đối thủ X mở 5 chi nhánh mới",source:"Market Intel",date:"2025-05",impact:"negative",desc:"Cạnh tranh gia tăng khu vực Q1, Q3."},
    {title:"Thu nhập khả dụng tăng 5.1%",source:"GSO",date:"2025-Q1",impact:"positive",desc:"Người tiêu dùng sẵn sàng chi tiêu hơn."},
    {title:"Trend healthy food +35%",source:"Euromonitor",date:"2025",impact:"positive",desc:"Mở rộng danh mục organic, healthy snack."},
  ],
};
const PRED_PERIODS=[{id:"1m",label:"1 tháng",m:1},{id:"3m",label:"Quý (3T)",m:3},{id:"6m",label:"6 tháng",m:6},{id:"12m",label:"12 tháng",m:12}];

const fv=n=>{if(!n&&n!==0)return"—";const v=Number(n);if(v>=1e9)return`${(v/1e9).toFixed(1)}B`;if(v>=1e6)return`${(v/1e6).toFixed(1)}M`;if(v>=1e3)return`${(v/1e3).toFixed(0)}K`;return v.toLocaleString("vi-VN")};
const fn=n=>n?Number(n).toLocaleString("vi-VN"):"—";

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
const Metric=({icon,label,value,sub,idx=0})=>(<div className={`card fu fu${idx}`} style={{position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-25,right:-25,width:80,height:80,borderRadius:"50%",background:`${T.accent}08`}}/><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}><div style={{width:34,height:34,borderRadius:8,background:`${T.accent}18`,display:"flex",alignItems:"center",justifyContent:"center"}}><I d={icon} s={16} c={T.accent}/></div><span style={{fontSize:11,color:T.textSec,fontWeight:500}}>{label}</span></div><div className="counter">{value}</div>{sub&&<div style={{fontSize:11,color:T.textMuted,marginTop:3}}>{sub}</div>}</div>);
const Sec=({icon,title,sql,children})=>(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:6}}><div style={{display:"flex",alignItems:"center",gap:9}}><I d={icon} s={16} c={T.accent}/><span style={{fontSize:14,fontWeight:700,color:T.text}}>{title}</span>{sql&&<span className="sql-tag">SQL</span>}</div>{children}</div>);
const Tier=({t})=>{const c={Platinum:"#e0e0e0",Gold:"#c8965a",Silver:"#8888a0"}[t]||T.info;return(<span className="badge" style={{background:c+"20",color:c}}><I d={ic.star} s={9} c={c}/> {t}</span>)};

// Permission editor panel (standalone component to avoid IIFE in JSX)
const PermEditor=({uid,users,setUsers,close})=>{
  const u=users.find(x=>x.id===uid);
  if(!u) return null;
  const upd=(field,val)=>setUsers(p=>p.map(x=>x.id===uid?{...x,...(typeof field==='string'?{[field]:val}:field)}:x));
  const togTab=(tabId)=>{
    const cur=u.permissions.tabs||[];
    const nxt=cur.includes(tabId)?cur.filter(t=>t!==tabId):[...cur,tabId];
    upd({permissions:{...u.permissions,tabs:nxt}});
  };
  const togExp=()=>upd({permissions:{...u.permissions,canExport:!u.permissions.canExport}});
  return(
    <div className="card fu" style={{borderColor:T.accent+"40"}}>
      <Sec icon={ic.key} title={"Phân quyền: "+u.name}><button className="btn btn-g btn-sm" onClick={close}><I d={ic.x} s={11}/></button></Sec>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div><span className="label-sm">Vai trò</span><select className="inp" value={u.role} onChange={e=>{const r=e.target.value;const rp=ROLES[r];upd({role:r,permissions:{tabs:rp.tabs,canExport:rp.canExport}})}}><option value="admin">Admin</option><option value="manager">Manager</option><option value="viewer">Viewer</option></select></div>
        <div><span className="label-sm">Trạng thái</span><select className="inp" value={u.status} onChange={e=>upd('status',e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
      </div>
      <div style={{marginBottom:14}}>
        <span className="label-sm">Modules được truy cập</span>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginTop:6}}>
          {ALL_TABS.map(t=>(<div key={t.id} className="perm-row">
            <div style={{display:"flex",alignItems:"center",gap:8}}><I d={t.icon} s={13} c={u.permissions.tabs?.includes(t.id)?T.accent:T.textMuted}/><span style={{fontSize:12,color:u.permissions.tabs?.includes(t.id)?T.text:T.textMuted}}>{t.label}</span></div>
            <Toggle on={u.permissions.tabs?.includes(t.id)} onClick={()=>togTab(t.id)}/>
          </div>))}
        </div>
      </div>
      <div className="perm-row" style={{background:u.permissions.canExport?T.warning+"08":T.surface,border:"1px solid "+(u.permissions.canExport?T.warning:T.cardBorder)+"40",borderRadius:10,padding:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:8,background:T.warning+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><I d={ic.download} s={16} c={T.warning}/></div>
          <div><div style={{fontSize:13,fontWeight:700,color:T.text}}>Quyền Export dữ liệu</div><div style={{fontSize:11,color:T.textSec}}>Cho phép tải CSV, Excel từ báo cáo</div></div>
        </div>
        <Toggle on={u.permissions.canExport} onClick={togExp}/>
      </div>
    </div>
  );
};
const Dot=({on,label})=>(<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:on?`${T.success}18`:`${T.danger}18`,fontSize:11,fontWeight:600,color:on?T.success:T.danger}}><span style={{width:5,height:5,borderRadius:"50%",background:on?T.success:T.danger,...(on?{animation:"pulse 2s infinite"}:{})}}/>{label||(on?"Connected":"Demo")}</span>);
const Toggle=({on,onClick})=>(<button className={`toggle ${on?'on':''}`} onClick={onClick}/>);
const NoAccess=()=>(<div className="no-access"><I d={ic.lock} s={48} c={T.textMuted}/><div style={{fontSize:16,fontWeight:700,color:T.textSec,marginBottom:6}}>Không có quyền truy cập</div><div style={{fontSize:13,color:T.textMuted}}>Liên hệ Admin để được cấp quyền xem module này</div></div>);
// CSV export helper
const exportCSV = (rows, filename) => {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const body = rows.map(r => keys.map(k => {
    const v = r[k];
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(",")).join("\n");
  const csv = "\uFEFF" + header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (filename || "export") + ".csv";
  a.click();
  URL.revokeObjectURL(url);
};

const ExportBtn=({canExport,onClick,data:expData,filename})=>{
  const handleClick = () => {
    if (onClick) { onClick(); return; }
    if (expData && expData.length) exportCSV(expData, filename || "menas_export");
  };
  return canExport
    ? (<button className="btn btn-g btn-sm" onClick={handleClick}><I d={ic.download} s={12}/> Export</button>)
    : (<button className="btn btn-sm" disabled style={{opacity:.3,background:"transparent",color:T.textMuted,border:"1px solid "+T.cardBorder,cursor:"not-allowed"}} title="Bạn không có quyền Export"><I d={ic.lock} s={11}/> Export</button>);
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
const ALL_TABS=[
  {id:"overview",label:"Tổng quan",icon:ic.home},
  {id:"customers",label:"KH 360°",icon:ic.users},
  {id:"segment",label:"Lọc & Chiến dịch",icon:ic.filter},
  {id:"sales",label:"Sales",icon:ic.cart},
  {id:"marketing",label:"Marketing",icon:ic.target},
  {id:"zalo",label:"Zalo ZNS",icon:ic.msg},
  {id:"predictions",label:"AI Predict",icon:ic.zap},
  {id:"ai_chat",label:"AI Chat",icon:ic.brain},
  {id:"report",label:"AI Report",icon:ic.fileText},
  {id:"datamap",label:"Data Map",icon:ic.layers},
  {id:"activity_log",label:"Activity Log",icon:ic.clipboard},
  {id:"settings",label:"Cài đặt",icon:ic.settings},
  {id:"user_mgmt",label:"Phân quyền",icon:ic.shield},
];

export default function MenasDX() {
  // ── Auth State ──
  const [loggedIn,setLoggedIn]=useState(false);
  const [allUsers,setAllUsers]=useState(DEFAULT_USERS);
  const [currentUserId,setCurrentUserId]=useState(null);
  const currentUser=useMemo(()=>allUsers.find(u=>u.id===currentUserId)||null,[allUsers,currentUserId]);
  const [loginEmail,setLoginEmail]=useState("admin@menas.vn");
  const [loginPass,setLoginPass]=useState("");
  const [loginErr,setLoginErr]=useState("");
  const [editingUser,setEditingUser]=useState(null);

  // ── App State ──
  const [tab,setTab]=useState("overview");
  const [dbCfg,setDbCfg]=useState({host:"",port:"5432",database:"",user:"",password:"",ssl:false});
  const [dbOn,setDbOn]=useState(false);
  const [dbTest,setDbTest]=useState(false);
  const [data]=useState(DEMO);
  const [searchQ,setSearchQ]=useState("");
  const [selCustomer,setSelCustomer]=useState(null);
  // ── KH 360 Filters ──
  const [custShowFilter,setCustShowFilter]=useState(false);
  const [custStore,setCustStore]=useState("all");
  const [custTier,setCustTier]=useState("all");
  const [custSegment,setCustSegment]=useState("all");
  const [custSpendMin,setCustSpendMin]=useState("");
  const [custSpendMax,setCustSpendMax]=useState("");
  const [custLastFrom,setCustLastFrom]=useState("");
  const [custLastTo,setCustLastTo]=useState("");
  const [custSort,setCustSort]=useState("total_spent_desc");
  const [detailTab,setDetailTab]=useState("overview"); // overview | orders
  const [orderDateFrom,setOrderDateFrom]=useState("");
  const [orderDateTo,setOrderDateTo]=useState("");
  const [orderStore,setOrderStore]=useState("all");
  const [expandedOrder,setExpandedOrder]=useState(null);

  // ── Overview Time Filter ──
  const [timePeriod,setTimePeriod]=useState("12m");
  const [showYoY,setShowYoY]=useState(true);
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const [showDatePicker,setShowDatePicker]=useState(false);

  // ── Segment ──
  const [segF,setSegF]=useState({tiers:[],segments:[],categories:[],spendMin:"",spendMax:"",ordersMin:"",ordersMax:"",freqMin:"",freqMax:"",avgBasketMin:"",avgBasketMax:"",daysSinceMin:"",daysSinceMax:"",hasZalo:"all",zaloFollow:"all",stores:[],txnStores:[],lastPurchaseFrom:"",lastPurchaseTo:"",lastTxnAmtMin:"",lastTxnAmtMax:""});
  const [segRes,setSegRes]=useState(null);
  const [selCamp,setSelCamp]=useState([]);

  // ── Zalo ──
  const [zaloCfg,setZaloCfg]=useState({oa_id:"",app_id:"",secret_key:"",access_token:""});
  const [zaloOn,setZaloOn]=useState(false);
  const [zaloTpl,setZaloTpl]=useState(null);
  const [zaloSending,setZaloSending]=useState(false);
  const [zaloSent,setZaloSent]=useState(0);
  const [zaloMsg,setZaloMsg]=useState("");

  // ── AI Chat ──
  const [aiModel,setAiModel]=useState("claude");
  const [aiApiKey,setAiApiKey]=useState("");
  const [chatMsgs,setChatMsgs]=useState([{role:"ai",text:"Xin chào! Tôi là AI Assistant của MENAS DX. Tôi có thể:\n• Phân tích dữ liệu KH, doanh thu, RFM\n• Đề xuất tệp KH cho chiến dịch\n• Truy vấn Activity Log: \"xem log hoạt động\", \"ai gửi ZNS gần đây?\", \"marketing làm gì?\"\nHãy hỏi tôi bất cứ điều gì!"}]);
  const [chatInput,setChatInput]=useState("");
  const [chatLoading,setChatLoading]=useState(false);
  const chatEndRef=useRef(null);

  // ── AI Report ──
  const [rptInput,setRptInput]=useState("");
  const [rptLoading,setRptLoading]=useState(false);
  const [rptHistory,setRptHistory]=useState([]);

  // ── AI Predict ──
  const [predPeriod,setPredPeriod]=useState("1m");
  const [predLoading,setPredLoading]=useState(false);
  const [predDone,setPredDone]=useState(false);

  // ── Activity Log ──
  const [activityLog,setActivityLog]=useState([
    {id:1,ts:"2025-06-01 09:00:12",user:"admin@menas.vn",action:"login",module:"auth",detail:"Đăng nhập thành công",ip:"192.168.1.10"},
    {id:2,ts:"2025-06-01 09:01:30",user:"admin@menas.vn",action:"view",module:"overview",detail:"Xem Dashboard Tổng Quan",ip:"192.168.1.10"},
    {id:3,ts:"2025-06-01 09:05:22",user:"admin@menas.vn",action:"view",module:"customers",detail:"Xem KH 360° — click KH001 Nguyễn Văn An",ip:"192.168.1.10"},
    {id:4,ts:"2025-05-31 14:22:08",user:"marketing@menas.vn",action:"filter",module:"segment",detail:"Lọc KH: Platinum + Champions, 3,200 KH phù hợp",ip:"192.168.1.25"},
    {id:5,ts:"2025-05-31 14:25:41",user:"marketing@menas.vn",action:"send_zns",module:"zalo",detail:"Gửi ZNS 'Chăm sóc VIP' cho 850 KH",ip:"192.168.1.25"},
    {id:6,ts:"2025-05-31 10:15:33",user:"sales@menas.vn",action:"export",module:"customers",detail:"Export CSV: 8 khách hàng",ip:"192.168.1.30"},
    {id:7,ts:"2025-05-30 16:40:10",user:"admin@menas.vn",action:"config",module:"settings",detail:"Cập nhật DB config — host: db.menas.vn",ip:"192.168.1.10"},
    {id:8,ts:"2025-05-30 11:20:55",user:"marketing@menas.vn",action:"ai_chat",module:"ai_chat",detail:"Hỏi AI: đề xuất chiến dịch win-back",ip:"192.168.1.25"},
    {id:9,ts:"2025-05-30 09:12:00",user:"admin@menas.vn",action:"predict",module:"predictions",detail:"Chạy dự báo 3 tháng — DT dự kiến 28.5B",ip:"192.168.1.10"},
    {id:10,ts:"2025-05-29 15:33:22",user:"sales@menas.vn",action:"report",module:"report",detail:"Tạo báo cáo: Phân tích khách hàng VIP",ip:"192.168.1.30"},
    {id:11,ts:"2025-05-29 13:10:00",user:"admin@menas.vn",action:"user_mgmt",module:"user_mgmt",detail:"Cập nhật quyền user marketing@menas.vn — thêm tab Report",ip:"192.168.1.10"},
    {id:12,ts:"2025-05-28 17:05:44",user:"marketing@menas.vn",action:"send_zns",module:"zalo",detail:"Gửi ZNS 'Flash Sale' cho 1,200 KH Gold",ip:"192.168.1.25"},
    {id:13,ts:"2025-05-28 10:30:00",user:"admin@menas.vn",action:"view",module:"customers",detail:"Xem chi tiết KH006 Võ Thị Hoa — tab Lịch sử đơn",ip:"192.168.1.10"},
    {id:14,ts:"2025-05-27 16:20:18",user:"sales@menas.vn",action:"ai_chat",module:"ai_chat",detail:"Hỏi AI: phân tích doanh thu tháng 5",ip:"192.168.1.30"},
    {id:15,ts:"2025-05-27 09:00:05",user:"viewer@menas.vn",action:"login",module:"auth",detail:"Đăng nhập thành công",ip:"192.168.1.40"},
  ]);
  const logIdRef=useRef(16);
  const addLog=(action,module,detail)=>{
    const entry={id:logIdRef.current++,ts:new Date().toISOString().replace("T"," ").slice(0,19),user:currentUser?.email||"unknown",action,module,detail,ip:"192.168.1."+Math.floor(10+Math.random()*40)};
    setActivityLog(prev=>[entry,...prev].slice(0,200));
    return entry;
  };

  // ── Activity Log Filters ──
  const [logSearch,setLogSearch]=useState("");
  const [logActionF,setLogActionF]=useState("all");
  const [logUserF,setLogUserF]=useState("all");
  const [logModuleF,setLogModuleF]=useState("all");
  const [logDateFrom,setLogDateFrom]=useState("");
  const [logDateTo,setLogDateTo]=useState("");

  // Permission helpers
  const userPerms=useMemo(()=>currentUser?.permissions||{tabs:[],canExport:false},[currentUser]);
  const canView=(tabId)=>(userPerms.tabs||[]).indexOf(tabId)>=0;
  const canExport=userPerms.canExport;
  const isAdmin=currentUser?.role==="admin";
  const visibleTabs=useMemo(()=>ALL_TABS.filter(t=>userPerms.tabs?.includes(t.id)),[userPerms]);

  // helper: % change (must be before early return for hooks order)
  const pctChg=(cur,prev)=>{if(!prev||!cur)return null;return((cur-prev)/prev*100).toFixed(1);};
  const ChgBadge=({cur,prev})=>{const v=pctChg(cur,prev);if(v===null)return null;const up=Number(v)>=0;return(<span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,fontWeight:700,color:up?T.success:T.danger}}>{up?"▲":"▼"} {Math.abs(Number(v))}%<span style={{fontWeight:400,color:T.textMuted,marginLeft:2}}>vs cùng kỳ</span></span>);};

  // filtered revenue: daily data for short periods, monthly for long
  const filteredRevenue=useMemo(()=>{
    const daily=data.revenueDaily||[];
    const monthly=data.revenueByMonth;
    if(timePeriod==="custom"&&dateFrom&&dateTo){
      return daily.filter(d=>d.date>=dateFrom&&d.date<=dateTo);
    }
    const now=daily.length?daily[daily.length-1].date:"2025-06-01";
    const end=new Date(now);
    switch(timePeriod){
      case"today":{const t=now;return daily.filter(d=>d.date===t);}
      case"yesterday":{const y=new Date(end);y.setDate(y.getDate()-1);return daily.filter(d=>d.date===y.toISOString().slice(0,10));}
      case"7d":{const s=new Date(end);s.setDate(s.getDate()-6);return daily.filter(d=>d.date>=s.toISOString().slice(0,10));}
      case"30d":{const s=new Date(end);s.setDate(s.getDate()-29);return daily.filter(d=>d.date>=s.toISOString().slice(0,10));}
      case"90d":{const s=new Date(end);s.setDate(s.getDate()-89);return daily.filter(d=>d.date>=s.toISOString().slice(0,10));}
      case"1m":return monthly.slice(-1);
      case"3m":return monthly.slice(-3);
      case"6m":return monthly.slice(-6);
      case"ytd":return monthly;
      case"12m":default:return monthly;
    }
  },[timePeriod,dateFrom,dateTo,data.revenueDaily,data.revenueByMonth]);
  const isDaily=["today","yesterday","7d","30d","90d","custom"].includes(timePeriod);
  const chartXKey=isDaily?"label":"month";

  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"})},[chatMsgs]);

  // Customer export data (must be before early return)
  const custExportData = useMemo(() => data.customers.map(c => ({
    MaTheKHTT: c.MaTheKHTT, Ten: c.name, SoDienThoai: c.phone,
    HangLoyalty: c.loyalty_tier, TongChiTieu: c.total_spent,
    SoDonHang: c.total_orders, TanSuatThang: c.frequency_month,
    AOV: c.avg_basket, Segment: c.segment, CuaHang: c.store_primary,
    CoZalo: c.has_zalo ? "Có" : "Không", FollowOA: c.zalo_oa_follow ? "Có" : "Không",
    DanhMuc: (c.top_categories || []).join("; "), SanPham: (c.top_products || []).join("; ")
  })), [data.customers]);

  // KH 360 computed
  const allStoresList = [...new Set(data.customers.map(c=>c.store_primary))];
  const allTiersList = [...new Set(data.customers.map(c=>c.loyalty_tier))];
  const allSegsList = [...new Set(data.customers.map(c=>c.segment))];
  const filteredCust = useMemo(()=>{
    let list = data.customers;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(c=>c.name.toLowerCase().includes(q)||c.MaTheKHTT.toLowerCase().includes(q)||c.phone.includes(q));
    }
    if (custStore !== "all") list = list.filter(c=>c.store_primary===custStore);
    if (custTier !== "all") list = list.filter(c=>c.loyalty_tier===custTier);
    if (custSegment !== "all") list = list.filter(c=>c.segment===custSegment);
    if (custSpendMin) list = list.filter(c=>c.total_spent >= Number(custSpendMin));
    if (custSpendMax) list = list.filter(c=>c.total_spent <= Number(custSpendMax));
    if (custLastFrom) list = list.filter(c=>c.last_purchase >= custLastFrom);
    if (custLastTo) list = list.filter(c=>c.last_purchase <= custLastTo);
    const s = [...list];
    switch(custSort){
      case"total_spent_desc":s.sort((a,b)=>b.total_spent-a.total_spent);break;
      case"total_spent_asc":s.sort((a,b)=>a.total_spent-b.total_spent);break;
      case"last_purchase_desc":s.sort((a,b)=>b.last_purchase.localeCompare(a.last_purchase));break;
      case"last_purchase_asc":s.sort((a,b)=>a.last_purchase.localeCompare(b.last_purchase));break;
      case"orders_desc":s.sort((a,b)=>b.total_orders-a.total_orders);break;
      case"freq_desc":s.sort((a,b)=>b.frequency_month-a.frequency_month);break;
      default:break;
    }
    return s;
  },[data.customers,searchQ,custStore,custTier,custSegment,custSpendMin,custSpendMax,custLastFrom,custLastTo,custSort]);
  const resetCustFilter = () => {
    setCustStore("all");setCustTier("all");setCustSegment("all");
    setCustSpendMin("");setCustSpendMax("");setCustLastFrom("");setCustLastTo("");
    setCustSort("total_spent_desc");setSearchQ("");
  };
  const hasActiveFilter = custStore!=="all"||custTier!=="all"||custSegment!=="all"||custSpendMin||custSpendMax||custLastFrom||custLastTo;

  // ── Time-filtered dashboard data (all sections respond to time filter) ──
  const dashData = useMemo(() => {
    const totalFullYear = data.revenueByMonth.reduce((s,r) => s + r.revenue, 0);
    const filteredTotal = filteredRevenue.reduce((s,r) => s + r.revenue, 0);
    const ratio = totalFullYear > 0 ? filteredTotal / totalFullYear : 1;
    const prevRatio = totalFullYear > 0 ? filteredRevenue.reduce((s,r) => s + (r.prevRevenue||0), 0) / totalFullYear : 0.85;

    const stores = data.topStores.map(s => ({
      ...s,
      revenue: Math.round(s.revenue * ratio),
      orders: Math.round(s.orders * ratio),
      prevRevenue: Math.round(s.revenue * prevRatio),
      prevOrders: Math.round(s.orders * prevRatio),
    })).sort((a,b) => b.revenue - a.revenue);

    const products = data.topProducts.map(p => ({
      ...p,
      revenue: Math.round(p.revenue * ratio),
      qty_sold: Math.round(p.qty_sold * ratio),
      prevRevenue: Math.round(p.revenue * prevRatio),
    })).sort((a,b) => b.revenue - a.revenue);

    const cats = data.catPerf.map(c => ({
      ...c,
      revenue: Math.round(c.revenue * ratio),
      orders: Math.round(c.orders * ratio),
      prevRevenue: Math.round(c.revenue * prevRatio),
    })).sort((a,b) => b.revenue - a.revenue);

    const segs = data.segmentation.map(s => ({
      ...s,
      value: Math.round(s.value * (0.85 + ratio * 0.15)),
    }));

    return { stores, products, cats, segs, ratio };
  }, [filteredRevenue, data]);

  // ── AI Predict forecast pre-computation ──
  const predPeriodObj = PRED_PERIODS.find(p=>p.id===predPeriod)||PRED_PERIODS[0];
  const predM = predPeriodObj.m;
  const predForecast = useMemo(()=>{
    const months=["T6","T7","T8","T9","T10","T11","T12","T1","T2","T3","T4","T5"];
    const baseRevs=[7.8,8.1,7.5,8.3,8.8,9.5,10.2,12.5,7.2,8.0,8.4,8.9];
    const result=[];
    for(let i=0;i<Math.min(predM,12);i++){
      const evts=EXT_SIGNALS.events.filter(e=>{const em=new Date(e.date).getMonth();const fm=(5+i+1)%12;return em===fm;});
      const boost=evts.reduce((s,e)=>s+(e.impact==="very_high"?0.4:e.impact==="high"?0.2:e.impact==="medium"?0.1:0.03),0);
      const rev=baseRevs[i%12]*(1+boost)*(0.95+Math.random()*0.1);
      const orders=Math.round(rev*380+Math.random()*200);
      const newCust=Math.round(420+Math.random()*180+(boost>0.1?150:0));
      const churn=Math.round(280-boost*200+Math.random()*80);
      result.push({month:months[i%12],rev:+rev.toFixed(1),orders,newCust,churn,events:evts,prevRev:baseRevs[i%12]*0.88});
    }
    return result;
  },[predM]);
  const predTotalRev=predForecast.reduce((s,f)=>s+f.rev,0);
  const predTotalOrders=predForecast.reduce((s,f)=>s+f.orders,0);
  const predTotalNew=predForecast.reduce((s,f)=>s+f.newCust,0);
  const predTotalChurn=predForecast.reduce((s,f)=>s+f.churn,0);
  const predEvents=EXT_SIGNALS.events.filter(e=>{const d=new Date(e.date);const now=new Date("2025-06-01");const end=new Date(now);end.setMonth(end.getMonth()+predM);return d>=now&&d<=end;});

  // ── Login ──
  const doLogin=()=>{
    const user=allUsers.find(u=>u.email===loginEmail&&u.status==="active");
    if(user){setCurrentUserId(user.id);setLoggedIn(true);setLoginErr("");setTab("overview");addLog("login","auth","Đăng nhập thành công — "+user.name);}
    else setLoginErr("Email không hợp lệ hoặc tài khoản bị vô hiệu hoá");
  };

  // ── Segment filter ──
  const applyF=()=>{
    let list=[...data.customers];const f=segF;
    if(f.tiers.length)list=list.filter(c=>f.tiers.includes(c.loyalty_tier));
    if(f.segments.length)list=list.filter(c=>f.segments.includes(c.segment));
    if(f.categories.length)list=list.filter(c=>c.top_categories?.some(cat=>f.categories.includes(cat)));
    if(f.spendMin)list=list.filter(c=>c.total_spent>=+f.spendMin);
    if(f.spendMax)list=list.filter(c=>c.total_spent<=+f.spendMax);
    if(f.ordersMin)list=list.filter(c=>c.total_orders>=+f.ordersMin);
    if(f.ordersMax)list=list.filter(c=>c.total_orders<=+f.ordersMax);
    if(f.freqMin)list=list.filter(c=>c.frequency_month>=+f.freqMin);
    if(f.freqMax)list=list.filter(c=>c.frequency_month<=+f.freqMax);
    if(f.avgBasketMin)list=list.filter(c=>c.avg_basket>=+f.avgBasketMin);
    if(f.avgBasketMax)list=list.filter(c=>c.avg_basket<=+f.avgBasketMax);
    if(f.daysSinceMin||f.daysSinceMax){const now=Date.now();list=list.filter(c=>{const d=Math.floor((now-new Date(c.last_purchase).getTime())/864e5);return(!f.daysSinceMin||d>=+f.daysSinceMin)&&(!f.daysSinceMax||d<=+f.daysSinceMax)});}
    if(f.hasZalo==="yes")list=list.filter(c=>c.has_zalo);
    if(f.hasZalo==="no")list=list.filter(c=>!c.has_zalo);
    if(f.zaloFollow==="yes")list=list.filter(c=>c.zalo_oa_follow);
    if(f.zaloFollow==="no")list=list.filter(c=>!c.zalo_oa_follow);
    if(f.stores.length)list=list.filter(c=>f.stores.includes(c.store_primary));
    if(f.txnStores.length)list=list.filter(c=>(c.transaction_stores||[]).some(s=>f.txnStores.includes(s)));
    if(f.lastPurchaseFrom)list=list.filter(c=>c.last_purchase>=f.lastPurchaseFrom);
    if(f.lastPurchaseTo)list=list.filter(c=>c.last_purchase<=f.lastPurchaseTo);
    if(f.lastTxnAmtMin)list=list.filter(c=>(c.last_txn_amount||0)>=+f.lastTxnAmtMin);
    if(f.lastTxnAmtMax)list=list.filter(c=>(c.last_txn_amount||0)<=+f.lastTxnAmtMax);
    setSegRes(list);setSelCamp(list.map(c=>c.id));
    addLog("filter","segment","Lọc KH: "+list.length+" KH phù hợp"+(f.tiers.length?" — Tier: "+f.tiers.join(","):"")+(f.segments.length?" — Seg: "+f.segments.join(","):""));
  };
  const resetF=()=>{setSegF({tiers:[],segments:[],categories:[],spendMin:"",spendMax:"",ordersMin:"",ordersMax:"",freqMin:"",freqMax:"",avgBasketMin:"",avgBasketMax:"",daysSinceMin:"",daysSinceMax:"",hasZalo:"all",zaloFollow:"all",stores:[],txnStores:[],lastPurchaseFrom:"",lastPurchaseTo:"",lastTxnAmtMin:"",lastTxnAmtMax:""});setSegRes(null);setSelCamp([]);};
  const togChip=(k,v)=>setSegF(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));

  // ── AI Chat (calls Anthropic API) ──
  const sendAiMsg=async()=>{
    if(!chatInput.trim())return;
    const userMsg=chatInput.trim();
    setChatMsgs(p=>[...p,{role:"user",text:userMsg}]);
    setChatInput("");setChatLoading(true);
    addLog("ai_chat","ai_chat","Hỏi AI: "+userMsg.substring(0,80));

    const logSummary = activityLog.slice(0,20).map(l=>`[${l.ts}] ${l.user} — ${l.action}: ${l.detail}`).join("\n");
    const systemPrompt=`Bạn là AI Assistant cho MENAS DX - hệ thống Customer 360° Intelligence Platform.
Dữ liệu hệ thống hiện tại:
- Tổng khách hàng: ${data.overview.total_customers} (Active: ${data.overview.active_customers})
- KH mới tháng này: ${data.overview.new_this_month}
- AOV: ${data.overview.avg_order_value} VND
- Segments: ${JSON.stringify(data.segmentation.map(s=>({name:s.name,count:s.value})))}
- RFM: ${JSON.stringify(data.rfm.map(r=>({segment:r.segment,count:r.count,avg_recency:r.avg_recency,avg_frequency:r.avg_frequency})))}
- Top Stores: ${JSON.stringify(data.topStores.map(s=>({name:s.store_name,revenue:s.revenue})))}
- Top Categories: ${JSON.stringify(data.catPerf.map(c=>({name:c.name,revenue:c.revenue})))}
- Payments: ${JSON.stringify(data.payments.map(p=>({method:p.method,amount:p.amount})))}
- Revenue YTD: 72.3 tỷ VND

=== ACTIVITY LOG (${activityLog.length} records gần nhất) ===
${logSummary}

Hãy phân tích dữ liệu, đề xuất chiến dịch, hoặc truy vấn activity log.
Khi user hỏi về log/lịch sử/ai đã làm gì/hoạt động, hãy phân tích activity log ở trên.
Trả lời bằng tiếng Việt. Khi đề xuất lọc KH, gợi ý tiêu chí cụ thể.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: chatMsgs.filter(m=>m.role!=="ai"||chatMsgs.indexOf(m)>0).map(m=>({
            role: m.role==="user"?"user":"assistant",
            content: m.text
          })).concat([{ role:"user", content: userMsg }]),
        }),
      });
      const result = await response.json();
      const aiText = result.content?.map(b=>b.text||"").join("\n") || "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.";
      setChatMsgs(p=>[...p,{role:"ai",text:aiText}]);
    } catch(e) {
      // Fallback smart responses for demo
      let reply = generateSmartReply(userMsg);
      setChatMsgs(p=>[...p,{role:"ai",text:reply}]);
    }
    setChatLoading(false);
  };

  const generateSmartReply=(msg)=>{
    const m=msg.toLowerCase();
    if(m.includes("log")||m.includes("lịch sử")||m.includes("hoạt động")||m.includes("ai đã")||m.includes("ai làm")||m.includes("tương tác")||m.includes("history")){
      const recent=activityLog.slice(0,10);
      const byUser={};const byAction={};
      activityLog.forEach(l=>{byUser[l.user]=(byUser[l.user]||0)+1;byAction[l.action]=(byAction[l.action]||0)+1;});
      const topUsers=Object.entries(byUser).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([u,c])=>u+" ("+c+" lần)").join(", ");
      const topActions=Object.entries(byAction).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([a,c])=>a+": "+c).join(", ");
      return `📋 **Activity Log — ${activityLog.length} records:**\n\n**Phân bố theo user:**\n${topUsers}\n\n**Phân bố theo hành động:**\n${topActions}\n\n**10 hoạt động gần nhất:**\n${recent.map((l,i)=>`${i+1}. [${l.ts}] **${l.user}** — ${l.action}: ${l.detail}`).join("\n")}\n\nBạn có thể hỏi cụ thể: "ai gửi ZNS gần đây", "marketing làm gì", "log export"...`;
    }
    if(m.includes("zns")&&(m.includes("ai gửi")||m.includes("gửi gần")||m.includes("log gửi"))){
      const znsLogs=activityLog.filter(l=>l.action==="send_zns");
      return `📨 **Log gửi ZNS (${znsLogs.length} lần):**\n\n${znsLogs.slice(0,5).map((l,i)=>`${i+1}. [${l.ts}] ${l.user} — ${l.detail}`).join("\n")}\n\nTổng: ${znsLogs.length} chiến dịch ZNS đã gửi.`;
    }
    if(m.includes("marketing")||m.includes("nguyễn")){
      const mktLogs=activityLog.filter(l=>l.user?.includes("marketing"));
      return `👤 **Hoạt động của marketing@menas.vn (${mktLogs.length} records):**\n\n${mktLogs.slice(0,8).map((l,i)=>`${i+1}. [${l.ts}] ${l.action}: ${l.detail}`).join("\n")}\n\nUser này chủ yếu: lọc segment, gửi ZNS, hỏi AI.`;
    }
    if(m.includes("export")||m.includes("xuất")){
      const expLogs=activityLog.filter(l=>l.action==="export");
      return `📥 **Log Export (${expLogs.length} lần):**\n\n${expLogs.slice(0,5).map((l,i)=>`${i+1}. [${l.ts}] ${l.user} — ${l.detail}`).join("\n")||"Chưa có log export nào."}\n\nHiện ${allUsers.filter(u=>u.permissions.canExport).length} user có quyền export.`;
    }
    if(m.includes("vip")||m.includes("platinum")||m.includes("cao cấp"))
      return `📊 **Phân tích tệp VIP:**\n\n• VIP Platinum: 1,284 KH (10%) — AOV cao nhất, tần suất 4+ lần/tháng\n• VIP Gold: 2,569 KH (20%)\n\n**Đề xuất chiến dịch VIP:**\nVào tab **Lọc & Chiến dịch**, chọn:\n→ Hạng Loyalty: Platinum + Gold\n→ RFM Segment: Champions + Loyal\n→ Tần suất: >= 2 lần/tháng\n→ Chi tiêu: >= 20,000,000\n\nDự kiến: ~3,800 KH phù hợp. Nên gửi ZNS template "Chăm sóc VIP" với offer giảm 15-20%.`;
    if(m.includes("churn")||m.includes("rời")||m.includes("risk")||m.includes("mất"))
      return `⚠️ **Cảnh báo Churn:**\n\n• At Risk: 1,928 KH — chưa mua > 90 ngày nhưng có frequency cao\n• Hibernating: 1,285 KH — chưa mua > 200 ngày\n\n**Đề xuất Win-back:**\nTab **Lọc & Chiến dịch**:\n→ RFM Segment: At Risk\n→ Số ngày kể từ lần mua cuối: 60 — 120\n→ Zalo: Đã follow OA\n\nGửi ZNS "Win-back" với voucher giảm 30% trong 7 ngày. Ưu tiên KH có tổng chi > 10M.`;
    if(m.includes("doanh thu")||m.includes("revenue")||m.includes("bán"))
      return `📈 **Phân tích doanh thu:**\n\n• YTD: 72.3 tỷ VND (+12% YoY)\n• Tháng cao nhất: T12 (8.5 tỷ)\n• Top category: Thực phẩm (3.2B), Đồ uống (2.4B)\n• Top store: CH Nguyễn Huệ (2.8B)\n\n**Insight:** Peak giờ 11h-13h chiếm 35% doanh thu. Đề xuất tăng staffing và chạy flash deal khung giờ 15h-17h để cân bằng.`;
    if(m.includes("chiến dịch")||m.includes("campaign")||m.includes("marketing"))
      return `🎯 **Đề xuất 3 chiến dịch:**\n\n**1. Re-engage KH Potential** (2,056 KH)\n→ Lọc: Segment Potential + Tần suất 1-3 + Chi tiêu 5-15M\n→ Offer: Giảm 10% + tặng điểm x2\n\n**2. Birthday Campaign** (ước tính ~1,000 KH/tháng)\n→ Lọc: Birthday tháng hiện tại + Có Zalo\n→ ZNS template "Sinh nhật KH" + voucher 20%\n\n**3. Cross-sell Top Category**\n→ Lọc: Đã mua "Thực phẩm" NHƯNG chưa mua "Đồ uống"\n→ Offer: Combo giảm 15%`;
    if(m.includes("lọc")||m.includes("tệp")||m.includes("segment"))
      return `🔍 **Hướng dẫn lọc KH:**\n\nVào tab **Lọc & Chiến dịch**, bạn có thể kết hợp:\n\n• **Hạng Loyalty:** Platinum / Gold / Silver\n• **RFM:** Champions / Loyal / Potential / New / At Risk / Hibernating\n• **Danh mục đã mua:** Thực phẩm, Đồ uống, Gia vị...\n• **Chi tiêu:** range min-max\n• **Tần suất mua/tháng:** range\n• **Ngày mua cuối:** bao nhiêu ngày trước\n• **Zalo:** Có/Không, Follow OA\n• **Cửa hàng:** multi-select\n\nSau khi lọc xong, click **"Gửi Zalo ZNS"** để chuyển sang tab Zalo gửi tin nhắn hàng loạt.`;
    return `Cảm ơn câu hỏi! Dựa trên dữ liệu MENAS DX:\n\n• Tổng KH: ${fn(data.overview.total_customers)} (${fn(data.overview.active_customers)} active)\n• AOV: ${fv(data.overview.avg_order_value)}\n• Top segment: Champions (1,284) + Loyal (2,569) = 30% KH tạo 65% doanh thu\n• Activity log: ${activityLog.length} records\n\nBạn có thể hỏi: "phân tích VIP", "đề xuất chiến dịch", "cảnh báo churn", "xem log hoạt động", "ai gửi ZNS gần đây"...`;
  };

  // ── Zalo Send ──
  const sendZns=async()=>{
    setZaloSending(true);setZaloSent(0);
    const n=selCamp.length||data.customers.filter(c=>c.has_zalo&&c.zalo_oa_follow).length;
    for(let i=0;i<n;i++){await new Promise(r=>setTimeout(r,60));setZaloSent(i+1);}
    setZaloSending(false);setZaloMsg(`Gửi thành công ${n} ZNS!`);setTimeout(()=>setZaloMsg(""),5000);
    addLog("send_zns","zalo","Gửi ZNS cho "+n+" KH"+(zaloTpl?" — template: "+data.znsTemplates.find(t=>t.id===zaloTpl)?.name:""));
  };

  // ═══════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════
  if(!loggedIn) return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{css}</style>
      <div style={{width:400,padding:36,borderRadius:20,background:T.card,border:`1px solid ${T.cardBorder}`}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:12,background:T.grad,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14}}><I d={ic.layers} s={24} c={T.bg}/></div>
          <div style={{fontSize:22,fontWeight:800,fontFamily:"'Libre Baskerville',serif"}}><span style={{color:T.accent}}>MENAS</span> <span style={{color:T.text}}>DX</span></div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:4,letterSpacing:".1em",textTransform:"uppercase"}}>Customer 360° Intelligence Platform</div>
        </div>
        <div style={{marginBottom:12}}><span className="label-sm">Email</span><input className="inp" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="admin@menas.vn" onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
        <div style={{marginBottom:16}}><span className="label-sm">Password</span><input className="inp" type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="(bất kỳ — demo mode)" onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
        {loginErr&&<div style={{padding:"8px 12px",borderRadius:8,background:`${T.danger}15`,color:T.danger,fontSize:12,marginBottom:12}}>{loginErr}</div>}
        <button className="btn btn-p" style={{width:"100%",justifyContent:"center",padding:12}} onClick={doLogin}><I d={ic.play} s={14}/> Đăng nhập</button>
        <div style={{marginTop:16,padding:12,borderRadius:8,background:T.surfaceAlt,fontSize:11,color:T.textSec,lineHeight:1.6}}>
          <div style={{fontWeight:700,marginBottom:4}}>Demo accounts:</div>
          <div><b style={{color:T.danger}}>Admin:</b> admin@menas.vn — Full access</div>
          <div><b style={{color:T.warning}}>Manager:</b> marketing@menas.vn — Không settings/export</div>
          <div><b style={{color:T.info}}>Viewer:</b> viewer@menas.vn — Chỉ xem Overview+Sales</div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // MODULE RENDERERS
  // ═══════════════════════════════════════════════════════════

  // helper: % change
  // ── OVERVIEW ──
  const rOverview=()=>{
    const o=data.overview;
    const totalRev=filteredRevenue.reduce((s,r)=>s+r.revenue,0);
    const prevTotalRev=filteredRevenue.reduce((s,r)=>s+(r.prevRevenue||0),0);
    const totalOrders=filteredRevenue.reduce((s,r)=>s+r.orders,0);
    const prevTotalOrders=filteredRevenue.reduce((s,r)=>s+(r.prevOrders||0),0);

    return(<div className="fu">
    {/* Time period filter bar */}
    <div className="card" style={{padding:"12px 18px",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:showDatePicker?10:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
          <I d={ic.calendar} s={15} c={T.accent}/>
          <span style={{fontSize:12,fontWeight:700,color:T.text}}>Thời gian:</span>
          {[
            {v:"today",l:"Hôm nay"},{v:"yesterday",l:"Hôm qua"},
            {v:"7d",l:"7 ngày"},{v:"30d",l:"30 ngày"},{v:"90d",l:"90 ngày"},
            {v:"6m",l:"6 tháng"},{v:"12m",l:"12 tháng"},{v:"ytd",l:"YTD"},
          ].map(p=>(<button key={p.v} className={`chip ${timePeriod===p.v?'on':''}`} onClick={()=>{setTimePeriod(p.v);setShowDatePicker(false)}} style={{padding:"3px 8px",fontSize:10}}>{p.l}</button>))}
          <button className={`chip ${timePeriod==="custom"?'on':''}`} onClick={()=>{setTimePeriod("custom");setShowDatePicker(true)}} style={{padding:"3px 8px",fontSize:10}}><I d={ic.calendar} s={10}/> Tuỳ chọn</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:T.textSec}}>So sánh cùng kỳ:</span>
          <Toggle on={showYoY} onClick={()=>setShowYoY(!showYoY)}/>
        </div>
      </div>
      {/* Custom date range picker */}
      {showDatePicker&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0 2px",borderTop:`1px solid ${T.cardBorder}40`,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:T.textSec,fontWeight:600}}>Từ ngày:</span>
        <input type="date" className="inp" style={{maxWidth:160,fontSize:12}} value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
        <span style={{fontSize:11,color:T.textSec,fontWeight:600}}>Đến ngày:</span>
        <input type="date" className="inp" style={{maxWidth:160,fontSize:12}} value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
        {dateFrom&&dateTo&&<span className="badge" style={{background:`${T.accent}18`,color:T.accent}}>
          {Math.round((new Date(dateTo)-new Date(dateFrom))/864e5)+1} ngày
        </span>}
        {/* Quick date presets */}
        <div style={{display:"flex",gap:4,marginLeft:6}}>
          {[
            {l:"Tuần này",fn:()=>{const n=new Date("2025-06-01"),s=new Date(n);s.setDate(n.getDate()-n.getDay()+1);setDateFrom(s.toISOString().slice(0,10));setDateTo(n.toISOString().slice(0,10))}},
            {l:"Tháng này",fn:()=>{setDateFrom("2025-06-01");setDateTo("2025-06-01")}},
            {l:"Quý này",fn:()=>{setDateFrom("2025-04-01");setDateTo("2025-06-01")}},
            {l:"Năm nay",fn:()=>{setDateFrom("2025-01-01");setDateTo("2025-06-01")}},
          ].map(q=><button key={q.l} className="chip" style={{padding:"2px 7px",fontSize:9}} onClick={q.fn}>{q.l}</button>)}
        </div>
      </div>}
    </div>

    {/* KPI Cards with YoY */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
      {[
        {icon:ic.users,label:"Tổng KH",value:fn(o.total_customers),prev:o.prev_total_customers,cur:o.total_customers,sub:`${fn(o.active_customers)} active`},
        {icon:ic.cart,label:"AOV",value:fv(o.avg_order_value),prev:o.prev_aov,cur:o.avg_order_value,sub:"Giá trị TB / đơn"},
        {icon:ic.star,label:"KH mới tháng",value:fn(o.new_this_month),prev:o.prev_new_month,cur:o.new_this_month},
        {icon:ic.trend,label:`Doanh thu ${timePeriod==="custom"&&dateFrom?`${dateFrom.slice(5)} → ${dateTo.slice(5)}`:timePeriod==="ytd"?"YTD":timePeriod}`,value:fv(totalRev*(isDaily?1e6:1e6)),prev:prevTotalRev,cur:totalRev,sub:"VND"},
      ].map((m,idx)=>(<div key={idx} className={`card fu fu${idx+1}`} style={{position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-25,right:-25,width:80,height:80,borderRadius:"50%",background:`${T.accent}08`}}/>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
          <div style={{width:34,height:34,borderRadius:8,background:`${T.accent}18`,display:"flex",alignItems:"center",justifyContent:"center"}}><I d={m.icon} s={16} c={T.accent}/></div>
          <span style={{fontSize:11,color:T.textSec,fontWeight:500}}>{m.label}</span>
        </div>
        <div className="counter">{m.value}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4,flexWrap:"wrap"}}>
          {m.sub&&<span style={{fontSize:11,color:T.textMuted}}>{m.sub}</span>}
          {showYoY&&m.prev&&<ChgBadge cur={m.cur} prev={m.prev}/>}
        </div>
      </div>))}
    </div>

    {/* Revenue Chart with YoY line */}
    <div style={{display:"grid",gridTemplateColumns:"5fr 3fr",gap:12,marginBottom:16}}>
      <div className="card fu fu2">
        <Sec icon={ic.trend} title="Doanh thu & Đơn hàng" sql>
          {showYoY&&<span className="badge" style={{background:T.purple+"18",color:T.purple,fontSize:10}}>vs Năm trước</span>}
        </Sec>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={filteredRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder}/>
            <XAxis dataKey={chartXKey} stroke={T.textMuted} fontSize={isDaily?9:11} angle={isDaily&&filteredRevenue.length>15?-45:0} textAnchor={isDaily&&filteredRevenue.length>15?"end":"middle"} height={isDaily&&filteredRevenue.length>15?50:30} interval={isDaily&&filteredRevenue.length>60?"preserveStartEnd":filteredRevenue.length>30?2:0}/>
            <YAxis yAxisId="l" stroke={T.textMuted} fontSize={11}/>
            <YAxis yAxisId="r" orientation="right" stroke={T.textMuted} fontSize={11}/>
            <Tooltip {...tt}/>
            <Legend wrapperStyle={{fontSize:11}}/>
            <Area yAxisId="l" type="monotone" dataKey="revenue" fill={T.accent+"25"} stroke={T.accent} strokeWidth={2} name="Doanh thu"/>
            {showYoY&&<Line yAxisId="l" type="monotone" dataKey="prevRevenue" stroke={T.purple} strokeWidth={2} strokeDasharray="6 4" dot={false} name="DT cùng kỳ"/>}
            <Bar yAxisId="r" dataKey="orders" fill={T.info+"70"} radius={[3,3,0,0]} name="Đơn hàng"/>
            {showYoY&&<Line yAxisId="r" type="monotone" dataKey="prevOrders" stroke={T.info+"50"} strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Đơn cùng kỳ"/>}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="card fu fu3">
        <Sec icon={ic.target} title="Phân khúc" sql/>
        <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={dashData.segs} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">{dashData.segs.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip {...tt}/></PieChart></ResponsiveContainer>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>{dashData.segs.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:7,height:7,borderRadius:"50%",background:s.color,display:"inline-block"}}/><span style={{color:T.text}}>{s.name}</span></div><span style={{color:T.textMuted,fontWeight:700}}>{fn(s.value)}</span></div>))}</div>
      </div>
    </div>

    {/* Top Danh mục bán chạy */}
    <div className="card fu" style={{marginBottom:16}}>
      <Sec icon={ic.package} title="Top danh mục bán chạy" sql><ExportBtn canExport={canExport} data={dashData.cats.map(c=>({DanhMuc:c.name,DoanhThu:c.revenue,SoDon:c.orders}))} filename="top_categories"/></Sec>
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dashData.cats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder}/>
            <XAxis type="number" stroke={T.textMuted} fontSize={10} tickFormatter={v=>fv(v)}/>
            <YAxis type="category" dataKey="name" stroke={T.textMuted} fontSize={11} width={75}/>
            <Tooltip {...tt} formatter={v=>fv(v)}/>
            <Bar dataKey="revenue" radius={[0,6,6,0]} name="Doanh thu">{dashData.cats.map((_,i)=><Cell key={i} fill={CL[i]}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {dashData.cats.map((c,i) => {
            const pct = pctChg(c.revenue, c.prevRevenue);
            const up = Number(pct) >= 0;
            return (<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<dashData.cats.length-1?"1px solid "+T.cardBorder+"50":"none"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:CL[i],flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{c.name}</div>
                <div style={{fontSize:10,color:T.textMuted}}>{fn(c.orders)} đơn</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="counter" style={{fontSize:13}}>{fv(c.revenue)}</div>
                {showYoY && pct !== null && <span style={{fontSize:10,fontWeight:700,color:up?T.success:T.danger}}>{up?"+":""}{pct}%</span>}
              </div>
            </div>);
          })}
        </div>
      </div>
    </div>

    {/* Period comparison summary */}
    {showYoY&&<div className="card fu" style={{marginBottom:16,padding:"14px 20px",background:"linear-gradient(135deg,"+T.card+" 0%,#17152a 100%)",border:"1px solid "+T.purple+"25"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><I d={ic.trend} s={15} c={T.purple}/><span style={{fontSize:13,fontWeight:700}}>So sánh cùng kỳ năm trước {timePeriod==="custom"&&dateFrom?"("+dateFrom+" - "+dateTo+")":"("+timePeriod+")"}</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {[
          {l:"Doanh thu",cur:totalRev,prev:prevTotalRev,fmt:v=>fv(v*1e6)},
          {l:"Đơn hàng",cur:totalOrders,prev:prevTotalOrders,fmt:fn},
          {l:"AOV",cur:o.avg_order_value,prev:o.prev_aov,fmt:fv},
          {l:"KH mới",cur:o.new_this_month,prev:o.prev_new_month,fmt:fn},
        ].map((m,i)=>{const v=pctChg(m.cur,m.prev);const up=Number(v)>=0;return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:T.textMuted,textTransform:"uppercase",letterSpacing:".05em"}}>{m.l}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:2}}>
                <span style={{fontSize:16,fontWeight:800,fontFamily:"'Libre Baskerville',serif"}}>{m.fmt(m.cur)}</span>
                <span style={{fontSize:11,color:T.textMuted}}>← {m.fmt(m.prev)}</span>
              </div>
            </div>
            <div style={{padding:"4px 10px",borderRadius:6,background:up?`${T.success}15`:`${T.danger}15`,color:up?T.success:T.danger,fontSize:13,fontWeight:800}}>
              {up?"+":""}{v}%
            </div>
          </div>);})
        }
      </div>
    </div>}

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div className="card fu fu3"><Sec icon={ic.map} title="Top cửa hàng" sql><ExportBtn canExport={canExport} data={dashData.stores.map(s=>({CuaHang:s.store_name,DoanhThu:s.revenue,SoDon:s.orders}))} filename="top_stores"/></Sec>{dashData.stores.map((s,i)=>{const pct=pctChg(s.revenue,s.prevRevenue);const up=Number(pct)>=0;return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<dashData.stores.length-1?"1px solid "+T.cardBorder+"50":"none"}}><span style={{width:24,height:24,borderRadius:6,background:T.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:T.accent}}>{i+1}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{s.store_name}</div><div style={{fontSize:10,color:T.textMuted}}>{fn(s.orders)} đơn</div></div><div style={{textAlign:"right"}}><span className="counter" style={{fontSize:14}}>{fv(s.revenue)}</span>{showYoY&&pct!==null&&<div style={{fontSize:9,fontWeight:700,color:up?T.success:T.danger}}>{up?"+":""}{pct}%</div>}</div></div>)})}</div>
      <div className="card fu fu4"><Sec icon={ic.bar} title="Top sản phẩm" sql><ExportBtn canExport={canExport} data={dashData.products.map(p=>({SanPham:p.product_name,DanhMuc:p.category_name,SoLuong:p.qty_sold,DoanhThu:p.revenue}))} filename="top_products"/></Sec>{dashData.products.map((p,i)=>{const pct=pctChg(p.revenue,p.prevRevenue);const up=Number(pct)>=0;return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<dashData.products.length-1?"1px solid "+T.cardBorder+"50":"none"}}><span style={{width:24,height:24,borderRadius:6,background:T.success+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:T.success}}>{i+1}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{p.product_name}</div><div style={{fontSize:10,color:T.textMuted}}>{p.category_name}</div></div><div style={{textAlign:"right"}}><span className="counter" style={{fontSize:14}}>{fv(p.revenue)}</span>{showYoY&&pct!==null&&<div style={{fontSize:9,fontWeight:700,color:up?T.success:T.danger}}>{up?"+":""}{pct}%</div>}</div></div>)})}</div>
    </div>
  </div>);};

  // ── CUSTOMERS 360 ──
  // Pre-compute order data for selected customer (avoids IIFE in JSX)
  const selOrders = selCustomer ? (DEMO_ORDERS[selCustomer.id] || []) : [];
  const filteredOrders = selOrders.filter(o => {
    if (orderDateFrom && o.date < orderDateFrom) return false;
    if (orderDateTo && o.date > orderDateTo) return false;
    if (orderStore !== "all" && o.store !== orderStore) return false;
    return true;
  });
  const fOrdTotal = filteredOrders.filter(o=>o.status==="done").reduce((s,o)=>s+o.total,0);
  const fOrdCount = filteredOrders.filter(o=>o.status==="done").length;
  const selCustStores = [...new Set(selOrders.map(o=>o.store))];

  // RFM pre-computation for selected customer
  const selRFM = selCustomer ? (() => {
    const c = selCustomer;
    const daysSince = Math.floor((new Date("2025-06-01") - new Date(c.last_purchase)) / 864e5);
    const rScore = daysSince <= 7 ? 5 : daysSince <= 30 ? 4 : daysSince <= 60 ? 3 : daysSince <= 120 ? 2 : 1;
    const fScore = c.frequency_month >= 4 ? 5 : c.frequency_month >= 2.5 ? 4 : c.frequency_month >= 1.5 ? 3 : c.frequency_month >= 0.8 ? 2 : 1;
    const mScore = c.total_spent >= 50e6 ? 5 : c.total_spent >= 20e6 ? 4 : c.total_spent >= 10e6 ? 3 : c.total_spent >= 5e6 ? 2 : 1;
    const total = rScore + fScore + mScore;
    const label = total >= 13 ? "Champions" : total >= 10 ? "Loyal" : total >= 7 ? "Potential" : total >= 5 ? "At Risk" : "Hibernating";
    const color = total >= 13 ? T.success : total >= 10 ? T.info : total >= 7 ? T.warning : total >= 5 ? T.danger : T.textMuted;
    return { daysSince, rScore, fScore, mScore, total, label, color };
  })() : { daysSince:0, rScore:0, fScore:0, mScore:0, total:0, label:"—", color:T.textMuted };

  const rCustomers=()=>(<div className="fu">
    <div className="card" style={{marginBottom:14}}>
      {/* Search + Filter Toggle + Export */}
      <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"0 12px",borderRadius:8,background:T.surface,border:"1px solid "+T.cardBorder}}>
          <I d={ic.search} s={14} c={T.textMuted}/>
          <input className="inp" style={{border:"none",background:"transparent",padding:"8px 0"}} placeholder="Tìm MaTheKHTT, tên, SĐT..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
        </div>
        <button className={"btn btn-sm "+(custShowFilter||hasActiveFilter?"btn-p":"btn-g")} onClick={()=>setCustShowFilter(!custShowFilter)}>
          <I d={ic.filter} s={12}/> Lọc {hasActiveFilter?"("+filteredCust.length+")":""}
        </button>
        <ExportBtn canExport={canExport} data={filteredCust.map(c=>({MaTheKHTT:c.MaTheKHTT,Ten:c.name,SoDienThoai:c.phone,HangLoyalty:c.loyalty_tier,TongChiTieu:c.total_spent,SoDonHang:c.total_orders,TanSuat:c.frequency_month,AOV:c.avg_basket,Segment:c.segment,CuaHang:c.store_primary,LanMuaCuoi:c.last_purchase,CoZalo:c.has_zalo?"Co":"Khong"}))} filename={"KH360_"+filteredCust.length+"kh"}/>
      </div>

      {/* Advanced Filter Panel */}
      {custShowFilter&&(<div style={{padding:14,marginBottom:12,borderRadius:10,background:T.surfaceAlt,border:"1px solid "+T.cardBorder}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700,color:T.accent}}>Bộ lọc nâng cao</span>
          <button className="btn btn-g btn-sm" onClick={resetCustFilter} style={{padding:"3px 10px",fontSize:10}}><I d={ic.x} s={10}/> Xoá lọc</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <span className="label-sm">Cửa hàng giao dịch</span>
            <select className="inp" value={custStore} onChange={e=>setCustStore(e.target.value)}>
              <option value="all">Tất cả</option>
              {allStoresList.map(s=>(<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div>
            <span className="label-sm">Hạng Loyalty</span>
            <select className="inp" value={custTier} onChange={e=>setCustTier(e.target.value)}>
              <option value="all">Tất cả</option>
              {allTiersList.map(t=>(<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <span className="label-sm">Segment</span>
            <select className="inp" value={custSegment} onChange={e=>setCustSegment(e.target.value)}>
              <option value="all">Tất cả</option>
              {allSegsList.map(s=>(<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div>
            <span className="label-sm">Sắp xếp</span>
            <select className="inp" value={custSort} onChange={e=>setCustSort(e.target.value)}>
              <option value="total_spent_desc">Chi tiêu cao - thấp</option>
              <option value="total_spent_asc">Chi tiêu thấp - cao</option>
              <option value="last_purchase_desc">Mua gần nhất</option>
              <option value="last_purchase_asc">Lâu chưa mua</option>
              <option value="orders_desc">Nhiều đơn nhất</option>
              <option value="freq_desc">Tần suất cao nhất</option>
            </select>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <span className="label-sm">Tổng chi tiêu (VNĐ)</span>
            <div className="range-row">
              <input className="inp" placeholder="Từ" value={custSpendMin} onChange={e=>setCustSpendMin(e.target.value)}/>
              <span style={{color:T.textMuted}}>—</span>
              <input className="inp" placeholder="Đến" value={custSpendMax} onChange={e=>setCustSpendMax(e.target.value)}/>
            </div>
          </div>
          <div>
            <span className="label-sm">Lần giao dịch gần nhất</span>
            <div className="range-row">
              <input type="date" className="inp" style={{fontSize:12}} value={custLastFrom} onChange={e=>setCustLastFrom(e.target.value)}/>
              <span style={{color:T.textMuted}}>—</span>
              <input type="date" className="inp" style={{fontSize:12}} value={custLastTo} onChange={e=>setCustLastTo(e.target.value)}/>
            </div>
          </div>
        </div>
        {hasActiveFilter&&(<div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
          {custStore!=="all"&&<span className="badge" style={{background:T.accent+"18",color:T.accent}}>{custStore} <span style={{cursor:"pointer",marginLeft:4}} onClick={()=>setCustStore("all")}>x</span></span>}
          {custTier!=="all"&&<span className="badge" style={{background:T.accent+"18",color:T.accent}}>{custTier} <span style={{cursor:"pointer",marginLeft:4}} onClick={()=>setCustTier("all")}>x</span></span>}
          {custSegment!=="all"&&<span className="badge" style={{background:T.accent+"18",color:T.accent}}>{custSegment} <span style={{cursor:"pointer",marginLeft:4}} onClick={()=>setCustSegment("all")}>x</span></span>}
          {custSpendMin&&<span className="badge" style={{background:T.info+"18",color:T.info}}>{">="+fv(+custSpendMin)} <span style={{cursor:"pointer",marginLeft:4}} onClick={()=>setCustSpendMin("")}>x</span></span>}
          {custSpendMax&&<span className="badge" style={{background:T.info+"18",color:T.info}}>{"<="+fv(+custSpendMax)} <span style={{cursor:"pointer",marginLeft:4}} onClick={()=>setCustSpendMax("")}>x</span></span>}
          {custLastFrom&&<span className="badge" style={{background:T.success+"18",color:T.success}}>{"Từ "+custLastFrom} <span style={{cursor:"pointer",marginLeft:4}} onClick={()=>setCustLastFrom("")}>x</span></span>}
          {custLastTo&&<span className="badge" style={{background:T.success+"18",color:T.success}}>{"Đến "+custLastTo} <span style={{cursor:"pointer",marginLeft:4}} onClick={()=>setCustLastTo("")}>x</span></span>}
        </div>)}
      </div>)}

      {/* Result count */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:11,color:T.textSec}}>{filteredCust.length} / {data.customers.length} khách hàng</span>
      </div>

      {/* Table */}
      <div className="tw"><table><thead><tr>{["Mã KH","Tên","Cửa hàng","Hạng","Chi tiêu","Đơn","Mua cuối","Tần suất","Segment","Zalo"].map(h=>(<th key={h}>{h}</th>))}</tr></thead><tbody>
        {filteredCust.map(c=>(<tr key={c.id} className="rh" onClick={()=>{setSelCustomer(c);addLog("view","customers","Xem chi tiết "+c.MaTheKHTT+" "+c.name)}}>
          <td style={{color:T.accent,fontWeight:600}}>{c.MaTheKHTT}</td>
          <td style={{fontWeight:600}}>{c.name}</td>
          <td style={{fontSize:11,color:T.textSec}}>{c.store_primary}</td>
          <td><Tier t={c.loyalty_tier}/></td>
          <td style={{fontWeight:700,fontSize:12}}>{fv(c.total_spent)}</td>
          <td>{c.total_orders}</td>
          <td style={{fontSize:11,color:T.textSec}}>{c.last_purchase}</td>
          <td style={{color:T.info,fontWeight:600}}>{c.frequency_month}</td>
          <td><span className="badge" style={{background:(c.segment==="Champions"?T.success:c.segment==="At Risk"||c.segment==="Hibernating"?T.danger:T.info)+"18",color:c.segment==="Champions"?T.success:c.segment==="At Risk"||c.segment==="Hibernating"?T.danger:T.info,fontSize:10}}>{c.segment}</span></td>
          <td>{c.has_zalo?<I d={ic.check} s={13} c={T.success}/>:<I d={ic.x} s={13} c={T.textMuted}/>}</td>
        </tr>))}
      </tbody></table></div>
    </div>
    {selCustomer&&(<div className="card fu" style={{borderColor:T.accent+"40",overflow:"hidden"}}>
        {/* Customer Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,padding:"0 2px"}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg,"+T.accent+"30,"+T.purple+"30)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:T.accent}}>{selCustomer.name.charAt(0)}</div>
            <div>
              <div style={{fontSize:20,fontWeight:800,fontFamily:"'Libre Baskerville',serif"}}>{selCustomer.name}</div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginTop:2}}>
                <span style={{fontSize:12,color:T.accent,fontWeight:600}}>{selCustomer.MaTheKHTT}</span>
                <span style={{width:3,height:3,borderRadius:"50%",background:T.textMuted}}/>
                <span style={{fontSize:12,color:T.textSec}}>{selCustomer.phone}</span>
                <span style={{width:3,height:3,borderRadius:"50%",background:T.textMuted}}/>
                <span style={{fontSize:12,color:T.textSec}}>{selCustomer.store_primary}</span>
                <Tier t={selCustomer.loyalty_tier}/>
              </div>
            </div>
          </div>
          <button className="btn btn-g btn-sm" onClick={()=>{setSelCustomer(null);setDetailTab("overview");setExpandedOrder(null);setOrderDateFrom("");setOrderDateTo("");setOrderStore("all")}}><I d={ic.x} s={12}/></button>
        </div>

        {/* KPI row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:16}}>
          {[
            {l:"Tổng chi",v:fv(selCustomer.total_spent),c:T.accent,ic2:ic.dollar},
            {l:"Đơn hàng",v:selCustomer.total_orders,c:T.info,ic2:ic.cart},
            {l:"Mua cuối",v:selCustomer.last_purchase,c:T.success,ic2:ic.clock},
            {l:"Tần suất/T",v:selCustomer.frequency_month,c:T.warning,ic2:ic.repeat},
            {l:"AOV",v:fv(selCustomer.avg_basket),c:T.purple,ic2:ic.trend},
            {l:"Points",v:fn(selCustomer.loyalty_points),c:T.pink,ic2:ic.star}
          ].map((m,i)=>(<div key={i} style={{padding:"10px 12px",borderRadius:10,background:m.c+"08",border:"1px solid "+m.c+"20"}}>
            <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}><I d={m.ic2} s={10} c={m.c}/><span style={{fontSize:9,fontWeight:700,color:m.c,textTransform:"uppercase",letterSpacing:".04em"}}>{m.l}</span></div>
            <div className="counter" style={{fontSize:16}}>{m.v}</div>
          </div>))}
        </div>

        {/* Tab switcher */}
        <div style={{display:"flex",gap:2,marginBottom:16,borderBottom:"1px solid "+T.cardBorder}}>
          {[{id:"overview",label:"Tổng quan",icon:ic.eye},{id:"persona",label:"Chân dung KH",icon:ic.users},{id:"orders",label:"Lịch sử đơn ("+selOrders.length+")",icon:ic.cart}].map(t=>(
            <button key={t.id} onClick={()=>{setDetailTab(t.id);setExpandedOrder(null)}} style={{padding:"8px 16px",fontSize:12,fontWeight:detailTab===t.id?700:500,color:detailTab===t.id?T.accent:T.textSec,background:detailTab===t.id?T.accent+"10":"transparent",border:"none",borderBottom:detailTab===t.id?"2px solid "+T.accent:"2px solid transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:6,borderRadius:"6px 6px 0 0"}}><I d={t.icon} s={12} c={detailTab===t.id?T.accent:T.textMuted}/>{t.label}</button>
          ))}
        </div>

        {/* Tab: Overview */}
        {detailTab==="overview"&&(<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><I d={ic.package} s={13} c={T.accent}/> Top danh mục</div>
              {(selCustomer.top_categories||[]).map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0"}}><span style={{width:8,height:8,borderRadius:"50%",background:CL[i]}}/><span style={{fontSize:12}}>{c}</span></div>))}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:700,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><I d={ic.star} s={13} c={T.success}/> Top sản phẩm</div>
              {(selCustomer.top_products||[]).map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0"}}><span style={{width:20,height:20,borderRadius:5,background:CL[i]+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:CL[i]}}>{i+1}</span><span style={{fontSize:12}}>{p}</span></div>))}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:700,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><I d={ic.map} s={13} c={T.info}/> Cửa hàng giao dịch</div>
              {(selCustomer.transaction_stores||[]).map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0"}}><I d={ic.map} s={11} c={T.textMuted}/><span style={{fontSize:12}}>{s}</span></div>))}
            </div>
          </div>
          <div style={{marginTop:14,display:"flex",gap:8}}>
            <span className="badge" style={{background:T.success+"18",color:T.success}}>{selCustomer.segment}</span>
            {selCustomer.has_zalo&&<span className="badge" style={{background:T.zaloGreen+"18",color:T.zaloGreen}}>Zalo {selCustomer.zalo_oa_follow?"+ Follow OA":""}</span>}
            <span className="badge" style={{background:T.info+"18",color:T.info}}>KH từ {selCustomer.first_purchase}</span>
          </div>
        </div>)}

        {/* Tab: Chân dung KH (Customer Persona + RFM) */}
        {detailTab==="persona"&&selCustomer&&(<div>
          {/* RFM Section */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><I d={ic.bar} s={14} c={selRFM.color}/> RFM Analysis</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {label:"R - Recency",sub:selRFM.daysSince+" ngày trước",score:selRFM.rScore,color:T.success},
                  {label:"F - Frequency",sub:selCustomer.frequency_month+"/tháng",score:selRFM.fScore,color:T.info},
                  {label:"M - Monetary",sub:fv(selCustomer.total_spent),score:selRFM.mScore,color:T.accent},
                ].map((r,i)=>(<div key={i}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div><span style={{fontSize:12,fontWeight:700}}>{r.label}</span><span style={{fontSize:10,color:T.textMuted,marginLeft:8}}>{r.sub}</span></div>
                    <span style={{fontSize:14,fontWeight:800,color:r.color}}>{r.score}/5</span>
                  </div>
                  <div style={{height:6,borderRadius:3,background:T.cardBorder,overflow:"hidden"}}>
                    <div style={{height:"100%",width:(r.score/5*100)+"%",background:r.color,borderRadius:3}}/>
                  </div>
                </div>))}
              </div>
              <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:selRFM.color+"10",border:"1px solid "+selRFM.color+"30",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><span style={{fontSize:11,color:T.textSec}}>RFM Score</span><div style={{fontSize:22,fontWeight:800,color:selRFM.color}}>{selRFM.total}/15</div></div>
                <span className="badge" style={{background:selRFM.color+"20",color:selRFM.color,fontSize:13,fontWeight:700,padding:"6px 14px"}}>{selRFM.label}</span>
              </div>
            </div>

            {/* Value & Lifecycle */}
            <div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><I d={ic.target} s={14} c={T.purple}/> Phân loại giá trị</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                {[
                  {label:"Value Segment",value:(selCustomer.persona||{}).value_seg,colorMap:{"Super VIP":T.accent,"VIP":T.success,"Regular":T.info,"Low":T.textMuted}},
                  {label:"Lifecycle",value:(selCustomer.persona||{}).lifecycle,colorMap:{"Loyal":T.success,"Active":T.info,"Growing":T.warning,"Declining":T.danger,"Churning":T.textMuted}},
                ].map((d,i)=>{const cl=d.colorMap[d.value]||T.info;return(<div key={i} style={{padding:10,borderRadius:10,background:cl+"10",border:"1px solid "+cl+"25"}}>
                  <div style={{fontSize:9,fontWeight:700,color:cl,textTransform:"uppercase",marginBottom:3}}>{d.label}</div>
                  <div style={{fontSize:15,fontWeight:800,color:cl}}>{d.value||"—"}</div>
                </div>)})}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {label:"AOV Level",value:(selCustomer.persona||{}).aov_level},
                  {label:"Frequency",value:(selCustomer.persona||{}).freq_level},
                ].map((d,i)=>(<div key={i} style={{padding:8,borderRadius:8,background:T.surfaceAlt}}>
                  <div style={{fontSize:9,fontWeight:600,color:T.textMuted,marginBottom:2}}>{d.label}</div>
                  <div style={{fontSize:12,fontWeight:700}}>{d.value||"—"}</div>
                </div>))}
              </div>
            </div>
          </div>

          {/* Persona Dimensions */}
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><I d={ic.users} s={14} c={T.accent}/> Customer Persona</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            {[
              {label:"Product Persona",value:((selCustomer.persona||{}).product_persona||[]).join(", "),icon:ic.package,color:T.accent},
              {label:"Payment Persona",value:(selCustomer.persona||{}).payment_persona,icon:ic.dollar,color:T.info},
              {label:"Price Sensitivity",value:(selCustomer.persona||{}).price_sens,icon:ic.star,color:T.warning},
              {label:"Shopping Mission",value:(selCustomer.persona||{}).shop_mission,icon:ic.cart,color:T.success},
              {label:"Channel",value:(selCustomer.persona||{}).channel,icon:ic.msg,color:T.purple},
              {label:"Store",value:selCustomer.store_primary,icon:ic.map,color:T.teal},
            ].map((d,i)=>(<div key={i} style={{padding:10,borderRadius:10,background:T.surfaceAlt,border:"1px solid "+T.cardBorder}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}><I d={d.icon} s={11} c={d.color}/><span style={{fontSize:9,fontWeight:700,color:d.color,textTransform:"uppercase"}}>{d.label}</span></div>
              <div style={{fontSize:12,fontWeight:600,color:T.text}}>{d.value||"—"}</div>
            </div>))}
          </div>

          {/* Notes */}
          {(selCustomer.persona||{}).note&&(<div style={{padding:"12px 16px",borderRadius:10,background:"linear-gradient(135deg,"+T.card+" 0%,#1a1828 100%)",border:"1px solid "+T.purple+"20"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><I d={ic.edit} s={12} c={T.purple}/><span style={{fontSize:11,fontWeight:700,color:T.purple}}>Ghi chú</span></div>
            <div style={{fontSize:12,color:T.textSec,lineHeight:1.6}}>{(selCustomer.persona||{}).note}</div>
          </div>)}
        </div>)}

        {/* Tab: Orders */}
        {detailTab==="orders"&&(<div>
          {/* Order filter bar */}
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
            <I d={ic.calendar} s={13} c={T.textMuted}/>
            <input type="date" className="inp" style={{maxWidth:140,fontSize:11}} value={orderDateFrom} onChange={e=>setOrderDateFrom(e.target.value)}/>
            <span style={{color:T.textMuted,fontSize:11}}>to</span>
            <input type="date" className="inp" style={{maxWidth:140,fontSize:11}} value={orderDateTo} onChange={e=>setOrderDateTo(e.target.value)}/>
            <select className="inp" style={{maxWidth:170,fontSize:11}} value={orderStore} onChange={e=>setOrderStore(e.target.value)}>
              <option value="all">Tất cả cửa hàng</option>
              {selCustStores.map(s=>(<option key={s} value={s}>{s}</option>))}
            </select>
            {(orderDateFrom||orderDateTo||orderStore!=="all")&&<button className="btn btn-g btn-sm" style={{fontSize:10,padding:"3px 8px"}} onClick={()=>{setOrderDateFrom("");setOrderDateTo("");setOrderStore("all")}}><I d={ic.x} s={10}/> Xoá lọc</button>}
            <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:11,color:T.textSec}}>{fOrdCount} đơn</span>
              <span style={{fontSize:11,color:T.textMuted}}>|</span>
              <span style={{fontSize:12,fontWeight:700,color:T.accent}}>{fv(fOrdTotal)}</span>
            </div>
          </div>

          {/* Quick time chips */}
          <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>
            {[
              {l:"7 ngày",fn:()=>{const n=new Date("2025-06-01");const f=new Date(n);f.setDate(f.getDate()-7);setOrderDateFrom(f.toISOString().slice(0,10));setOrderDateTo(n.toISOString().slice(0,10))}},
              {l:"30 ngày",fn:()=>{const n=new Date("2025-06-01");const f=new Date(n);f.setDate(f.getDate()-30);setOrderDateFrom(f.toISOString().slice(0,10));setOrderDateTo(n.toISOString().slice(0,10))}},
              {l:"90 ngày",fn:()=>{const n=new Date("2025-06-01");const f=new Date(n);f.setDate(f.getDate()-90);setOrderDateFrom(f.toISOString().slice(0,10));setOrderDateTo(n.toISOString().slice(0,10))}},
              {l:"6 tháng",fn:()=>{setOrderDateFrom("2024-12-01");setOrderDateTo("2025-06-01")}},
              {l:"Năm nay",fn:()=>{setOrderDateFrom("2025-01-01");setOrderDateTo("2025-06-01")}},
              {l:"Tất cả",fn:()=>{setOrderDateFrom("");setOrderDateTo("")}},
            ].map(q=>(<button key={q.l} className="chip" style={{padding:"3px 8px",fontSize:10}} onClick={q.fn}>{q.l}</button>))}
          </div>

          {/* Orders list */}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {filteredOrders.length===0&&<div style={{padding:20,textAlign:"center",color:T.textMuted,fontSize:13}}>Không có đơn hàng trong khoảng thời gian này</div>}
            {filteredOrders.map(o=>{
              const isExp = expandedOrder===o.id;
              const isCx = o.status==="cancelled";
              return (<div key={o.id} style={{borderRadius:10,border:"1px solid "+(isExp?T.accent+"40":T.cardBorder),background:isExp?T.accent+"05":T.surface,overflow:"hidden"}}>
                {/* Order row */}
                <div onClick={()=>setExpandedOrder(isExp?null:o.id)} style={{padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:30,height:30,borderRadius:8,background:isCx?T.danger+"15":T.success+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I d={isCx?ic.x:ic.check} s={13} c={isCx?T.danger:T.success}/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,fontWeight:700,color:T.accent}}>{o.id}</span>
                      <span style={{fontSize:11,color:T.textSec}}>{o.date}</span>
                      {isCx&&<span className="badge" style={{background:T.danger+"18",color:T.danger,fontSize:9}}>Đã huỷ</span>}
                    </div>
                    <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{o.store} · {o.pay} · {o.items.length} SP</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div className="counter" style={{fontSize:14,textDecoration:isCx?"line-through":"none"}}>{fv(o.total)}</div>
                    {o.disc>0&&<div style={{fontSize:10,color:T.success}}>-{fv(o.disc)}</div>}
                  </div>
                  <I d={isExp?"M18 15l-6-6-6 6":"M6 9l6 6 6-6"} s={14} c={T.textMuted}/>
                </div>

                {/* Expanded: Order items */}
                {isExp&&(<div style={{borderTop:"1px solid "+T.cardBorder,padding:"12px 14px",background:T.bg+"80"}}>
                  <div style={{display:"grid",gridTemplateColumns:"40px 1fr 90px 50px 70px 90px",gap:4,marginBottom:6,padding:"0 4px"}}>
                    {["SKU","Sản phẩm","Đơn giá","SL","Danh mục","Thành tiền"].map(h=>(<span key={h} style={{fontSize:9,color:T.textMuted,fontWeight:700,textAlign:h==="Đơn giá"||h==="Thành tiền"?"right":h==="SL"?"center":"left"}}>{h}</span>))}
                  </div>
                  {o.items.map((it,j)=>(<div key={j} style={{display:"grid",gridTemplateColumns:"40px 1fr 90px 50px 70px 90px",gap:4,padding:"6px 4px",borderRadius:6,background:j%2===0?"transparent":T.surfaceAlt+"50",alignItems:"center"}}>
                    <span style={{fontSize:10,color:T.textMuted}}>{it.sku}</span>
                    <span style={{fontSize:12,fontWeight:600}}>{it.name}</span>
                    <span style={{fontSize:11,color:T.textSec,textAlign:"right"}}>{fv(it.price)}</span>
                    <span style={{fontSize:12,fontWeight:700,color:T.info,textAlign:"center"}}>{it.qty}</span>
                    <span style={{fontSize:10,color:T.textMuted}}>{it.cat}</span>
                    <span style={{fontSize:12,fontWeight:700,textAlign:"right"}}>{fv(it.amt)}</span>
                  </div>))}
                  <div style={{borderTop:"1px solid "+T.cardBorder,marginTop:8,paddingTop:8,display:"flex",justifyContent:"flex-end",gap:20}}>
                    <span style={{fontSize:11,color:T.textSec}}>Tạm tính: <b style={{color:T.text}}>{fv(o.sub)}</b></span>
                    {o.disc>0&&<span style={{fontSize:11,color:T.success}}>Giảm: <b>-{fv(o.disc)}</b></span>}
                    <span style={{fontSize:12,fontWeight:800,color:T.accent}}>Tổng: {fv(o.total)}</span>
                    <span style={{fontSize:11,color:T.purple}}>+{o.pts} pts</span>
                  </div>
                </div>)}
              </div>);
            })}
          </div>
        </div>)}
      </div>)}
  </div>);

  // ── SEGMENT FILTER ──
  const rSegment=()=>{
    const allT=["Platinum","Gold","Silver"],allS=["Champions","Loyal","Potential","New","At Risk","Hibernating"],allC=["Thực phẩm","Đồ uống","Gia vị","Snack","Đông lạnh"],allSt=[...new Set(data.customers.map(c=>c.store_primary))];
    const res=segRes||[];
    return(<div className="fu">
      <div className="card" style={{marginBottom:14}}>
        <Sec icon={ic.sliders} title="Bộ lọc khách hàng nâng cao"><div style={{display:"flex",gap:6}}><button className="btn btn-p btn-sm" onClick={applyF}><I d={ic.filter} s={12}/> Áp dụng</button><button className="btn btn-g btn-sm" onClick={resetF}><I d={ic.x} s={12}/> Reset</button></div></Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}><div><span className="label-sm">Hạng Loyalty</span><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{allT.map(t=><button key={t} className={`chip ${segF.tiers.includes(t)?'on':''}`} onClick={()=>togChip('tiers',t)}><I d={ic.star} s={10}/>{t}</button>)}</div></div><div><span className="label-sm">RFM Segment</span><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{allS.map(s=><button key={s} className={`chip ${segF.segments.includes(s)?'on':''}`} onClick={()=>togChip('segments',s)}>{s}</button>)}</div></div></div>
        <div style={{marginBottom:12}}><span className="label-sm">Danh mục sản phẩm đã mua</span><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{allC.map(c=><button key={c} className={`chip ${segF.categories.includes(c)?'on':''}`} onClick={()=>togChip('categories',c)}><I d={ic.package} s={10}/>{c}</button>)}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}><div><span className="label-sm">Tổng chi tiêu (VNĐ)</span><div className="range-row"><input className="inp" placeholder="Từ" value={segF.spendMin} onChange={e=>setSegF(p=>({...p,spendMin:e.target.value}))}/><span style={{color:T.textMuted}}>—</span><input className="inp" placeholder="Đến" value={segF.spendMax} onChange={e=>setSegF(p=>({...p,spendMax:e.target.value}))}/></div></div><div><span className="label-sm">Số đơn hàng</span><div className="range-row"><input className="inp" placeholder="Từ" value={segF.ordersMin} onChange={e=>setSegF(p=>({...p,ordersMin:e.target.value}))}/><span style={{color:T.textMuted}}>—</span><input className="inp" placeholder="Đến" value={segF.ordersMax} onChange={e=>setSegF(p=>({...p,ordersMax:e.target.value}))}/></div></div><div><span className="label-sm">Tần suất / tháng</span><div className="range-row"><input className="inp" placeholder="Từ" value={segF.freqMin} onChange={e=>setSegF(p=>({...p,freqMin:e.target.value}))}/><span style={{color:T.textMuted}}>—</span><input className="inp" placeholder="Đến" value={segF.freqMax} onChange={e=>setSegF(p=>({...p,freqMax:e.target.value}))}/></div></div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}><div><span className="label-sm">AOV</span><div className="range-row"><input className="inp" placeholder="Từ" value={segF.avgBasketMin} onChange={e=>setSegF(p=>({...p,avgBasketMin:e.target.value}))}/><span style={{color:T.textMuted}}>—</span><input className="inp" placeholder="Đến" value={segF.avgBasketMax} onChange={e=>setSegF(p=>({...p,avgBasketMax:e.target.value}))}/></div></div><div><span className="label-sm">Ngày kể từ lần mua cuối</span><div className="range-row"><input className="inp" placeholder="Từ (ngày)" value={segF.daysSinceMin} onChange={e=>setSegF(p=>({...p,daysSinceMin:e.target.value}))}/><span style={{color:T.textMuted}}>—</span><input className="inp" placeholder="Đến (ngày)" value={segF.daysSinceMax} onChange={e=>setSegF(p=>({...p,daysSinceMax:e.target.value}))}/></div></div></div>
        <div style={{marginBottom:12}}><span className="label-sm">Cửa hàng chính</span><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{allSt.map(s=><button key={s} className={"chip "+(segF.stores.includes(s)?"on":"")} onClick={()=>togChip("stores",s)}>{s}</button>)}</div></div>
        <div style={{marginBottom:12}}><span className="label-sm">Nơi phát sinh giao dịch</span><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{allSt.map(s=><button key={s} className={"chip "+(segF.txnStores.includes(s)?"on":"")} onClick={()=>togChip("txnStores",s)}><I d={ic.map} s={10}/>{s}</button>)}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
          <div><span className="label-sm">Lần GD gần nhất (từ ngày)</span><div className="range-row"><input type="date" className="inp" value={segF.lastPurchaseFrom} onChange={e=>setSegF(p=>({...p,lastPurchaseFrom:e.target.value}))}/><span style={{color:T.textMuted}}>—</span><input type="date" className="inp" value={segF.lastPurchaseTo} onChange={e=>setSegF(p=>({...p,lastPurchaseTo:e.target.value}))}/></div></div>
          <div><span className="label-sm">Số tiền GD gần nhất (VNĐ)</span><div className="range-row"><input className="inp" placeholder="Từ" value={segF.lastTxnAmtMin} onChange={e=>setSegF(p=>({...p,lastTxnAmtMin:e.target.value}))}/><span style={{color:T.textMuted}}>—</span><input className="inp" placeholder="Đến" value={segF.lastTxnAmtMax} onChange={e=>setSegF(p=>({...p,lastTxnAmtMax:e.target.value}))}/></div></div>
          <div><span className="label-sm">Zalo</span><div style={{display:"flex",gap:6}}><select className="inp" value={segF.hasZalo} onChange={e=>setSegF(p=>({...p,hasZalo:e.target.value}))}><option value="all">Tất cả</option><option value="yes">Có Zalo</option><option value="no">Không</option></select><select className="inp" value={segF.zaloFollow} onChange={e=>setSegF(p=>({...p,zaloFollow:e.target.value}))}><option value="all">OA</option><option value="yes">Follow</option><option value="no">Chưa</option></select></div></div>
        </div>
      </div>
      {segRes!==null&&(<div className="fu">
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}><Metric icon={ic.userCheck} label="KH phù hợp" value={fn(res.length)} sub={`/${fn(data.customers.length)}`} idx={1}/><Metric icon={ic.dollar} label="Tổng chi tệp" value={fv(res.reduce((s,c)=>s+c.total_spent,0))} idx={2}/><Metric icon={ic.repeat} label="Tần suất TB" value={res.length?(res.reduce((s,c)=>s+c.frequency_month,0)/res.length).toFixed(1):0} idx={3}/><Metric icon={ic.msg} label="Có Zalo" value={res.filter(c=>c.has_zalo).length} sub={`${res.filter(c=>c.zalo_oa_follow).length} follow`} idx={4}/></div>
        <div className="card" style={{marginBottom:12}}>
          <Sec icon={ic.users} title={"Tệp KH (" + res.length + ")"}><div style={{display:"flex",gap:6}}><button className="btn btn-z btn-sm" onClick={()=>setTab("zalo")}><I d={ic.send} s={12}/> Gửi ZNS</button><button className="btn btn-ai btn-sm" onClick={()=>{setChatInput("Phân tích tệp " + res.length + " KH vừa lọc: " + res.map(c=>c.name+"("+c.segment+","+fv(c.total_spent)+")").join(", ") + ". Đề xuất chiến dịch phù hợp.");setTab("ai_chat");}}><I d={ic.brain} s={12}/> Hỏi AI</button><ExportBtn canExport={canExport} data={res.map(c=>({MaTheKHTT:c.MaTheKHTT,Ten:c.name,SoDienThoai:c.phone,HangLoyalty:c.loyalty_tier,TongChiTieu:c.total_spent,SoDonHang:c.total_orders,TanSuat:c.frequency_month,AOV:c.avg_basket,Segment:c.segment,CuaHang:c.store_primary,CoZalo:c.has_zalo?"Có":"Không",FollowOA:c.zalo_oa_follow?"Có":"Không",DanhMuc:(c.top_categories||[]).join("; ")}))} filename={"segment_filter_"+res.length+"kh"}/></div></Sec>
          <div className="tw"><table><thead><tr>{["","Mã","Tên","Hạng","Chi tiêu","Đơn","Tần suất","Danh mục","Segment","Zalo"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
            {res.map(c=>(<tr key={c.id} className="rh"><td><input type="checkbox" checked={selCamp.includes(c.id)} onChange={()=>setSelCamp(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id])}/></td><td style={{color:T.accent,fontWeight:600,fontSize:11}}>{c.MaTheKHTT}</td><td style={{fontWeight:600,fontSize:12}}>{c.name}</td><td><Tier t={c.loyalty_tier}/></td><td className="counter" style={{fontSize:11}}>{fv(c.total_spent)}</td><td>{c.total_orders}</td><td style={{color:T.info,fontWeight:600}}>{c.frequency_month}</td><td style={{fontSize:10,color:T.textSec}}>{c.top_categories?.slice(0,2).join(", ")}</td><td><span className="badge" style={{background:`${c.segment==='Champions'?T.success:T.info}18`,color:c.segment==='Champions'?T.success:T.info,fontSize:9}}>{c.segment}</span></td><td>{c.has_zalo?<I d={ic.check} s={12} c={T.success}/>:<I d={ic.x} s={12} c={T.textMuted}/>}</td></tr>))}
          </tbody></table></div>
        </div>
      </div>)}
    </div>);
  };

  // ── SALES ──
  const rSales=()=>(<div className="fu">
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
      <div className="card"><Sec icon={ic.bar} title="Doanh thu danh mục" sql><ExportBtn canExport={canExport}/></Sec><ResponsiveContainer width="100%" height={220}><BarChart data={data.catPerf} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder}/><XAxis type="number" stroke={T.textMuted} fontSize={11} tickFormatter={v=>fv(v)}/><YAxis type="category" dataKey="name" stroke={T.textMuted} fontSize={11} width={70}/><Tooltip {...tt} formatter={v=>fv(v)}/><Bar dataKey="revenue" radius={[0,6,6,0]}>{data.catPerf.map((_,i)=><Cell key={i} fill={CL[i]}/>)}</Bar></BarChart></ResponsiveContainer></div>
      <div className="card"><Sec icon={ic.gift} title="Thanh toán" sql/><ResponsiveContainer width="100%" height={170}><PieChart><Pie data={data.payments} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={4} dataKey="amount" nameKey="method">{data.payments.map((_,i)=><Cell key={i} fill={CL[i]}/>)}</Pie><Tooltip {...tt} formatter={v=>fv(v)}/></PieChart></ResponsiveContainer><div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>{data.payments.map((p,i)=>(<span key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10}}><span style={{width:7,height:7,borderRadius:"50%",background:CL[i],display:"inline-block"}}/>{p.method}</span>))}</div></div>
    </div>
    <div className="card"><Sec icon={ic.clock} title="Đơn hàng theo giờ" sql/><ResponsiveContainer width="100%" height={170}><AreaChart data={data.hourly}><CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder}/><XAxis dataKey="hour" stroke={T.textMuted} fontSize={10}/><YAxis stroke={T.textMuted} fontSize={10}/><Tooltip {...tt}/><Area type="monotone" dataKey="orders" stroke={T.accent} fill={`${T.accent}30`} strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
  </div>);

  // ── MARKETING ──
  const rMarketing=()=>(<div className="fu"><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}><Metric icon={ic.target} label="Campaigns" value="12" idx={1}/><Metric icon={ic.users} label="Reach" value="485K" idx={2}/><Metric icon={ic.trend} label="CTR" value="3.8%" idx={3}/></div><div className="card"><Sec icon={ic.target} title="Chiến dịch" sql><ExportBtn canExport={canExport}/></Sec><div className="tw"><table><thead><tr>{["Tên","Status","Mục tiêu","Chi","Reach","CTR"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{[{n:"Flash Sale T12",s:"Active",o:"Sales",sp:"45M",r:"120K",c:"4.2%"},{n:"Loyalty Q4",s:"Active",o:"Retention",sp:"32M",r:"85K",c:"3.5%"},{n:"VIP Exclusive",s:"Active",o:"Upsell",sp:"18M",r:"15K",c:"8.1%"},{n:"Win-back",s:"Active",o:"Retention",sp:"12M",r:"25K",c:"2.8%"}].map((c,i)=>(<tr key={i} className="rh"><td style={{fontWeight:600}}>{c.n}</td><td><span className="badge" style={{background:`${T.success}18`,color:T.success}}>{c.s}</span></td><td style={{color:T.textSec}}>{c.o}</td><td style={{fontWeight:600}}>{c.sp}</td><td>{c.r}</td><td style={{color:T.accent,fontWeight:600}}>{c.c}</td></tr>))}</tbody></table></div></div></div>);

  // ── ZALO ──
  const rZalo=()=>(<div className="fu">
    <div className="card" style={{marginBottom:14,background:`linear-gradient(135deg,${T.zaloGreen}12 0%,${T.surface} 100%)`,border:`1px solid ${T.zaloGreen}30`}}>
      <Sec icon={ic.msg} title="Zalo OA"><Dot on={zaloOn} label={zaloOn?"Zalo Connected":"Chưa kết nối"}/></Sec>
      {isAdmin&&(<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}><div><span className="label-sm">OA ID</span><input className="inp" value={zaloCfg.oa_id} onChange={e=>setZaloCfg(p=>({...p,oa_id:e.target.value}))}/></div><div><span className="label-sm">APP ID</span><input className="inp" value={zaloCfg.app_id} onChange={e=>setZaloCfg(p=>({...p,app_id:e.target.value}))}/></div></div><div style={{display:"flex",gap:8,marginBottom:10}}><button className="btn btn-z" onClick={()=>{if(zaloCfg.oa_id)setZaloOn(true)}}><I d={ic.play} s={13}/> Kết nối</button>{zaloOn&&<button className="btn btn-d" onClick={()=>setZaloOn(false)}><I d={ic.x} s={13}/> Ngắt</button>}</div></>)}
      {!isAdmin&&!zaloOn&&<div style={{fontSize:12,color:T.textSec}}>Chỉ Admin mới có thể cấu hình Zalo OA.</div>}
    </div>
    <div className="card" style={{marginBottom:14}}><Sec icon={ic.gift} title="ZNS Templates"/><div className="tw"><table><thead><tr>{["Template","Loại","Trạng thái","Chọn"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{data.znsTemplates.map(t=>(<tr key={t.id} className="rh"><td style={{fontWeight:600}}>{t.name}</td><td><span className="badge" style={{background:t.type==='transaction'?`${T.info}18`:`${T.warning}18`,color:t.type==='transaction'?T.info:T.warning}}>{t.type}</span></td><td><span className="badge" style={{background:t.status==='approved'?`${T.success}18`:`${T.warning}18`,color:t.status==='approved'?T.success:T.warning}}>{t.status==='approved'?'Đã duyệt':'Chờ'}</span></td><td><button className="btn btn-z btn-sm" disabled={t.status!=='approved'} onClick={()=>setZaloTpl(t)}><I d={ic.send} s={11}/></button></td></tr>))}</tbody></table></div></div>
    <div className="card" style={{border:`1px solid ${T.zaloGreen}30`}}>
      <Sec icon={ic.send} title="Gửi ZNS"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}><div style={{padding:12,borderRadius:8,background:T.surface}}><span className="label-sm">Template</span><div style={{fontSize:13,fontWeight:600,color:zaloTpl?T.text:T.textMuted,marginTop:4}}>{zaloTpl?.name||"Chưa chọn"}</div></div><div style={{padding:12,borderRadius:8,background:T.surface}}><span className="label-sm">Người nhận</span><div className="counter" style={{fontSize:20,marginTop:4}}>{selCamp.length||data.customers.filter(c=>c.has_zalo&&c.zalo_oa_follow).length}</div></div></div>
      {zaloMsg&&<div style={{padding:"8px 12px",borderRadius:8,background:`${T.success}15`,color:T.success,fontSize:12,marginBottom:10,fontWeight:600}}>{zaloMsg}</div>}
      {zaloSending&&<div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textSec,marginBottom:3}}><span>Đang gửi...</span><span>{zaloSent}/{selCamp.length||1}</span></div><div style={{height:5,borderRadius:3,background:T.cardBorder,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:T.zaloGreen,width:`${(zaloSent/(selCamp.length||1))*100}%`,transition:"width .1s"}}/></div></div>}
      <div style={{display:"flex",gap:8}}><button className="btn btn-z" disabled={!zaloOn||!zaloTpl||zaloSending} onClick={sendZns}><I d={ic.send} s={13}/> Gửi ZNS</button><button className="btn btn-g" onClick={()=>setTab("segment")}><I d={ic.filter} s={12}/> Chọn tệp</button></div>
    </div>
  </div>);

  // ── PREDICTIONS (Enhanced with External Signals) ──
  const runPred=async()=>{setPredLoading(true);await new Promise(r=>setTimeout(r,1500));setPredDone(true);setPredLoading(false);addLog("predict","predictions","Chạy dự báo "+predPeriodObj.label+" — DT dự kiến "+fv(predTotalRev*1e9));};

  const rPredictions=()=>(<div className="fu">
    {/* Header with period selector */}
    <div className="card" style={{marginBottom:14,background:"linear-gradient(135deg,"+T.card+" 0%,#1a1528 100%)",border:"1px solid "+T.accent+"30"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:10,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center"}}><I d={ic.zap} s={18} c={T.bg}/></div>
          <div>
            <div style={{fontSize:17,fontWeight:800,fontFamily:"'Libre Baskerville',serif"}}>AI Predictions</div>
            <div style={{fontSize:11,color:T.textSec}}>Dự báo đa nguồn: Data nội bộ + Thị trường + Thời tiết + Sự kiện</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:AI_MODELS.find(m=>m.id===aiModel)?.color||T.purple}}/>
          <span style={{fontSize:10,color:T.textSec}}>{AI_MODELS.find(m=>m.id===aiModel)?.name}</span>
        </div>
      </div>

      {/* Period selector */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <I d={ic.calendar} s={14} c={T.accent}/>
        <span style={{fontSize:12,fontWeight:700,color:T.text}}>Giai đoạn dự báo:</span>
        <div style={{display:"flex",gap:4}}>
          {PRED_PERIODS.map(p=>(<button key={p.id} className={"chip "+(predPeriod===p.id?"on":"")} style={predPeriod===p.id?{borderColor:T.accent,color:T.accent,background:T.accent+"20"}:{}} onClick={()=>{setPredPeriod(p.id);setPredDone(false)}}>{p.label}</button>))}
        </div>
        <button className="btn btn-ai" style={{marginLeft:"auto",padding:"7px 18px"}} onClick={runPred} disabled={predLoading}>
          {predLoading?(<><div className="spin" style={{width:13,height:13}}/> Đang phân tích...</>):(<><I d={ic.sparkle} s={13}/> {predDone?"Cập nhật":"Chạy"} dự báo</>)}
        </button>
      </div>

      {/* Data sources badges */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[{l:"Data nội bộ",c:T.accent,ic2:ic.db},{l:"Sự kiện & Lễ tết",c:T.warning,ic2:ic.gift},{l:"Thời tiết",c:T.info,ic2:ic.alert},{l:"Tin thị trường",c:T.success,ic2:ic.trend},{l:"Đối thủ",c:T.danger,ic2:ic.target}].map((s,i)=>(<span key={i} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,background:s.c+"12",border:"1px solid "+s.c+"25",fontSize:10,fontWeight:600,color:s.c}}><I d={s.ic2} s={9} c={s.c}/>{s.l}</span>))}
      </div>
    </div>

    {/* Loading */}
    {predLoading&&(<div className="card" style={{padding:30,textAlign:"center",marginBottom:14}}>
      <div className="spin" style={{width:28,height:28,margin:"0 auto 12px",borderWidth:3}}/>
      <div style={{fontSize:14,fontWeight:700,color:T.accent,marginBottom:4}}>AI đang tổng hợp đa nguồn dữ liệu...</div>
      <div style={{fontSize:11,color:T.textSec}}>Phân tích {fn(data.overview.total_customers)} KH + {EXT_SIGNALS.events.length} sự kiện + {EXT_SIGNALS.weather.length} dữ liệu thời tiết + {EXT_SIGNALS.market.length} tin thị trường</div>
    </div>)}

    {/* Results */}
    {predDone&&(<>
      {/* KPI Forecast */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[
          {l:"Doanh thu dự báo",v:fv(predTotalRev*1e9),c:T.success,s:"+"+(((predTotalRev/(predM*8.5))-1)*100).toFixed(1)+"% vs cùng kỳ",ic2:ic.dollar},
          {l:"Đơn hàng dự báo",v:fn(predTotalOrders),c:T.info,s:predM+" tháng tới",ic2:ic.cart},
          {l:"KH mới dự kiến",v:fn(predTotalNew),c:T.accent,s:"Avg "+fn(Math.round(predTotalNew/predM))+"/tháng",ic2:ic.users},
          {l:"Churn Risk",v:fn(predTotalChurn),c:T.danger,s:"Cần chăm sóc",ic2:ic.alert},
        ].map((k,i)=>(<div key={i} className="card fu" style={{padding:"14px 16px",border:"1px solid "+k.c+"20"}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}><I d={k.ic2} s={11} c={k.c}/><span style={{fontSize:9,fontWeight:700,color:k.c,textTransform:"uppercase",letterSpacing:".04em"}}>{k.l}</span></div>
          <div className="counter" style={{fontSize:22}}>{k.v}</div>
          <div style={{fontSize:10,color:k.c,marginTop:3,fontWeight:600}}>{k.s}</div>
        </div>))}
      </div>

      {/* Forecast Chart */}
      <div className="card" style={{marginBottom:14}}>
        <Sec icon={ic.trend} title={"Dự báo doanh thu "+predPeriodObj.label+" tới"}/>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={predForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder}/>
            <XAxis dataKey="month" stroke={T.textMuted} fontSize={11}/>
            <YAxis stroke={T.textMuted} fontSize={10} unit="B"/>
            <Tooltip contentStyle={{background:T.card,border:"1px solid "+T.cardBorder,borderRadius:8,fontSize:11}} formatter={(v,n)=>[typeof v==="number"?v.toFixed(1)+"B":v,n]}/>
            <Legend wrapperStyle={{fontSize:10}}/>
            <Area type="monotone" dataKey="prevRev" fill={T.textMuted+"15"} stroke={T.textMuted} strokeDasharray="4 4" strokeWidth={1} name="Cùng kỳ"/>
            <Area type="monotone" dataKey="rev" fill={T.accent+"20"} stroke={T.accent} strokeWidth={2} name="Dự báo DT"/>
            <Bar dataKey="newCust" fill={T.info+"50"} radius={[3,3,0,0]} name="KH mới" yAxisId="right"/>
            <YAxis yAxisId="right" orientation="right" stroke={T.textMuted} fontSize={10}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 3-column: Events | Weather | Market */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
        {/* Events & Holidays */}
        <div className="card" style={{padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}><I d={ic.gift} s={14} c={T.warning}/><span style={{fontSize:13,fontWeight:700}}>Sự kiện & Lễ tết</span><span className="badge" style={{background:T.warning+"18",color:T.warning,marginLeft:"auto",fontSize:9}}>{predEvents.length} sự kiện</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {predEvents.length===0&&<div style={{fontSize:11,color:T.textMuted,textAlign:"center",padding:10}}>Không có sự kiện trong giai đoạn này</div>}
            {predEvents.slice(0,6).map((e,i)=>{
              const impC=e.impact==="very_high"?T.danger:e.impact==="high"?T.warning:e.impact==="medium"?T.info:T.textMuted;
              return(<div key={i} style={{padding:"8px 10px",borderRadius:8,background:impC+"08",border:"1px solid "+impC+"18"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:700}}>{e.name}</span>
                  <span style={{fontSize:9,color:impC,fontWeight:700,textTransform:"uppercase"}}>{e.impact==="very_high"?"Rất cao":e.impact==="high"?"Cao":e.impact==="medium"?"TB":"Thấp"}</span>
                </div>
                <div style={{fontSize:10,color:T.textSec}}>{e.date}</div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{e.desc}</div>
              </div>);
            })}
          </div>
        </div>

        {/* Weather */}
        <div className="card" style={{padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}><I d={ic.alert} s={14} c={T.info}/><span style={{fontSize:13,fontWeight:700}}>Thời tiết dự báo</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {EXT_SIGNALS.weather.slice(0,predM).map((w,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,background:w.color+"08",border:"1px solid "+w.color+"15"}}>
              <div style={{width:34,textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:700,color:w.color}}>{w.period.split("/")[0]}</div>
                <div style={{fontSize:8,color:T.textMuted}}>{w.temp}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600}}>{w.condition}</div>
                <div style={{fontSize:10,color:T.textSec}}>{w.impact}</div>
              </div>
            </div>))}
          </div>
        </div>

        {/* Market News */}
        <div className="card" style={{padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}><I d={ic.trend} s={14} c={T.success}/><span style={{fontSize:13,fontWeight:700}}>Tin thị trường</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {EXT_SIGNALS.market.map((m,i)=>(<div key={i} style={{padding:"8px 10px",borderRadius:8,border:"1px solid "+(m.impact==="positive"?T.success:T.danger)+"18",background:(m.impact==="positive"?T.success:T.danger)+"05"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                <I d={m.impact==="positive"?ic.trend:ic.alert} s={11} c={m.impact==="positive"?T.success:T.danger}/>
                <span style={{fontSize:11,fontWeight:700}}>{m.title}</span>
              </div>
              <div style={{fontSize:10,color:T.textMuted}}>{m.source} · {m.date}</div>
              <div style={{fontSize:10,color:T.textSec,marginTop:2}}>{m.desc}</div>
            </div>))}
          </div>
        </div>
      </div>

      {/* AI Insights - combined analysis */}
      <div className="card" style={{border:"1px solid "+T.purple+"25"}}>
        <Sec icon={ic.sparkle} title="AI Insights (Tổng hợp đa nguồn)"/>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {c:T.danger,t:fn(predTotalChurn)+" KH churn risk trong "+predPeriodObj.label,d:"Gửi ZNS win-back + offer cá nhân hoá. Ưu tiên KH At Risk có LTV > 15M.",ic2:ic.alert},
            {c:T.success,t:"Doanh thu dự báo tăng "+((predTotalRev/(predM*8.5)-1)*100).toFixed(0)+"% nhờ mùa lễ hội",d:predEvents.length>0?"Sự kiện: "+predEvents.slice(0,2).map(e=>e.name).join(", ")+". Tăng stock thực phẩm & quà tặng.":"Không có sự kiện lớn, tập trung retention.",ic2:ic.trend},
            {c:T.info,t:"Thời tiết ảnh hưởng danh mục: "+EXT_SIGNALS.weather.slice(0,Math.min(predM,2)).map(w=>w.impact).join("; "),d:"Điều chỉnh inventory theo dự báo thời tiết. Đồ uống & đông lạnh peak mùa nóng.",ic2:ic.alert},
            {c:T.warning,t:"Đối thủ mở rộng — cần tăng loyalty retention",d:"CPI tăng 3.2% + đối thủ mới = áp lực. Đề xuất: Flash sale, tăng rewards points x2.",ic2:ic.target},
            {c:T.purple,t:"Xu hướng healthy food +35% — cơ hội mở rộng",d:"Cross-sell organic/healthy cho KH VIP. Thêm danh mục mới trong 90 ngày tới.",ic2:ic.package},
          ].map((ins,i)=>(<div key={i} style={{display:"flex",gap:12,padding:"10px 14px",borderRadius:10,background:ins.c+"06",border:"1px solid "+ins.c+"15"}}>
            <div style={{width:32,height:32,borderRadius:8,background:ins.c+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I d={ins.ic2} s={14} c={ins.c}/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2}}>{ins.t}</div>
              <div style={{fontSize:11,color:T.textSec,lineHeight:1.5}}>{ins.d}</div>
            </div>
          </div>))}
        </div>
      </div>
    </>)}

    {/* Initial state - before running */}
    {!predDone&&!predLoading&&(<div className="card" style={{padding:35,textAlign:"center"}}>
      <div style={{width:60,height:60,borderRadius:14,background:T.accent+"12",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><I d={ic.zap} s={28} c={T.accent}/></div>
      <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:6}}>Chọn giai đoạn và chạy dự báo</div>
      <div style={{fontSize:12,color:T.textSec,maxWidth:480,margin:"0 auto",lineHeight:1.7,marginBottom:16}}>AI sẽ tổng hợp dữ liệu nội bộ ({fn(data.overview.total_customers)} KH, {fn(data.revenueByMonth.reduce((s,r)=>s+r.orders,0))} đơn) + {EXT_SIGNALS.events.length} sự kiện lễ tết + dự báo thời tiết + {EXT_SIGNALS.market.length} tin thị trường để đưa ra dự đoán chính xác.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,maxWidth:520,margin:"0 auto"}}>
        {[{ic2:ic.db,l:"12,847 KH",s:"Data nội bộ",c:T.accent},{ic2:ic.gift,l:"8 sự kiện",s:"Lễ tết & xã hội",c:T.warning},{ic2:ic.alert,l:"7 tháng",s:"Dự báo thời tiết",c:T.info},{ic2:ic.trend,l:"5 tin tức",s:"Thị trường",c:T.success}].map((d,i)=>(<div key={i} style={{padding:10,borderRadius:10,background:d.c+"08",border:"1px solid "+d.c+"18",textAlign:"center"}}>
          <I d={d.ic2} s={16} c={d.c}/>
          <div style={{fontSize:12,fontWeight:700,marginTop:4}}>{d.l}</div>
          <div style={{fontSize:9,color:T.textSec}}>{d.s}</div>
        </div>))}
      </div>
    </div>)}
  </div>);

  // ── AI CHAT ──
  const rAiChat=()=>(<div className="fu" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 180px)"}}>
    {/* Model selector */}
    <div className="card" style={{padding:12,marginBottom:10,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <I d={ic.brain} s={16} c={T.purple}/>
      <span style={{fontSize:12,fontWeight:700,color:T.text}}>AI Model:</span>
      {AI_MODELS.map(m=>(<button key={m.id} className={`chip ${aiModel===m.id?'on':''}`} style={aiModel===m.id?{borderColor:m.color,color:m.color,background:`${m.color}20`}:{}} onClick={()=>setAiModel(m.id)}><span style={{width:6,height:6,borderRadius:"50%",background:m.color,display:"inline-block"}}/>{m.name}</button>))}
      {isAdmin&&<span style={{fontSize:10,color:T.textMuted,marginLeft:"auto"}}>API Key: Cài đặt → AI Config</span>}
    </div>
    {/* Chat area */}
    <div className="card" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",padding:0}}>
      <div style={{flex:1,overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
        {chatMsgs.map((m,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}><div className={`chat-bubble ${m.role==="user"?"chat-user":"chat-ai"}`}>{m.role==="ai"&&<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6,fontSize:10,fontWeight:700,color:T.purple}}><I d={ic.sparkle} s={11} c={T.purple}/>{AI_MODELS.find(x=>x.id===aiModel)?.name||"AI"}</div>}{m.text}</div></div>))}
        {chatLoading&&<div style={{alignSelf:"flex-start"}}><div className="chat-bubble chat-ai"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></div></div>}
        <div ref={chatEndRef}/>
      </div>
      <div style={{padding:12,borderTop:`1px solid ${T.cardBorder}`,display:"flex",gap:8,background:T.surface}}>
        <input className="inp" style={{flex:1}} placeholder="Hỏi AI: phân tích VIP, đề xuất chiến dịch, cảnh báo churn..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAiMsg()}}}/>
        <button className="btn btn-ai" onClick={sendAiMsg} disabled={chatLoading||!chatInput.trim()}><I d={ic.send} s={14}/></button>
      </div>
      {/* Quick prompts */}
      <div style={{padding:"8px 12px",display:"flex",gap:6,flexWrap:"wrap",borderTop:`1px solid ${T.cardBorder}20`}}>
        {["Phân tích KH VIP","Đề xuất chiến dịch win-back","Cảnh báo churn","Phân tích doanh thu","Xem log hoạt động","Ai gửi ZNS gần đây?","Log export"].map(q=>(<button key={q} className="chip" style={{fontSize:10,padding:"3px 8px"}} onClick={()=>{setChatInput(q);}}>{q}</button>))}
      </div>
    </div>
  </div>);

  // ── AI REPORT ──
  const genReport = async () => {
    if (!rptInput.trim() || rptLoading) return;
    const prompt = rptInput.trim();
    setRptInput("");
    setRptLoading(true);

    // Simulate AI analyzing data and generating report
    await new Promise(r => setTimeout(r, 1800));

    // Build report based on prompt keywords
    const d = data;
    const now = "2025-06-01";
    const totalRev = d.revenueByMonth.reduce((s,r) => s + r.revenue, 0);
    const totalOrders = d.revenueByMonth.reduce((s,r) => s + r.orders, 0);
    const topCats = d.catPerf.slice(0, 3);
    const topSt = d.topStores.slice(0, 3);
    const atRisk = d.customers.filter(c => c.segment === "At Risk" || c.segment === "Hibernating");
    const vip = d.customers.filter(c => c.loyalty_tier === "Platinum");
    const lp = prompt.toLowerCase();

    let title = "";
    let sections = [];
    let kpis = [];
    let tableData = null;
    let chartData = null;
    let recommendations = [];

    if (lp.includes("doanh thu") || lp.includes("revenue") || lp.includes("sales")) {
      title = "Báo cáo Doanh thu & Bán hàng";
      kpis = [
        { l: "Tổng Doanh thu", v: fv(totalRev * 1e6), c: T.accent, chg: "+12.4%" },
        { l: "Tổng Đơn hàng", v: fn(totalOrders), c: T.info, chg: "+8.7%" },
        { l: "AOV", v: fv(d.overview.avg_order_value), c: T.purple, chg: "+3.2%" },
        { l: "KH Active", v: fn(d.overview.active_customers), c: T.success, chg: "+14%" },
      ];
      sections = [
        { title: "Xu hướng doanh thu", content: "Doanh thu 12 tháng gần nhất đạt " + fv(totalRev * 1e6) + " VNĐ với tổng " + fn(totalOrders) + " đơn hàng. Tháng cao nhất là T11 (mùa lễ hội) với doanh thu tăng vượt trội. Xu hướng tăng trưởng ổn định YoY +12.4%." },
        { title: "Top danh mục", content: topCats.map(c => c.name + " (" + fv(c.revenue) + ", " + fn(c.orders) + " đơn)").join(" → ") + ". Thực phẩm dẫn đầu chiếm 32% tổng doanh thu." },
        { title: "Top cửa hàng", content: topSt.map(s => s.store_name + " (" + fv(s.revenue) + ")").join(" → ") + ". CH Nguyễn Huệ chiếm 26% tổng doanh thu hệ thống." },
      ];
      chartData = d.revenueByMonth.slice(-6);
      recommendations = ["Tăng ngân sách marketing T10-T12 (mùa cao điểm)", "Focus upsell AOV tại CH Nguyễn Huệ", "Mở rộng danh mục Đông lạnh (margin cao, đang tăng)"];
    } else if (lp.includes("khách hàng") || lp.includes("customer") || lp.includes("kh") || lp.includes("loyalty")) {
      title = "Báo cáo Phân tích Khách hàng";
      kpis = [
        { l: "Tổng KH", v: fn(d.overview.total_customers), c: T.accent, chg: "+14.7%" },
        { l: "KH Mới / tháng", v: fn(d.overview.new_this_month), c: T.success, chg: "+18.2%" },
        { l: "VIP (Platinum)", v: String(vip.length), c: T.purple, chg: "" },
        { l: "At Risk + Hibernating", v: String(atRisk.length), c: T.danger, chg: "Cần xử lý" },
      ];
      sections = [
        { title: "Phân khúc Loyalty", content: "Platinum: " + vip.length + " KH (top spender), Gold: " + d.customers.filter(c=>c.loyalty_tier==="Gold").length + " KH, Silver: " + d.customers.filter(c=>c.loyalty_tier==="Silver").length + " KH. Platinum chiếm 25% KH nhưng đóng góp 58% doanh thu." },
        { title: "RFM Segments", content: d.rfm.map(r => r.segment + ": " + fn(r.count) + " KH (R=" + r.avg_recency + "d, F=" + r.avg_frequency + "/m, M=" + fv(r.avg_monetary) + ")").join(". ") },
        { title: "Rủi ro Churn", content: atRisk.length + " KH đang At Risk / Hibernating. Cần chiến dịch win-back ngay. KH Hibernating trung bình 200 ngày không mua hàng." },
      ];
      tableData = { headers: ["MaTheKHTT", "Tên", "Tier", "Segment", "Tổng chi", "Đơn", "Mua cuối"], rows: d.customers.map(c => [c.MaTheKHTT, c.name, c.loyalty_tier, c.segment, fv(c.total_spent), c.total_orders, c.last_purchase]) };
      recommendations = ["Gửi ZNS win-back cho " + atRisk.length + " KH At Risk", "Upsell Platinum → brand ambassador program", "Nurture Silver → Gold qua promotion 3 tháng"];
    } else if (lp.includes("churn") || lp.includes("at risk") || lp.includes("win-back") || lp.includes("rủi ro")) {
      title = "Báo cáo Churn Risk & Win-back";
      kpis = [
        { l: "KH At Risk", v: String(d.rfm.find(r=>r.segment==="At Risk")?.count||0), c: T.danger, chg: "120 ngày TB" },
        { l: "KH Hibernating", v: String(d.rfm.find(r=>r.segment==="Hibernating")?.count||0), c: T.textMuted, chg: "200 ngày TB" },
        { l: "Churn Rate", v: "18.5%", c: T.danger, chg: "vs 15% ngành" },
        { l: "Revenue at Risk", v: "5.8B", c: T.warning, chg: "Mất nếu churn" },
      ];
      sections = [
        { title: "Phân tích nhóm rủi ro", content: "At Risk: " + fn(d.rfm.find(r=>r.segment==="At Risk")?.count) + " KH, recency TB 120 ngày, từng mua 5 lần/tháng với AOV 18M. Hibernating: " + fn(d.rfm.find(r=>r.segment==="Hibernating")?.count) + " KH, recency TB 200 ngày." },
        { title: "Nguyên nhân churn phổ biến", content: "1) Giá không cạnh tranh (35%), 2) Thiếu khuyến mãi phù hợp (28%), 3) Trải nghiệm CH kém (20%), 4) Chuyển sang đối thủ (17%)." },
        { title: "Hiệu quả win-back trước đó", content: "Chiến dịch win-back Q3/2024: gửi 1,500 ZNS, tỷ lệ quay lại 22%. AOV của KH quay lại tăng 15% so với trước khi churn." },
      ];
      tableData = { headers: ["MaTheKHTT", "Tên", "Segment", "Ngày cuối", "Tổng chi", "Tần suất cũ"], rows: atRisk.map(c => [c.MaTheKHTT, c.name, c.segment, c.last_purchase, fv(c.total_spent), c.frequency_month + "/tháng"]) };
      recommendations = ["Gửi ZNS offer 20% cho At Risk ngay tuần này", "Personal call cho top 50 KH At Risk (chi tiêu > 15M)", "Tạo loyalty event riêng cho nhóm Hibernating", "A/B test: voucher vs cashback cho win-back"];
    } else {
      title = "Báo cáo Tổng hợp: " + prompt;
      kpis = [
        { l: "Tổng KH", v: fn(d.overview.total_customers), c: T.accent, chg: "+14.7%" },
        { l: "Doanh thu", v: fv(totalRev * 1e6), c: T.success, chg: "+12.4%" },
        { l: "Đơn hàng", v: fn(totalOrders), c: T.info, chg: "+8.7%" },
        { l: "AOV", v: fv(d.overview.avg_order_value), c: T.purple, chg: "+3.2%" },
      ];
      sections = [
        { title: "Tổng quan hệ thống", content: "MENAS DX hiện quản lý " + fn(d.overview.total_customers) + " KH, trong đó " + fn(d.overview.active_customers) + " active. Doanh thu 12 tháng: " + fv(totalRev * 1e6) + ". Top segment: Champions (" + fn(d.rfm[0].count) + " KH)." },
        { title: "Điểm nổi bật", content: "KH mới tháng này: " + fn(d.overview.new_this_month) + " (+18% vs tháng trước). 5 cửa hàng đang hoạt động. 5 danh mục sản phẩm chính. Zalo OA kết nối " + d.customers.filter(c=>c.has_zalo).length + "/" + d.customers.length + " KH." },
      ];
      recommendations = ["Tập trung nurture KH mới → Gold trong 90 ngày", "Tăng Zalo OA coverage lên 80%+", "Triển khai AI Predict để dự báo churn sớm"];
    }

    const report = { id: Date.now(), prompt, title, kpis, sections, chartData, tableData, recommendations, createdAt: new Date().toLocaleString("vi-VN"), model: AI_MODELS.find(m => m.id === aiModel)?.name || "AI" };
    setRptHistory(prev => [report, ...prev]);
    setRptLoading(false);
    addLog("report","report","Tạo báo cáo: "+title);
  };

  const rReport = () => (<div className="fu">
    {/* Input bar */}
    <div className="card" style={{marginBottom:14,border:"1px solid "+T.accent+"30",background:"linear-gradient(135deg,"+T.card+" 0%,#1a1528 100%)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:38,height:38,borderRadius:10,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center"}}><I d={ic.fileText} s={17} c={T.bg}/></div>
        <div>
          <div style={{fontSize:15,fontWeight:800,fontFamily:"'Libre Baskerville',serif"}}>AI Report Generator</div>
          <div style={{fontSize:11,color:T.textSec}}>Nhập yêu cầu bằng ngôn ngữ tự nhiên → AI phân tích data → Xuất báo cáo</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:AI_MODELS.find(m=>m.id===aiModel)?.color||T.purple}}/>
          <span style={{fontSize:10,color:T.textSec}}>{AI_MODELS.find(m=>m.id===aiModel)?.name}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <input className="inp" style={{flex:1,fontSize:13,padding:"10px 14px"}} placeholder='Ví dụ: "Báo cáo doanh thu Q2", "Phân tích KH VIP", "Churn risk report"...' value={rptInput} onChange={e=>setRptInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();genReport()}}}/>
        <button className="btn btn-ai" style={{padding:"8px 18px"}} onClick={genReport} disabled={rptLoading||!rptInput.trim()}>
          {rptLoading ? (<><div className="spin" style={{width:14,height:14}}/> Đang phân tích...</>) : (<><I d={ic.sparkle} s={14}/> Tạo báo cáo</>)}
        </button>
      </div>
      <div style={{display:"flex",gap:5,marginTop:10,flexWrap:"wrap"}}>
        {["Báo cáo doanh thu tháng","Phân tích khách hàng VIP","Churn risk & win-back","Hiệu suất cửa hàng","Tổng hợp KPI tháng"].map(q=>(<button key={q} className="chip" style={{fontSize:10,padding:"3px 9px"}} onClick={()=>setRptInput(q)}>{q}</button>))}
      </div>
    </div>

    {/* Loading state */}
    {rptLoading && (<div className="card fu" style={{padding:30,textAlign:"center",marginBottom:14}}>
      <div className="spin" style={{width:28,height:28,margin:"0 auto 12px",borderWidth:3}}/>
      <div style={{fontSize:14,fontWeight:700,color:T.accent,marginBottom:4}}>AI đang phân tích dữ liệu...</div>
      <div style={{fontSize:12,color:T.textSec}}>Đang xử lý {fn(data.overview.total_customers)} KH, {fn(data.revenueByMonth.reduce((s,r)=>s+r.orders,0))} đơn hàng</div>
    </div>)}

    {/* Report history */}
    {rptHistory.map(rpt => (<div key={rpt.id} className="card fu" style={{marginBottom:16,overflow:"hidden"}}>
      {/* Report header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:17,fontWeight:800,fontFamily:"'Libre Baskerville',serif",color:T.text}}>{rpt.title}</div>
          <div style={{display:"flex",gap:8,alignItems:"center",marginTop:4}}>
            <span style={{fontSize:10,color:T.textMuted}}>{rpt.createdAt}</span>
            <span style={{width:3,height:3,borderRadius:"50%",background:T.textMuted}}/>
            <span style={{fontSize:10,color:T.purple}}>{rpt.model}</span>
            <span style={{width:3,height:3,borderRadius:"50%",background:T.textMuted}}/>
            <span style={{fontSize:10,color:T.textSec,fontStyle:"italic"}}>Prompt: "{rpt.prompt}"</span>
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <ExportBtn canExport={canExport} data={rpt.tableData?.rows?.map((r,i) => {const obj = {};rpt.tableData.headers.forEach((h,j)=>{obj[h]=r[j]});return obj}) || rpt.sections.map(s => ({Section:s.title,Content:s.content}))} filename={"report_"+rpt.id}/>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat("+rpt.kpis.length+",1fr)",gap:10,marginBottom:16}}>
        {rpt.kpis.map((k,i)=>(<div key={i} style={{padding:"12px 14px",borderRadius:10,background:k.c+"08",border:"1px solid "+k.c+"20"}}>
          <div style={{fontSize:9,fontWeight:700,color:k.c,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4}}>{k.l}</div>
          <div className="counter" style={{fontSize:20}}>{k.v}</div>
          {k.chg&&<div style={{fontSize:10,color:k.chg.startsWith("+")?T.success:k.chg.startsWith("-")?T.danger:T.textSec,fontWeight:600,marginTop:2}}>{k.chg}</div>}
        </div>))}
      </div>

      {/* Chart (if available) */}
      {rpt.chartData && (<div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><I d={ic.trend} s={13} c={T.accent}/> Biểu đồ xu hướng</div>
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={rpt.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder}/>
            <XAxis dataKey="month" stroke={T.textMuted} fontSize={11}/>
            <YAxis stroke={T.textMuted} fontSize={10}/>
            <Tooltip contentStyle={{background:T.card,border:"1px solid "+T.cardBorder,borderRadius:8,fontSize:11}}/>
            <Area type="monotone" dataKey="revenue" fill={T.accent+"25"} stroke={T.accent} strokeWidth={2} name="Doanh thu"/>
            <Bar dataKey="orders" fill={T.info+"60"} radius={[3,3,0,0]} name="Đơn hàng"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>)}

      {/* Analysis sections */}
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
        {rpt.sections.map((s,i)=>(<div key={i} style={{padding:"12px 16px",borderRadius:10,background:T.surfaceAlt,border:"1px solid "+T.cardBorder}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{width:20,height:20,borderRadius:5,background:CL[i]+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:CL[i]}}>{i+1}</span><span style={{fontSize:12,fontWeight:700}}>{s.title}</span></div>
          <div style={{fontSize:12,color:T.textSec,lineHeight:1.7}}>{s.content}</div>
        </div>))}
      </div>

      {/* Data table (if available) */}
      {rpt.tableData && (<div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><I d={ic.clipboard} s={13} c={T.info}/> Dữ liệu chi tiết</div>
        <div className="tw"><table><thead><tr>{rpt.tableData.headers.map(h=>(<th key={h}>{h}</th>))}</tr></thead><tbody>
          {rpt.tableData.rows.map((r,i)=>(<tr key={i} className="rh">{r.map((cell,j)=>(<td key={j} style={j===0?{color:T.accent,fontWeight:600}:j===r.length-1?{fontSize:11,color:T.textSec}:{}}>{cell}</td>))}</tr>))}
        </tbody></table></div>
      </div>)}

      {/* Recommendations */}
      {rpt.recommendations.length > 0 && (<div style={{padding:"14px 18px",borderRadius:10,background:"linear-gradient(135deg,"+T.success+"08 0%,"+T.card+" 100%)",border:"1px solid "+T.success+"20"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><I d={ic.zap} s={13} c={T.success}/><span style={{fontSize:12,fontWeight:700,color:T.success}}>Đề xuất hành động</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {rpt.recommendations.map((r,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{width:18,height:18,borderRadius:4,background:T.success+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:T.success,flexShrink:0,marginTop:1}}>{i+1}</span>
            <span style={{fontSize:12,color:T.text,lineHeight:1.5}}>{r}</span>
          </div>))}
        </div>
      </div>)}
    </div>))}

    {/* Empty state */}
    {rptHistory.length === 0 && !rptLoading && (<div className="card" style={{padding:40,textAlign:"center"}}>
      <div style={{width:56,height:56,borderRadius:14,background:T.accent+"12",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><I d={ic.fileText} s={24} c={T.accent}/></div>
      <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:6}}>Chưa có báo cáo nào</div>
      <div style={{fontSize:12,color:T.textSec,maxWidth:400,margin:"0 auto",lineHeight:1.6}}>Nhập yêu cầu ở trên để AI phân tích dữ liệu KH, doanh thu, RFM và tạo báo cáo tự động với biểu đồ, bảng số liệu và đề xuất hành động.</div>
    </div>)}
  </div>);

  // ── ACTIVITY LOG ──
  const logUniqueUsers=[...new Set(activityLog.map(l=>l.user))];
  const logUniqueActions=[...new Set(activityLog.map(l=>l.action))];
  const logUniqueModules=[...new Set(activityLog.map(l=>l.module))];
  const filteredLog=activityLog.filter(l=>{
    if(logSearch&&!l.detail.toLowerCase().includes(logSearch.toLowerCase())&&!l.user.toLowerCase().includes(logSearch.toLowerCase())&&!l.action.toLowerCase().includes(logSearch.toLowerCase()))return false;
    if(logActionF!=="all"&&l.action!==logActionF)return false;
    if(logUserF!=="all"&&l.user!==logUserF)return false;
    if(logModuleF!=="all"&&l.module!==logModuleF)return false;
    if(logDateFrom&&l.ts<logDateFrom)return false;
    if(logDateTo&&l.ts.slice(0,10)>logDateTo)return false;
    return true;
  });
  const logStats={};activityLog.forEach(l=>{logStats[l.action]=(logStats[l.action]||0)+1;});
  const logUserStats={};activityLog.forEach(l=>{logUserStats[l.user]=(logUserStats[l.user]||0)+1;});

  const ACTION_LABELS={login:"Đăng nhập",view:"Xem trang",filter:"Lọc KH",send_zns:"Gửi ZNS",ai_chat:"AI Chat",report:"Tạo báo cáo",predict:"Dự báo AI",export:"Export",config:"Cấu hình",user_mgmt:"Quản lý user"};
  const ACTION_COLORS={login:T.info,view:T.textSec,filter:T.warning,send_zns:"#00b0ff",ai_chat:T.purple,report:T.accent,predict:T.success,export:T.teal,config:T.danger,user_mgmt:T.pink};

  const rActivityLog=()=>(<div className="fu">
    {/* Header */}
    <div className="card" style={{marginBottom:14,background:"linear-gradient(135deg,"+T.card+" 0%,#1a1825 100%)",border:"1px solid "+T.purple+"25"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <div style={{width:40,height:40,borderRadius:10,background:T.purple+"20",display:"flex",alignItems:"center",justifyContent:"center"}}><I d={ic.clipboard} s={18} c={T.purple}/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:800,fontFamily:"'Libre Baskerville',serif"}}>Activity Log</div>
          <div style={{fontSize:11,color:T.textSec}}>Lịch sử tương tác hệ thống — {activityLog.length} records • Truy vấn qua AI Chat</div>
        </div>
        <ExportBtn canExport={canExport} data={filteredLog.map(l=>({ID:l.id,Timestamp:l.ts,User:l.user,Action:l.action,Module:l.module,Detail:l.detail,IP:l.ip}))} filename={"activity_log_"+filteredLog.length}/>
      </div>

      {/* Stats cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:14}}>
        {[
          {l:"Tổng log",v:activityLog.length,c:T.purple},
          {l:"Users",v:logUniqueUsers.length,c:T.info},
          {l:"Đăng nhập",v:logStats.login||0,c:T.success},
          {l:"Gửi ZNS",v:logStats.send_zns||0,c:"#00b0ff"},
          {l:"AI Chat",v:logStats.ai_chat||0,c:T.accent},
          {l:"Hôm nay",v:activityLog.filter(l=>l.ts.startsWith(new Date().toISOString().slice(0,10))).length,c:T.warning},
        ].map((s,i)=>(<div key={i} style={{padding:"8px 10px",borderRadius:8,background:s.c+"08",border:"1px solid "+s.c+"18",textAlign:"center"}}>
          <div style={{fontSize:8,fontWeight:700,color:s.c,textTransform:"uppercase",letterSpacing:".04em"}}>{s.l}</div>
          <div className="counter" style={{fontSize:18}}>{s.v}</div>
        </div>))}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <I d={ic.search} s={13} c={T.textMuted} style={{position:"absolute",left:10,top:9}}/>
          <input className="inp" style={{paddingLeft:30,fontSize:11}} placeholder="Tìm kiếm log..." value={logSearch} onChange={e=>setLogSearch(e.target.value)}/>
        </div>
        <select className="inp" style={{maxWidth:140,fontSize:11}} value={logActionF} onChange={e=>setLogActionF(e.target.value)}>
          <option value="all">Tất cả actions</option>
          {logUniqueActions.map(a=>(<option key={a} value={a}>{ACTION_LABELS[a]||a}</option>))}
        </select>
        <select className="inp" style={{maxWidth:170,fontSize:11}} value={logUserF} onChange={e=>setLogUserF(e.target.value)}>
          <option value="all">Tất cả users</option>
          {logUniqueUsers.map(u=>(<option key={u} value={u}>{u}</option>))}
        </select>
        <select className="inp" style={{maxWidth:140,fontSize:11}} value={logModuleF} onChange={e=>setLogModuleF(e.target.value)}>
          <option value="all">Tất cả modules</option>
          {logUniqueModules.map(m=>(<option key={m} value={m}>{m}</option>))}
        </select>
        <input type="date" className="inp" style={{maxWidth:135,fontSize:11}} value={logDateFrom} onChange={e=>setLogDateFrom(e.target.value)}/>
        <span style={{color:T.textMuted,fontSize:10}}>→</span>
        <input type="date" className="inp" style={{maxWidth:135,fontSize:11}} value={logDateTo} onChange={e=>setLogDateTo(e.target.value)}/>
        {(logSearch||logActionF!=="all"||logUserF!=="all"||logModuleF!=="all"||logDateFrom||logDateTo)&&<button className="chip" style={{fontSize:10,color:T.danger,borderColor:T.danger+"40"}} onClick={()=>{setLogSearch("");setLogActionF("all");setLogUserF("all");setLogModuleF("all");setLogDateFrom("");setLogDateTo("")}}>Xoá lọc</button>}
        <span style={{marginLeft:"auto",fontSize:11,color:T.textMuted}}>{filteredLog.length} / {activityLog.length} records</span>
      </div>
    </div>

    {/* AI Chat quick access */}
    <div className="card" style={{marginBottom:14,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,border:"1px solid "+T.accent+"20"}}>
      <I d={ic.brain} s={15} c={T.accent}/>
      <span style={{fontSize:12,fontWeight:600}}>Truy vấn log bằng AI:</span>
      <div style={{display:"flex",gap:5,flex:1,flexWrap:"wrap"}}>
        {["Xem log hoạt động","Ai gửi ZNS gần đây?","Marketing làm gì?","Log export","Thống kê tương tác"].map(q=>(<button key={q} className="chip" style={{fontSize:10,padding:"2px 8px"}} onClick={()=>{setTab("ai_chat");setChatInput(q)}}>{q}</button>))}
      </div>
    </div>

    {/* Log Table */}
    <div className="card" style={{padding:0,overflow:"hidden"}}>
      <div className="tw" style={{maxHeight:"calc(100vh - 440px)",overflow:"auto"}}>
        <table>
          <thead><tr>
            <th style={{width:30}}>#</th>
            <th style={{width:145}}>Thời gian</th>
            <th style={{width:160}}>User</th>
            <th style={{width:100}}>Action</th>
            <th style={{width:100}}>Module</th>
            <th>Chi tiết</th>
            <th style={{width:110}}>IP</th>
          </tr></thead>
          <tbody>
            {filteredLog.length===0&&(<tr><td colSpan={7} style={{textAlign:"center",padding:30,color:T.textMuted}}>Không có log phù hợp</td></tr>)}
            {filteredLog.slice(0,100).map((l,i)=>{
              const ac=ACTION_COLORS[l.action]||T.textSec;
              return(<tr key={l.id} className="rh">
                <td style={{fontSize:10,color:T.textMuted}}>{l.id}</td>
                <td style={{fontSize:11,color:T.textSec,fontFamily:"monospace"}}>{l.ts}</td>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:T.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:T.accent}}>{l.user.charAt(0).toUpperCase()}</div>
                    <span style={{fontSize:11,fontWeight:500}}>{l.user}</span>
                  </div>
                </td>
                <td><span className="badge" style={{background:ac+"15",color:ac,fontSize:9,padding:"2px 8px"}}>{ACTION_LABELS[l.action]||l.action}</span></td>
                <td style={{fontSize:11,color:T.textSec}}>{l.module}</td>
                <td style={{fontSize:11,fontWeight:500,maxWidth:320,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.detail}</td>
                <td style={{fontSize:10,color:T.textMuted,fontFamily:"monospace"}}>{l.ip}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
      {filteredLog.length>100&&<div style={{padding:"8px 16px",borderTop:"1px solid "+T.cardBorder,fontSize:11,color:T.textMuted,textAlign:"center"}}>Hiển thị 100 / {filteredLog.length} records. Export để xem toàn bộ.</div>}
    </div>
  </div>);

  // ── DATAMAP ──
  const rDatamap=()=>(<div className="fu"><div className="card" style={{marginBottom:14}}><Sec icon={ic.layers} title="Data Architecture"/><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>{[{l:"POS",s:"iPOS·ToPOS·KiotViet",c:T.success,i:ic.cart},{l:"→",c:null},{l:"OMS",s:"Chuẩn hóa",c:T.info,i:ic.db},{l:"→",c:null},{l:"DX",s:"360°·AI",c:T.accent,i:ic.zap}].map((s,i)=>s.c?(<div key={i} style={{padding:10,borderRadius:10,background:T.bg,border:`1px solid ${s.c}30`,textAlign:"center"}}><div style={{width:28,height:28,borderRadius:8,background:`${s.c}18`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px"}}><I d={s.i} s={13} c={s.c}/></div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{s.l}</div><div style={{fontSize:9,color:T.textSec}}>{s.s}</div></div>):(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:T.textMuted}}>→</div>))}</div></div></div>);

  // ── SETTINGS ──
  const rSettings=()=>(<div className="fu" style={{maxWidth:700}}>
    <div className="card" style={{marginBottom:14}}><Sec icon={ic.db} title="PostgreSQL 17"><Dot on={dbOn}/></Sec><div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8,marginBottom:8}}><div><span className="label-sm">HOST</span><input className="inp" value={dbCfg.host} onChange={e=>setDbCfg(p=>({...p,host:e.target.value}))}/></div><div><span className="label-sm">PORT</span><input className="inp" value={dbCfg.port} onChange={e=>setDbCfg(p=>({...p,port:e.target.value}))}/></div></div><div style={{marginBottom:8}}><span className="label-sm">DATABASE</span><input className="inp" value={dbCfg.database} onChange={e=>setDbCfg(p=>({...p,database:e.target.value}))}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}><div><span className="label-sm">USER</span><input className="inp" value={dbCfg.user} onChange={e=>setDbCfg(p=>({...p,user:e.target.value}))}/></div><div><span className="label-sm">PASSWORD</span><input className="inp" type="password" value={dbCfg.password} onChange={e=>setDbCfg(p=>({...p,password:e.target.value}))}/></div></div><button className="btn btn-p" onClick={async()=>{setDbTest(true);await new Promise(r=>setTimeout(r,1000));if(dbCfg.host&&dbCfg.database)setDbOn(true);setDbTest(false)}} disabled={dbTest}>{dbTest?<><div className="spin" style={{width:14,height:14}}/> Testing...</>:<><I d={ic.play} s={13}/> Kết nối</>}</button></div>
    {/* AI Config */}
    <div className="card" style={{marginBottom:14,border:`1px solid ${T.purple}30`}}><Sec icon={ic.brain} title="AI Model Configuration"/><div style={{marginBottom:8}}><span className="label-sm">Default Model</span><select className="inp" value={aiModel} onChange={e=>setAiModel(e.target.value)}>{AI_MODELS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div><div style={{marginBottom:8}}><span className="label-sm">API Key ({AI_MODELS.find(m=>m.id===aiModel)?.provider})</span><input className="inp" type="password" placeholder="sk-..." value={aiApiKey} onChange={e=>setAiApiKey(e.target.value)}/></div><div style={{fontSize:11,color:T.textSec,lineHeight:1.5}}>Default: Claude (Anthropic). Hỗ trợ: OpenAI GPT-4o, Google Gemini, Local LLM (Ollama). AI Chat sẽ sử dụng model được chọn.</div></div>
  </div>);

  // ── USER MANAGEMENT (Admin only) ──
  const rUserMgmt=()=>(<div className="fu" style={{maxWidth:900}}>
    <div className="card" style={{marginBottom:14}}>
      <Sec icon={ic.shield} title="Quản lý người dùng & Phân quyền"><button className="btn btn-p btn-sm"><I d={ic.plus} s={12}/> Thêm user</button></Sec>
      <div className="tw"><table><thead><tr>{["","Tên","Email","Vai trò","Tabs","Export","Trạng thái",""].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
        {allUsers.map(u=>(<tr key={u.id} className="rh">
          <td><div style={{width:30,height:30,borderRadius:"50%",background:`${ROLES[u.role]?.color||T.info}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:ROLES[u.role]?.color||T.info}}>{u.avatar}</div></td>
          <td style={{fontWeight:600}}>{u.name}</td>
          <td style={{fontSize:12,color:T.textSec}}>{u.email}</td>
          <td><span className="badge" style={{background:`${ROLES[u.role]?.color}18`,color:ROLES[u.role]?.color}}>{ROLES[u.role]?.label}</span></td>
          <td style={{fontSize:10,color:T.textSec,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{u.permissions.tabs?.length} modules</td>
          <td>{u.permissions.canExport?<I d={ic.check} s={14} c={T.success}/>:<I d={ic.x} s={14} c={T.textMuted}/>}</td>
          <td><span className="badge" style={{background:u.status==='active'?`${T.success}18`:`${T.danger}18`,color:u.status==='active'?T.success:T.danger}}>{u.status}</span></td>
          <td><button className="btn btn-g btn-sm" onClick={()=>setEditingUser(u.id===editingUser?null:u.id)}><I d={ic.edit} s={11}/></button></td>
        </tr>))}
      </tbody></table></div>
    </div>

    {/* Edit Permissions Panel */}
    {editingUser && allUsers.find(x=>x.id===editingUser) && <PermEditor uid={editingUser} users={allUsers} setUsers={setAllUsers} close={()=>setEditingUser(null)}/>}
  </div>);

  // ═══════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════
  const renderTab=()=>{
    const ok = canView(tab);
    switch(tab){
      case"overview":return rOverview();
      case"customers":return ok?rCustomers():<NoAccess/>;
      case"segment":return ok?rSegment():<NoAccess/>;
      case"sales":return ok?rSales():<NoAccess/>;
      case"marketing":return ok?rMarketing():<NoAccess/>;
      case"zalo":return ok?rZalo():<NoAccess/>;
      case"predictions":return ok?rPredictions():<NoAccess/>;
      case"ai_chat":return ok?rAiChat():<NoAccess/>;
      case"report":return ok?rReport():<NoAccess/>;
      case"datamap":return ok?rDatamap():<NoAccess/>;
      case"activity_log":return isAdmin?rActivityLog():<NoAccess/>;
      case"settings":return isAdmin?rSettings():<NoAccess/>;
      case"user_mgmt":return isAdmin?rUserMgmt():<NoAccess/>;
      default:return rOverview();
    }
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      <style>{css}</style>
      {/* HEADER */}
      <header style={{padding:"10px 22px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:T.surface}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center"}}><I d={ic.layers} s={15} c={T.bg}/></div>
          <div><div style={{fontSize:16,fontWeight:800,fontFamily:"'Libre Baskerville',serif",letterSpacing:"-.02em"}}><span style={{color:T.accent}}>MENAS</span> <span style={{color:T.text}}>DX</span></div><div style={{fontSize:8,color:T.textMuted,letterSpacing:".1em",textTransform:"uppercase"}}>Customer 360° + AI + ZNS</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Dot on={dbOn}/>
          {zaloOn&&<span className="badge" style={{background:`${T.zaloGreen}18`,color:T.zaloGreen,fontSize:10}}><I d={ic.msg} s={9} c={T.zaloGreen}/> Zalo</span>}
          <div style={{width:1,height:20,background:T.cardBorder,margin:"0 4px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:8,background:T.surfaceAlt,cursor:"pointer"}} onClick={()=>setTab("user_mgmt")}>
            <div style={{width:24,height:24,borderRadius:"50%",background:`${ROLES[currentUser?.role]?.color||T.info}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:ROLES[currentUser?.role]?.color||T.info}}>{currentUser?.avatar}</div>
            <div><div style={{fontSize:11,fontWeight:600,color:T.text}}>{currentUser?.name}</div><div style={{fontSize:9,color:ROLES[currentUser?.role]?.color}}>{ROLES[currentUser?.role]?.label}</div></div>
          </div>
          <button className="btn btn-g btn-sm" onClick={()=>{setLoggedIn(false);setCurrentUserId(null)}} title="Đăng xuất"><I d={ic.logout} s={13}/></button>
        </div>
      </header>
      {/* TABS */}
      <nav style={{padding:"0 22px",borderBottom:`1px solid ${T.cardBorder}`,display:"flex",gap:1,overflowX:"auto",background:T.bg}}>
        {visibleTabs.map(t=>(<button key={t.id} className={`tab ${tab===t.id?'on':''}`} onClick={()=>{setTab(t.id);addLog("view",t.id,"Mở tab "+t.label)}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><I d={t.icon} s={13}/>{t.label}</span></button>))}
      </nav>
      {/* CONTENT */}
      <main style={{padding:"18px 22px",maxWidth:1380,margin:"0 auto"}} key={tab}>{renderTab()}</main>
      {/* FOOTER */}
      <footer style={{padding:"10px 22px",borderTop:`1px solid ${T.cardBorder}`,textAlign:"center",fontSize:10,color:T.textMuted}}>
        Menas DX © 2026 · {currentUser?.name} ({ROLES[currentUser?.role]?.label}) · {dbOn?`DB: ${dbCfg.host}`:"Demo"}{canExport?" · Export ✓":" · Export ✗"}
      </footer>
    </div>
  );
}
