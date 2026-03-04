import { Icon } from './Icon.jsx';
import { ic, T } from '../constants/index.js';
import { exportCSV } from '../utils/export.js';

export const ExportBtn = ({ canExport, onClick, data: expData, filename }) => {
  const handleClick = () => {
    if (onClick) { onClick(); return; }
    if (expData && expData.length) exportCSV(expData, filename || "menas_export");
  };
  return canExport
    ? (<button className="btn btn-g btn-sm" onClick={handleClick}><Icon d={ic.download} s={12} /> Export</button>)
    : (<button className="btn btn-sm" disabled style={{ opacity: .3, background: "transparent", color: T.textMuted, border: "1px solid " + T.cardBorder, cursor: "not-allowed" }} title="Bạn không có quyền Export"><Icon d={ic.lock} s={11} /> Export</button>);
};
