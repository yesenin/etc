import { useHighScores } from "../highScores";
import { panelClass } from "../styles";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// Serbian style: 29.09.2026. 14:05
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return (
    `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}. ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function HighScores({ highlight }: { highlight?: number | null }): React.ReactElement {
  const scores = useHighScores();

  return (
    <section className={panelClass}>
      <h2 className="text-center font-mono text-sm uppercase tracking-[0.3em] text-zinc-500">
        Top 10
      </h2>
      {scores.length === 0 ? (
        <p className="text-center font-mono text-sm text-zinc-400">пока пусто</p>
      ) : (
        <ol className="flex flex-col font-mono text-sm">
          {scores.map((entry) => (
            <li
              key={entry.date}
              className={`flex gap-2 ${entry.date === highlight ? "animate-pulse font-bold text-emerald-600" : ""}`}
            >
              <span className="whitespace-nowrap">{formatDate(entry.date)}</span>
              <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-zinc-300">
                {".".repeat(80)}
              </span>
              <span className="whitespace-nowrap">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
