import { chromium } from "playwright-core";

const appUrl = process.env.APP_URL ?? "http://127.0.0.1:5173/world-flag-patterns/";
const chromePath =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

const errors = [];
const context = await browser.newContext({
  viewport: { width: 1440, height: 920 },
});
const page = await context.newPage();

page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") {
    errors.push(message.text());
  }
});

await page.goto(appUrl, { waitUntil: "networkidle" });
await page.getByText("Flags, places, stories.", { exact: true }).waitFor();

const mapPathCount = await page.locator(".map-country").count();
const availablePathCount = await page.locator(".map-country.is-available").count();
const availableMarkerCount = await page.locator(".map-marker.is-available").count();
assert(mapPathCount > 150, `Expected world map paths, found ${mapPathCount}`);
assert(
  availablePathCount + availableMarkerCount >= 240,
  `Expected global map coverage, found ${availablePathCount} paths and ${availableMarkerCount} markers`,
);

await page.screenshot({ fullPage: true, path: "/private/tmp/world-flag-patterns-explore.png" });

const wikipediaLink = page.getByRole("link", { name: "Read on Wikipedia", exact: true });
await wikipediaLink.waitFor();
const wikipediaHref = await wikipediaLink.getAttribute("href");
assert(
  wikipediaHref?.startsWith("https://en.wikipedia.org/wiki/"),
  `Expected Wikipedia link, found ${wikipediaHref}`,
);

await page.getByPlaceholder("Search country, color, symbol").fill("Japan");
await page.locator(".country-card", { hasText: "Japan" }).waitFor();
assert((await page.locator(".country-card").count()) === 1, "Search should narrow the country list");

await page.getByPlaceholder("Search country, color, symbol").fill("Bhutan");
await page.locator(".country-card", { hasText: "Bhutan" }).waitFor();
assert((await page.locator(".country-card").count()) === 1, "Search should narrow to Bhutan");
await page.getByPlaceholder("Search country, color, symbol").fill("");

await page.getByRole("button", { name: "Learn", exact: true }).click();
await page.getByText("Place And History", { exact: true }).waitFor();
await page.getByRole("heading", { name: "Bhutan", exact: true }).waitFor();
await page.getByText("Thunder dragon:", { exact: true }).waitFor();

await page.getByRole("button", { name: "Explore", exact: true }).click();
await page.getByPlaceholder("Search country, color, symbol").fill("India");
const indiaCard = page.locator(".country-card", {
  has: page.locator("strong", { hasText: /^India$/ }),
});
await indiaCard.waitFor();
assert((await indiaCard.count()) === 1, "Expected one exact India country card");
await indiaCard.click();
await page.getByRole("button", { name: "Learn", exact: true }).click();
await page.getByRole("heading", { name: "India", exact: true }).waitFor();
await page.getByText("24-spoked navy Ashoka Chakra", { exact: false }).waitFor();
await page.getByText("Ashoka's wheel:", { exact: false }).waitFor();
const chakraLink = page.getByRole("link", { name: "Ashoka Chakra", exact: true });
await chakraLink.waitFor();
assert(
  (await chakraLink.getAttribute("href")) === "https://en.wikipedia.org/wiki/Ashoka_Chakra",
  "Expected India lesson to link to the Ashoka Chakra reference",
);
await page.getByRole("button", { name: "Explore", exact: true }).click();
await page.getByPlaceholder("Search country, color, symbol").fill("");

await page.getByRole("button", { name: "Patterns", exact: true }).click();
await page.getByRole("heading", { name: "Flags that look and feel related.", exact: true }).waitFor();
await page.getByRole("combobox").nth(2).selectOption("Two-color layout");
await page.getByRole("combobox").nth(3).selectOption("two-color-horizontal");
await page.getByRole("heading", { name: "Two-Color Horizontal Fields", exact: true }).waitFor();
await page.locator(".pattern-flag", { hasText: "Ukraine" }).waitFor();
await page.getByRole("combobox").nth(2).selectOption("Shape family");
await page.getByRole("combobox").nth(3).selectOption("nordic-cross");
await page.getByRole("heading", { name: "Nordic Crosses", exact: true }).waitFor();
const patternShortcutBox = await page.locator(".pattern-chip").first().boundingBox();
assert(
  patternShortcutBox && patternShortcutBox.height >= 60,
  `Expected roomier pattern shortcut buttons, got ${patternShortcutBox?.height}`,
);
await page.locator(".pattern-flag img").evaluateAll(async (images) => {
  await Promise.all(images.map((image) => image.decode?.().catch(() => undefined)));
});
await page.screenshot({ fullPage: true, path: "/private/tmp/world-flag-patterns-patterns.png" });
const swedenPattern = page.locator(".pattern-flag", { hasText: "Sweden" });
await swedenPattern.waitFor();
await swedenPattern.click();
await page.getByRole("heading", { name: "Sweden", exact: true }).waitFor();

await page.getByRole("button", { name: "Quiz", exact: true }).click();
await page.locator("select").first().selectOption("Asia");
await page.locator(".answer-option").first().waitFor();
const answerCount = await page.locator(".answer-option").count();
assert(answerCount === 4, `Expected four quiz answers, found ${answerCount}`);
const answerCodeBefore = await page.locator(".quiz-layout").getAttribute("data-answer-code");
const answerNameBefore = await page.locator(".quiz-layout").getAttribute("data-answer-name");
const contextCodeBefore = await page.locator(".quiz-context").getAttribute("data-context-code");
const revealedBefore = await page.locator(".quiz-context").getAttribute("data-revealed");
const promptBefore = await page.locator(".quiz-shell h1").innerText();
const contextBefore = await page.locator(".quiz-context").innerText();
assert(
  answerCodeBefore === contextCodeBefore,
  `Quiz context should match answer before answering, got ${answerCodeBefore} and ${contextCodeBefore}`,
);
assert(revealedBefore === "false", "Quiz context should not be revealed before answering");
assert(contextBefore.includes("Map clue"), "Quiz context should show a generic map clue before answering");
assert(!contextBefore.includes("Read on Wikipedia"), "Quiz context should not link to the answer before answering");
assert(
  answerNameBefore && !promptBefore.toLowerCase().includes(answerNameBefore.toLowerCase()),
  `Quiz prompt should not reveal answer name ${answerNameBefore}: ${promptBefore}`,
);
await page.locator(".answer-option").first().click();
await page.locator(".feedback").waitFor();
const answerCodeAfter = await page.locator(".quiz-layout").getAttribute("data-answer-code");
const contextCodeAfter = await page.locator(".quiz-context").getAttribute("data-context-code");
const revealedAfter = await page.locator(".quiz-context").getAttribute("data-revealed");
assert(
  answerCodeAfter === contextCodeAfter,
  `Quiz context should match answer after answering, got ${answerCodeAfter} and ${contextCodeAfter}`,
);
assert(revealedAfter === "true", "Quiz context should reveal the answer after answering");
await page.locator(".quiz-context").getByRole("link", { name: "Read on Wikipedia", exact: true }).waitFor();
await page.getByText("Next clue", { exact: true }).waitFor();
await page.screenshot({ fullPage: true, path: "/private/tmp/world-flag-patterns-quiz.png" });

const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});
const mobilePage = await mobileContext.newPage();
await mobilePage.goto(appUrl, { waitUntil: "networkidle" });
await mobilePage.getByText("Flags, places, stories.", { exact: true }).waitFor();
await mobilePage.screenshot({ fullPage: true, path: "/private/tmp/world-flag-patterns-mobile.png" });

await browser.close();

assert(errors.length === 0, `Browser errors detected:\n${errors.join("\n")}`);
console.log("UI smoke verification passed");
