import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { T, ic, AI_MODELS } from '../constants/index.js';
import { Icon } from '../components/Icon.jsx';
import { useAiConfig } from '../hooks/useAiConfig.js';
import { aiApi } from '../services/api.js';
import { formatValue, formatNumber } from '../utils/format.js';

const QUICK_PROMPTS = [
  "Phân tích KH VIP",
  "Đề xuất chiến dịch win-back",
  "Cảnh báo churn",
  "Phân tích doanh thu",
  "Xem log hoạt động",
  "Ai gửi ZNS gần đây?",
  "Log export"
];

export function AIChat({ dbOn, demoData, addLog, activityLog = [] }) {
  const location = useLocation();
  const { selectedModel, setSelectedModel } = useAiConfig();
  const [chatMsgs, setChatMsgs] = useState([
    {
      role: "ai",
      text: "Xin chào! Tôi là AI Assistant của MENAS DX. Tôi có thể:\n• Phân tích dữ liệu KH, doanh thu, RFM\n• Đề xuất tệp KH cho chiến dịch\n• Truy vấn Activity Log: \"xem log hoạt động\", \"ai gửi ZNS gần đây?\", \"marketing làm gì?\"\nHãy hỏi tôi bất cứ điều gì!"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, chatLoading]);

  // Handle initial prompt from navigation
  useEffect(() => {
    if (location.state?.initialPrompt) {
      setChatInput(location.state.initialPrompt);
    }
  }, [location.state]);

  const sendAiMsg = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatMsgs(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    addLog?.("ai_chat", "ai_chat", "Hỏi AI: " + userMsg.substring(0, 80));

    try {
      // Build system prompt with data context
      const logSummary = activityLog.slice(0, 20).map(l => `[${l.ts}] ${l.user} — ${l.action}: ${l.detail}`).join("\n");
      
      let systemPrompt = `Bạn là AI Assistant cho MENAS DX - hệ thống Customer 360° Intelligence Platform.\n`;
      
      if (dbOn && demoData) {
        const d = demoData;
        systemPrompt += `Dữ liệu hệ thống hiện tại:
- Tổng khách hàng: ${formatNumber(d.overview?.total_customers || 0)} (Active: ${formatNumber(d.overview?.active_customers || 0)})
- KH mới tháng này: ${formatNumber(d.overview?.new_this_month || 0)}
- AOV: ${formatValue(d.overview?.avg_order_value || 0)} VND
- Revenue YTD: ${formatValue((d.revenueByMonth || []).reduce((s, r) => s + (r.revenue || 0), 0) * 1e6)} VND\n`;
      }

      systemPrompt += `\n=== ACTIVITY LOG (${activityLog.length} records gần nhất) ===
${logSummary || "Chưa có log"}

Hãy phân tích dữ liệu, đề xuất chiến dịch, hoặc truy vấn activity log.
Khi user hỏi về log/lịch sử/ai đã làm gì/hoạt động, hãy phân tích activity log ở trên.
Trả lời bằng tiếng Việt. Khi đề xuất lọc KH, gợi ý tiêu chí cụ thể.`;

      // Call backend API
      const response = await aiApi.chat({
        modelId: selectedModel,
        messages: chatMsgs.map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text
        })).concat([{ role: "user", content: userMsg }]),
        systemPrompt
      });

      setChatMsgs(prev => [...prev, { role: "ai", text: response.text }]);
    } catch (error) {
      console.error("AI Chat error:", error);
      // Fallback smart reply
      const reply = generateSmartReply(userMsg);
      setChatMsgs(prev => [...prev, { role: "ai", text: reply }]);
    } finally {
      setChatLoading(false);
    }
  };

  const generateSmartReply = (msg) => {
    const m = msg.toLowerCase();
    
    if (m.includes("log") || m.includes("lịch sử") || m.includes("hoạt động") || m.includes("ai đã") || m.includes("ai làm") || m.includes("tương tác") || m.includes("history")) {
      const recent = activityLog.slice(0, 10);
      const byUser = {};
      const byAction = {};
      activityLog.forEach(l => {
        byUser[l.user] = (byUser[l.user] || 0) + 1;
        byAction[l.action] = (byAction[l.action] || 0) + 1;
      });
      const topUsers = Object.entries(byUser).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([u, c]) => `${u} (${c} lần)`).join(", ");
      const topActions = Object.entries(byAction).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([a, c]) => `${a}: ${c}`).join(", ");
      return `📋 **Activity Log — ${activityLog.length} records:**\n\n**Phân bố theo user:**\n${topUsers}\n\n**Phân bố theo hành động:**\n${topActions}\n\n**10 hoạt động gần nhất:**\n${recent.map((l, i) => `${i + 1}. [${l.ts}] **${l.user}** — ${l.action}: ${l.detail}`).join("\n")}\n\nBạn có thể hỏi cụ thể: "ai gửi ZNS gần đây", "marketing làm gì", "log export"...`;
    }
    
    if (m.includes("zns") && (m.includes("ai gửi") || m.includes("gửi gần") || m.includes("log gửi"))) {
      const znsLogs = activityLog.filter(l => l.action === "send_zns");
      return `📨 **Log gửi ZNS (${znsLogs.length} lần):**\n\n${znsLogs.slice(0, 5).map((l, i) => `${i + 1}. [${l.ts}] ${l.user} — ${l.detail}`).join("\n")}\n\nTổng: ${znsLogs.length} chiến dịch ZNS đã gửi.`;
    }
    
    if (m.includes("marketing") || m.includes("nguyễn")) {
      const mktLogs = activityLog.filter(l => l.user?.includes("marketing"));
      return `👤 **Hoạt động của marketing@menas.vn (${mktLogs.length} records):**\n\n${mktLogs.slice(0, 8).map((l, i) => `${i + 1}. [${l.ts}] ${l.action}: ${l.detail}`).join("\n")}\n\nUser này chủ yếu: lọc segment, gửi ZNS, hỏi AI.`;
    }
    
    if (m.includes("export") || m.includes("xuất")) {
      const expLogs = activityLog.filter(l => l.action === "export");
      return `📥 **Log Export (${expLogs.length} lần):**\n\n${expLogs.slice(0, 5).map((l, i) => `${i + 1}. [${l.ts}] ${l.user} — ${l.detail}`).join("\n") || "Chưa có log export nào."}\n\n`;
    }
    
    if (m.includes("vip") || m.includes("platinum") || m.includes("cao cấp")) {
      return `📊 **Phân tích tệp VIP:**\n\n• VIP Platinum: ~1,284 KH (10%) — AOV cao nhất, tần suất 4+ lần/tháng\n• VIP Gold: ~2,569 KH (20%)\n\n**Đề xuất chiến dịch VIP:**\nVào tab **Segment**, chọn:\n→ Hạng Loyalty: Platinum + Gold\n→ RFM Segment: Champions + Loyal\n→ Tần suất: >= 2 lần/tháng\n→ Chi tiêu: >= 20,000,000\n\nDự kiến: ~3,800 KH phù hợp. Nên gửi ZNS template "Chăm sóc VIP" với offer giảm 15-20%.`;
    }
    
    if (m.includes("churn") || m.includes("rời") || m.includes("risk") || m.includes("mất")) {
      return `⚠️ **Cảnh báo Churn:**\n\n• At Risk: ~1,928 KH — chưa mua > 90 ngày nhưng có frequency cao\n• Hibernating: ~1,285 KH — chưa mua > 200 ngày\n\n**Đề xuất Win-back:**\nTab **Segment**:\n→ RFM Segment: At Risk\n→ Số ngày kể từ lần mua cuối: 60 — 120\n→ Zalo: Đã follow OA\n\nGửi ZNS "Win-back" với voucher giảm 30% trong 7 ngày. Ưu tiên KH có tổng chi > 10M.`;
    }
    
    if (m.includes("doanh thu") || m.includes("revenue") || m.includes("bán")) {
      return `📈 **Phân tích doanh thu:**\n\n• YTD: ~72.3 tỷ VND (+12% YoY)\n• Tháng cao nhất: T12 (8.5 tỷ)\n• Top category: Thực phẩm, Đồ uống\n• Top store: CH Nguyễn Huệ\n\n**Insight:** Peak giờ 11h-13h chiếm 35% doanh thu. Đề xuất tăng staffing và chạy flash deal khung giờ 15h-17h để cân bằng.`;
    }
    
    if (m.includes("chiến dịch") || m.includes("campaign") || m.includes("marketing")) {
      return `🎯 **Đề xuất 3 chiến dịch:**\n\n**1. Re-engage KH Potential** (~2,056 KH)\n→ Lọc: Segment Potential + Tần suất 1-3 + Chi tiêu 5-15M\n→ Offer: Giảm 10% + tặng điểm x2\n\n**2. Birthday Campaign** (ước tính ~1,000 KH/tháng)\n→ Lọc: Birthday tháng hiện tại + Có Zalo\n→ ZNS template "Sinh nhật KH" + voucher 20%\n\n**3. Cross-sell Top Category**\n→ Lọc: Đã mua "Thực phẩm" NHƯNG chưa mua "Đồ uống"\n→ Offer: Combo giảm 15%`;
    }
    
    if (m.includes("lọc") || m.includes("tệp") || m.includes("segment")) {
      return `🔍 **Hướng dẫn lọc KH:**\n\nVào tab **Segment**, bạn có thể kết hợp:\n\n• **Hạng Loyalty:** Platinum / Gold / Silver\n• **RFM:** Champions / Loyal / Potential / New / At Risk / Hibernating\n• **Danh mục đã mua:** Thực phẩm, Đồ uống, Gia vị...\n• **Chi tiêu:** range min-max\n• **Tần suất mua/tháng:** range\n• **Ngày mua cuối:** bao nhiêu ngày trước\n• **Zalo:** Có/Không, Follow OA\n• **Cửa hàng:** multi-select\n\nSau khi lọc xong, click **"Gửi Zalo ZNS"** để chuyển sang tab Zalo gửi tin nhắn hàng loạt.`;
    }
    
    return `Cảm ơn câu hỏi! Dựa trên dữ liệu MENAS DX:\n\n• Tổng KH: ${formatNumber(demoData?.overview?.total_customers || 0)} (${formatNumber(demoData?.overview?.active_customers || 0)} active)\n• AOV: ${formatValue(demoData?.overview?.avg_order_value || 0)}\n• Activity log: ${activityLog.length} records\n\nBạn có thể hỏi: "phân tích VIP", "đề xuất chiến dịch", "cảnh báo churn", "xem log hoạt động", "ai gửi ZNS gần đây"...`;
  };

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return (
    <div className="fu" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      {/* Model selector */}
      <div className="card" style={{ padding: 12, marginBottom: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Icon d={ic.brain} s={16} c={T.purple} />
        <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>AI Model:</span>
        {AI_MODELS.map(m => (
          <button
            key={m.id}
            className={`chip ${selectedModel === m.id ? 'on' : ''}`}
            style={selectedModel === m.id ? { borderColor: m.color, color: m.color, background: `${m.color}20` } : {}}
            onClick={() => setSelectedModel(m.id)}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, display: "inline-block", marginRight: 4 }} />
            {m.name}
          </button>
        ))}
        <span style={{ fontSize: 10, color: T.textMuted, marginLeft: "auto" }}>API Key: Cài đặt → AI Config</span>
      </div>

      {/* Chat area */}
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
        <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {chatMsgs.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div className={`chat-bubble ${m.role === "user" ? "chat-user" : "chat-ai"}`}>
                {m.role === "ai" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, fontSize: 10, fontWeight: 700, color: T.purple }}>
                    <Icon d={ic.sparkle} s={11} c={T.purple} />
                    {currentModel.name}
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{m.text}</div>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ alignSelf: "flex-start" }}>
              <div className="chat-bubble chat-ai">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: 12, borderTop: `1px solid ${T.cardBorder}`, display: "flex", gap: 8, background: T.surface }}>
          <input
            className="inp"
            style={{ flex: 1 }}
            placeholder="Hỏi AI: phân tích VIP, đề xuất chiến dịch, cảnh báo churn..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendAiMsg();
              }
            }}
          />
          <button className="btn btn-ai" onClick={sendAiMsg} disabled={chatLoading || !chatInput.trim()}>
            <Icon d={ic.send} s={14} />
          </button>
        </div>

        {/* Quick prompts */}
        <div style={{ padding: "8px 12px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: `1px solid ${T.cardBorder}20` }}>
          {QUICK_PROMPTS.map(q => (
            <button
              key={q}
              className="chip"
              style={{ fontSize: 10, padding: "3px 8px" }}
              onClick={() => setChatInput(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
