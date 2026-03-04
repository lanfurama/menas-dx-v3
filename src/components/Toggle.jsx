export const Toggle = ({ on, onClick }) => (
  <button className={`toggle ${on ? 'on' : ''}`} onClick={onClick} />
);
