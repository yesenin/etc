"use client";

import { useRef, useState } from "react";
import { defaultOrder, setOrder, useOrder } from "./order";
import { Code, currencies, useRates } from "./rates";

const names = Object.fromEntries(currencies.map(({ code, name }) => [code, name])) as Record<Code, string>;

const skeletonClass = "animate-pulse rounded bg-zinc-200";

function parseAmount(text: string): number | null {
  const cleaned = text.replace(/\s/g, "").replace(",", ".");
  const amount = Number(cleaned);
  return cleaned === "" || Number.isNaN(amount) ? null : amount;
}

function formatAmount(amount: number): string {
  // Small amounts (a few drams in euros) would otherwise round to zero.
  return amount.toLocaleString("ru-RU", { maximumFractionDigits: Math.abs(amount) < 1 ? 4 : 2 });
}

export default function XccyPage(): React.ReactElement {
  const { rates, failed } = useRates();
  // Until the saved order is known the page is a skeleton of itself: same rows, same
  // sizes, grey bars instead of content — so nothing jumps once the real state arrives.
  const savedOrder = useOrder();
  const ready = savedOrder !== null;
  const order = savedOrder ?? defaultOrder;
  // The field the user typed into last; every other field is derived from it.
  const [source, setSource] = useState<{ code: Code; text: string }>({ code: "EUR", text: "100" });
  // The row being dragged: how far the pointer has carried it (dy) and the distance between rows (step).
  const [drag, setDrag] = useState<{ code: Code; startY: number; dy: number; step: number } | null>(null);
  const moved = useRef(false);

  const amount = parseAmount(source.text);

  // The DOM order stays put during a drag — rows are only shifted with transforms —
  // and the new order is committed on drop.
  const from = drag ? order.indexOf(drag.code) : -1;
  const to = drag ? from + Math.round(drag.dy / drag.step) : -1;

  return (
    <div className="flex min-h-dvh justify-center bg-zinc-50 px-4 py-4 font-sans text-zinc-900 sm:py-10">
      <main className="flex w-full max-w-2xl flex-col gap-3 sm:gap-4">
        <h1 className="font-serif text-2xl sm:text-3xl">Валюты</h1>

        {order.map((code, index) => {
          const isSource = ready && code === source.code;
          let value = "";
          if (isSource) value = source.text;
          else if (ready && rates && amount !== null)
            value = formatAmount((amount / rates.perUsd[source.code]) * rates.perUsd[code]);
          // The value is on its way: show a bar rather than an empty field.
          const pending = !ready || (!isSource && !rates && !failed);

          let shift = 0;
          let dragClass = "";
          if (drag) {
            if (index === from) {
              shift = drag.dy;
              dragClass = "z-10 shadow-lg";
            } else {
              // Rows between the old and the new slot step aside.
              if (index > from && index <= to) shift = -drag.step;
              else if (index < from && index >= to) shift = drag.step;
              dragClass = "transition-transform duration-150";
            }
          }

          return (
            <label
              key={code}
              style={shift ? { transform: `translateY(${shift}px)` } : undefined}
              className={`relative flex cursor-text items-center gap-3 rounded-lg border-2 pr-4 focus-within:border-zinc-900 sm:pr-6 ${isSource ? "border-amber-400 bg-amber-50" : "border-zinc-200 bg-white"} ${dragClass}`}
            >
              <span
                title="Перетащите, чтобы изменить порядок"
                className={`flex touch-none select-none items-center gap-2 self-stretch py-3 pl-2 sm:gap-3 sm:py-5 sm:pl-3 ${drag?.code === code ? "cursor-grabbing" : "cursor-grab"}`}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  const row = event.currentTarget.parentElement!;
                  const gap = parseFloat(getComputedStyle(row.parentElement!).rowGap) || 0;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  moved.current = false;
                  setDrag({ code, startY: event.clientY, dy: 0, step: row.offsetHeight + gap });
                }}
                onPointerMove={(event) => {
                  if (drag?.code !== code) return;
                  const dy = Math.max(
                    -index * drag.step,
                    Math.min((order.length - 1 - index) * drag.step, event.clientY - drag.startY),
                  );
                  if (Math.abs(dy) > 4) moved.current = true;
                  setDrag({ ...drag, dy });
                }}
                onPointerUp={() => {
                  if (drag?.code !== code) return;
                  if (to !== from) {
                    const next = order.filter((other) => other !== code);
                    next.splice(to, 0, code);
                    setOrder(next);
                  }
                  setDrag(null);
                }}
                onPointerCancel={() => setDrag(null)}
                onClick={(event) => {
                  // A plain tap focuses the field as usual; the click that ends a drag shouldn't.
                  if (moved.current) event.preventDefault();
                }}
              >
                <svg viewBox="0 0 8 14" aria-hidden className="h-4 w-2.5 fill-zinc-300 sm:h-5 sm:w-3">
                  {[2, 7, 12].flatMap((y) => [2, 6].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" />))}
                </svg>
                <span className="flex flex-col">
                  <span
                    className={`text-2xl font-semibold sm:text-4xl ${ready ? "" : `${skeletonClass} text-transparent`}`}
                  >
                    {code}
                  </span>
                  <span
                    className={`hidden whitespace-nowrap text-xs text-zinc-400 sm:block ${ready ? "" : "invisible"}`}
                  >
                    {names[code]}
                  </span>
                </span>
              </span>
              {pending && <span className={`ml-auto h-8 w-28 shrink-0 sm:h-12 sm:w-48 ${skeletonClass}`} />}
              <input
                inputMode="decimal"
                autoComplete="off"
                aria-label={names[code]}
                placeholder={isSource || rates ? "0" : "—"}
                value={value}
                disabled={!ready}
                onChange={(event) =>
                  setSource({ code, text: event.target.value.replace(/[^\d\s.,]/g, "") })
                }
                // Typing into a field replaces the converted value instead of appending to it.
                onFocus={(event) => event.target.select()}
                // While the bar is shown the field is still there to tap into, just not visible.
                className={`min-w-0 bg-transparent text-right text-4xl tabular-nums outline-none placeholder:text-zinc-300 sm:text-6xl ${pending ? "absolute inset-y-0 right-0 h-full w-1/2 opacity-0" : "flex-1"}`}
              />
            </label>
          );
        })}

        <p className="flex flex-wrap items-center gap-x-1 text-xs text-zinc-400">
          {ready && rates ? (
            <span>
              Курс на{" "}
              {new Date(rates.updated).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              {failed && " — обновить не удалось"}
            </span>
          ) : failed ? (
            <span>Не удалось загрузить курсы</span>
          ) : (
            <span className={`h-3 w-36 ${skeletonClass}`} />
          )}
          <span>·</span>
          <a href="https://www.exchangerate-api.com" className="underline hover:text-zinc-900">
            Rates By Exchange Rate API
          </a>
        </p>
      </main>
    </div>
  );
}
