import Group from "./group";
import "./playoff.css";

function PlayOffPage() {
  const paths = (): string[] => {
    const result = [];

    //result.push(getPathFor(-4, -3, 250, 200));

    result.push(getPathFor(-3, -2, 250, 200));
    /*
    result.push(getPathFor(-2, -1, 250, 200));
    result.push(getPathFor(-1, 0, 250, 200));
    result.push(getPathFor(0, 1, 250, 200));
    result.push(getPathFor(1, 2, 250, 200));
    result.push(getPathFor(2, 3, 250, 200));
    result.push(getPathFor(3, 4, 250, 200));
    result.push(getPathFor(4, 5, 250, 200));
    result.push(getPathFor(5, 6, 250, 200));
    result.push(getPathFor(6, 7, 250, 200));
    result.push(getPathFor(7, 8, 250, 200));
    result.push(getPathFor(8, 9, 250, 200));
    result.push(getPathFor(9, 10, 250, 200));
    result.push(getPathFor(10, 11, 250, 200));
    result.push(getPathFor(11, 12, 250, 200));
    */

    result.push(getPathFor(-4, -2, 200, 150));
    /*
    result.push(getPathFor(-2, 0, 200, 150));
    result.push(getPathFor(0, 2, 200, 150));
    result.push(getPathFor(2, 4, 200, 150));
    result.push(getPathFor(4, 6, 200, 150));
    result.push(getPathFor(6, 8, 200, 150));
    result.push(getPathFor(8, 10, 200, 150));
    result.push(getPathFor(10, 12, 200, 150));

    result.push(getPathFor(-4, 0, 150, 100));
    result.push(getPathFor(0, 4, 150, 100));
    result.push(getPathFor(4, 8, 150, 100));
    result.push(getPathFor(8, 12, 150, 100));

    result.push(getPathFor(-4, 4, 100, 50));
    result.push(getPathFor(4, 12, 100, 50));
    */

    return result;
  };

  const getPathFor = (
    a1: number,
    a2: number,
    r1: number,
    r2: number,
  ): string => {
    const bigX = 260 + r1 * Math.cos((Math.PI / 8) * a1);
    const bigY = 260 + r1 * Math.sin((Math.PI / 8) * a1);

    const t_bigX = 260 + r1 * Math.cos((Math.PI / 8) * a2);
    const t_bigY = 260 + r1 * Math.sin((Math.PI / 8) * a2);

    const smallX = 260 + r2 * Math.cos((Math.PI / 8) * a2);
    const smallY = 260 + r2 * Math.sin((Math.PI / 8) * a2);

    const t_smallX = 260 + r2 * Math.cos((Math.PI / 8) * a1);
    const t_smallY = 260 + r2 * Math.sin((Math.PI / 8) * a1);
    return (
      `M ${bigX} ${bigY}` +
      `A ${r1} ${r1} 0 0 1 ${t_bigX} ${t_bigY}` +
      `L ${smallX} ${smallY}` +
      `A ${r2} ${r2} 0 0 0 ${t_smallX} ${t_smallY}` +
      "Z"
    );
  };

  const getTier1 = () => {
    const sectors = [
      { color: "#1F77B4", a1: -4, a2: -3 },
      { color: "#FF7F0E", a1: -3, a2: -2 },
      { color: "#2CA02C", a1: -2, a2: -1 },
      { color: "#D62728", a1: -1, a2: 0 },
      { color: "#9467BD", a1: 0, a2: 1 },
      { color: "#8C564B", a1: 1, a2: 2 },
      { color: "#E377C2", a1: 2, a2: 3 },
      { color: "#7F7F7F", a1: 3, a2: 4 },
      { color: "#BCBD22", a1: 4, a2: 5 },
      { color: "#17BECF", a1: 5, a2: 6 },
      { color: "#0B1320", a1: 6, a2: 7 },
      { color: "#F2E9E4", a1: 7, a2: 8 },
      { color: "#4A90E2", a1: 8, a2: 9 },
      { color: "#50E3C2", a1: 9, a2: 10 },
      { color: "#F5A623", a1: 10, a2: 11 },
      { color: "#B8E986", a1: 11, a2: 12 },
    ];
    return sectors.map((g, i: number) => (
      <Group key={i} color={g.color} t1={{ a1: g.a1, a2: g.a2 }} />
    ));
  };

  return (
    <div>
      <h2>Playoff</h2>
      <div>
        <svg>
          <circle cx={260} cy={260} r={250} className="simplePath" />
          <circle cx={260} cy={260} r={200} className="simplePath" />
          <circle cx={260} cy={260} r={150} className="simplePath" />
          <circle cx={260} cy={260} r={100} className="simplePath" />
          <circle cx={260} cy={260} r={50} className="simplePath" />

          <Group
            name="Alcaraz 1"
            color="#1F77B4"
            t1={{ a1: -4, a2: -3 }}
            t2={{ a1: -4, a2: -2 }}
            t3={{ a1: -4, a2: 0 }}
            t4={{ a1: -4, a2: 4 }}
            t5
          />
          <Group name="Paul" color="#FF7F0E" t1={{ a1: -3, a2: -2 }} />
          <Group name="Bublik 10" color="#2CA02C" t1={{ a1: -2, a2: -1 }} />
          <Group
            name="de Minaur"
            color="#D62728"
            t1={{ a1: -1, a2: 0 }}
            t2={{ a1: -2, a2: 0 }}
          />
          <Group name="Medvedev 11" color="#9467BD" t1={{ a1: 0, a2: 1 }} />
          <Group
            name="Tien"
            color="#8C564B"
            t1={{ a1: 1, a2: 2 }}
            t2={{ a1: 0, a2: 2 }}
          />
          <Group
            name="Zverev 3"
            color="#E377C2"
            t1={{ a1: 2, a2: 3 }}
            t2={{ a1: 2, a2: 4 }}
            t3={{ a1: 0, a2: 4 }}
          />
          <Group name="Cerundolo" color="#7F7F7F" t1={{ a1: 3, a2: 4 }} />

          <Group
            name="Musetti 5"
            color="#BCBD22"
            t1={{ a1: 4, a2: 5 }}
            t2={{ a1: 4, a2: 6 }}
          />
          <Group name="Fritz" color="#17BECF" t1={{ a1: 5, a2: 6 }} />
          <Group name="Mensik" color="#0B1320" t1={{ a1: 6, a2: 7 }} />
          <Group
            name="Djokovic"
            color="#F2E9E4"
            t1={{ a1: 7, a2: 8 }}
            t2={{ a1: 6, a2: 8 }}
            t3={{ a1: 4, a2: 8 }}
          />
          <Group name="Shelton" color="#4A90E2" t1={{ a1: 8, a2: 9 }} />
          <Group
            name="Ruud"
            color="#50E3C2"
            t1={{ a1: 9, a2: 10 }}
            t2={{ a1: 8, a2: 10 }}
            t3={{ a1: 8, a2: 12 }}
            t4={{ a1: 4, a2: 12 }}
          />
          <Group
            name="Darderi"
            color="#F5A623"
            t1={{ a1: 10, a2: 11 }}
            t2={{ a1: 10, a2: 12 }}
          />
          <Group name="Sinner" color="#B8E986" t1={{ a1: 11, a2: 12 }} />
        </svg>
      </div>
    </div>
  );
}

export default PlayOffPage;
