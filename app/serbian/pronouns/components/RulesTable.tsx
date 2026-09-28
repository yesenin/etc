import { decline, Form, objects, ownerRow, owners } from "../pronouns";
import { Formulas } from "./Formulas";

// Built from the game data, so the table always matches what the game checks.
const ruleRows = Object.values(Object.groupBy(owners, ownerRow)).map((group) => group!);
const ruleForms = [...new Set(objects.map((object) => object.form))];

export function RulesTable(): React.ReactElement {
  return (
    <details className="rounded-lg border border-zinc-200 bg-white">
      <summary className="cursor-pointer select-none px-4 py-3 font-medium sm:px-6">Правила</summary>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        {/* Scrolls sideways on narrow phones; the owner column stays pinned. */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 border-l border-t border-zinc-200 font-mono text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-white p-1 text-left text-xs font-normal text-zinc-400 sm:p-2">
                  владелец ↓ / предмет →
                </th>
                {ruleForms.map((form: Form) => (
                  <th key={form} className="border-b border-r border-zinc-200 p-1 sm:p-2 text-xs font-normal text-zinc-500">
                    <Formulas labels={objects.filter((object) => object.form === form).map((object) => object.label)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ruleRows.map((group) => (
                <tr key={group[0].label}>
                  <td className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-white p-1 text-xs text-zinc-500 sm:p-2">
                    <Formulas labels={group.map((owner) => owner.label)} />
                  </td>
                  {ruleForms.map((form) => (
                    <td key={form} className="border-b border-r border-zinc-200 p-1 sm:p-2 text-center">
                      {decline(group[0].stem, form)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Смешанные роды → мужской род мн. ч.; только ж → женский мн. ч.; только с → средний мн. ч.
          В формуле владельца «я» даёт moj/naš, иначе «ты» — tvoj/vaš, иначе третье лицо.
        </p>
      </div>
    </details>
  );
}
