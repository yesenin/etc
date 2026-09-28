import { answerKeys } from "../keys";
import { Question } from "../pronouns";

export function QuestionCard({
  question,
  answered,
  choice,
  onChoose,
  header,
  children,
}: {
  question: Question;
  answered: boolean;
  choice: string | null;
  onChoose: (choice: string) => void;
  header?: React.ReactNode;
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:gap-5 sm:p-6">
      {header}

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-zinc-400">владелец</span>
          <span className="font-serif text-4xl">{question.owner.label}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-zinc-400">предмет</span>
          <span className="font-serif text-4xl">{question.object.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {question.options.map((option, index) => {
          let tone = "border-zinc-300 hover:border-zinc-900";
          if (answered) {
            if (option === question.answer) tone = "border-emerald-500 bg-emerald-50 text-emerald-700";
            else if (option === choice) tone = "border-red-500 bg-red-50 text-red-700";
            else tone = "border-zinc-200 text-zinc-400";
          }
          return (
            <button
              key={option}
              disabled={answered}
              onClick={() => onChoose(option)}
              className={`flex touch-manipulation flex-col items-center justify-center rounded-md border-2 py-4 font-mono text-base transition-colors sm:py-3 sm:text-lg ${tone}`}
            >
              {option}
              <span className="text-xs text-zinc-400 pointer-coarse:hidden">
                {index + 1} · {answerKeys[index][1]}
              </span>
            </button>
          );
        })}
      </div>

      {children}
    </section>
  );
}
