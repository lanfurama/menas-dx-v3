import { useState, useEffect, useRef } from 'react';
import { T, ic, ALL_TABS, ROLES } from './constants/index.js';
import { globalCSS } from './styles/global.js';
import { useAuth } from './hooks/useAuth.js';
import { usePermissions } from './hooks/usePermissions.js';
import { Icon } from './components/Icon.jsx';
import { Dot } from './components/Dot.jsx';
import { NoAccess } from './components/NoAccess.jsx';
import { PermEditor } from './components/PermEditor.jsx';
import { DEMO } from './data/demo.js';
import { Settings } from './pages/Settings.jsx';

export default function MenasDX() {
  const auth = useAuth();
  const { canView, canExport, isAdmin, visibleTabs } = usePermissions(auth.currentUser, ALL_TABS);

  // App State
  const [tab, setTab] = useState("overview");
  const [dbOn, setDbOn] = useState(false);
  const [data] = useState(DEMO);

  // Activity Log
  const [activityLog, setActivityLog] = useState([
    { id: 1, ts: "2025-06-01 09:00:12", user: "admin@menas.vn", action: "login", module: "auth", detail: "Đăng nhập thành công", ip: "192.168.1.10" },
  ]);
  const logIdRef = useRef(16);
  const addLog = (action, module, detail) => {
    const entry = {
      id: logIdRef.current++,
      ts: new Date().toISOString().replace("T", " ").slice(0, 19),
      user: auth.currentUser?.email || "unknown",
      action,
      module,
      detail,
      ip: "192.168.1." + Math.floor(10 + Math.random() * 40)
    };
    setActivityLog(prev => [entry, ...prev].slice(0, 200));
    return entry;
  };

  // Login Screen
  if (!auth.loggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Outfit',sans-serif", color: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{globalCSS}</style>
        <div className="card" style={{ maxWidth: 400, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icon d={ic.layers} s={32} c={T.bg} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Libre Baskerville',serif", letterSpacing: "-.02em" }}>
              <span style={{ color: T.accent }}>MENAS</span> <span style={{ color: T.text }}>DX</span>
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Customer 360° + AI + ZNS</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <span className="label-sm">Email</span>
            <input className="inp" type="email" value={auth.loginEmail} onChange={e => auth.setLoginEmail(e.target.value)} placeholder="admin@menas.vn" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <span className="label-sm">Mật khẩu</span>
            <input className="inp" type="password" value={auth.loginPass} onChange={e => auth.setLoginPass(e.target.value)} placeholder="123" onKeyPress={e => e.key === 'Enter' && auth.handleLogin()} />
          </div>
          {auth.loginErr && <div style={{ padding: "10px 14px", borderRadius: 8, background: T.danger + "18", color: T.danger, fontSize: 12, marginBottom: 16 }}>{auth.loginErr}</div>}
          <button className="btn btn-p" style={{ width: "100%" }} onClick={auth.handleLogin}>Đăng nhập</button>
        </div>
      </div>
    );
  }

  // Main App
  const renderTab = () => {
    const ok = canView(tab);
    // Tạm thời return placeholder, sẽ được thay thế bằng các page components
    switch (tab) {
      case "overview":
      case "customers":
      case "segment":
      case "sales":
      case "marketing":
      case "zalo":
      case "predictions":
      case "ai_chat":
      case "report":
      case "datamap":
        return ok ? <div className="fu">Page {tab} - Coming soon</div> : <NoAccess />;
      case "activity_log":
        return isAdmin ? <div className="fu">Activity Log - Coming soon</div> : <NoAccess />;
      case "settings":
        return isAdmin ? <Settings currentUser={auth.currentUser} addLog={addLog} /> : <NoAccess />;
      case "user_mgmt":
        return isAdmin ? (
          <div className="fu">
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Quản lý người dùng</span>
              </div>
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      {["Tên", "Email", "Vai trò", "Trạng thái", ""].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {auth.allUsers.map(u => (
                      <tr key={u.id} className="rh">
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className="badge" style={{ background: ROLES[u.role]?.color + "18", color: ROLES[u.role]?.color }}>{ROLES[u.role]?.label}</span></td>
                        <td><span className="badge" style={{ background: u.status === 'active' ? `${T.success}18` : `${T.danger}18`, color: u.status === 'active' ? T.success : T.danger }}>{u.status}</span></td>
                        <td><button className="btn btn-g btn-sm" onClick={() => auth.setEditingUser(u.id === auth.editingUser ? null : u.id)}><Icon d={ic.edit} s={11} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {auth.editingUser && <PermEditor uid={auth.editingUser} users={auth.allUsers} setUsers={auth.setAllUsers} close={() => auth.setEditingUser(null)} />}
          </div>
        ) : <NoAccess />;
      default:
        return <div className="fu">Page not found</div>;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Outfit',sans-serif", color: T.text }}>
      <style>{globalCSS}</style>
      {/* HEADER */}
      <header style={{ padding: "10px 22px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ic.layers} s={15} c={T.bg} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Libre Baskerville',serif", letterSpacing: "-.02em" }}>
              <span style={{ color: T.accent }}>MENAS</span> <span style={{ color: T.text }}>DX</span>
            </div>
            <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: ".1em", textTransform: "uppercase" }}>Customer 360° + AI + ZNS</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* DB status sẽ được update từ Settings page */}
          <Dot on={dbOn} />
          <div style={{ width: 1, height: 20, background: T.cardBorder, margin: "0 4px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: T.surfaceAlt, cursor: "pointer" }} onClick={() => setTab("user_mgmt")}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${ROLES[auth.currentUser?.role]?.color || T.info}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: ROLES[auth.currentUser?.role]?.color || T.info }}>{auth.currentUser?.avatar}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{auth.currentUser?.name}</div>
              <div style={{ fontSize: 9, color: ROLES[auth.currentUser?.role]?.color }}>{ROLES[auth.currentUser?.role]?.label}</div>
            </div>
          </div>
          <button className="btn btn-g btn-sm" onClick={auth.handleLogout} title="Đăng xuất"><Icon d={ic.logout} s={13} /></button>
        </div>
      </header>
      {/* TABS */}
      <nav style={{ padding: "0 22px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", gap: 1, overflowX: "auto", background: T.bg }}>
        {visibleTabs.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => { setTab(t.id); addLog("view", t.id, "Mở tab " + t.label); }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon d={t.icon} s={13} />{t.label}
            </span>
          </button>
        ))}
      </nav>
      {/* CONTENT */}
      <main style={{ padding: "18px 22px", maxWidth: 1380, margin: "0 auto" }} key={tab}>{renderTab()}</main>
      {/* FOOTER */}
      <footer style={{ padding: "10px 22px", borderTop: `1px solid ${T.cardBorder}`, textAlign: "center", fontSize: 10, color: T.textMuted }}>
        Menas DX © 2026 · {auth.currentUser?.name} ({ROLES[auth.currentUser?.role]?.label}) · {dbOn ? `DB: ${dbCfg.host}` : "Demo"}{canExport ? " · Export ✓" : " · Export ✗"}
      </footer>
    </div>
  );
}
