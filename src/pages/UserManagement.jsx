import { T, ic, ROLES } from '../constants/index.js';
import { Icon } from '../components/Icon.jsx';
import { PermEditor } from '../components/PermEditor.jsx';

export function UserManagement({ auth }) {
  return (
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
  );
}
