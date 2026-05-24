// Polling-бот: /start -> web_app + файл скилла. /skill -> снова шлёт файл.
import fs from 'node:fs'
import path from 'node:path'

const TOKEN = process.env.BOT_TOKEN
const URL = process.env.MINIAPP_URL
const SKILL_PATH = path.resolve('./public/files/web-design-pro.skill')
const API = `https://api.telegram.org/bot${TOKEN}`

async function api(method, payload) {
  const r = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return r.json()
}

async function sendSkill(chat_id, caption) {
  if (!fs.existsSync(SKILL_PATH)) { console.error('skill not found', SKILL_PATH); return }
  const buf = fs.readFileSync(SKILL_PATH)
  const form = new FormData()
  form.append('chat_id', String(chat_id))
  form.append('caption', caption)
  form.append('document', new Blob([buf]), 'web-design-pro.skill')
  const r = await fetch(`${API}/sendDocument`, { method: 'POST', body: form })
  return r.json()
}

let offset = 0
console.log('bot polling…')
while (true) {
  try {
    const r = await fetch(`${API}/getUpdates?timeout=30&offset=${offset}`)
    const d = await r.json()
    if (!d.ok) { console.error('getUpdates fail', d); await new Promise(r => setTimeout(r, 5000)); continue }
    for (const u of d.result) {
      offset = u.update_id + 1
      const msg = u.message
      if (!msg || !msg.text) continue
      const text = msg.text.trim()
      const chat_id = msg.chat.id

      if (text.startsWith('/start')) {
        await api('sendMessage', {
          chat_id,
          text: 'Привет. Внутри 7 разделов — кейсы, автоматизации, агенты, база знаний.\n\nЖми кнопку, чтобы открыть.',
          reply_markup: {
            inline_keyboard: [[{ text: 'Открыть ИИшницу', web_app: { url: URL } }]],
          },
        })
        await sendSkill(chat_id,
          'Бонус-скилл из раздела "База знаний": web-design-pro для Claude Code.\n\n' +
          'Распакуй и скопируй папку в ~/.claude/skills/ — твой агент сможет верстать профессиональные сайты.\n\n' +
          'Команда /skill пришлёт файл ещё раз.')
        console.log('start ->', chat_id)
      } else if (text.startsWith('/skill')) {
        await sendSkill(chat_id, 'web-design-pro.skill — распакуй в ~/.claude/skills/')
        console.log('skill ->', chat_id)
      }
    }
  } catch (e) {
    console.error('loop err', e.message)
    await new Promise(r => setTimeout(r, 3000))
  }
}
