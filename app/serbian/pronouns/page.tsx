"use client";

import Link from "next/link";
import { useState } from "react";
import { Game } from "./components/Game";
import { RulesTable } from "./components/RulesTable";
import { Training } from "./components/Training";

const modes = [
  { id: "training", label: "Обучение" },
  { id: "game", label: "Игра" },
] as const;

export default function SerbianPronounsPage(): React.ReactElement {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("training");

  return (
    <div className="flex min-h-dvh justify-center bg-zinc-50 px-4 py-4 font-sans text-zinc-900 sm:py-10">
      <main className="flex w-full max-w-xl flex-col gap-3 sm:gap-6">
        <header className="flex flex-col gap-1">
          <Link href="/serbian" className="self-start text-sm text-zinc-400 hover:text-zinc-900">
            ← Srpski
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl">Prisvojne zamenice</h1>
          <p className="hidden text-sm text-zinc-500 sm:block">
            Кто владелец и что за предмет — выбери правильное притяжательное местоимение.
          </p>
        </header>

        <div className="flex gap-1 self-start rounded-lg bg-zinc-200 p-1 text-sm">
          {modes.map(({ id, label }) => (
            <button
              key={id}
              onClick={(event) => {
                setMode(id);
                // Keep Enter/Space from re-clicking the tab instead of reaching the game.
                event.currentTarget.blur();
              }}
              className={`touch-manipulation rounded-md px-4 py-1 sm:py-1.5 ${mode === id ? "bg-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "training" ? <Training /> : <Game />}

        <RulesTable />
      </main>
    </div>
  );
}
