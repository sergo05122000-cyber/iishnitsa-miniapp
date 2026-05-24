export type Post = {
  id: string
  title: string
  excerpt: string
  date: string
  type: 'text' | 'video' | 'pdf' | 'mixed' | 'voice'
  pinned?: boolean
}
export type Folder = {
  id: string
  icon: string
  title: string
  subtitle: string
  count: number
  accent: string
  closed?: boolean
  posts: Post[]
}
const today = new Date()
const dayBack = (d: number) => new Date(today.getTime() - d*86400000).toLocaleDateString('ru-RU')

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
    id: 'kb', icon: '📚', title: 'База знаний', subtitle: 'Промпты, шаблоны, чек-листы',
    count: 0, accent: 'from-amber-500 to-yellow-500', closed: true, posts: [],
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
