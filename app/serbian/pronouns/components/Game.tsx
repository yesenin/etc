"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { addHighScore } from "../highScores";
import { makeQuestion, Question } from "../pronouns";
import { answerIndex } from "../keys";
import { buttonClass, panelClass } from "../styles";
import { HighScores } from "./HighScores";
import { QuestionCard } from "./QuestionCard";
import { Stat } from "./Stat";

const START_LIVES = 3;
const MAX_LIVES = 5;
const START_TIME = 8000;
const MIN_TIME = 2000;
const TIME_DECAY = 0.95;
const STREAK_BONUS_EVERY = 10;
const STREAK_BONUS_POINTS = 50;
const WRONG_PENALTY = 20;

function timeForRound(round: number): number {
  return Math.max(MIN_TIME, START_TIME * TIME_DECAY ** round);
}

interface Feedback {
  choice: string | null;
  correct: boolean;
  points: number;
  bonus: boolean;
  remaining: number;
}

interface State {
  phase: "idle" | "playing" | "over";
  question: Question | null;
  round: number;
  duration: number;
  deadline: number;
  now: number;
  score: number;
  lives: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  feedback: Feedback | null;
}

type Action =
  | { type: "start"; question: Question; now: number }
  | { type: "answer"; choice: string | null; now: number }
  | { type: "tick"; now: number }
  | { type: "next"; question: Question; now: number };

const initialState: State = {
  phase: "idle",
  question: null,
  round: 0,
  duration: START_TIME,
  deadline: 0,
  now: 0,
  score: 0,
  lives: START_LIVES,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  feedback: null,
};

function answer(state: State, choice: string | null, now: number): State {
  if (state.phase !== "playing" || state.feedback || !state.question) {
    return state;
  }
  const remaining = Math.max(0, state.deadline - now);

  if (choice === state.question.answer) {
    const streak = state.streak + 1;
    const bonus = streak % STREAK_BONUS_EVERY === 0;
    const points = 10 + Math.ceil(remaining / 1000) + (bonus ? STREAK_BONUS_POINTS : 0);
    return {
      ...state,
      now,
      score: state.score + points,
      lives: bonus ? Math.min(MAX_LIVES, state.lives + 1) : state.lives,
      streak,
      bestStreak: Math.max(state.bestStreak, streak),
      correctCount: state.correctCount + 1,
      feedback: { choice, correct: true, points, bonus, remaining },
    };
  }

  const points = -Math.min(WRONG_PENALTY, state.score);
  return {
    ...state,
    now,
    score: state.score + points,
    lives: state.lives - 1,
    streak: 0,
    feedback: { choice, correct: false, points, bonus: false, remaining },
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return {
        ...initialState,
        phase: "playing",
        question: action.question,
        duration: timeForRound(0),
        deadline: action.now + timeForRound(0),
        now: action.now,
      };
    case "answer":
      return answer(state, action.choice, action.now);
    case "tick":
      if (state.phase === "playing" && !state.feedback && action.now >= state.deadline) {
        return answer(state, null, action.now);
      }
      return { ...state, now: action.now };
    case "next": {
      if (state.lives <= 0) {
        return { ...state, phase: "over", feedback: null };
      }
      const round = state.round + 1;
      return {
        ...state,
        round,
        question: action.question,
        duration: timeForRound(round),
        deadline: action.now + timeForRound(round),
        now: action.now,
        feedback: null,
      };
    }
  }
}

export function Game(): React.ReactElement {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [lastScoreDate, setLastScoreDate] = useState<number | null>(null);
  const { phase, question, feedback } = state;

  const start = useCallback(() => {
    setLastScoreDate(null);
    dispatch({ type: "start", question: makeQuestion(0), now: Date.now() });
  }, []);

  const choose = useCallback((choice: string) => {
    dispatch({ type: "answer", choice, now: Date.now() });
  }, []);

  useEffect(() => {
    if (phase !== "playing" || feedback) return;
    const timer = setInterval(() => dispatch({ type: "tick", now: Date.now() }), 50);
    return () => clearInterval(timer);
  }, [phase, feedback]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(
      () => {
        if (state.lives <= 0 && state.score > 0) {
          const date = Date.now();
          addHighScore({ score: state.score, date });
          setLastScoreDate(date);
        }
        dispatch({ type: "next", question: makeQuestion(state.round + 1), now: Date.now() });
      },
      feedback.correct ? 600 : 1600,
    );
    return () => clearTimeout(timer);
  }, [feedback, state.round, state.lives, state.score]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (phase !== "playing") {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
        return;
      }
      const index = answerIndex(event);
      if (index >= 0 && question) {
        event.preventDefault();
        choose(question.options[index]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, question, start, choose]);

  const remaining = feedback ? feedback.remaining : Math.max(0, state.deadline - state.now);
  const timeFraction = state.duration > 0 ? remaining / state.duration : 0;

  return (
    <>
      {phase === "idle" && (
        <section className={panelClass}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>С каждым раундом времени на ответ всё меньше.</li>
            <li>Ошибка или истёкшее время — минус жизнь и −{WRONG_PENALTY} очков.</li>
            <li>
              {STREAK_BONUS_EVERY} правильных подряд — +{STREAK_BONUS_POINTS} очков и +1 жизнь.
            </li>
            <li className="pointer-coarse:hidden">Отвечать можно клавишами 1, 2, 3 или стрелками ←, ↓, →.</li>
          </ul>
          <button onClick={start} className={buttonClass}>
            Начать
          </button>
        </section>
      )}

      {phase === "idle" && <HighScores />}

      {phase !== "idle" && (
        <div className="grid grid-cols-4 gap-2 text-center font-mono">
          <Stat label="очки" value={state.score} />
          <Stat
            label="жизни"
            value={"♥".repeat(Math.max(0, state.lives)) || "—"}
            className="text-red-500"
          />
          <Stat label="серия" value={`${state.streak % STREAK_BONUS_EVERY}/${STREAK_BONUS_EVERY}`} />
          <Stat label="раунд" value={state.round + 1} />
        </div>
      )}

      {phase === "playing" && question && (
        <QuestionCard
          question={question}
          answered={!!feedback}
          choice={feedback?.choice ?? null}
          onChoose={choose}
          header={
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className={`h-full ${timeFraction < 0.3 ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${timeFraction * 100}%` }}
              />
            </div>
          }
        >
          <div className="h-6 text-center text-sm">
            {feedback?.correct && (
              <span className="text-emerald-600">
                +{feedback.points}
                {feedback.bonus && " · серия из 10! +1 ♥"}
              </span>
            )}
            {feedback && !feedback.correct && (
              <span className="text-red-600">
                {feedback.choice === null ? "Время вышло" : "Неверно"}: {question.owner.label} +{" "}
                {question.object.label} → <b>{question.answer}</b>
              </span>
            )}
          </div>
        </QuestionCard>
      )}

      {phase === "over" && (
        <section className={panelClass}>
          <h2 className="font-serif text-2xl">Kraj igre</h2>
          <p className="text-zinc-700">
            Очки: <b>{state.score}</b> · правильных ответов: <b>{state.correctCount}</b> · лучшая
            серия: <b>{state.bestStreak}</b>
          </p>
          <button onClick={start} className={buttonClass}>
            Ещё раз
          </button>
        </section>
      )}

      {phase === "over" && <HighScores highlight={lastScoreDate} />}
    </>
  );
}
