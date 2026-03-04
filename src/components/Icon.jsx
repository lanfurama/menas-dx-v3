export const Icon = ({ d, s = 17, c = "currentColor" }) => {
  const segs = d.split(/\s(?=M)/);
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {segs.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
};
