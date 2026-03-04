import { T, ic } from '../constants/index.js';
import { Icon } from './Icon.jsx';

export const Tier = ({ t }) => {
  const c = { Platinum: "#e0e0e0", Gold: "#c8965a", Silver: "#8888a0" }[t] || T.info;
  return (
    <span className="badge" style={{ background: c + "20", color: c }}>
      <Icon d={ic.star} s={9} c={c} /> {t}
    </span>
  );
};
