import type { Country } from "../data/countries";

export type QuizKind = "meaning" | "symbol" | "color" | "geography";

export type QuizQuestion = {
  id: string;
  kind: QuizKind;
  prompt: string;
  answerCode: string;
  options: Country[];
  explanation: string;
};

const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const makeOptions = (answer: Country, pool: Country[]) => {
  const distractors = shuffle(pool.filter((country) => country.code !== answer.code)).slice(0, 3);
  return shuffle([answer, ...distractors]);
};

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const clueText = (text: string, answer: Country) => {
  const withoutAnswerName = text
    .replace(new RegExp(escapeRegExp(answer.name), "gi"), "this country")
    .replace(/^this country:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return withoutAnswerName || "Use the flag, map position, and pattern clues together.";
};

const isUsefulGeographyClue = (text: string) => {
  const normalized = text.toLowerCase();
  return !(
    normalized.startsWith("status anchor") ||
    normalized.includes("united nations member") ||
    normalized.includes("global country dataset")
  );
};

export const createQuestion = (pool: Country[]): QuizQuestion | null => {
  if (pool.length < 4) {
    return null;
  }

  const answer = randomItem(pool);
  const availableKinds: QuizKind[] = ["meaning", "geography"];

  if (answer.symbols.length > 0) {
    availableKinds.push("symbol");
  }

  if (answer.colors.length > 0) {
    availableKinds.push("color");
  }

  const kind = randomItem(availableKinds);
  const options = makeOptions(answer, pool);

  if (kind === "symbol") {
    const symbol = randomItem(answer.symbols);
    const symbolMeaning = clueText(symbol.meaning, answer).toLowerCase();
    return {
      id: `${answer.code}-symbol-${symbol.name}-${Date.now()}`,
      kind,
      prompt: `Which flag uses ${symbol.name.toLowerCase()} to represent ${symbolMeaning}?`,
      answerCode: answer.code,
      options,
      explanation: `${answer.name}: ${symbol.name} means ${symbol.meaning}. ${answer.memoryHook}`,
    };
  }

  if (kind === "color") {
    const color = randomItem(answer.colors);
    const colorMeaning = clueText(color.meaning, answer).toLowerCase();
    return {
      id: `${answer.code}-color-${color.name}-${Date.now()}`,
      kind,
      prompt: `Which flag connects ${color.name.toLowerCase()} with ${colorMeaning}?`,
      answerCode: answer.code,
      options,
      explanation: `${answer.name}: ${color.name} is used for ${color.meaning}. ${answer.meaning}`,
    };
  }

  if (kind === "geography") {
    const usefulHistory = answer.geoContext.history.filter(isUsefulGeographyClue);
    const history = clueText(randomItem(usefulHistory.length > 0 ? usefulHistory : answer.geoContext.history), answer);
    return {
      id: `${answer.code}-geo-${Date.now()}`,
      kind,
      prompt: `Which country fits this map-and-history clue: ${history}`,
      answerCode: answer.code,
      options,
      explanation: `${answer.name}: ${answer.geoContext.location} ${answer.memoryHook}`,
    };
  }

  return {
    id: `${answer.code}-meaning-${Date.now()}`,
    kind,
    prompt: `Which flag is best remembered by this clue: ${clueText(answer.memoryHook, answer)}`,
    answerCode: answer.code,
    options,
    explanation: `${answer.name}: ${answer.meaning}`,
  };
};
