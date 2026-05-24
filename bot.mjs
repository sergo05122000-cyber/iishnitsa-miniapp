// Простой polling-бот: /start -> inline-кнопка с web_app
const TOKEN = process.env.BOT_TOKEN
const URL = process.env.MINIAPP_URL
const API = `https://api.telegram.org/bot${TOKEN}`

async function api(method, payload) {
  const r = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
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
      if (text === '/start' || text === '/start@App_meenee_bot') {
        await api('sendMessage', {
          chat_id,
          text: 'Привет. Жми кнопку чтобы открыть ИИшницу.',
          reply_markup: {
            inline_keyboard: [[{ text: '🥚 Открыть ИИшницу', web_app: { url: URL } }]],
          },
        })
        console.log('start ->', chat_id)
      }
    }
  } catch (e) {
    console.error('loop err', e.message)
    await new Promise(r => setTimeout(r, 3000))
  }
}
