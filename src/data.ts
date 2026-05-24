export type Post = {
  id: string
  title: string
  excerpt: string
  date: string
  type: 'text' | 'video' | 'pdf' | 'mixed' | 'voice' | 'file'
  pinned?: boolean
  body?: string
  fileUrl?: string
  fileName?: string
  fileSize?: string
  tgUrl?: string  // прямая ссылка на сообщение в TG (https://t.me/<channel>/<msg_id>)
}
export type Folder = {
  id: string
  icon: string
  title: string
  subtitle: string
  count: number
  accent: string
  closed?: boolean
  tgChannel?: string  // username канала без @
  posts: Post[]
}

// Главный TG-канал клуба. Кнопка "Открыть в Telegram" ведёт сюда, если у поста нет своего tgUrl.
export const TG_CHANNEL = 'road_iishnika'
export const tgUrlFor = (channel?: string, msgId?: string | number) => {
  const ch = channel || TG_CHANNEL
  return msgId ? `https://t.me/${ch}/${msgId}` : `https://t.me/${ch}`
}
const today = new Date()
const dayBack = (d: number) => new Date(today.getTime() - d*86400000).toLocaleDateString('ru-RU')
// Production base path is hardcoded to avoid import.meta.env.BASE_URL — старый iOS WebKit может не поддерживать import.meta в модулях
const BASE = '/iishnitsa-miniapp/'
const asset = (p: string) => `${BASE}${p}`

export const channelName = 'ИИшница'
export const channelSubtitle = '7 разделов · приватный клуб'

export const folders: Folder[] = [
  {
    id: 'chat', icon: '🗣', title: 'Жила была', subtitle: 'Чатик',
    count: 0, accent: 'from-sky-400 to-blue-500',
    posts: [
      { id: 'c1', title: 'Открытый чат', excerpt: 'Болтаем о чём угодно по теме клуба', date: dayBack(0), type: 'text', pinned: true },
    ],
  },
  {
    id: 'cases', icon: '🔥', title: 'Кейсы и результаты', subtitle: 'Сделал агента, автоматизировал процесс, сэкономил время',
    count: 0, accent: 'from-orange-500 to-red-500',
    posts: [
      { id: 'k1', title: 'Залейте свой первый кейс', excerpt: 'Что сделал, сколько часов сэкономил, кто заплатил', date: dayBack(0), type: 'text', pinned: true },
    ],
  },
  {
    id: 'automations', icon: '🚗', title: 'Автоматизации', subtitle: 'Скрипты, n8n, make, zapier',
    count: 0, accent: 'from-emerald-500 to-teal-500', closed: true, posts: [],
  },
  {
    id: 'agents', icon: '🤖', title: 'Ai Агенты', subtitle: 'Сборка и продакшен AI-агентов',
    count: 0, accent: 'from-violet-500 to-fuchsia-500', closed: true, posts: [],
  },
  {
    id: 'kb', icon: '📚', title: 'База знаний', subtitle: 'Промпты, шаблоны, скиллы, чек-листы',
    count: 0, accent: 'from-amber-500 to-yellow-500',
    posts: [
      {
        id: 'kb-web-design-pro',
        title: 'Скилл web-design-pro для Claude Code',
        excerpt: 'Готовый skill для генерации профессиональных сайтов: 8 дизайн-направлений, AIDA-структура, компоненты и анимации.',
        date: dayBack(0),
        type: 'file',
        pinned: true,
        fileUrl: asset('files/web-design-pro.skill'),
        fileName: 'web-design-pro.skill',
        fileSize: '17 KB',
        body: `Скилл для Claude Code, который превращает агента в фронтенд-дизайнера уровня senior.

Что внутри:
- SKILL.md — алгоритм выбора стиля, структуры, копирайта под лендинги, портфолио, SaaS, бизнес-сайты.
- references/website-creation.md (46 KB) — готовые компоненты: hero, navbar, features, pricing, FAQ, footer + анимации, эффекты, шрифтовые пары, паттерны адаптивности.

Как поставить:
1. Скачай файл по кнопке ниже.
2. Распакуй (это zip, переименованный в .skill).
3. Скопируй папку web-design-pro в ~/.claude/skills/ (для всех проектов) или в .claude/skills/ конкретного проекта.
4. В чате с Claude Code напиши "сделай лендинг про X" — скилл подхватится автоматически.

Когда триггерится:
"сделай сайт", "напиши лендинг", "сверстай страницу", "frontend", "веб-приложение", "адаптивный сайт", "одностраничник" — и любые синонимы.

Этот мини-апп переделан с применением этого скилла. Направление — Editorial × Tech (Space Grotesk + Inter).`,
      },
    ],
  },
  {
    id: 'intro', icon: '👮', title: 'Знакомства', subtitle: 'Расскажи коротко: кто ты, откуда пришёл и зачем',
    count: 0, accent: 'from-indigo-500 to-blue-600',
    posts: [
      { id: 'i1', title: 'Анкета новичка', excerpt: 'Имя · город · чем занимаешься · зачем пришёл в ИИшницу', date: dayBack(0), type: 'text', pinned: true },
    ],
  },
  {
    id: 'qna', icon: '❓', title: 'Вопросы и разборы', subtitle: 'Задавай любой вопрос по ИИ и автоматизации',
    count: 0, accent: 'from-rose-500 to-pink-500',
    posts: [
      { id: 'q1', title: 'Как задавать вопросы', excerpt: 'Контекст · что пробовал · что не получилось · что ждёшь', date: dayBack(0), type: 'text', pinned: true },
    ],
  },
]
