import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, NavLink, Navigate } from 'react-router-dom';
import { T, ic, ALL_TABS, ROLES, tabToPath, pathToTab } from './constants/index.js';
import { globalCSS } from './styles/global.js';
import { useAuth } from './hooks/useAuth.js';
import { usePermissions } from './hooks/usePermissions.js';
import { Icon } from './components/Icon.jsx';
import { Dot } from './components/Dot.jsx';
import { NoAccess } from './components/NoAccess.jsx';
import { PermEditor } from './components/PermEditor.jsx';
import { DEMO } from './data/demo.js';
import { Settings } from './pages/Settings.jsx';
import { Overview } from './pages/Overview.jsx';
import { Customers } from './pages/Customers.jsx';
import { Segment } from './pages/Segment.jsx';
import { UserManagement } from './pages/UserManagement.jsx';
import { dbApi } from './services/api.js';

export default function MenasDX() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const tab = pathToTab(location.pathname);
  const { canView, canExport, isAdmin, visibleTabs } = usePermissions(auth.currentUser, ALL_TABS);

  // App State
  const [dbOn, setDbOn] = useState(false);
  const [dbCfg, setDbCfg] = useState(null);
  const [data] = useState(DEMO);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem('menas_theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  // Check database connection health
  const checkDbHealth = async () => {
    try {
      const { config } = await dbApi.getConfig();
      if (config?.is_active) {
        setDbCfg(config);
        // Test actual connection
        const health = await dbApi.checkHealth();
        const connected = health.connected === true;
        setDbOn(connected);
        return connected;
      } else {
        setDbOn(false);
        setDbCfg(null);
        return false;
      }
    } catch (error) {
      setDbOn(false);
      return false;
    }
  };

  useEffect(() => {
    checkDbHealth();
    // Check every 30 seconds
    const interval = setInterval(checkDbHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('menas_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Khi vào tab Tổng quan, đồng bộ lại config và trigger gọi API overview nếu đã lưu DB
  const [overviewRefetchKey, setOverviewRefetchKey] = useState(0);
  useEffect(() => {
    if (tab !== 'overview') return;
    checkDbHealth().then((connected) => {
      if (connected) {
        setOverviewRefetchKey((k) => k + 1);
      }
    });
  }, [tab]);

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
      <div
        className={`app-root theme-${theme}`}
        style={{
          minHeight: "100vh",
          background: theme === 'dark' ? T.bg : "#f4f4f8",
          fontFamily: "'Be Vietnam Pro',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
          color: theme === 'dark' ? T.text : "#111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <style>{globalCSS}</style>
        <div className="card" style={{ maxWidth: 400, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icon d={ic.layers} s={32} c={T.bg} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Be Vietnam Pro',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", letterSpacing: "-.02em" }}>
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

  if (location.pathname === '/' || location.pathname === '') {
    return <Navigate to="/overview" replace />;
  }

  // Main App
  const renderTab = () => {
    const ok = canView(tab);
    // Tạm thời return placeholder, sẽ được thay thế bằng các page components
    switch (tab) {
      case "overview":
        return ok ? <Overview dbOn={dbOn} demoData={data} canExport={canExport} refetchKey={overviewRefetchKey} /> : <NoAccess />;
      case "customers":
        return ok ? <Customers dbOn={dbOn} demoData={data} canExport={canExport} addLog={addLog} /> : <NoAccess />;
      case "segment":
        return ok ? <Segment dbOn={dbOn} demoData={data} canExport={canExport} addLog={addLog} /> : <NoAccess />;
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
        return isAdmin ? <Settings currentUser={auth.currentUser} addLog={addLog} onDbConnect={checkDbHealth} /> : <NoAccess />;
      case "user_mgmt":
        return isAdmin ? <UserManagement auth={auth} /> : <NoAccess />;
      default:
        return <div className="fu">Page not found</div>;
    }
  };

  return (
    <div
      className={`app-root theme-${theme}`}
      style={{
        minHeight: "100vh",
        background: theme === 'dark' ? T.bg : "#f4f4f8",
        fontFamily: "'Be Vietnam Pro',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        color: theme === 'dark' ? T.text : "#111827"
      }}
    >
      <style>{globalCSS}</style>
      {/* HEADER */}
      <header style={{ padding: "10px 22px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ic.layers} s={15} c={T.bg} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Be Vietnam Pro',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", letterSpacing: "-.02em" }}>
              <span style={{ color: T.accent }}>MENAS</span> <span style={{ color: T.text }}>DX</span>
            </div>
            <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: ".1em", textTransform: "uppercase" }}>Customer 360° + AI + ZNS</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="btn btn-g btn-sm"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Chuyển Light mode' : 'Chuyển Dark mode'}
          >
            <Icon d={ic.sparkle} s={13} />
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
          {/* DB status sẽ được update từ Settings page */}
          <Dot on={dbOn} />
          <div style={{ width: 1, height: 20, background: T.cardBorder, margin: "0 4px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: T.surfaceAlt, cursor: "pointer" }} onClick={() => navigate(tabToPath('user_mgmt'))}>
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
          <NavLink
            key={t.id}
            to={tabToPath(t.id)}
            className={({ isActive }) => `tab ${isActive ? 'on' : ''}`}
            onClick={() => addLog("view", t.id, "Mở tab " + t.label)}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon d={t.icon} s={13} />{t.label}
            </span>
          </NavLink>
        ))}
      </nav>
      {/* CONTENT */}
      <main style={{ padding: "18px 22px", maxWidth: 1380, margin: "0 auto" }} key={tab}>{renderTab()}</main>
      {/* FOOTER */}
      <footer style={{ padding: "10px 22px", borderTop: `1px solid ${T.cardBorder}`, textAlign: "center", fontSize: 10, color: T.textMuted }}>
        Menas DX © 2026 · {auth.currentUser?.name} ({ROLES[auth.currentUser?.role]?.label}) · {dbOn && dbCfg ? `DB: ${dbCfg.host}` : dbOn ? "DB connected" : "Demo"}{canExport ? " · Export ✓" : " · Export ✗"}
      </footer>
    </div>
  );
}
