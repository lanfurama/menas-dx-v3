import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T, ic } from '../constants/index.js';
import { Section } from '../components/Section.jsx';
import { ExportBtn } from '../components/ExportBtn.jsx';

const ACTION_LABELS = {
  login: 'Đăng nhập',
  view: 'Xem trang',
  filter: 'Lọc KH',
  send_zns: 'Gửi ZNS',
  ai_chat: 'AI Chat',
  report: 'Tạo báo cáo',
  predict: 'Dự báo AI',
  export: 'Export',
  config: 'Cấu hình',
  user_mgmt: 'Quản lý user',
};

const ACTION_COLORS = {
  login: T.info,
  view: T.textSec,
  filter: T.warning,
  send_zns: '#00b0ff',
  ai_chat: T.purple,
  report: T.accent,
  predict: T.success,
  export: T.teal,
  config: T.danger,
  user_mgmt: T.pink,
};

export function ActivityLog({ activityLog, canExport }) {
  const navigate = useNavigate();

  const [logSearch, setLogSearch] = useState('');
  const [logActionF, setLogActionF] = useState('all');
  const [logUserF, setLogUserF] = useState('all');
  const [logModuleF, setLogModuleF] = useState('all');
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');

  const logUniqueUsers = useMemo(
    () => [...new Set(activityLog.map((l) => l.user))],
    [activityLog]
  );
  const logUniqueActions = useMemo(
    () => [...new Set(activityLog.map((l) => l.action))],
    [activityLog]
  );
  const logUniqueModules = useMemo(
    () => [...new Set(activityLog.map((l) => l.module))],
    [activityLog]
  );

  const filteredLog = useMemo(
    () =>
      activityLog.filter((l) => {
        if (
          logSearch &&
          !(
            l.detail.toLowerCase().includes(logSearch.toLowerCase()) ||
            l.user.toLowerCase().includes(logSearch.toLowerCase()) ||
            l.module.toLowerCase().includes(logSearch.toLowerCase())
          )
        ) {
          return false;
        }
        if (logActionF !== 'all' && l.action !== logActionF) return false;
        if (logUserF !== 'all' && l.user !== logUserF) return false;
        if (logModuleF !== 'all' && l.module !== logModuleF) return false;
        if (logDateFrom && l.ts.slice(0, 10) < logDateFrom) return false;
        if (logDateTo && l.ts.slice(0, 10) > logDateTo) return false;
        return true;
      }),
    [activityLog, logSearch, logActionF, logUserF, logModuleF, logDateFrom, logDateTo]
  );

  const logStats = useMemo(() => {
    const stats = {};
    activityLog.forEach((l) => {
      stats[l.action] = (stats[l.action] || 0) + 1;
    });
    return stats;
  }, [activityLog]);

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return activityLog.filter((l) => l.ts.startsWith(today)).length;
  }, [activityLog]);

  const expData = useMemo(
    () =>
      filteredLog.map((l) => ({
        ID: l.id,
        Timestamp: l.ts,
        User: l.user,
        Action: l.action,
        Module: l.module,
        Detail: l.detail,
        IP: l.ip,
      })),
    [filteredLog]
  );

  const handleAiQuickQuery = (q) => {
    navigate('/ai_chat', { state: { initialPrompt: q } });
  };

  const logUniqueUsersCount = logUniqueUsers.length;

  return (
    <div className="fu">
      <div
        className="card"
        style={{
          marginBottom: 14,
          background: `linear-gradient(135deg,${T.card} 0%,#1a1825 100%)`,
          border: `1px solid ${T.purple}25`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${T.purple}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke={T.purple}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={ic.clipboard} />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Libre Baskerville',serif" }}>
              Activity Log
            </div>
            <div style={{ fontSize: 11, color: T.textSec }}>
              Lịch sử tương tác hệ thống — {activityLog.length} records • Truy vấn qua AI Chat
            </div>
          </div>
          <ExportBtn
            canExport={canExport}
            data={expData}
            filename={`activity_log_${filteredLog.length}`}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 8,
            marginBottom: 14,
          }}
        >
          {[
            { label: 'Tổng log', value: activityLog.length, color: T.purple },
            { label: 'Users', value: logUniqueUsersCount, color: T.info },
            { label: 'Đăng nhập', value: logStats.login || 0, color: T.success },
            { label: 'Gửi ZNS', value: logStats.send_zns || 0, color: '#00b0ff' },
            { label: 'AI Chat', value: logStats.ai_chat || 0, color: T.accent },
            { label: 'Hôm nay', value: todayCount, color: T.warning },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                background: `${s.color}08`,
                border: `1px solid ${s.color}18`,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: s.color,
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                }}
              >
                {s.label}
              </div>
              <div className="counter" style={{ fontSize: 18 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke={T.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', left: 10, top: 9 }}
            >
              <path d={ic.search} />
            </svg>
            <input
              className="inp"
              style={{ paddingLeft: 30, fontSize: 11 }}
              placeholder="Tìm kiếm log..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
            />
          </div>
          <select
            className="inp"
            style={{ maxWidth: 140, fontSize: 11 }}
            value={logActionF}
            onChange={(e) => setLogActionF(e.target.value)}
          >
            <option value="all">Tất cả actions</option>
            {logUniqueActions.map((a) => (
              <option key={a} value={a}>
                {ACTION_LABELS[a] || a}
              </option>
            ))}
          </select>
          <select
            className="inp"
            style={{ maxWidth: 170, fontSize: 11 }}
            value={logUserF}
            onChange={(e) => setLogUserF(e.target.value)}
          >
            <option value="all">Tất cả users</option>
            {logUniqueUsers.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select
            className="inp"
            style={{ maxWidth: 140, fontSize: 11 }}
            value={logModuleF}
            onChange={(e) => setLogModuleF(e.target.value)}
          >
            <option value="all">Tất cả modules</option>
            {logUniqueModules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="inp"
            style={{ maxWidth: 135, fontSize: 11 }}
            value={logDateFrom}
            onChange={(e) => setLogDateFrom(e.target.value)}
          />
          <span style={{ color: T.textMuted, fontSize: 10 }}>→</span>
          <input
            type="date"
            className="inp"
            style={{ maxWidth: 135, fontSize: 11 }}
            value={logDateTo}
            onChange={(e) => setLogDateTo(e.target.value)}
          />
          {(logSearch ||
            logActionF !== 'all' ||
            logUserF !== 'all' ||
            logModuleF !== 'all' ||
            logDateFrom ||
            logDateTo) && (
            <button
              className="chip"
              style={{ fontSize: 10, color: T.danger, borderColor: `${T.danger}40` }}
              onClick={() => {
                setLogSearch('');
                setLogActionF('all');
                setLogUserF('all');
                setLogModuleF('all');
                setLogDateFrom('');
                setLogDateTo('');
              }}
            >
              Xoá lọc
            </button>
          )}
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: T.textMuted,
            }}
          >
            {filteredLog.length} / {activityLog.length} records
          </span>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 14,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: `1px solid ${T.accent}20`,
        }}
      >
        <svg
          width={15}
          height={15}
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={ic.brain} />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Truy vấn log bằng AI:</span>
        <div style={{ display: 'flex', gap: 5, flex: 1, flexWrap: 'wrap' }}>
          {[
            'Xem log hoạt động',
            'Ai gửi ZNS gần đây?',
            'Marketing làm gì?',
            'Log export',
            'Thống kê tương tác',
          ].map((q) => (
            <button
              key={q}
              className="chip"
              style={{ fontSize: 10, padding: '2px 8px' }}
              onClick={() => handleAiQuickQuery(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tw" style={{ maxHeight: 'calc(100vh - 440px)', overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 30 }}>#</th>
                <th style={{ width: 145 }}>Thời gian</th>
                <th style={{ width: 160 }}>User</th>
                <th style={{ width: 100 }}>Action</th>
                <th style={{ width: 100 }}>Module</th>
                <th>Chi tiết</th>
                <th style={{ width: 110 }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLog.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: 'center', padding: 30, color: T.textMuted }}
                  >
                    Không có log phù hợp
                  </td>
                </tr>
              )}
              {filteredLog.slice(0, 100).map((l) => {
                const ac = ACTION_COLORS[l.action] || T.textSec;
                return (
                  <tr key={l.id} className="rh">
                    <td style={{ fontSize: 10, color: T.textMuted }}>{l.id}</td>
                    <td
                      style={{
                        fontSize: 11,
                        color: T.textSec,
                        fontFamily: 'monospace',
                      }}
                    >
                      {l.ts}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: `${T.accent}18`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 9,
                            fontWeight: 800,
                            color: T.accent,
                          }}
                        >
                          {l.user.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500 }}>{l.user}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: `${ac}15`,
                          color: ac,
                          fontSize: 9,
                          padding: '2px 8px',
                        }}
                      >
                        {ACTION_LABELS[l.action] || l.action}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: T.textSec }}>{l.module}</td>
                    <td
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        maxWidth: 320,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {l.detail}
                    </td>
                    <td style={{ fontSize: 11, color: T.textSec }}>{l.ip}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredLog.length > 100 && (
          <div
            style={{
              padding: '8px 16px',
              borderTop: `1px solid ${T.cardBorder}`,
              fontSize: 11,
              color: T.textMuted,
              textAlign: 'center',
            }}
          >
            Hiển thị 100 / {filteredLog.length} records. Export để xem toàn bộ.
          </div>
        )}
      </div>
    </div>
  );
}

