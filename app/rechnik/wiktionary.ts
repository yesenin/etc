// The site is a static export, so both Wiktionaries are queried straight from the browser
// (MediaWiki allows anonymous CORS with `origin=*`) and the rendered HTML is parsed with DOMParser.

export const cases = [
  { id: "nom", label: "Nominativ", question: "ko? šta?" },
  { id: "gen", label: "Genitiv", question: "koga? čega?" },
  { id: "dat", label: "Dativ", question: "kome? čemu?" },
  { id: "acc", label: "Akuzativ", question: "koga? šta?" },
  { id: "voc", label: "Vokativ", question: "hej!" },
  { id: "ins", label: "Instrumental", question: "s kim? čime?" },
  { id: "loc", label: "Lokativ", question: "o kome? o čemu?" },
] as const;

export type CaseId = (typeof cases)[number]["id"];

export const numbers = [
  { id: "singular", label: "Jednina" },
  { id: "plural", label: "Množina" },
] as const;

export type NumberId = (typeof numbers)[number]["id"];

export type Declension = {
  headword: string;
  gender: string;
  glosses: string[];
  forms: Partial<Record<CaseId, Partial<Record<NumberId, string>>>>;
};

export type Meaning = { label: string; text: string };

export type Wiki = "sr" | "en";

export function pageUrl(wiki: Wiki, word: string): string {
  return `https://${wiki}.wiktionary.org/wiki/${encodeURIComponent(word)}`;
}

/** Rendered page as a DOM document, or null when the wiki has no such page. */
async function fetchPage(wiki: Wiki, word: string, signal: AbortSignal): Promise<Document | null> {
  const params = new URLSearchParams({
    action: "parse",
    page: word,
    prop: "text",
    redirects: "1",
    disableeditsection: "1",
    disabletoc: "1",
    disablelimitreport: "1",
    format: "json",
    formatversion: "2",
    origin: "*",
  });
  const response = await fetch(`https://${wiki}.wiktionary.org/w/api.php?${params}`, { signal });
  if (!response.ok) throw new Error(`${wiki}.wiktionary.org: HTTP ${response.status}`);

  const body = await response.json();
  if (body.error) {
    if (body.error.code === "missingtitle" || body.error.code === "invalidtitle") return null;
    throw new Error(`${wiki}.wiktionary.org: ${body.error.info ?? body.error.code}`);
  }
  return new DOMParser().parseFromString(body.parse.text, "text/html");
}

function cleanText(element: Element, drop: string): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll(drop).forEach((node) => node.remove());
  return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
}

function headingLevel(element: Element): number {
  return Number(element.tagName[1]);
}

function parseDeclensionTable(table: HTMLTableElement): Declension["forms"] {
  const forms: Declension["forms"] = {};
  let columns: (NumberId | undefined)[] = [];

  for (const row of Array.from(table.rows)) {
    const data = Array.from(row.cells).filter((cell) => cell.tagName === "TD");
    if (data.length === 0) {
      // Header row: its first cell is the empty corner above the case names.
      columns = Array.from(row.cells)
        .slice(1)
        .map((cell) => numbers.find(({ id }) => cell.textContent?.trim().toLowerCase() === id)?.id);
      continue;
    }

    const caseName = row.cells[0].textContent?.trim().toLowerCase() ?? "";
    const caseId = cases.find(({ id }) => caseName.startsWith(id))?.id;
    if (!caseId) continue;

    data.forEach((cell, index) => {
      const number = columns[index];
      const form = cell.textContent?.replace(/\s+/g, " ").trim();
      if (number && form) forms[caseId] = { ...forms[caseId], [number]: form };
    });
  }
  return forms;
}

/** English glosses listed under a headword line: the first <ol> after its paragraph. */
function parseGlosses(headword: Element): string[] {
  let list = headword.closest("p")?.nextElementSibling;
  while (list && list.tagName !== "OL" && !list.classList.contains("mw-heading")) {
    list = list.nextElementSibling;
  }
  if (list?.tagName !== "OL") return [];
  return Array.from(list.children)
    .map((item) => cleanText(item, "dl, ul, ol, style, sup.reference, .nyms"))
    .filter(Boolean);
}

/** Noun and pronoun declension tables from the Serbo-Croatian section of an en.wiktionary page. */
function parseDeclensions(doc: Document): Declension[] {
  const declensions: Declension[] = [];
  let inLanguage = false;
  // Heading level of the enclosing "Noun"/"Pronoun" section, 0 when outside of one.
  let nounLevel = 0;
  let entry: Omit<Declension, "forms"> | null = null;

  for (const node of Array.from(doc.querySelectorAll("h2, h3, h4, h5, strong.headword, table.inflection-table"))) {
    if (node.tagName === "H2") {
      inLanguage = node.id === "Serbo-Croatian";
      nounLevel = 0;
      entry = null;
    } else if (!inLanguage) {
      continue;
    } else if (/^H\d$/.test(node.tagName)) {
      const level = headingLevel(node);
      if (/^(Proper noun|Noun|Pronoun)/.test(node.textContent?.trim() ?? "")) {
        nounLevel = level;
        entry = null;
      } else if (level <= nounLevel) {
        nounLevel = 0;
        entry = null;
      }
    } else if (nounLevel === 0) {
      continue;
    } else if (node.tagName === "STRONG") {
      const line = node.closest(".headword-line");
      entry = {
        headword: node.textContent?.trim() ?? "",
        gender: cleanText(line?.querySelector(".gender") ?? node.ownerDocument.createElement("span"), "style"),
        glosses: parseGlosses(node),
      };
    } else if (entry) {
      const forms = parseDeclensionTable(node as HTMLTableElement);
      if (Object.keys(forms).length > 0) declensions.push({ ...entry, forms });
    }
  }
  return declensions;
}

/** "Значења" of the noun or pronoun in the Serbian section of an sr.wiktionary page. */
function parseMeanings(doc: Document): Meaning[] {
  const meanings: Meaning[] = [];
  let inLanguage = false;
  let inNoun = false;

  for (const node of Array.from(doc.querySelectorAll("h2, h3, h4, b"))) {
    if (node.tagName === "H2") {
      // The entry title ("кућа (српски, lat. kuća)") is sometimes an <h2> of its own.
      if (node.id === "Српски") inLanguage = true;
      else if (!node.id.includes("српски")) inLanguage = false;
      inNoun = false;
    } else if (node.tagName !== "B") {
      inNoun = /^(Именица|Заменица)/.test(node.id);
    } else if (inLanguage && inNoun && node.textContent?.trim().startsWith("Значењ")) {
      const block = node.closest("p")?.nextElementSibling;
      if (!block) continue;

      const list = block.matches("ol, ul") ? block : block.querySelector("ol, ul");
      const items = Array.from(list ? list.children : block.querySelectorAll(":scope > dd"));
      items.forEach((item, index) => {
        const text = cleanText(item, "style, sup.reference, .mw-empty-elt");
        // Hand-numbered entries look like "[1.1.] ...".
        const numbered = text.match(/^\[([\d.]+)\]\s*(.*)$/);
        const meaning = numbered
          ? { label: numbered[1], text: numbered[2] }
          : { label: list ? `${index + 1}.` : "", text };
        if (meaning.text) meanings.push(meaning);
      });
    }
  }
  return meanings;
}

// Tone marks that sit on the stressed syllable: grave, acute, double grave, inverted breve
// (and the circumflex some entries use in its place).
const stressMarks = /[\u0300\u0301\u0302\u030F\u0311]/;
// Also dropped from vowels: the macron, which only marks length.
const accentMarks = /[\u0300\u0301\u0302\u0304\u030F\u0311]/g;
// Syllable nuclei, including syllabic r. Marks on other letters (ć, č, š, ž) are part of the letter.
const nucleus = /[aeiourаеиоур]/i;

export type StressSegment = { text: string; stressed: boolean };

/** Strips dictionary accent marks, flagging the letters that carried the stress. */
export function splitStress(text: string): StressSegment[] {
  const segments: StressSegment[] = [];
  for (const [letter] of text.normalize("NFD").matchAll(/.\p{M}*/gsu)) {
    const accented = nucleus.test(letter[0]);
    const stressed = accented && stressMarks.test(letter);
    const plain = (accented ? letter.replace(accentMarks, "") : letter).normalize("NFC");
    const last = segments.at(-1);
    if (last && last.stressed === stressed) last.text += plain;
    else segments.push({ text: plain, stressed });
  }
  return segments;
}

export type Lookup = {
  word: string;
  /** null when the wiki has no page for the word. */
  meanings: Meaning[] | null;
  declensions: Declension[] | null;
};

export async function lookup(word: string, signal: AbortSignal): Promise<Lookup> {
  const [sr, en] = await Promise.all([fetchPage("sr", word, signal), fetchPage("en", word, signal)]);
  return {
    word,
    meanings: sr && parseMeanings(sr),
    declensions: en && parseDeclensions(en),
  };
}
