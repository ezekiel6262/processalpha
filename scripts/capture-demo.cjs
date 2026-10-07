const { chromium } = require("playwright");
const fs = require("node:fs/promises");
const path = require("node:path");

(async () => {
  const root = path.resolve(__dirname, "..");
  const output = path.join(root, "demo", "screens");
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  await page.goto("https://processalpha.vercel.app", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(output, "01-homepage.png"), fullPage: true });

  await page.goto("https://processalpha.vercel.app/app", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(output, "02-journal-empty.png"), fullPage: true });

  await page.getByLabel("Symbol").fill("BTCUSDT");
  await page.getByLabel("Entry price").fill("100");
  await page.getByLabel("Exit price").fill("105");
  await page.getByLabel("Thesis written before entry").fill("Momentum continuation after a confirmed range breakout.");
  await page.getByLabel("Invalidation condition").fill("Price closes back inside the prior range.");
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "Save and score decision" }).click();
  await page.getByText("Good decision, good outcome").first().waitFor();
  await page.getByText("Confidence:").waitFor({ timeout: 30000 });
  await page.screenshot({ path: path.join(output, "03-scored-review.png"), fullPage: true });

  await page.getByRole("button", { name: "Patterns" }).click();
  await page.screenshot({ path: path.join(output, "04-patterns.png"), fullPage: true });

  await page.getByRole("button", { name: "Rulebook" }).click();
  await page.getByRole("textbox", { name: "Rule", exact: true }).fill("Only enter after the planned confirmation closes.");
  await page.getByRole("button", { name: "Add to rulebook" }).click();
  await page.screenshot({ path: path.join(output, "05-rulebook.png"), fullPage: true });

  await browser.close();
  console.log(`Created demo screenshots in ${output}`);
})().catch(error => { console.error(error.message); process.exit(1); });
