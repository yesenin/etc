"use client";

import { useCallback, useEffect, useState } from "react";
import { formNames, Question } from "../pronouns";
import {
  initialProgress,
  nextQuestion,
  Progress,
  record,
  stageProgress,
  stages,
  UNLOCK_SHARE,
} from "../trainer";
import { answerIndex } from "../keys";
import { buttonClass, panelClass } from "../styles";
import { QuestionCard } from "./QuestionCard";
import { Stat } from "./Stat";

const STORAGE_KEY = "serbian-pronouns-training";
const continueKeys = ["Enter", " ", "ArrowUp"];

interface Session {
  progress: Progress;
  question: Question;
  cell: string;
  answered: number;
  correct: number;
  feedback: { choice: string; correct: boolean; levelUp: boolean } | null;
}

function loadProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (typeof saved?.stage === "number" && typeof saved?.boxes === "object") {
      return { stage: Math.min(saved.stage, stages.length - 1), boxes: saved.boxes };
    }
  } catch {
    // Storage unavailable or corrupted — start fresh.
  }
  return initialProgress;
}

function newSession(progress: Progress): Session {
  return { progress, ...nextQuestion(progress, null, 0), answered: 0, correct: 0, feedback: null };
}

export function Training(): React.ReactElement {
  const [session, setSession] = useState<Session | null>(null);

  const start = useCallback(() => setSession(newSession(loadProgress())), []);

  const reset = useCallback(() => {
    if (window.confirm("Сбросить прогресс обучения?")) setSession(newSession(initialProgress));
  }, []);

  const choose = useCallback(
    (choice: string) => {
      if (!session || session.feedback) return;
      const correct = choice === session.question.answer;
      const { progress, levelUp } = record(session.progress, session.cell, correct);
      setSession({
        ...session,
        progress,
        answered: session.answered + 1,
        correct: session.correct + (correct ? 1 : 0),
        feedback: { choice, correct, levelUp },
      });
    },
    [session],
  );

  const next = useCallback(() => {
    if (!session) return;
    const { question, cell } = nextQuestion(session.progress, session.cell, session.answered);
    setSession({ ...session, question, cell, feedback: null });
  }, [session]);

  const progress = session?.progress;
  useEffect(() => {
    if (!progress) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Progress just won't survive a reload.
    }
  }, [progress]);

  // Correct answers move on by themselves; mistakes and new stages wait for the
  // learner so there's time to read the explanation.
  const feedback = session?.feedback;
  const waiting = !!feedback && (!feedback.correct || feedback.levelUp);
  useEffect(() => {
    if (!feedback || waiting) return;
    const timer = setTimeout(next, 700);
    return () => clearTimeout(timer);
  }, [feedback, waiting, next]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!session) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
        return;
      }
      if (waiting) {
        if (continueKeys.includes(event.key)) {
          event.preventDefault();
          next();
        }
        return;
      }
      const index = answerIndex(event);
      if (index >= 0 && !session.feedback) {
        event.preventDefault();
        choose(session.question.options[index]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [session, waiting, start, next, choose]);

  if (!session) {
    return (
      <section className={panelClass}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
          <li>Без таймера и штрафов. Начинаем с moj/tvoj в единственном числе.</li>
          <li>
            Новые формулы появляются, когда почти на каждое правило из текущего набора (
            {UNLOCK_SHARE * 100}%) ответишь верно дважды подряд.
          </li>
          <li>Ошибки возвращаются чаще, пока не закрепятся.</li>
          <li className="pointer-coarse:hidden">
            Отвечать — 1, 2, 3 или ←, ↓, →. Дальше после ошибки — Enter, пробел или ↑.
          </li>
          <li>Прогресс сохраняется в браузере.</li>
        </ul>
        <button onClick={start} className={buttonClass}>
          Начать
        </button>
      </section>
    );
  }

  const { question } = session;
  const stage = session.progress.stage;
  const { mastered, total } = stageProgress(session.progress);
  const allDone = stage === stages.length - 1 && mastered === total;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 text-center font-mono">
        <Stat label="уровень" value={`${stage + 1}/${stages.length}`} />
        <Stat label="освоено" value={`${mastered}/${total}`} />
        <Stat
          label="точность"
          value={session.answered ? `${Math.round((session.correct / session.answered) * 100)}%` : "—"}
        />
      </div>

      <QuestionCard
        question={question}
        answered={!!feedback}
        choice={feedback?.choice ?? null}
        onChoose={choose}
        header={
          <div className="flex flex-col gap-2">
            <div className="text-sm text-zinc-500">
              {allDone ? "Всё освоено — свободная практика" : stages[stage].name}
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(mastered / total) * 100}%` }}
              />
              {/* Where the next stage unlocks */}
              <div
                className="absolute inset-y-0 w-0.5 bg-zinc-400"
                style={{ left: `${UNLOCK_SHARE * 100}%` }}
              />
            </div>
          </div>
        }
      >
        <div className="flex min-h-18 flex-col items-center justify-center gap-2 text-center text-sm">
          {feedback?.correct && !feedback.levelUp && <span className="text-emerald-600">Верно</span>}
          {feedback && !feedback.correct && (
            <span className="text-red-600">
              {question.owner.label} → <b>{question.owner.stem}</b> · {question.object.label} →{" "}
              {formNames[question.object.form]} → <b>{question.answer}</b>
            </span>
          )}
          {feedback?.levelUp && (
            <span className="text-blue-600">
              Верно! Новый уровень: <b>{stages[stage].name}</b>
            </span>
          )}
          {waiting && (
            <button onClick={next} className="touch-manipulation rounded-md border border-zinc-300 px-6 py-1.5 hover:border-zinc-900">
              Дальше
            </button>
          )}
        </div>
      </QuestionCard>

      <button onClick={reset} className="self-start text-xs text-zinc-400 hover:text-zinc-700">
        Сбросить прогресс
      </button>
    </>
  );
}
