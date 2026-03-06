import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { T, ic } from '../constants/index.js';
import { Section } from '../components/Section.jsx';
import { Metric } from '../components/Metric.jsx';
import { ExportBtn } from '../components/ExportBtn.jsx';
import { zaloApi } from '../services/api.js';

export function Zalo({ dbOn, demoData, canExport }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState('');

  const [templates, setTemplates] = useState([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [tplError, setTplError] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [message, setMessage] = useState('');

  const segmentState = location.state && location.state.fromSegment ? location.state : null;

  const targetCustomers = useMemo(() => {
    if (segmentState?.segmentCustomers?.length) {
      return segmentState.segmentCustomers.filter((c) => c.has_zalo && c.zalo_oa_follow);
    }
    const all = (demoData?.customers || []).filter((c) => c.has_zalo && c.zalo_oa_follow);
    return all;
  }, [segmentState, demoData]);

  const totalCustomers = useMemo(() => (demoData?.customers || []).length, [demoData]);

  useEffect(() => {
    let cancelled = false;
    const loadConfig = async () => {
      if (!dbOn) return;
      setConfigLoading(true);
      setConfigError('');
      try {
        const res = await zaloApi.getConfig();
        if (!cancelled) {
          setConfig(res.config || null);
        }
      } catch (err) {
        if (!cancelled) {
          setConfigError(err.message || 'Không thể tải cấu hình Zalo.');
        }
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    };
    loadConfig();
    return () => {
      cancelled = true;
    };
  }, [dbOn]);

  useEffect(() => {
    let cancelled = false;
    const loadTemplates = async () => {
      if (!dbOn) {
        // Fallback demo templates khi chưa có DB
        setTemplates(demoData?.znsTemplates || []);
        return;
      }
      setTplLoading(true);
      setTplError('');
      try {
        const res = await zaloApi.getTemplates();
        if (!cancelled) {
          setTemplates(res.templates || []);
        }
      } catch (err) {
        if (!cancelled) {
          setTplError(err.message || 'Không thể tải danh sách template.');
        }
      } finally {
        if (!cancelled) setTplLoading(false);
      }
    };
    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, [dbOn, demoData]);

  const zaloConnected = !!(config && config.oa_id);

  const handleSend = async () => {
    if (!selectedTemplate || !targetCustomers.length) return;
    setSending(true);
    setSentCount(0);
    setMessage('');
    // Demo: giả lập tiến trình gửi
    for (let i = 0; i < targetCustomers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 80));
      setSentCount((c) => c + 1);
    }
    setSending(false);
    setMessage(`Đã giả lập gửi ZNS cho ${targetCustomers.length} khách hàng (${selectedTemplate.name}). Tích hợp API gửi thực tế sẽ dùng backend Zalo OA.`);
  };

  const handleSelectSegment = () => {
    navigate('/segment');
  };

  const templatesForExport = useMemo(
    () =>
      templates.map((t) => ({
        TemplateId: t.id || t.template_id,
        Ten: t.name,
        Loai: t.type,
        TrangThai: t.status,
      })),
    [templates]
  );

  const customersExport = useMemo(
    () =>
      targetCustomers.map((c) => ({
        MaTheKHTT: c.MaTheKHTT,
        Ten: c.name,
        SoDienThoai: c.phone,
        Segment: c.segment,
        CoZalo: c.has_zalo ? 'Có' : 'Không',
        FollowOA: c.zalo_oa_follow ? 'Có' : 'Không',
      })),
    [targetCustomers]
  );

  return (
    <div className="fu">
      <div
        className="card"
        style={{
          marginBottom: 14,
          background: `linear-gradient(135deg,${T.zaloGreen}12 0%,${T.surface} 100%)`,
          border: `1px solid ${T.zaloGreen}30`,
        }}
      >
        <Section icon={ic.msg} title="Zalo OA" sql={!!dbOn}>
          {dbOn && configLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textSec }}>
              <div className="spin" style={{ width: 16, height: 16 }} />
              <span>Đang tải cấu hình...</span>
            </div>
          )}
        </Section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="badge"
              style={{
                background: zaloConnected ? `${T.zaloGreen}18` : `${T.textMuted}18`,
                color: zaloConnected ? T.zaloGreen : T.textMuted,
              }}
            >
              {zaloConnected ? 'Zalo Connected' : 'Chưa kết nối'}
            </span>
            {config && (
              <span style={{ fontSize: 11, color: T.textSec }}>
                OA ID: <span style={{ color: T.text }}>{config.oa_id}</span>
              </span>
            )}
          </div>
          {configError && (
            <div style={{ fontSize: 11, color: T.danger }}>
              {configError}
            </div>
          )}
          {!dbOn && (
            <div style={{ fontSize: 11, color: T.textSec }}>
              Đang chạy ở chế độ demo — dùng dữ liệu mock từ file cấu hình.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <Section icon={ic.gift} title="ZNS Templates" sql={!!dbOn}>
          <ExportBtn canExport={canExport} data={templatesForExport} filename="zalo_templates" />
        </Section>
        {tplLoading && dbOn && (
          <div style={{ padding: 12, fontSize: 12, color: T.textSec }}>
            Đang tải templates từ database...
          </div>
        )}
        {tplError && (
          <div style={{ padding: 12, fontSize: 12, color: T.danger }}>
            {tplError}
          </div>
        )}
        <div className="tw">
          <table>
            <thead>
              <tr>
                {['Template', 'Loại', 'Trạng thái', 'Chọn'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id || t.template_id} className="rh">
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: t.type === 'transaction' ? `${T.info}18` : `${T.warning}18`,
                        color: t.type === 'transaction' ? T.info : T.warning,
                      }}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: t.status === 'approved' ? `${T.success}18` : `${T.warning}18`,
                        color: t.status === 'approved' ? T.success : T.warning,
                      }}
                    >
                      {t.status === 'approved' ? 'Đã duyệt' : 'Chờ'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-z btn-sm"
                      disabled={t.status !== 'approved'}
                      onClick={() => setSelectedTemplate(t)}
                    >
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={ic.send} />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {!templates.length && !tplLoading && (
                <tr>
                  <td colSpan={4} style={{ padding: 12, fontSize: 12, color: T.textSec }}>
                    Chưa có template nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ border: `1px solid ${T.zaloGreen}30` }}>
        <Section icon={ic.send} title="Gửi ZNS">
          <div style={{ display: 'flex', gap: 6 }}>
            <Metric
              icon={ic.userCheck}
              label="KH mục tiêu"
              value={targetCustomers.length.toLocaleString('vi-VN')}
              sub={totalCustomers ? `/${totalCustomers.toLocaleString('vi-VN')} toàn bộ KH` : undefined}
              idx={1}
            />
          </div>
        </Section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ padding: 12, borderRadius: 8, background: T.surface }}>
            <span className="label-sm">Template</span>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: selectedTemplate ? T.text : T.textMuted,
                marginTop: 4,
              }}
            >
              {selectedTemplate?.name || 'Chưa chọn'}
            </div>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: T.surface }}>
            <span className="label-sm">Người nhận</span>
            <div className="counter" style={{ fontSize: 20, marginTop: 4 }}>
              {targetCustomers.length.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: `${T.success}15`,
              color: T.success,
              fontSize: 12,
              marginBottom: 10,
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        )}

        {sending && (
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: T.textSec,
                marginBottom: 3,
              }}
            >
              <span>Đang gửi...</span>
              <span>
                {sentCount}/{targetCustomers.length || 1}
              </span>
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 3,
                background: T.cardBorder,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 3,
                  background: T.zaloGreen,
                  width: `${(sentCount / (targetCustomers.length || 1)) * 100}%`,
                  transition: 'width .1s',
                }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-z"
            disabled={!selectedTemplate || !targetCustomers.length || sending}
            onClick={handleSend}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
              <path d={ic.send} />
            </svg>
            Gửi ZNS (demo)
          </button>
          <button className="btn btn-g" onClick={handleSelectSegment}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
              <path d={ic.filter} />
            </svg>
            Chọn tệp
          </button>
          {segmentState?.fromSegment && (
            <span style={{ fontSize: 11, color: T.textSec, alignSelf: 'center' }}>
              Đã chuyển từ Segment với {segmentState.segmentCustomerIds?.length || 0} KH được chọn
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

