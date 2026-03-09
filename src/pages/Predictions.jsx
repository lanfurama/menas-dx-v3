import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { T, ic, tooltipStyle } from '../constants/index.js';
import { PRED_PERIODS, AI_MODELS } from '../constants/ai.js';
import { Section } from '../components/Section.jsx';
import { Icon } from '../components/Icon.jsx';
import { usePredictions } from '../hooks/usePredictions.js';
import { transformPredictionsData } from '../utils/predictionsData.js';
import { formatValue, formatNumber } from '../utils/format.js';
import { useAuth } from '../hooks/useAuth.js';

const tt = tooltipStyle;

// External signals data (demo)
const EXT_SIGNALS = {
  events: [
    { id: "e1", name: "Tết Nguyên Đán 2026", date: "2026-01-17", type: "holiday", impact: "very_high", desc: "Nhu cầu thực phẩm, quà tặng tăng 180-250%. Peak mua sắm từ 15 ngày trước Tết." },
    { id: "e2", name: "Valentine's Day", date: "2026-02-14", type: "holiday", impact: "medium", desc: "Đồ uống, snack, quà tặng tăng 40-60%." },
    { id: "e3", name: "Giỗ Tổ Hùng Vương", date: "2026-04-12", type: "holiday", impact: "low", desc: "Nghỉ lễ 1 ngày, doanh thu giảm nhẹ 10-15%." },
    { id: "e4", name: "30/4 - 1/5", date: "2026-04-30", type: "holiday", impact: "medium", desc: "Nghỉ lễ dài, nhu cầu đông lạnh, đồ uống tăng 30%." },
    { id: "e5", name: "Back to School", date: "2026-09-01", type: "social", impact: "medium", desc: "Snack, đồ uống cho trẻ em tăng 25-35%." },
    { id: "e6", name: "Black Friday", date: "2025-11-28", type: "promo", impact: "high", desc: "Flash sale toàn hệ thống, doanh thu +120-150%." },
    { id: "e7", name: "Noel & Năm mới", date: "2025-12-25", type: "holiday", impact: "high", desc: "Quà tặng, thực phẩm nhập khẩu tăng 80-120%." },
    { id: "e8", name: "Rằm tháng 7", date: "2025-08-22", type: "holiday", impact: "low", desc: "Thực phẩm chay, trái cây tăng nhẹ." },
  ],
  weather: [
    { period: "T6/2025", condition: "Nắng nóng", temp: "34-38°C", impact: "Đồ uống +25%, đông lạnh +18%", color: "#ff9800" },
    { period: "T7/2025", condition: "Mưa nhiều", temp: "28-32°C", impact: "Delivery tăng 30%, outdoor giảm", color: "#2196f3" },
    { period: "T8/2025", condition: "Mưa bão", temp: "26-30°C", impact: "Stock-up behavior +40%", color: "#f44336" },
    { period: "T9/2025", condition: "Chuyển mùa", temp: "27-33°C", impact: "Gia vị, thực phẩm nấu +15%", color: "#4caf50" },
    { period: "T10/2025", condition: "Mát mẻ", temp: "25-30°C", impact: "Nhu cầu ổn định", color: "#9e9e9e" },
    { period: "T11/2025", condition: "Se lạnh", temp: "22-28°C", impact: "Đồ nóng, gia vị +20%", color: "#ff5722" },
    { period: "T12/2025", condition: "Lạnh", temp: "18-24°C", impact: "Mùa lễ hội + thời tiết = peak", color: "#e91e63" },
  ],
  market: [
    { title: "CPI thực phẩm tăng 3.2%", source: "GSO", date: "2025-05", impact: "negative", desc: "Giá nguyên liệu tăng, margin giảm. Cần điều chỉnh pricing." },
    { title: "Doanh số FMCG online +22%", source: "Nielsen", date: "2025-Q1", impact: "positive", desc: "Xu hướng mua online tiếp tục tăng. Tích hợp Zalo Mini App." },
    { title: "Đối thủ X mở 5 chi nhánh mới", source: "Market Intel", date: "2025-05", impact: "negative", desc: "Cạnh tranh gia tăng khu vực Q1, Q3." },
    { title: "Thu nhập khả dụng tăng 5.1%", source: "GSO", date: "2025-Q1", impact: "positive", desc: "Người tiêu dùng sẵn sàng chi tiêu hơn." },
    { title: "Trend healthy food +35%", source: "Euromonitor", date: "2025", impact: "positive", desc: "Mở rộng danh mục organic, healthy snack." },
  ],
};

export function Predictions({ dbOn, demoData, canExport, addLog }) {
  const auth = useAuth();
  const [predPeriod, setPredPeriod] = useState("1m");
  const [predLoading, setPredLoading] = useState(false);
  const [predDone, setPredDone] = useState(false);
  const [aiModel, setAiModel] = useState("claude");

  const predPeriodObj = PRED_PERIODS.find(p => p.id === predPeriod) || PRED_PERIODS[0];
  const predM = predPeriodObj.m;

  const { data: apiData, loading: apiLoading, error } = usePredictions(dbOn, { period: predPeriod });
  const { forecast, kpis, events, insights } = useMemo(
    () => transformPredictionsData(dbOn, apiData, error, demoData, predM, EXT_SIGNALS),
    [dbOn, apiData, error, demoData, predM]
  );

  const runPred = async () => {
    setPredLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setPredDone(true);
    setPredLoading(false);
    if (addLog) {
      const totalRev = forecast.reduce((s, f) => s + (f.rev || 0), 0);
      addLog("predict", "predictions", `Chạy dự báo ${predPeriodObj.label} — DT dự kiến ${formatValue(totalRev * 1e9)}`);
    }
  };

  const totalRev = forecast.reduce((s, f) => s + (f.rev || 0), 0);
  const totalOrders = forecast.reduce((s, f) => s + (f.orders || 0), 0);
  const totalNew = forecast.reduce((s, f) => s + (f.newCust || 0), 0);
  const totalChurn = forecast.reduce((s, f) => s + (f.churn || 0), 0);
  const predEvents = events.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + predM);
    return d >= now && d <= end;
  });

  const currentModel = AI_MODELS.find(m => m.id === aiModel) || AI_MODELS[0];
  const overviewData = demoData?.overview || { total_customers: 12847 };
  const totalOrdersHist = demoData?.revenueByMonth?.reduce((s, r) => s + (r.orders || 0), 0) || 0;

  return (
    <div className="fu">
      {/* Header with period selector */}
      <div className="card" style={{ marginBottom: 14, background: `linear-gradient(135deg, ${T.card} 0%, #1a1528 100%)`, border: `1px solid ${T.accent}30` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={ic.zap} s={18} c={T.bg} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Libre Baskerville',serif" }}>AI Predictions</div>
              <div style={{ fontSize: 11, color: T.textSec }}>Dự báo đa nguồn: Data nội bộ + Thị trường + Thời tiết + Sự kiện</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: currentModel.color }} />
            <span style={{ fontSize: 10, color: T.textSec }}>{currentModel.name}</span>
          </div>
        </div>

        {/* Period selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Icon d={ic.calendar} s={14} c={T.accent} />
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Giai đoạn dự báo:</span>
          <div style={{ display: "flex", gap: 4 }}>
            {PRED_PERIODS.map(p => (
              <button
                key={p.id}
                className={`chip ${predPeriod === p.id ? "on" : ""}`}
                style={predPeriod === p.id ? { borderColor: T.accent, color: T.accent, background: T.accent + "20" } : {}}
                onClick={() => { setPredPeriod(p.id); setPredDone(false); }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            className="btn btn-ai"
            style={{ marginLeft: "auto", padding: "7px 18px" }}
            onClick={runPred}
            disabled={predLoading || apiLoading}
          >
            {predLoading || apiLoading ? (
              <>
                <div className="spin" style={{ width: 13, height: 13 }} /> Đang phân tích...
              </>
            ) : (
              <>
                <Icon d={ic.sparkle} s={13} /> {predDone ? "Cập nhật" : "Chạy"} dự báo
              </>
            )}
          </button>
        </div>

        {/* Data sources badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { l: "Data nội bộ", c: T.accent, ic2: ic.db },
            { l: "Sự kiện & Lễ tết", c: T.warning, ic2: ic.gift },
            { l: "Thời tiết", c: T.info, ic2: ic.alert },
            { l: "Tin thị trường", c: T.success, ic2: ic.trend },
            { l: "Đối thủ", c: T.danger, ic2: ic.target }
          ].map((s, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 20,
                background: s.c + "12",
                border: `1px solid ${s.c}25`,
                fontSize: 10,
                fontWeight: 600,
                color: s.c
              }}
            >
              <Icon d={s.ic2} s={9} c={s.c} />
              {s.l}
            </span>
          ))}
        </div>
      </div>

      {/* Loading */}
      {(predLoading || apiLoading) && (
        <div className="card" style={{ padding: 30, textAlign: "center", marginBottom: 14 }}>
          <div className="spin" style={{ width: 28, height: 28, margin: "0 auto 12px", borderWidth: 3 }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 4 }}>AI đang tổng hợp đa nguồn dữ liệu...</div>
          <div style={{ fontSize: 11, color: T.textSec }}>
            Phân tích {formatNumber(overviewData.total_customers)} KH + {EXT_SIGNALS.events.length} sự kiện + {EXT_SIGNALS.weather.length} dữ liệu thời tiết + {EXT_SIGNALS.market.length} tin thị trường
          </div>
        </div>
      )}

      {/* Results */}
      {predDone && !predLoading && !apiLoading && (
        <>
          {/* KPI Forecast */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
            {[
              {
                l: "Doanh thu dự báo",
                v: formatValue(totalRev * 1e9),
                c: T.success,
                s: `+${(((totalRev / (predM * 8.5)) - 1) * 100).toFixed(1)}% vs cùng kỳ`,
                ic2: ic.dollar
              },
              {
                l: "Đơn hàng dự báo",
                v: formatNumber(totalOrders),
                c: T.info,
                s: `${predM} tháng tới`,
                ic2: ic.cart
              },
              {
                l: "KH mới dự kiến",
                v: formatNumber(totalNew),
                c: T.accent,
                s: `Avg ${formatNumber(Math.round(totalNew / predM))}/tháng`,
                ic2: ic.users
              },
              {
                l: "Churn Risk",
                v: formatNumber(totalChurn),
                c: T.danger,
                s: "Cần chăm sóc",
                ic2: ic.alert
              },
            ].map((k, i) => (
              <div key={i} className="card fu" style={{ padding: "14px 16px", border: `1px solid ${k.c}20` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <Icon d={k.ic2} s={11} c={k.c} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: k.c, textTransform: "uppercase", letterSpacing: ".04em" }}>
                    {k.l}
                  </span>
                </div>
                <div className="counter" style={{ fontSize: 22 }}>{k.v}</div>
                <div style={{ fontSize: 10, color: k.c, marginTop: 3, fontWeight: 600 }}>{k.s}</div>
              </div>
            ))}
          </div>

          {/* Forecast Chart */}
          <div className="card" style={{ marginBottom: 14 }}>
            <Section icon={ic.trend} title={`Dự báo doanh thu ${predPeriodObj.label} tới`} />
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
                <XAxis dataKey="month" stroke={T.textMuted} fontSize={11} />
                <YAxis stroke={T.textMuted} fontSize={10} unit="B" />
                <Tooltip
                  contentStyle={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 8, fontSize: 11 }}
                  formatter={(v, n) => [typeof v === "number" ? v.toFixed(1) + "B" : v, n]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="prevRev"
                  fill={T.textMuted + "15"}
                  stroke={T.textMuted}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  name="Cùng kỳ"
                />
                <Area
                  type="monotone"
                  dataKey="rev"
                  fill={T.accent + "20"}
                  stroke={T.accent}
                  strokeWidth={2}
                  name="Dự báo DT"
                />
                <Bar dataKey="newCust" fill={T.info + "50"} radius={[3, 3, 0, 0]} name="KH mới" yAxisId="right" />
                <YAxis yAxisId="right" orientation="right" stroke={T.textMuted} fontSize={10} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 3-column: Events | Weather | Market */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            {/* Events & Holidays */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Icon d={ic.gift} s={14} c={T.warning} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Sự kiện & Lễ tết</span>
                <span className="badge" style={{ background: T.warning + "18", color: T.warning, marginLeft: "auto", fontSize: 9 }}>
                  {predEvents.length} sự kiện
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {predEvents.length === 0 && (
                  <div style={{ fontSize: 11, color: T.textMuted, textAlign: "center", padding: 10 }}>
                    Không có sự kiện trong giai đoạn này
                  </div>
                )}
                {predEvents.slice(0, 6).map((e, i) => {
                  const impC = e.impact === "very_high" ? T.danger : e.impact === "high" ? T.warning : e.impact === "medium" ? T.info : T.textMuted;
                  return (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: impC + "08", border: `1px solid ${impC}18` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{e.name}</span>
                        <span style={{ fontSize: 9, color: impC, fontWeight: 700, textTransform: "uppercase" }}>
                          {e.impact === "very_high" ? "Rất cao" : e.impact === "high" ? "Cao" : e.impact === "medium" ? "TB" : "Thấp"}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: T.textSec }}>{e.date}</div>
                      <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{e.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weather */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Icon d={ic.alert} s={14} c={T.info} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Thời tiết dự báo</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {EXT_SIGNALS.weather.slice(0, predM).map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: w.color + "08", border: `1px solid ${w.color}15` }}>
                    <div style={{ width: 34, textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: w.color }}>{w.period.split("/")[0]}</div>
                      <div style={{ fontSize: 8, color: T.textMuted }}>{w.temp}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{w.condition}</div>
                      <div style={{ fontSize: 10, color: T.textSec }}>{w.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market News */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Icon d={ic.trend} s={14} c={T.success} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Tin thị trường</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {EXT_SIGNALS.market.map((m, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${m.impact === "positive" ? T.success : T.danger}18`, background: `${m.impact === "positive" ? T.success : T.danger}05` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                      <Icon d={m.impact === "positive" ? ic.trend : ic.alert} s={11} c={m.impact === "positive" ? T.success : T.danger} />
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{m.title}</span>
                    </div>
                    <div style={{ fontSize: 10, color: T.textMuted }}>{m.source} · {m.date}</div>
                    <div style={{ fontSize: 10, color: T.textSec, marginTop: 2 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="card" style={{ border: `1px solid ${T.purple}25` }}>
            <Section icon={ic.sparkle} title="AI Insights (Tổng hợp đa nguồn)" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {insights.map((ins, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: 10, background: ins.c + "06", border: `1px solid ${ins.c}15` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: ins.c + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon d={ins.ic2} s={14} c={ins.c} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{ins.t}</div>
                    <div style={{ fontSize: 11, color: T.textSec, lineHeight: 1.5 }}>{ins.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Initial state - before running */}
      {!predDone && !predLoading && !apiLoading && (
        <div className="card" style={{ padding: 35, textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: T.accent + "12", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icon d={ic.zap} s={28} c={T.accent} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>Chọn giai đoạn và chạy dự báo</div>
          <div style={{ fontSize: 12, color: T.textSec, maxWidth: 480, margin: "0 auto", lineHeight: 1.7, marginBottom: 16 }}>
            AI sẽ tổng hợp dữ liệu nội bộ ({formatNumber(overviewData.total_customers)} KH, {formatNumber(totalOrdersHist)} đơn) + {EXT_SIGNALS.events.length} sự kiện lễ tết + dự báo thời tiết + {EXT_SIGNALS.market.length} tin thị trường để đưa ra dự đoán chính xác.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, maxWidth: 520, margin: "0 auto" }}>
            {[
              { ic2: ic.db, l: formatNumber(overviewData.total_customers) + " KH", s: "Data nội bộ", c: T.accent },
              { ic2: ic.gift, l: `${EXT_SIGNALS.events.length} sự kiện`, s: "Lễ tết & xã hội", c: T.warning },
              { ic2: ic.alert, l: `${EXT_SIGNALS.weather.length} tháng`, s: "Dự báo thời tiết", c: T.info },
              { ic2: ic.trend, l: `${EXT_SIGNALS.market.length} tin tức`, s: "Thị trường", c: T.success }
            ].map((d, i) => (
              <div key={i} style={{ padding: 10, borderRadius: 10, background: d.c + "08", border: `1px solid ${d.c}18`, textAlign: "center" }}>
                <Icon d={d.ic2} s={16} c={d.c} />
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{d.l}</div>
                <div style={{ fontSize: 9, color: T.textSec }}>{d.s}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
