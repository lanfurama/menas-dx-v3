import { T, ROLES, ALL_TABS, ic } from '../constants/index.js';
import { Icon } from './Icon.jsx';
import { Section } from './Section.jsx';
import { Toggle } from './Toggle.jsx';

export const PermEditor = ({ uid, users, setUsers, close }) => {
  const u = users.find(x => x.id === uid);
  if (!u) return null;
  
  const upd = (field, val) => setUsers(p => p.map(x => x.id === uid ? { ...x, ...(typeof field === 'string' ? { [field]: val } : field) } : x));
  
  const togTab = (tabId) => {
    const cur = u.permissions.tabs || [];
    const nxt = cur.includes(tabId) ? cur.filter(t => t !== tabId) : [...cur, tabId];
    upd({ permissions: { ...u.permissions, tabs: nxt } });
  };
  
  const togExp = () => upd({ permissions: { ...u.permissions, canExport: !u.permissions.canExport } });
  
  return (
    <div className="card fu" style={{ borderColor: T.accent + "40" }}>
      <Section icon={ic.key} title={"Phân quyền: " + u.name}>
        <button className="btn btn-g btn-sm" onClick={close}><Icon d={ic.x} s={11} /></button>
      </Section>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <span className="label-sm">Vai trò</span>
          <select className="inp" value={u.role} onChange={e => {
            const r = e.target.value;
            const rp = ROLES[r];
            upd({ role: r, permissions: { tabs: rp.tabs, canExport: rp.canExport } });
          }}>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div>
          <span className="label-sm">Trạng thái</span>
          <select className="inp" value={u.status} onChange={e => upd('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <span className="label-sm">Modules được truy cập</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginTop: 6 }}>
          {ALL_TABS.map(t => (
            <div key={t.id} className="perm-row">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon d={t.icon} s={13} c={u.permissions.tabs?.includes(t.id) ? T.accent : T.textMuted} />
                <span style={{ fontSize: 12, color: u.permissions.tabs?.includes(t.id) ? T.text : T.textMuted }}>{t.label}</span>
              </div>
              <Toggle on={u.permissions.tabs?.includes(t.id)} onClick={() => togTab(t.id)} />
            </div>
          ))}
        </div>
      </div>
      <div className="perm-row" style={{ background: u.permissions.canExport ? T.warning + "08" : T.surface, border: "1px solid " + (u.permissions.canExport ? T.warning : T.cardBorder) + "40", borderRadius: 10, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: T.warning + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ic.download} s={16} c={T.warning} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Quyền Export dữ liệu</div>
            <div style={{ fontSize: 11, color: T.textSec }}>Cho phép tải CSV, Excel từ báo cáo</div>
          </div>
        </div>
        <Toggle on={u.permissions.canExport} onClick={togExp} />
      </div>
    </div>
  );
};
