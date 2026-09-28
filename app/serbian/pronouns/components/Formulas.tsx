const genderColors: { [part: string]: string } = {
  м: "text-blue-600",
  ж: "text-red-600",
};

export function Formulas({ labels }: { labels: string[] }): React.ReactElement {
  return (
    <>
      {labels.map((label, i) => (
        <span key={label}>
          {i > 0 && ", "}
          {label.split("+").map((part, j) => (
            <span key={j}>
              {j > 0 && "+"}
              <span className={genderColors[part]}>{part}</span>
            </span>
          ))}
        </span>
      ))}
    </>
  );
}
