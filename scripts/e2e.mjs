import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.BASE_URL || "http://localhost:3777";
const SHOTS = "/tmp/formo-shots";
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
function check(name, cond, extra = "") {
  results.push({ name, pass: !!cond, extra });
  console.log(`${cond ? "✅" : "❌"} ${name}${extra ? " — " + extra : ""}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ---------- 1. Landing + demo form ----------
await page.goto(BASE + "/");
await page.waitForLoadState("domcontentloaded");
check("landing title", (await page.title()).includes("Formo"));
await page.screenshot({ path: `${SHOTS}/01-landing.png`, fullPage: false });

const demoOpt = page.getByRole("button", { name: "All of them" });
await demoOpt.click();
await page.waitForTimeout(400);
const q2visible = await page.getByRole("heading", { name: "How painful is that bill every month?" }).isVisible();
check("hero demo advances to q2 on click", q2visible);
await page.keyboard.press("5"); // number key selects rating 5
await page.waitForTimeout(400);
const q3visible = await page.getByRole("heading", { name: "Want updates when we ship something great?" }).isVisible();
check("hero demo advances to q3 via keyboard", q3visible);
await page.screenshot({ path: `${SHOTS}/02-demo-form.png` });

// ---------- 2. Login ----------
await page.goto(BASE + "/login");
await page.getByRole("textbox", { name: "admin@formo.local" }).fill("admin@formo.local");
await page.getByRole("textbox", { name: "••••••••" }).fill("formo-admin");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL("**/dashboard", { timeout: 5000 });
check("login redirects to dashboard", page.url().includes("/dashboard"));
await page.screenshot({ path: `${SHOTS}/03-dashboard-empty.png` });

// ---------- 3. Create form from template ----------
await page.getByRole("button", { name: "New form" }).first().waitFor({ timeout: 8000 });
await page.screenshot({ path: `${SHOTS}/03-dashboard-empty.png` });
await page.getByRole("button", { name: "New form" }).first().click();
await page.getByRole("button", { name: /Product feedback/ }).click();
await page.waitForURL("**/dashboard/forms/**", { timeout: 5000 });
check("template creates form and opens builder", page.url().includes("/dashboard/forms/"));
const formId = page.url().split("/").pop();
await page.waitForTimeout(600);
await page.screenshot({ path: `${SHOTS}/04-builder.png` });

// ---------- 4. Edit a question + autosave ----------
// note: the first question is expanded by default — open the second one
await page.getByRole("button", { name: /What should we improve most\?/ }).first().click();
await page.waitForTimeout(300);
const editorInput = page.locator('input[value="What should we improve most?"]');
check("question editor opens", (await editorInput.count()) === 1);
if ((await editorInput.count()) === 1) {
  await editorInput.fill("What should we improve first?");
  const saved = await page
    .getByText("Saved")
    .first()
    .waitFor({ timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  check("autosave indicator appears", saved);
} else {
  check("autosave indicator appears", false, "editor did not open");
}

// ---------- 5. Publish ----------
await page.getByRole("button", { name: "Publish" }).click();
await page.waitForTimeout(900);
check("publish toggles to Unpublish", await page.getByRole("button", { name: "Unpublish" }).isVisible());

// grab the slug from the share tab
await page.getByRole("button", { name: /Share/ }).click();
await page.waitForTimeout(400);
const publicUrlText = await page.locator("code.rounded-lg").first().textContent();
const slug = (publicUrlText || "").trim().split("/f/").pop();
check("share tab shows public URL", !!slug, `slug=${slug}`);
await page.screenshot({ path: `${SHOTS}/05-share.png` });

// ---------- 6. Fill the public form ----------
const pub = await ctx.newPage();
await pub.goto(`${BASE}/f/${slug}`);
await pub.waitForLoadState("domcontentloaded");
await pub.getByRole("heading", { name: /How would you rate/ }).waitFor({ timeout: 5000 });
await pub.screenshot({ path: `${SHOTS}/06-public-form.png` });
await pub.getByRole("button", { name: "4" }).click();
await pub.waitForTimeout(400);
await pub.getByRole("button", { name: "Speed" }).click();
await pub.waitForTimeout(400);
await pub.getByRole("textbox").first().fill("The loading speed is fantastic, keep it up!");
await pub.getByRole("button", { name: "Submit" }).click();
await pub.getByRole("heading", { name: "Thank you!" }).waitFor({ timeout: 5000 });
check("public form submits and shows thank-you", true);
await pub.screenshot({ path: `${SHOTS}/07-thankyou.png` });
await pub.close();

// ---------- 7. Responses dashboard ----------
await page.goto(`${BASE}/dashboard/forms/${formId}/responses`);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(500);
check("responses page shows 1 response", await page.getByText("1 response").isVisible());
check("summary shows rating average", await page.locator("text=/4\\.0/").first().isVisible());
check("shows submitted answer text", await page.getByText("The loading speed is fantastic").first().isVisible());
await page.screenshot({ path: `${SHOTS}/08-responses.png`, fullPage: true });

// ---------- 8. CSV export ----------
const csvResp = await ctx.request.get(`${BASE}/api/forms/${formId}/export`);
const csv = await csvResp.text();
check("CSV exports with headers + answer", csv.includes("Submitted at") && csv.includes("loading speed is fantastic"));

// ---------- 9. QR + embed.js ----------
const qrResp = await ctx.request.get(`${BASE}/api/qr/${slug}`);
check("QR code renders PNG", (qrResp.headers()["content-type"] || "").includes("image/png"));
const embedResp = await ctx.request.get(`${BASE}/api/embed.js?id=${slug}`);
check("embed.js served", (await embedResp.text()).includes("__formoEmbed"));

// ---------- 10. Draft form blocked ----------
const draftPage = await ctx.newPage();
// create an unpublished form via API to verify 403 flow
const created = await ctx.request.post(`${BASE}/api/forms`, { data: { title: "Draft test" } });
const draftForm = await created.json();
const draftSubmit = await ctx.request.post(`${BASE}/api/public/submit/${draftForm.slug}`, {
  data: { answers: { q1: "x" } },
});
check("unpublished form rejects submissions", draftSubmit.status() === 403);
const deleted = await ctx.request.delete(`${BASE}/api/forms/${draftForm.id}`);
check("form deletes cleanly", (await deleted.json()).ok === true);

// ---------- 11. Skip logic ----------
const skipForm = await (
  await ctx.request.post(`${BASE}/api/forms`, {
    data: {
      title: "Skip logic test",
      questions: [
        {
          id: "s1",
          type: "choice",
          title: "Do you want the bonus question?",
          required: true,
          options: ["Yes", "No thanks"],
          jump: { "No thanks": "__end__" },
        },
        {
          id: "s2",
          type: "short",
          title: "Bonus: favorite color?",
          required: true,
        },
      ],
    },
  })
).json();
await ctx.request.patch(`${BASE}/api/forms/${skipForm.id}`, {
  data: { settings: { ...(skipForm.settings ?? {}), published: true, brandColor: "#6366f1", theme: "light", showProgress: true, welcomeEnabled: false, thankYouEnabled: true } },
});

const skipPub = await ctx.newPage();
await skipPub.goto(`${BASE}/f/${skipForm.slug}`);
await skipPub.getByRole("heading", { name: "Do you want the bonus question?" }).waitFor();
await skipPub.waitForTimeout(700); // read like a human; also clears the time-trap
await skipPub.getByRole("button", { name: "No thanks" }).click();
await skipPub.waitForTimeout(600);
const thankYouVisible = await skipPub.getByRole("heading", { name: "Thank you!" }).isVisible().catch(() => false);
check("skip logic: jump to submit skips required question", thankYouVisible);
await skipPub.close();

const skipCsv = await (await ctx.request.get(`${BASE}/api/forms/${skipForm.id}/export`)).text();
const skipRow = skipCsv.split("\r\n")[1] ?? "";
check(
  "skip logic: skipped question is empty in CSV",
  skipCsv.includes("No thanks") && skipRow.endsWith(","),
);

// ---------- 12. Duplicate form ----------
const dupResp = await ctx.request.post(`${BASE}/api/forms/${formId}/duplicate`);
const dupForm = await dupResp.json();
check("duplicate form creates a draft copy", dupResp.status() === 201 && dupForm.title.endsWith("(copy)") && dupForm.settings.published === false);
await ctx.request.delete(`${BASE}/api/forms/${dupForm.id}`);

// ---------- 13. Delete single response ----------
// grab the response id from the responses page HTML (details rows carry it via the delete button's API call)
const respPage = await ctx.newPage();
await respPage.goto(`${BASE}/dashboard/forms/${formId}/responses`);
await respPage.waitForLoadState("domcontentloaded");
respPage.on("dialog", (d) => d.accept());
const responseCount = await respPage.getByText("1 response").isVisible();
check("responses page shows the response before delete", responseCount);
await respPage.getByText("Response #1").first().click(); // expand details
await respPage.getByRole("button", { name: /Delete response/ }).click();
await respPage.waitForTimeout(1200);
const emptyAfterDelete = await respPage.getByText("Nothing here yet").isVisible().catch(() => false);
check("delete response removes it", emptyAfterDelete);
await respPage.close();

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("FAILED:", failed.map((f) => f.name).join(", "));
  process.exit(1);
}
