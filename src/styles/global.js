import { T } from '../constants/index.js';

export const globalCSS = `
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
