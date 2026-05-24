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

// Закрытая группа ИИшница — куда ведёт кнопка "Открыть в Telegram"
export const TG_GROUP_INVITE = 'https://t.me/+rVKsd93z5AQ1MTg6'
// Канал блога (на случай если когда-то понадобится прямая ссылка на канал)
export const TG_CHANNEL = 'road_iishnika'
export const tgUrlFor = (channel?: string, msgId?: string | number) => {
  // Если у поста явно указан channel и msgId — ссылаемся на сообщение в канале.
  if (channel && msgId) return `https://t.me/${channel}/${msgId}`
  // По умолчанию — ведём в закрытую группу клуба.
  return TG_GROUP_INVITE
}
const today = new Date()
const dayBack = (d: number) => new Date(today.getTime() - d*86400000).toLocaleDateString('ru-RU')
// Деплой на Vercel root — base "/"
const BASE = '/'
const asset = (p: string) => `${BASE}${p}`

export const channelName = 'ИИшница'
export const channelSubtitle = '7 разделов · приватный клуб'

export const folders: Folder[] = [
  {
    id: 'chat', icon: 'message', title: 'Жила была', subtitle: 'Открытый чат клуба',
    count: 0, accent: 'from-sky-400 to-blue-500',
    posts: [
      { id: 'c1', title: 'Открытый чат', excerpt: 'Болтаем о чём угодно по теме клуба', date: dayBack(0), type: 'text', pinned: true },
    ],
  },
  {
    id: 'cases', icon: 'trophy', title: 'Кейсы и результаты', subtitle: 'Сделал агента, автоматизировал процесс, сэкономил время',
    count: 0, accent: 'from-orange-500 to-red-500',
    posts: [
      { id: 'k1', title: 'Залейте свой первый кейс', excerpt: 'Что сделал, сколько часов сэкономил, кто заплатил', date: dayBack(0), type: 'text', pinned: true },
    ],
  },
  {
    id: 'automations', icon: 'zap', title: 'Автоматизации', subtitle: 'Скрипты, n8n, make, zapier',
    count: 0, accent: 'from-emerald-500 to-teal-500', closed: true, posts: [],
  },
  {
    id: 'agents', icon: 'cpu', title: 'AI-агенты', subtitle: 'Сборка и продакшен AI-агентов',
    count: 0, accent: 'from-violet-500 to-fuchsia-500', closed: true, posts: [],
  },
  {
    id: 'kb', icon: 'book', title: 'База знаний', subtitle: 'Промпты, шаблоны, скиллы, чек-листы',
    count: 0, accent: 'from-amber-500 to-yellow-500',
    posts: [
      {
        id: 'kb-learning-skills',
        title: '5 скиллов для обучения и саморазвития',
        excerpt: 'Пакет скиллов для Claude Code: персональный план изучения, study-buddy, выжимки книг, конструктор курса, деловой английский.',
        date: dayBack(0),
        type: 'file',
        pinned: true,
        fileUrl: asset('files/learning-skills.zip'),
        fileName: 'learning-skills.zip',
        fileSize: '15 KB',
        body: `Пакет из 5 скиллов под обучение, разбор информации и упаковку своих знаний.

Что внутри:
1. skill-roadmap-builder — персональный план освоения навыка с ресурсами и этапами. С чего начать, в каком порядке, реалистичные дедлайны.
2. study-buddy — объясняет тему простым языком, проверяет понимание через вопросы. Как репетитор, не как Wikipedia.
3. book-summarizer — выжимка книги до применимых идей и выводов. Не пересказ сюжета — то что можно использовать.
4. course-outline-creator — структурирует знания в курс/гайд: модули, уроки, домашки. Для упаковки экспертизы в продукт.
5. english-work-booster — деловой английский: переписка с клиентами, LinkedIn, Upwork, профили, оффер.

Как поставить:
1. Скачай архив по кнопке ниже.
2. Распакуй (внутри 5 папок).
3. Скопируй все папки в ~/.claude/skills/ (для всех проектов) или в .claude/skills/ конкретного проекта.
4. Триггер автоматический — напиши «составь план как освоить n8n за месяц» и подхватится skill-roadmap-builder.

Сильные связки:
- skill-roadmap-builder + study-buddy = составил план, по каждому пункту разбираешься через объяснения.
- book-summarizer + course-outline-creator = выжал книгу, упаковал в свой мини-курс.
- english-work-booster = выходишь на западные платформы (Upwork, LinkedIn) когда наработаешь портфолио.`,
      },
      {
        id: 'kb-content-skills',
        title: '6 скиллов для контент-маркетинга',
        excerpt: 'Пакет скиллов для Claude Code: хуки, рилс/шортс, посты в ТГ, контент-план, подписи, переупаковка контента.',
        date: dayBack(0),
        type: 'file',
        pinned: true,
        fileUrl: asset('files/content-skills.zip'),
        fileName: 'content-skills.zip',
        fileSize: '20 KB',
        body: `Пакет из 6 скиллов под весь цикл создания контента — для блога, ТГ-канала, рилсов, Instagram.

Что внутри:
1. viral-hook-generator — цепляющие заголовки и первые строки. Боли, провокация, любопытство.
2. reels-shorts-writer — сценарии для Reels/Shorts/TikTok с хуком в первые 3 секунды.
3. telegram-post-master — посты для ТГ-каналов под СНГ-аудиторию, правильный ритм и вовлечение.
4. content-calendar — контент-план на неделю/месяц под нишу и частоту публикаций.
5. caption-genius — подписи к фото для Instagram, ВК, Threads. Коротко, живо, с характером.
6. repurpose-engine — берёт одну идею и делает 5-7 форматов: пост, сторис, тезисы для видео, email, цитата.

Как поставить:
1. Скачай архив по кнопке ниже.
2. Распакуй (внутри 6 папок).
3. Скопируй все 6 папок в ~/.claude/skills/ (Mac/Linux) или в .claude/skills/ конкретного проекта.
4. Скиллы триггерятся автоматически — например напиши "напиши пост в ТГ про X" и подхватится telegram-post-master.

Связка: viral-hook-generator + reels-shorts-writer = готовое короткое видео под рилс. content-calendar + repurpose-engine = месячный план + автоматическая переупаковка под все площадки.`,
      },
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
      {
        id: 'kb-tz-ii-prodavets',
        title: 'ТЗ на ИИ-продавца для мессенджеров',
        excerpt: 'Полный шаблон ТЗ для генерации промпта текстового ИИ-продавца: роль, технология поведения, 5 этапов воронки, сильные смыслы, отработка возражений, продуктовая линейка.',
        date: dayBack(0),
        type: 'file',
        pinned: true,
        fileUrl: asset('files/tz-ii-prodavets.md'),
        fileName: 'tz-ii-prodavets.md',
        fileSize: '12 KB',
        body: `Готовый шаблон ТЗ для генерации промпта ИИ-продавца, который ведёт переписку с лидами в мессенджерах (Telegram, WhatsApp, VK, Instagram-DM).

Под ChatGPT 5.1, GPT-4o, Claude Sonnet — любая модель уровня senior LLM.

Что внутри:
- Блок 1 РОЛЬ — имя, должность, контекст обращений, источники трафика, обещания, стилистика
- Блок 2 ТЕХНОЛОГИЯ ПОВЕДЕНИЯ — ключевая цель + универсальные правила
- 5 этапов воронки — установление контакта, выявление потребностей, презентация решения, закрытие на следующий шаг, коммуникация после закрытия
- Блок 3 Сильные смыслы — выгоды, кейсы, отзывы (где применять)
- Блок 4 Отработка возражений — алгоритм в 2 сообщения, обязательные запреты
- Блок 5 Продуктовая линейка — KB продукта и акции
- Доп. пожелания и контекст под конкретный бизнес

Как использовать:
1. Скачай файл по кнопке ниже.
2. Заполни пустые поля под свой бизнес (ниша, цель, мессенджер, продуктовая линейка, обещания из рекламы).
3. Прокинь заполненный ТЗ в любую LLM с запросом "сгенерируй промпт по этому ТЗ".
4. Полученный промпт встрой в бота / агента / FastAPI Worker.

Ключевые принципы шаблона:
- Запрещены примеры диалогов (только правила и смыслы)
- Запрещено описывать внешние интеграции (CRM/API/вебхуки)
- Запрещены "присоединения" вроде "понимаю", "спасибо за уточнение"
- Запрещено сообщать что это ИИ — позиционирование как человека
- Один вопрос на сообщение
- Возражения отрабатываются в 2 сообщения с повторным закрытием
- Точное время следующего шага не предлагать — эксперт согласует сам`,
      },
    ],
  },
  {
    id: 'intro', icon: 'users', title: 'Знакомства', subtitle: 'Расскажи коротко: кто ты, откуда пришёл и зачем',
    count: 0, accent: 'from-indigo-500 to-blue-600',
    posts: [
      { id: 'i1', title: 'Анкета новичка', excerpt: 'Имя · город · чем занимаешься · зачем пришёл в ИИшницу', date: dayBack(0), type: 'text', pinned: true },
    ],
  },
  {
    id: 'qna', icon: 'help', title: 'Вопросы и разборы', subtitle: 'Задавай любой вопрос по ИИ и автоматизации',
    count: 0, accent: 'from-rose-500 to-pink-500',
    posts: [
      { id: 'q1', title: 'Как задавать вопросы', excerpt: 'Контекст · что пробовал · что не получилось · что ждёшь', date: dayBack(0), type: 'text', pinned: true },
    ],
  },
]
