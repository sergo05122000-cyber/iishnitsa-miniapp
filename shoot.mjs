import { chromium } from "playwright"
import { mkdirSync } from "fs"
mkdirSync("/home/edgelab/.claude-lab/jarvis/data/drafts/eggs", { recursive: true })
const browser = await chromium.launch({ args: ["--no-sandbox"] })

async function shoot(name, prep) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto("http://localhost:5180/", { waitUntil: "networkidle", timeout: 10000 })
  if (prep) await prep(page)
  await page.waitForTimeout(500)
  const file = `/home/edgelab/.claude-lab/jarvis/data/drafts/eggs/${name}.png`
  await page.screenshot({ path: file, fullPage: false })
  console.log("ok", file)
  await ctx.close()
}

await shoot("01-home-light")
await shoot("02-folder-closed-light", async (p) => {
  await p.locator('button:has-text("База знаний")').click()
})
await shoot("03-folder-active-light", async (p) => {
  await p.locator('button:has-text("Знакомства")').click()
})
await shoot("04-home-dark", async (p) => {
  await p.locator('button:has-text("Настройки")').click()
  await p.waitForTimeout(200)
  const switches = await p.locator('button.relative.w-12.h-7').all()
  if (switches[0]) await switches[0].click()
  await p.waitForTimeout(200)
  await p.locator('button:has-text("Разделы")').click()
})
await shoot("05-post-dark", async (p) => {
  await p.locator('button:has-text("Настройки")').click()
  await p.waitForTimeout(200)
  const switches = await p.locator('button.relative.w-12.h-7').all()
  if (switches[0]) await switches[0].click()
  await p.waitForTimeout(200)
  await p.locator('button:has-text("Разделы")').click()
  await p.waitForTimeout(200)
  await p.locator('button:has-text("Вопросы и разборы")').click()
  await p.waitForTimeout(200)
  await p.locator('button:has-text("Как задавать вопросы")').click()
})

await browser.close()
