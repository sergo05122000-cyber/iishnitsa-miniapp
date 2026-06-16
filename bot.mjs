// Polling-бот: /start -> миниапп + файл скилла. /anketa -> reply-кнопка для приёма web_app_data.
// При сабмите формы внутри миниаппы — анкета прилетает в личку OWNER_ID (если задан) или отправителю.
import fs from 'node:fs'
import path from 'node:path'
import { Database } from 'bun:sqlite'

const TOKEN = process.env.BOT_TOKEN
const URL = process.env.MINIAPP_URL
const OWNER_ID = process.env.OWNER_ID ? Number(process.env.OWNER_ID) : null
const SKILL_PATH = path.resolve('./public/files/web-design-pro.skill')
const API = `https://api.telegram.org/bot${TOKEN}`

// Обезличенный лог анкет: только tg_id + время, без имени/города/профессии.
// Решение от 2026-06-16: не поднимать Supabase/Postgres под одну колонку --
// собственный сервер (3.7GB RAM, диск в обрез) под полный self-host Supabase
// не годится, а 152-ФЗ снимается полностью если не хранить ПД привязанные к человеку.
fs.mkdirSync(path.resolve('./data'), { recursive: true })
const db = new Database(path.resolve('./data/leads.db'))
db.run(`CREATE TABLE IF NOT EXISTS leads (
  tg_id INTEGER NOT NULL,
  submitted_at TEXT NOT NULL
)`)
function logLead(tgId) {
  db.run('INSERT INTO leads (tg_id, submitted_at) VALUES (?, ?)', [tgId, new Date().toISOString()])
}

const ANKETA_URL = URL.endsWith('/') ? `${URL}?form=intro` : `${URL}/?form=intro`

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

const LEVEL_LABELS = { newbie: 'Новичок', sometimes: 'Иногда юзаю', daily: 'Каждый день' }

function formatAnketa(data, from) {
  const name = data.name || '?'
  const city = data.city || '—'
  const occ = data.occupation || '—'
  const level = LEVEL_LABELS[data.level] || data.level || '—'
  const goal = data.goal || '—'
  const handle = data.tg_username
    ? `@${data.tg_username}`
    : (from.username ? `@${from.username}` : `id ${from.id}`)
  const fullName = [from.first_name, from.last_name].filter(Boolean).join(' ')
  const submitted = data.submitted_at ? new Date(data.submitted_at).toLocaleString('ru-RU', { timeZone: 'Europe/Helsinki' }) : '—'

  return [
    '<b>Новая анкета · ИИшница</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Город:</b> ${escapeHtml(city)}`,
    `<b>Чем занимается:</b> ${escapeHtml(occ)}`,
    `<b>Уровень в ИИ:</b> ${escapeHtml(level)}`,
    '',
    `<b>Зачем пришёл:</b>`,
    escapeHtml(goal),
    '',
    `<i>From: ${escapeHtml(fullName)} · ${escapeHtml(handle)}</i>`,
    `<i>Submitted: ${escapeHtml(submitted)}</i>`,
  ].join('\n')
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

let offset = 0
console.log('bot polling… OWNER_ID:', OWNER_ID || 'unset (anketa goes to sender)')

while (true) {
  try {
    const r = await fetch(`${API}/getUpdates?timeout=30&offset=${offset}`)
    const d = await r.json()
    if (!d.ok) { console.error('getUpdates fail', d); await new Promise(r => setTimeout(r, 5000)); continue }

    for (const u of d.result) {
      offset = u.update_id + 1
      const msg = u.message
      if (!msg) continue

      const chat_id = msg.chat.id
      const from = msg.from || {}

      // === Анкета через Telegram WebApp.sendData() ===
      if (msg.web_app_data && msg.web_app_data.data) {
        let payload
        try { payload = JSON.parse(msg.web_app_data.data) }
        catch (e) { console.error('bad web_app_data json', e.message); continue }

        if (payload.type !== 'intro') {
          console.log('unknown web_app_data type:', payload.type)
          continue
        }

        logLead(from.id || chat_id)

        const card = formatAnketa(payload, from)
        const targetId = OWNER_ID || chat_id

        await api('sendMessage', {
          chat_id: targetId,
          text: card,
          parse_mode: 'HTML',
        })

        // Подтверждение отправителю (если копия ушла не ему)
        if (OWNER_ID && OWNER_ID !== chat_id) {
          await api('sendMessage', {
            chat_id,
            text: 'Анкета принята. Серёга прочитает и ответит лично.',
            reply_markup: { remove_keyboard: true },
          })
        } else {
          await api('sendMessage', {
            chat_id,
            text: 'Анкета принята.',
            reply_markup: { remove_keyboard: true },
          })
        }

        console.log('anketa received from', chat_id, '->', targetId, '·', payload.name)
        continue
      }

      const text = (msg.text || '').trim()

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
          'Команда /skill пришлёт файл ещё раз.\n' +
          'Команда /anketa — заполнить анкету новичка.')
        console.log('start ->', chat_id)
      } else if (text.startsWith('/skill')) {
        await sendSkill(chat_id, 'web-design-pro.skill — распакуй в ~/.claude/skills/')
        console.log('skill ->', chat_id)
      } else if (text.startsWith('/anketa') || text.startsWith('/anketka')) {
        // Reply-keyboard с web_app кнопкой — единственный путь, через который sendData() работает.
        await api('sendMessage', {
          chat_id,
          text: 'Жми кнопку снизу, заполни анкету, после отправки она прилетит мне в личку.',
          reply_markup: {
            keyboard: [[{ text: '📝 Заполнить анкету', web_app: { url: ANKETA_URL } }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        })
        console.log('anketa-keyboard ->', chat_id)
      } else if (text.startsWith('/myid')) {
        // Утилита: сообщить юзеру его chat_id (нужно для настройки OWNER_ID).
        await api('sendMessage', {
          chat_id,
          text: `Ваш chat_id: <code>${chat_id}</code>`,
          parse_mode: 'HTML',
        })
        console.log('myid ->', chat_id)
      }
    }
  } catch (e) {
    console.error('loop err', e.message)
    await new Promise(r => setTimeout(r, 3000))
  }
}
