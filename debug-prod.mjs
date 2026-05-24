import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
})
const page = await ctx.newPage()
const errs = []
const reqs = []
page.on('pageerror', e => errs.push('PAGE: ' + e.message + ' | stack: ' + (e.stack||'').split('\n').slice(0,3).join(' | ')))
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push('CON-' + m.type() + ': ' + m.text()) })
page.on('requestfailed', r => reqs.push('FAIL: ' + r.url() + ' | ' + r.failure()?.errorText))
page.on('response', r => { if (r.status() >= 400) reqs.push('HTTP ' + r.status() + ': ' + r.url()) })
await page.goto('https://iishnitsa.vercel.app/?v=' + Date.now(), { waitUntil: 'load', timeout: 30000 })
await page.waitForTimeout(5000)
const bootGone = await page.evaluate(() => !document.getElementById('boot'))
const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML.slice(0, 300))
console.log('errs:', JSON.stringify(errs, null, 2))
console.log('reqs:', JSON.stringify(reqs, null, 2))
console.log('bootGone:', bootGone)
console.log('rootHTML head:', rootHTML?.slice(0, 200))
await page.screenshot({ path: '/tmp/iish-debug.png' })
await browser.close()
