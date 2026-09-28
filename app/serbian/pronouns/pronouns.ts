// Form index: 0 m sg, 1 ž sg, 2 s sg, 3 m pl, 4 ž pl, 5 s pl
export type Form = 0 | 1 | 2 | 3 | 4 | 5;

export const formNames = ["м. ед.", "ж. ед.", "с. ед.", "м. мн.", "ж. мн.", "с. мн."];

export interface Owner {
  label: string;
  stem: string;
}

export interface ObjectKind {
  label: string;
  form: Form;
}

const stems: { [stem: string]: string[] } = {
  moj: ["", "a", "e", "i", "e", "a"],
  tvoj: ["", "a", "e", "i", "e", "a"],
  naš: ["", "a", "e", "i", "e", "a"],
  vaš: ["", "a", "e", "i", "e", "a"],
  njegov: ["", "a", "o", "i", "e", "a"],
  njen: ["", "a", "o", "i", "e", "a"],
  njihov: ["", "a", "o", "i", "e", "a"],
};

// Owner formula: "я" in the group → 1st person, else "ты" → 2nd person, else 3rd.
function ownerStem(parts: string[]): string {
  const plural = parts.length > 1;
  if (parts.includes("я")) return plural ? "naš" : "moj";
  if (parts.includes("ты")) return plural ? "vaš" : "tvoj";
  if (plural) return "njihov";
  return parts[0] === "ж" ? "njen" : "njegov";
}

export const owners: Owner[] = [
  "я", "ты", "м", "ж", "с",
  "я+ты", "я+м", "я+ж", "я+с", "ты+м", "ты+ж", "ты+с",
  "м+м", "м+ж", "м+с", "ж+ж", "ж+с", "с+с",
].map((label) => ({ label, stem: ownerStem(label.split("+")) }));

// Mixed genders agree in masculine plural; all-feminine gives feminine plural,
// all-neuter gives neuter plural.
export const objects: ObjectKind[] = [
  { label: "м", form: 0 },
  { label: "ж", form: 1 },
  { label: "с", form: 2 },
  { label: "м+м", form: 3 },
  { label: "м+ж", form: 3 },
  { label: "м+с", form: 3 },
  { label: "ж+с", form: 3 },
  { label: "ж+ж", form: 4 },
  { label: "с+с", form: 5 },
];

// Rules-table row: singular owners get their own row (м and с stay apart even
// though both are njegov); group owners share a row per stem.
export function ownerRow(owner: Owner): string {
  return owner.label.includes("+") ? owner.stem : owner.label;
}

export function decline(stem: string, form: Form): string {
  return stem + stems[stem][form];
}

export interface Question {
  id: number;
  owner: Owner;
  object: ObjectKind;
  answer: string;
  options: string[];
}

export function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function makeQuestion(
  id: number,
  owner: Owner = pick(owners),
  object: ObjectKind = pick(objects),
): Question {
  const answer = decline(owner.stem, object.form);

  // One distractor with the right owner but wrong ending, one with the right
  // ending but wrong owner — so both halves of the rule get tested.
  const wrongEnding = shuffle(
    ([0, 1, 2, 3, 4, 5] as Form[])
      // Masculine plural is also acceptable for с+с, so don't offer it as a trap.
      .filter((form) => !(object.form === 5 && form === 3))
      .map((form) => decline(owner.stem, form))
      .filter((word) => word !== answer),
  );
  const wrongOwner = shuffle(
    Object.keys(stems)
      .filter((stem) => stem !== owner.stem)
      .map((stem) => decline(stem, object.form)),
  );

  const distractors = [wrongEnding[0]];
  for (const word of [...wrongOwner, ...wrongEnding]) {
    if (!distractors.includes(word)) {
      distractors.push(word);
      break;
    }
  }

  return { id, owner, object, answer, options: shuffle([answer, ...distractors]) };
}
