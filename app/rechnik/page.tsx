"use client";

import { useRef, useState } from "react";
import { cases, lookup, numbers, pageUrl, splitStress, type Declension, type Lookup, type Meaning, type Wiki } from "./wiktionary";

const panelClass = "flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: Lookup };

function Source({ wiki, word }: { wiki: Wiki; word: string }): React.ReactElement {
  return (
    <a
      href={pageUrl(wiki, word)}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-zinc-400 hover:text-zinc-900"
    >
      {wiki}.wiktionary.org ↗
    </a>
  );
}

function Panel({
  title,
  wiki,
  word,
  collapsible = false,
  children,
}: {
  title: string;
  wiki: Wiki;
  word: string;
  collapsible?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  if (collapsible) {
    return (
      <details className={`group ${panelClass}`}>
        <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <h2 className="font-serif text-xl">
            <span className="mr-2 inline-block text-sm text-zinc-400 transition-transform group-open:rotate-90">
              ▸
            </span>
            {title}
          </h2>
          <Source wiki={wiki} word={word} />
        </summary>
        <div className="mt-3">{children}</div>
      </details>
    );
  }
  return (
    <section className={panelClass}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-xl">{title}</h2>
        <Source wiki={wiki} word={word} />
      </div>
      {children}
    </section>
  );
}

function Meanings({ meanings }: { meanings: Meaning[] | null }): React.ReactElement {
  if (!meanings || meanings.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        {meanings ? "На странице нет значения для сербского существительного или местоимения." : "Такой страницы нет."}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {meanings.map(({ label, text }, index) => (
        <li key={index} className="flex gap-2">
          {label && <span className="shrink-0 tabular-nums text-zinc-400">{label}</span>}
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

function Stressed({ text }: { text: string }): React.ReactElement {
  return (
    <>
      {splitStress(text).map((segment, index) =>
        segment.stressed ? (
          <u key={index} className="decoration-zinc-400 underline-offset-4">
            {segment.text}
          </u>
        ) : (
          segment.text
        ),
      )}
    </>
  );
}

function DeclensionTable({ declension }: { declension: Declension }): React.ReactElement {
  const { headword, gender, glosses, forms } = declension;
  const columns = numbers.filter(({ id }) => cases.some((item) => forms[item.id]?.[id]));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-serif text-lg">
          <Stressed text={headword} />
        </span>
        {gender && gender !== "?" && <span className="text-sm italic text-zinc-500">{gender}</span>}
        {glosses.length > 0 && <span className="text-sm text-zinc-500">— {glosses.join("; ")}</span>}
      </div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-200 text-sm text-zinc-500">
            <th className="py-1.5 pr-3 font-normal" />
            {columns.map(({ id, label }) => (
              <th key={id} className="py-1.5 pr-3 font-normal">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map(({ id, label, question }) => (
            <tr key={id} className="border-b border-zinc-100 last:border-0">
              <th className="py-1.5 pr-3 align-top font-normal">
                <span className="block text-sm">{label}</span>
                <span className="block text-xs text-zinc-400">{question}</span>
              </th>
              {columns.map((column) => (
                <td key={column.id} className="py-1.5 pr-3 align-top">
                  <Stressed text={forms[id]?.[column.id] ?? "—"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Declensions({ declensions }: { declensions: Declension[] | null }): React.ReactElement {
  if (!declensions || declensions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        {declensions ? "На странице нет подходящей таблицы склонения (существительное или личное местоимение)." : "Такой страницы нет."}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {declensions.map((declension, index) => (
        <DeclensionTable key={index} declension={declension} />
      ))}
    </div>
  );
}

export default function RechnikPage(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const request = useRef<AbortController | null>(null);

  async function search(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    const word = query.trim();
    if (!word) return;

    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ status: "loading" });

    try {
      const result = await lookup(word, controller.signal);
      if (!controller.signal.aborted) setState({ status: "done", result });
    } catch (error) {
      if (controller.signal.aborted) return;
      setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }

  return (
    <div className="flex min-h-dvh justify-center bg-zinc-50 px-4 py-4 font-sans text-zinc-900 sm:py-10">
      <main className="flex w-full max-w-xl flex-col gap-3 sm:gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl sm:text-3xl">Rečnik</h1>
          <p className="text-sm text-zinc-500">
            Сербские существительные и местоимения: значение и склонение по падежам из Викисловаря.
          </p>
        </header>

        <form onSubmit={search} className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="кућа или kuća"
            aria-label="Слово"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            lang="sr"
            className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-lg outline-none focus:border-zinc-900"
          />
          <button
            type="submit"
            disabled={state.status === "loading"}
            className="rounded-md bg-zinc-900 px-5 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            Найти
          </button>
        </form>

        {state.status === "loading" && <p className="text-sm text-zinc-500">Ищу…</p>}
        {state.status === "error" && (
          <p className="text-sm text-red-700">Не удалось загрузить: {state.message}</p>
        )}
        {state.status === "done" && (
          <>
            <Panel key={state.result.word} title="Značenje" wiki="sr" word={state.result.word} collapsible>
              <Meanings meanings={state.result.meanings} />
            </Panel>
            <Panel title="Padeži" wiki="en" word={state.result.word}>
              <Declensions declensions={state.result.declensions} />
            </Panel>
          </>
        )}
      </main>
    </div>
  );
}
