import "./playoff.css";

export interface Tier {
  a1: number;
  a2: number;
}

interface GroupProps {
  name: string;
  color: string;
  t1: Tier;
  t2?: Tier;
  t3?: Tier;
  t4?: Tier;
  t5?: boolean;
}

function Group(props: GroupProps) {
  const { name, color, t1, t2, t3, t4, t5 } = props;
  const getArc = (r1: number, r2: number, t: Tier) => {
    const { a1, a2 } = t;
    const bigX1 = 260 + r1 * Math.cos((Math.PI / 8) * a1);
    const bigY1 = 260 + r1 * Math.sin((Math.PI / 8) * a1);

    const bigX2 = 260 + r1 * Math.cos((Math.PI / 8) * a2);
    const bigY2 = 260 + r1 * Math.sin((Math.PI / 8) * a2);

    const smallX1 = 260 + r2 * Math.cos((Math.PI / 8) * a2);
    const smallY1 = 260 + r2 * Math.sin((Math.PI / 8) * a2);

    const smallX2 = 260 + r2 * Math.cos((Math.PI / 8) * a1);
    const smallY2 = 260 + r2 * Math.sin((Math.PI / 8) * a1);

    return (
      <path
        d={
          `M ${bigX1} ${bigY1}` +
          `A ${r1} ${r1} 0 0 1 ${bigX2} ${bigY2}` +
          `L ${smallX1} ${smallY1}` +
          `A ${r2} ${r2} 0 0 0 ${smallX2} ${smallY2}` +
          "Z"
        }
        style={{ fill: color }}
      />
    );
  };
  return (
    <g className="debugPath">
      <title>{name}</title>
      {getArc(250, 200, t1)}
      {t2 && getArc(200, 150, t2!)}
      {t3 && getArc(150, 100, t3!)}
      {t4 && getArc(100, 50, t4!)}
      {t5 && <circle cx={260} cy={260} r={50} fill={color} />}
    </g>
  );
}

export default Group;
