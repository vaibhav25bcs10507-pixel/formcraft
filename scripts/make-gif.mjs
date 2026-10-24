// Records the app in headless Chromium and encodes docs/demo.gif
import { chromium } from "playwright";
import gifenc from "gifenc";
import jpeg from "jpeg-js";
const { GIFEncoder, quantize, applyPalette } = gifenc;
import fs from "fs";

const BASE = process.env.BASE_URL || "http://localhost:3777";
const W = 880, H = 550;
const DELAY = 150; // ms per frame (~6.7fps)
const frames = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
page.on("dialog", (d) => d.accept());

async function snap(n = 1, gap = DELAY) {
  for (let i = 0; i < n; i++) {
    const buf = await page.screenshot({ type: "jpeg", quality: 82, clip: { x: 0, y: 0, width: W, height: H } });
    frames.push(buf);
    if (i < n - 1) await page.waitForTimeout(gap);
  }
}

// ---- Scene 1: landing hero + demo form ----
await page.goto(BASE + "/");
await page.waitForTimeout(900);
await snap(6);

// tilt the demo card with the mouse
const demoBox = await page.getByRole("heading", { name: "Which tool are you tired of overpaying for?" }).boundingBox();
if (demoBox) {
  await page.mouse.move(demoBox.x + demoBox.width * 0.85, demoBox.y - 20);
  await snap(3);
  await page.mouse.move(demoBox.x + demoBox.width * 0.1, demoBox.y + 90);
  await snap(3);
}
await page.getByRole("button", { name: "All of them" }).click();
await page.waitForTimeout(350);
await snap(5);
await page.keyboard.press("5");
await page.waitForTimeout(350);
await snap(5);

// ---- Scene 2: builder ----
await page.goto(BASE + "/login");
await page.getByRole("textbox", { name: "admin@formo.local" }).fill("admin@formo.local");
await page.getByRole("textbox", { name: "••••••••" }).fill("formo-admin");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL("**/dashboard");
await page.waitForTimeout(500);
await snap(3);

await page.getByRole("button", { name: "New form" }).first().click();
await page.getByRole("button", { name: /Product feedback/ }).click();
await page.waitForURL("**/dashboard/forms/**");
await page.waitForTimeout(900);
await snap(5);

// open a question and retitle it (autosave moment)
await page.getByRole("button", { name: /What should we improve most\?/ }).first().click();
await page.waitForTimeout(350);
const edit = page.locator('input[value="What should we improve most?"]');
if ((await edit.count()) === 1) {
  await edit.click();
  await edit.fill("What should we improve first?");
}
await page.waitForTimeout(1100); // let the Saved badge appear
await snap(5);

// ---- Scene 3: live preview click-through ----
await page.getByRole("button", { name: /Preview/ }).first().click();
await page.waitForTimeout(500);
await snap(3);
const prev = page.locator(".shadow-lg").last(); // preview card contains its own buttons
await page.getByRole("heading", { name: "How are we doing?" }).first().waitFor().catch(() => {});
await snap(3);

// ---- Scene 4: publish + public form ----
await page.getByRole("button", { name: "Publish" }).click();
await page.waitForTimeout(900);
await snap(3);

const shareUrl = await page.locator("code.rounded-lg").first().textContent().catch(() => null);
if (shareUrl) {
  const pub = await ctx.newPage();
  await pub.setViewportSize({ width: W, height: H });
  await pub.goto(shareUrl.trim());
  await pub.getByRole("heading", { name: /How would you rate/ }).waitFor().catch(() => {});
  await pub.waitForTimeout(500);
  await pub.screenshot({ type: "jpeg", quality: 82, path: "/tmp/pub1.jpg" });

  // record on the main page's browser by switching: simpler — reuse `page` via goto
  await page.goto(shareUrl.trim());
  await page.getByRole("heading", { name: /How would you rate/ }).waitFor().catch(() => {});
  await page.waitForTimeout(500);
  await snap(5);
  await page.getByRole("button", { name: "5" }).click();
  await page.waitForTimeout(400);
  await snap(5);
  const improve = await page.getByRole("heading", { name: /What should we improve/ }).count();
  if (improve) {
    await page.getByRole("button", { name: "Speed" }).click().catch(() => {});
    await page.waitForTimeout(400);
    await snap(5);
  }
  const tb = page.getByRole("textbox").first();
  if (await tb.isVisible().catch(() => false)) {
    await tb.fill("Love it — fast and free!");
    await page.waitForTimeout(300);
    await snap(3);
  }
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForTimeout(700);
  await snap(6);
  await pub.close().catch(() => {});
}

await browser.close();

// ---- encode ----
console.log(`captured ${frames.length} frames`);
const decoded = frames.map((f) => jpeg.decode(f, { useTArray: true, formatAsRGBA: true }));
const palette = quantize(decoded[Math.floor(decoded.length / 2)].data, 256, { format: "rgba4444" });
const gif = GIFEncoder();
for (const d of decoded) {
  const index = applyPalette(d.data, palette, "rgba4444");
  gif.writeFrame(index, d.width, d.height, { palette, delay: DELAY });
}
gif.finish();
const out = gif.bytes();
fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/demo.gif", Buffer.from(out));
console.log(`docs/demo.gif written: ${(out.length / 1024 / 1024).toFixed(2)} MB`);
