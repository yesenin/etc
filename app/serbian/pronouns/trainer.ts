import { makeQuestion, ObjectKind, objects, Owner, ownerRow, owners, pick, Question } from "./pronouns";

// Leitner boxes per cell (rules-table row × object formula): correct answer moves
// the cell up a box, a mistake drops it to 0. Lower boxes are asked more often.
// A stage is passed when UNLOCK_SHARE of the cells in the pool reached
// MASTERED_BOX (two correct in a row). Requiring 100% made one slip anywhere
// block progress; these numbers were tuned by simulating learners.
const BOX_WEIGHTS = [8, 4, 1, 0.5, 0.25];
const MAX_BOX = BOX_WEIGHTS.length - 1;
const MASTERED_BOX = 2;
export const UNLOCK_SHARE = 0.9;

interface Stage {
  name: string;
  stems: string[];
  objects: string[];
}

export const stages: Stage[] = [
  { name: "моё и твоё", stems: ["moj", "tvoj"], objects: ["м", "ж", "с"] },
  { name: "его и её", stems: ["njegov", "njen"], objects: [] },
  { name: "множественное число", stems: [], objects: ["м+м", "ж+ж", "с+с"] },
  { name: "смешанные роды", stems: [], objects: ["м+ж", "м+с", "ж+с"] },
  { name: "наше", stems: ["naš"], objects: [] },
  { name: "ваше", stems: ["vaš"], objects: [] },
  { name: "их", stems: ["njihov"], objects: [] },
];

export interface Progress {
  stage: number;
  boxes: { [cell: string]: number };
}

export const initialProgress: Progress = { stage: 0, boxes: {} };

function cellKey(owner: Owner, object: ObjectKind): string {
  return `${ownerRow(owner)}|${object.label}`;
}

// Everything introduced up to and including `stage`; the last stage covers all
// data, so formulas added to pronouns.ts later still get trained.
function pool(stage: number): { [cell: string]: [Owner, ObjectKind][] } {
  const isLast = stage >= stages.length - 1;
  const passed = stages.slice(0, stage + 1);
  const poolOwners = owners.filter(
    (owner) => isLast || passed.some((s) => s.stems.includes(owner.stem)),
  );
  const poolObjects = objects.filter(
    (object) => isLast || passed.some((s) => s.objects.includes(object.label)),
  );

  const cells: { [cell: string]: [Owner, ObjectKind][] } = {};
  for (const owner of poolOwners) {
    for (const object of poolObjects) {
      (cells[cellKey(owner, object)] ??= []).push([owner, object]);
    }
  }
  return cells;
}

export function stageProgress(progress: Progress): { mastered: number; total: number } {
  const keys = Object.keys(pool(progress.stage));
  return {
    mastered: keys.filter((key) => (progress.boxes[key] ?? 0) >= MASTERED_BOX).length,
    total: keys.length,
  };
}

export function nextQuestion(
  progress: Progress,
  lastCell: string | null,
  id: number,
): { question: Question; cell: string } {
  const cells = pool(progress.stage);
  let keys = Object.keys(cells);
  if (keys.length > 1) keys = keys.filter((key) => key !== lastCell);

  const weights = keys.map((key) => BOX_WEIGHTS[progress.boxes[key] ?? 0]);
  let roll = Math.random() * weights.reduce((total, weight) => total + weight, 0);
  let cell = keys[keys.length - 1];
  for (let i = 0; i < keys.length; i++) {
    roll -= weights[i];
    if (roll < 0) {
      cell = keys[i];
      break;
    }
  }

  const [owner, object] = pick(cells[cell]);
  return { question: makeQuestion(id, owner, object), cell };
}

export function record(
  progress: Progress,
  cell: string,
  correct: boolean,
): { progress: Progress; levelUp: boolean } {
  const box = progress.boxes[cell] ?? 0;
  const updated: Progress = {
    ...progress,
    boxes: { ...progress.boxes, [cell]: correct ? Math.min(MAX_BOX, box + 1) : 0 },
  };
  const { mastered, total } = stageProgress(updated);
  if (mastered >= total * UNLOCK_SHARE && updated.stage < stages.length - 1) {
    return { progress: { ...updated, stage: updated.stage + 1 }, levelUp: true };
  }
  return { progress: updated, levelUp: false };
}
