export const answerKeys = [
  ["1", "←", "ArrowLeft"],
  ["2", "↓", "ArrowDown"],
  ["3", "→", "ArrowRight"],
];

export function answerIndex(event: KeyboardEvent): number {
  return answerKeys.findIndex((keys) => keys.includes(event.key));
}
