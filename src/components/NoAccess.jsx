import { T, ic } from '../constants/index.js';
import { Icon } from './Icon.jsx';

export const NoAccess = () => (
  <div className="no-access">
    <Icon d={ic.lock} s={48} c={T.textMuted} />
    <div style={{ fontSize: 16, fontWeight: 700, color: T.textSec, marginBottom: 6 }}>Không có quyền truy cập</div>
    <div style={{ fontSize: 13, color: T.textMuted }}>Liên hệ Admin để được cấp quyền xem module này</div>
  </div>
);
