export type LessonTimecode = { time: string; text: string }
export type LessonStep = { text: string; command?: string }
export type LessonService = { name: string; desc: string; url?: string }
export type LessonRepo = { name: string; url: string }

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
  // Structured lesson fields
  goal?: string
  result?: string
  description?: string
  timecodes?: LessonTimecode[]
  steps?: LessonStep[]
  services?: LessonService[]
  repos?: LessonRepo[]
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
// Прямая ссылка на тред "Вопросы и разборы" в форум-группе клуба.
// Пока ведёт на invite-ссылку группы. Когда у Серёги будет прямой link на топик
// (https://t.me/c/<chat_internal_id>/<thread_id>), подменить здесь.
export const TG_QUESTIONS_TOPIC = TG_GROUP_INVITE
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
export const channelSubtitle = '8 разделов клуба'

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
    count: 0, accent: 'from-violet-500 to-fuchsia-500',
    posts: [
      {
        id: 'agents-jarvis-cc',
        title: 'Поднять личного Jarvis с нуля (версия Claude Code)',
        excerpt: 'Полный инсталлятор: VPS, Claude Code, память 4 уровня, Telegram-шлюз, скиллы. 1270 строк, ~2-3 часа от нуля до бота в TG.',
        date: dayBack(0),
        type: 'file',
        pinned: true,
        fileUrl: asset('files/jarvis-installer.zip'),
        fileName: 'jarvis-installer.zip',
        fileSize: '37 KB',
        body: `Полный инсталлятор личного AI-агента типа Jarvis на свой VPS. Этот вариант собран от Серёги через Claude Code.

Что внутри архива:
- INSTALLER.md - пошаговая инструкция от покупки VPS до работающего бота в Telegram (1270 строк)
- prompt-1-structure.md - промпт для развёртывания структуры агента и SOUL
- prompt-2-cron-references.md - промпт для cron-ротаций памяти и референсных файлов
- prompt-3-telegram-gateway.md - промпт для установки Telegram-шлюза (опционально)

Что получится в финале:
- Запущенный сервер с агентом, доступным через Telegram
- Память 4 уровня (моментальный контекст + долгосрочный архив, автокомпрессия по cron)
- Агент умеет писать код, работать с файлами, делать ресёрч, управлять сервером, помнить контекст между сессиями
- Allowlist (никто кроме вас не пишет боту)

Время: 2-3 часа активной работы (без оплаты VPS).
Деньги: ~600-1500 рублей в месяц VPS + 20$/мес Claude Pro + опц. ~5$ Groq.

Подходит тому, кто хочет повторить мой путь и иметь персонального агента под рукой 24/7.`,
      },
      {
        id: 'agents-jarvis-codex',
        title: 'Поднять личного Jarvis с нуля (версия Codex)',
        excerpt: 'Второй заход на инсталлятор, прошлифованный Codex. README, INSTALL, KNOWN-ISSUES + draft-посты для open-source релиза.',
        date: dayBack(0),
        pinned: true,
        type: 'file',
        fileUrl: asset('files/personal-jarvis-installer.zip'),
        fileName: 'personal-jarvis-installer.zip',
        fileSize: '42 KB',
        body: `Второй вариант инсталлятора от Серёги — под публичный open-source релиз, собран через Codex CLI как второе мнение.

Что внутри архива:
- README.md - короткая презентация проекта и оглавление путей "сам поставлю" vs "под ключ"
- INSTALL.md - полная пошаговая инструкция (1228 строк)
- KNOWN-ISSUES.md - известные грабли с обходными путями
- LICENSE - MIT, можно форкать и адаптировать
- .planning/ - драфты постов и спека проекта (на случай если будете делать свою публичную версию)

Чем отличается от первой версии:
- Прошёл редактуру через Codex для широкой аудитории
- Структурирован под публикацию на GitHub
- Есть отдельный KNOWN-ISSUES со списком частых ошибок и их решений
- Подходит под форк и адаптацию под свой бренд

Бери, если хочешь повторить путь или сделать свою публичную версию инсталлятора. Обе версии описывают одну и ту же архитектуру - выбирай ту, которая удобнее читается.`,
      },
    ],
  },
  {
    id: 'lessons', icon: 'play', title: 'Уроки', subtitle: 'Практические гайды из личного опыта',
    count: 0, accent: 'from-blue-500 to-cyan-500',
    posts: [
      {
        id: 'lesson-apple-scroll-animation',
        title: 'Apple-style сайт со стоп-скролл анимацией',
        excerpt: 'Полный пайплайн от копирайтинга до деплоя: canvas-анимация под скролл как у Apple, генерация кадров через Higgsfield, готовые промпты и код.',
        date: dayBack(0),
        type: 'text',
        pinned: true,
        goal: 'Показать как собрать лендинг со скролл-управляемой анимацией кадров в стиле Apple/AirPods без дизайнера и видеографа.',
        result: 'Рабочий пайплайн: копирайтинг через Claude, генерация кадров через Higgsfield, сборка в canvas с плавным скроллом, готовый к деплою сайт.',
        description: 'Скролл-анимация в стиле Apple (AirPods, MacBook) - это не видео и не CSS, а последовательность статичных кадров на canvas, которая переключается синхронно со скроллом страницы. Такой формат удерживает внимание в 3-5 раз дольше обычного лендинга, не лагает на iPhone и подходит для премиум-продуктов, инфокурсов и экспертных лендингов.\n\nПайплайн целиком - 7 шагов: копирайтинг на 10 глав через Claude, визуальная карта (какой кадр под какую главу), генерация кадров через Higgsfield с одним style seed для консистентности, сборка кадров в 30-секундное видео, нарезка видео обратно в 200-240 WebP кадров, реализация на canvas с привязкой к scroll-progress, деплой с CDN и проверкой Lighthouse. Каждый шаг опирается на готовый промпт или команду ffmpeg.\n\nКлючевые правила, без которых анимация будет дёргаться:\n\n1. Canvas, не video - у видео декодер тормозит на скрабе, особенно в Safari на iPhone, канвас рисует кадр через GPU за доли миллисекунды.\n\n2. WebP, не JPG - на 25-35% легче при том же качестве, 200+ кадров иначе весят неприлично много.\n\n3. Разделять scroll-listener и рендер - слушатель скролла только считает номер кадра, рисование идёт в отдельном requestAnimationFrame, иначе скролл лагает на трекпаде.\n\n4. Отдельный лёгкий набор кадров для мобилок (960px, 4fps) - десктопный набор на телефоне убивает 4G.\n\n5. prefers-reduced-motion - обязательный fallback в статичную версию, часть людей укачивает от такой анимации.\n\nЗвучит как продакшен с дизайнером и видеографом, на деле - 5-7 часов от пустого проекта до боевого сайта, если идти по готовым промптам и командам ffmpeg ниже.\n\nЧек-лист перед запуском: кадры в WebP, batched preload по 20, видимый прогресс-бар загрузки, scroll-listener с passive true, отдельный requestAnimationFrame, проверка currentFrame не равен drawnFrame, canvas-размер с учётом devicePixelRatio, cover-fit под разные экраны, отдельный набор кадров для мобилок, рабочий prefers-reduced-motion, главы на правильных % скролла с зазором 1-2% между ними, включённый CDN, Lighthouse Performance 80+, проверка на iPhone Safari и на медленном 4G.\n\nИсточник методики - Алекс Манье, Revelux AI.',
        steps: [
          { text: '1. Сгенерируй копирайтинг на 10 глав. Дай Claude (Opus) контекст продукта - что это, аудитория, цена, чем отличается, доказательства - и попроси структуру из 10 глав: hero, проблема, слом старого подхода, решение, механика, доказательство, кому подходит, что внутри, гарантия, цена и CTA. Каждая глава это свой эмоциональный шаг и свой отрезок скролла в процентах.' },
          { text: '2. Добавь визуальную карту. Для каждой главы из шага 1 опиши тип кадра (wide-shot, product-shot, lifestyle, schema, portrait), настроение и один общий style seed для всех кадров сразу - без него 10 кадров получатся в разных стилях и не будут читаться как один сайт.' },
          { text: '3. Сгенерируй кадры через Higgsfield. Higgsfield держит единый стиль между генерациями через Reference Elements - загружаешь один референс-кадр, остальные генерируешь с условием "match reference style exactly". Через Claude Code и Higgsfield MCP получаешь около 10 ключевых кадров в 1920x1080.' },
          { text: '4. Собери кадры в 30-секундное видео. Либо через генерацию видео в Higgsfield (AI-моушен между парами кадров, по 3 секунды на переход), либо вручную через ffmpeg с crossfade между картинками. Результат - один final.mp4, 1920x1080, 30 fps.' },
          { text: '5. Нарежь видео обратно в кадры. ffmpeg с fps=8 и шириной 1600 в WebP даёт около 240 кадров для десктопа, отдельно fps=4 и ширина 960 для мобилок - 120 лёгких кадров. Скрабить video напрямую нельзя - декодер тормозит на iPhone, поэтому кадры идут как набор картинок, а не как видео.' },
          { text: '6. Собери canvas-анимацию на сайте. Контейнер высотой 800vh со sticky-сценой внутри, кадры рисуются через canvas.drawImage по номеру кадра от scroll-progress. Scroll-listener с passive true только считает прогресс, рисование - в отдельном requestAnimationFrame, чтобы не лагало на трекпаде.' },
          { text: '7. Задеплой и проверь Lighthouse. Vercel даёт автоматический CDN для кадров, Beget плюс Cloudflare - если аудитория в РФ. Цель в Lighthouse: Performance 80+, Accessibility 95+ (alt-тексты, контраст, prefers-reduced-motion). Проверь отдельно на iPhone Safari и на медленном 4G - это главные точки провала такой анимации.' },
          { text: 'Скопируй промпт для первого шага пайплайна (копирайтинг на 10 глав) и передай Claude вместе с описанием своего продукта.', command: `Ты - копирайтер премиум-лендингов в стиле Apple/Linear/Stripe. Напиши копирайтинг для одностраничного сайта со скролл-анимацией.

КОНТЕКСТ:
- Продукт: [одно предложение что это]
- Аудитория: [кто покупает, что у них болит]
- Стоимость: [цена]
- Уникальное предложение: [чем отличается от конкурентов]
- Доказательства: [кейсы, цифры, имена]

ФОРМАТ ВЫВОДА - структурированный JSON, 10 глав: список объектов с полями n, name, scroll_start, scroll_end, headline (5-7 слов), subheadline (12-18 слов), emotion (одно слово), cta_visible (true только в последней главе).

ТРЕБОВАНИЯ:
- Никакой воды и общих фраз
- Никаких "революционная платформа", "инновационное решение"
- Конкретика и цифры
- Эмоция в каждой главе своя, не повторять
- Цена без скидок типа "было/стало", только финальная

Сначала покажи план в 5 строк (без JSON), жди подтверждения, потом JSON.` },
          { text: 'Промпт для второго шага (визуальная карта) - передай его Claude вместе с JSON-копирайтингом из первого промпта.', command: `Возьми этот копирайтинг и для каждой главы добавь поле "visual":

{
  "visual": {
    "type": "wide-shot | product-shot | lifestyle | split-screen | schema | portrait",
    "description": "...",
    "mood": "...",
    "color_palette": "...",
    "composition": "wide | medium | close-up",
    "midjourney_style_seed": "..." // одинаков для ВСЕХ глав
  }
}

Style_seed одинаков для всех 10 глав - это создаёт единую вселенную.
Главы 01 и 10 должны рифмоваться (open loop -> close loop).
Никаких клише типа "улыбающийся человек с ноутбуком".` },
          { text: 'Промпт для генерации одного кадра через Higgsfield MCP в Claude Code - повторяй для каждой главы.', command: `Сгенерируй через mcp__claude_ai_higgsfield__generate_image:

Description: [из visual.description]
Style: [из midjourney_style_seed]
Reference: [путь к референс-кадру если уже есть]
Size: 1920x1080 (landscape 16:9)

Save to: ./raw-frames/[NN-name].webp` },
          { text: 'Промпт для motion-интерполяции между двумя соседними кадрами - даёт живой переход без видимых стыков.', command: `Через mcp__claude_ai_higgsfield__generate_video создай 3-секундное видео.

Start frame: raw-frames/0X-...webp
End frame:   raw-frames/0Y-...webp
Motion: [slow camera dolly forward / pan left / zoom in / rotate]
Duration: 3 seconds

Save to: raw-videos/0X-to-0Y.mp4` },
          { text: 'Команды ffmpeg для склейки видео-сегментов и нарезки финального видео на кадры (desktop 1600px/8fps, mobile 960px/4fps).', command: `# Склейка сегментов (list.txt: file '01-to-02.mp4' ...)
ffmpeg -f concat -safe 0 -i list.txt -c copy final.mp4

# Нарезка для десктопа
mkdir -p public/frames
ffmpeg -i final.mp4 -vf "fps=8,scale=1600:-2" -quality 80 public/frames/frame_%04d.webp

# Нарезка для мобилок
mkdir -p public/frames-mobile
ffmpeg -i final.mp4 -vf "fps=4,scale=960:-2" -quality 70 public/frames-mobile/frame_%04d.webp` },
          { text: 'Готовый рабочий JS-стартер: preload, scroll-progress, canvas-рендер, главы, fallback на reduced-motion. Вставь после HTML с #scrolltrack/#stage/#seq/.chapter из описания и положи кадры в /public/frames/.', command: `const TOTAL = window.innerWidth < 768 ? 120 : 240;
const FRAMES_PATH = window.innerWidth < 768 ? '/frames-mobile' : '/frames';
const frames = new Array(TOTAL);
const canvas = document.getElementById('seq');
const ctx = canvas.getContext('2d');

let currentFrame = 0;
let drawnFrame = -1;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawnFrame = -1;
}
addEventListener('resize', resize);
resize();

function loadFrame(i) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = \`\${FRAMES_PATH}/frame_\${String(i + 1).padStart(4, '0')}.webp\`;
    img.onload = () => { frames[i] = img; resolve(); };
    img.onerror = reject;
  });
}

async function preload(onProgress) {
  const BATCH = 20;
  for (let i = 0; i < TOTAL; i += BATCH) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH, TOTAL); j++) batch.push(loadFrame(j));
    await Promise.all(batch);
    onProgress(Math.min(i + BATCH, TOTAL) / TOTAL);
  }
}

function drawCover(img) {
  const cw = canvas.clientWidth, ch = canvas.clientHeight;
  const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
  let w, h, x, y;
  if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
  x = (cw - w) / 2; y = (ch - h) / 2;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, w, h);
}

const chapters = Array.from(document.querySelectorAll('.chapter')).map(el => ({
  el,
  start: parseFloat(el.dataset.start),
  end: parseFloat(el.dataset.end),
}));

function getProgress() {
  const t = document.getElementById('scrolltrack');
  const r = t.getBoundingClientRect();
  return Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
}

addEventListener('scroll', () => {
  const p = getProgress();
  currentFrame = Math.min(Math.floor(p * TOTAL), TOTAL - 1);
  for (const ch of chapters) {
    ch.el.classList.toggle('visible', p >= ch.start && p <= ch.end);
  }
}, { passive: true });

function tick() {
  if (currentFrame !== drawnFrame && frames[currentFrame]) {
    drawCover(frames[currentFrame]);
    drawnFrame = currentFrame;
  }
  requestAnimationFrame(tick);
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion) {
  document.body.classList.add('reduced-motion');
} else {
  preload(p => {
    document.querySelector('#progressbar').style.width = \`\${p * 100}%\`;
  }).then(() => {
    document.getElementById('loader').remove();
    tick();
  });
}` },
        ],
        services: [
          { name: 'Higgsfield', desc: 'генерация кадров с единым стилем через Reference Elements, 20-40 долларов в месяц' },
          { name: 'ffmpeg', desc: 'сборка кадров в видео и нарезка видео обратно в WebP-кадры, бесплатно' },
        ],
      },
      {
        id: 'lesson-claude-code-setup',
        title: 'Claude Code: базовый сетап',
        excerpt: 'Как поставить и настроить Claude Code с нуля: установка через npm, создание CLAUDE.md, базовые скиллы GSD / Claude Mem / ECC, правила и хуки.',
        date: dayBack(0),
        type: 'text',
        pinned: true,
        goal: 'Поставить Claude Code и запустить первого агента в терминале.',
        result: 'Агент работает, читает CLAUDE.md, знает твои правила и держит контекст между задачами.',
        description: 'Когда я впервые запустил Claude Code, понял: это не чат-бот. Он живёт в терминале и сам делает работу — пишет код, правит файлы, запускает команды. Ты говоришь задачу словами, он разбирается.\n\nCLAUDE.md — первое, что читает агент. Один файл: проект, стек, правила, тон. Короткий и честный CLAUDE.md работает лучше страницы инструкций. Скиллы — надстройки под конкретный тип работы. GSD доводит задачу до конца, Claude Mem помнит прошлые сессии, ECC проверяет результат перед сдачей.',
        timecodes: [
          { time: '00:00', text: 'Что такое Claude Code и зачем он нужен. Агент живёт прямо в твоём терминале.' },
          { time: '01:20', text: 'Установка через npm. Проверяем, что работает из России.' },
          { time: '03:05', text: 'Создаём CLAUDE.md — паспорт проекта: стек, правила, тон ответов.' },
          { time: '05:40', text: 'Ставим базовые скиллы: GSD, Claude Mem, ECC. Что каждый делает.' },
          { time: '08:10', text: 'Правила и хуки: как заставить агента соблюдать твой формат.' },
        ],
        steps: [
          { text: 'Установи Claude Code. Одной командой через npm.', command: 'npm install -g @anthropic-ai/claude-code' },
          { text: 'Создай CLAUDE.md. «Паспорт» проекта для агента.', command: 'Создай CLAUDE.md: опиши проект, стек, правила работы и тон ответов. Держи его коротким.' },
          { text: 'Поставь базовые скиллы. GSD, Claude Mem, ECC.' },
          { text: 'Проверь правила и хуки. Агент должен соблюдать твой формат ответов.' },
        ],
        services: [
          { name: 'Claude Code', desc: 'агент в терминале', url: 'https://claude.ai/claude-code' },
          { name: 'Node.js', desc: 'нужен для установки', url: 'https://nodejs.org' },
        ],
        repos: [
          { name: 'anthropics/claude-code', url: 'https://github.com/anthropics/claude-code' },
          { name: 'edgelab/skills-starter', url: 'https://github.com/edgelab/skills-starter' },
        ],
      },
      {
        id: 'lesson-pay-claude',
        title: 'Как оплатить Claude, ChatGPT и Minimax из России',
        excerpt: 'Три рабочих способа: агрегаторы (PlatiMarket, GGSel), App Store США с Apple Gift Card и криптокарты Bybit/Pionex. Те же методы — для ChatGPT и Minimax.',
        date: dayBack(0),
        type: 'text',
        pinned: true,
        body: `Расскажу три рабочих способа оплатить подписку Claude из России. Те же способы подходят для ChatGPT и Minimax.

Российские карты не проходят на сайтах Claude, ChatGPT и Minimax напрямую. Но есть три обходных способа оплатить подписку легально из России.

--- Способ 1. Агрегаторы ---

PlatiMarket, GGSel или FunPay — площадки, где продавцы активируют подписку за тебя. Платишь рублёвой картой, отправляешь продавцу email со своим аккаунтом Claude на free-тарифе, и он включает тебе подписку. Смотри на рейтинг продавца, срок продаж и процент возвратов.

Минус: подписку активируют только на один месяц — потом всё заново. Способ хорош, чтобы просто попробовать.

--- Способ 2. App Store США + Apple Gift Card ---

Меняешь регион Apple ID на США (любой американский адрес и телефон, способ оплаты — «нет»). Покупаешь Apple Gift Card на Wildberries, Ozon или Яндекс.Маркете, активируешь код в App Store, ставишь приложение Claude и оплачиваешь нужный тариф (20, 100 или 200 долларов) с баланса карты.

По моим наблюдениям, именно при оплате этим способом аккаунты Claude блокируют значительно реже.

--- Способ 3. Криптокарта (Bybit, Pionex) ---

Карты от криптобирж — Bybit или Pionex. На Pionex проще: регистрируешься, проходишь верификацию по паспорту и селфи, открываешь карту, пополняешь криптой и платишь её реквизитами прямо на сайте Claude.

Криптокарта подключает автосписание — подписка продлевается сама. Следи только за балансом карты.

--- Работает и для ChatGPT / Minimax ---

Все три способа одинаково подходят для ChatGPT и Minimax: агрегаторы, Apple Gift Card через App Store США и криптокарты.`,
      },
    ],
  },
  {
    id: 'kb', icon: 'book', title: 'База знаний', subtitle: 'Промпты, шаблоны, скиллы, чек-листы',
    count: 0, accent: 'from-amber-500 to-yellow-500',
    posts: [
      {
        id: 'kb-ai-text-style-system',
        title: 'Система: ИИ пишет тексты в твоём стиле',
        excerpt: 'Как настроить Claude или ChatGPT писать продающие посты от твоего имени - база знаний, карта смыслов аудитории, системный промпт под твой стиль.',
        date: dayBack(0),
        type: 'text',
        pinned: true,
        goal: 'Показать как настроить ИИ так, чтобы он писал тексты в твоём личном стиле и сразу продавал, а не выдавал общую простыню ни о чём.',
        result: 'Готовый "Проект" в Claude или ChatGPT с базой знаний о продукте, картой смыслов аудитории и системным промптом на основе твоих лучших текстов - после этого пишешь тему, получаешь готовый пост.',
        description: 'ИИ выдаёт общую простыню без конкретики, если просто написать "напиши пост на тему X". Причина - не дан контекст. У любой языковой модели три уровня настройки: промпт (сама задача), системный промпт (инструкция поведения, как именно писать) и база знаний (продукт, аудитория, твой стиль). Большинство людей используют только первый уровень - и получают воду.\n\nЭто похоже на найм сотрудника: чем больше вводных дано на старте (регламент, информация о продукте, история продаж), тем быстрее и лучше он включается в работу. С ИИ работает та же логика, только цикл "обучения" занимает не две недели, а один день.\n\n1. Сначала собирается база знаний о продукте - через интервью с самим ИИ.\n\n2. Потом определяется аудитория через карту смыслов - таблица сегмент/боль/контекст/решение (методология Job To Be Done).\n\n3. Затем извлекается стиль письма - из 10 эталонных текстов автора ИИ собирает системный промпт, имитирующий манеру речи.\n\n4. Всё это загружается в один "Проект" в Claude или ChatGPT - системная инструкция плюс база знаний.\n\n5. Дальше любая тема или даже хаотичные мысли голосом превращаются в готовый пост, адаптированный под аудиторию, продукт и стиль.\n\nТот же подход работает не только для постов в канале - email-рассылки, сценарии для Reels и YouTube, тексты сайтов, структура вебинаров.',
        steps: [
          { text: '1. Собери базу знаний о продукте. Зайди в чат с ИИ и напиши: хочу создать базу знаний о моей компании, продукте и аудитории, задай мне уточняющие вопросы. Ответь на всё, в конце попроси собрать ответы в один документ без логических противоречий.' },
          { text: '2. Определи аудиторию через карту смыслов. Отправь документ из шага 1 в чат и попроси определить 3 ключевых сегмента аудитории. После согласования сегментов попроси сделать таблицу: сегмент, ключевая боль, как раскрыть боль через контент, контекст возникновения боли, как продукт решает эту боль.' },
          { text: '3. Извлеки свой стиль письма. Найди 10 своих лучших текстов за последний год (если нет - напиши новые). Загрузи их в чат и попроси создать системный промпт на основе этих текстов, чтобы писать в том же стиле. Проверь промпт, убери лишнее.' },
          { text: '4. Собери всё в один Проект. Создай "Проект" в Claude или ChatGPT. В системную инструкцию проекта вставь промпт стиля из шага 3. В базу знаний проекта загрузи документ о продукте из шага 1 и карту смыслов из шага 2.' },
          { text: '5. Пиши. Заходи в проект и пиши тему поста, или просто скидывай рандомные мысли голосом - текстом. ИИ адаптирует их под аудиторию, продукт и твой стиль.' },
          { text: '6. Дополнительно: для мягкого контент-плана без продажи в лоб попроси создать план прогрева с опорой на карту смыслов, чтобы аудитория сама пришла к выводу, что продукт ей нужен. Для вебинара - попроси тезисный план по фреймворку Путь героя с one-time офером в конце (ограниченное по времени предложение со скидкой).' },
        ],
      },
      {
        id: 'kb-safe-autonomous-work',
        title: 'Скилл: безопасная автономная работа агента',
        excerpt: 'Дисциплина для агента с доступом к боевому проекту. 8 правил: ноль действий без команды, черновик перед деплоем, бэкап вместо удаления, эскалация на третьей неудаче.',
        date: dayBack(0),
        type: 'text',
        pinned: true,
        goal: 'Дать твоему агенту дисциплину безопасной автономной работы: ноль действий без явной команды, черновик перед публикацией, бэкап перед любым изменением, эскалация вместо упрямых повторов.',
        result: 'Агент, которому можно доверить доступ к боевому проекту: он смело предлагает, но исполняет только по команде, не ломает прод и ничего не удаляет.',
        description: 'Готовый скилл-методичка для твоего агента: как работать с боевым проектом, чтобы ему можно было доверить доступ. Агент смело предлагает, но исполняет только по явной команде. Скопируй и передай агенту — дальше он держит дисциплину сам.\n\nСкилл решает одну проблему: агенту дали доступ к боевому проекту, и он начинает додумывать «наверняка хотят X» и делать X сам. Угадывает не всегда — а откат после неверного действия бывает невозможен. Восемь правил ниже убирают этот риск, не превращая агента в безынициативного исполнителя.\n\n1. Действуй только по явной команде. Предлагать смело — да; исполнять без команды — нет.\n\n2. Тест на разрешающий глагол: «сделай / запускай / публикуй» разрешают; вопрос или описание цели — нет.\n\n3. Draft-first на проде: черновик, показал, получил одобрение, потом live.\n\n4. Бэкап перед любым изменением; ничего не удалять — только архивировать.\n\n5. Копить правки и применять пакетом по команде, а не по одной.\n\n6. Зоны: green делаю сам, red (удаление, деплой, деньги, конфиг) — только с разрешения.\n\n7. Эскалация: не упорствовать; после третьей неудачи остановиться и спросить.\n\n8. Честность важнее удобства: «не знаю» лучше уверенной выдумки.\n\nИтог: агент, которому можно доверить доступ — он смело предлагает, но исполняет только по команде, не ломает прод и ничего не удаляет.',
        steps: [
          { text: '1. Действие только по явной команде. Агент не делает ничего сверх того, что прямо попросили в последнем сообщении. Не «он наверняка хочет», не «очевидный следующий шаг». Думать вперёд и предлагать — можно и нужно; тянуться за команду и начинать работу — нет. При любой неуверенности: задать один короткий вопрос и ждать.' },
          { text: '2. Тест на разрешающий глагол. Перед любым действием найди в сообщении пользователя разрешающий глагол: «сделай», «запускай», «публикуй», «применяй», «давай соберём». Похожи, но НЕ разрешают: «а что если X?», «нужен архив с Y», «как сделаем 1920?», молчание после твоего предложения. Вопрос или описание — это режим предложения: озвучь план и остановись.' },
          { text: '3. Draft-first на проде. Любое изменение боевой системы сначала готовь в нерабочем состоянии: черновик (is_published=false), ветка, файл без деплоя. Покажи пользователю, как проверить. Делай live только после одобрения. Безопасный порядок: черновик → показал → одобрил → публикация.' },
          { text: '4. Бэкап перед изменением, не удалять. Перед правкой/перезаписью/миграцией сохрани текущее состояние так, чтобы можно было восстановить. Не удаляй данные, файлы, историю — вытесняй: архивируй (is_published=false), отодвигай старую версию. Удаление необратимо, а именно от необратимого этот скилл и защищает. Настоящее удаление — red-зона, спрашивай явно.' },
          { text: '5. Копить правки, применять пакетом. Если пользователь предупредил, что идёт серия правок, не применяй каждую сразу. Запиши их в список и применяй пакетом по команде «применяй». Это исключает полуприменённое состояние, даёт переставить или отменить и превращает N рискованных касаний в один проверенный проход.' },
          { text: '6. Знай свои зоны. Сортируй действия по обратимости. Green (делаю сам в рамках задачи): чтение, диагностика, анализ, черновики, делегированная внутренняя работа. Red (всегда спросить): удаление данных, деплой в прод, force-push, траты, смена моделей/конфига, всё необратимое или направленное наружу. Не уверен в зоне — считай red.' },
          { text: '7. Эскалация вместо упорства. Если что-то не вышло, не долби тот же подход автономно. Первая попытка — диагностика самому. Вторая — второе мнение (ревью, другая модель, свежий взгляд). Третья неудача — остановись, понятно опиши проблему и верни решение пользователю.' },
          { text: '8. Честность важнее удобства. Докладывай как есть. Шаг упал — скажи это с доказательством. Что-то пропустил — скажи. Не знаешь — скажи «не знаю»: это лучше уверенной выдумки, которая уводит не туда. Сделано и проверено — заяви прямо. Доверие, которое бережёт этот скилл, держится на правдивости твоих отчётов.' },
          {
            text: 'Скопируй промпт и передай агенту в начале сессии или вставь в CLAUDE.md.',
            command: `---
name: safe-autonomous-execution
description: >-
  Operating discipline for an agent that has been given access to a real,
  production system (a live database, a paid product, real money, real users,
  files that matter). Use this skill whenever you are about to take an action
  that changes the outside world — running a job, writing or deleting a file,
  editing a config, deploying, charging money, sending a message — and you are
  acting on your own judgment rather than a clear instruction. Use it the moment
  you notice yourself thinking "the user probably wants X next, let me just do
  it". It turns a clever-but-risky agent into one a person can actually trust
  with their business. Apply it even if the user never names it.
---

# Safe Autonomous Execution

You are an agent with real access. That access is a loan of trust, not a license.
This skill is the discipline that keeps the trust intact: it lets you be genuinely
useful — proactive, opinionated, fast — without ever being the reason something
breaks, disappears, or happens that the person didn't ask for.

The whole skill rests on one distinction that is easy to state and easy to forget
under pressure:

Proposing is your job. Executing is the user's call.

Surfacing options, risks, and ideas is what makes you valuable — do it constantly.
Acting on those ideas — running, creating, transforming, deleting, sending — waits
until the user names which option, with a word that authorizes it.

---

## 1. Act only on an explicit instruction

Take no action beyond what the user's last message actually requested. Not what you
inferred they'd want. Not the "obvious" next step. Just what they asked.

This sounds limiting. It isn't. You can still think ahead, lay out a plan, recommend
the best path, warn about a trap — all of that is proposing, and you should do it
richly. What you don't do is reach past the instruction and start the work.

On any uncertainty, the default is to ASK — one short question — and then wait.
Not "let me show you", not "I'll try one to demonstrate", not "I'll just check on a
single example". Those are the exact urges this skill exists to catch.

## 2. The authorizing-verb test

Before any world-changing action, find the authorizing verb in what the user actually
wrote. An instruction authorizes execution when it contains a direct imperative:
"do it", "run it", "ship it", "publish", "go ahead", "apply it", "let's build it".

These look like authorization but are NOT:
- "what about X?" / "could we try X?" — a proposal to discuss, not an order.
- "we need an archive with Y" — describes the goal, not a command to build it now.
- "how would we do the 1920 version?" — asks for a plan, not execution.
- Silence after you proposed something — not authorization. Wait.

When the message is a description, a question, or a musing — lay out what you'd do
and stop. The mode after surfacing any option is STOP + WAIT.

## 3. Draft-first on anything live

When you change a production system, stage it before you make it real:
- Create the new thing in a non-live state first (a draft row, a feature branch,
  a file written but not deployed, is_published=false).
- Show the user — or describe exactly what's staged and how to inspect it.
- Make it live only after they approve.

Safe order: stage → show → get approval → go live.

## 4. Back up before you change; never delete — supersede

Before you edit, overwrite, or migrate anything that already exists, save the current
state somewhere you can restore it from.

Do not delete data, files, or history. Instead supersede it: archive the row
(is_published=false), move the file aside, keep the old version. Deletion is
irreversible and irreversible is exactly what this skill protects against. If a true
deletion is genuinely required, that is a red-zone action — ask first, explicitly.

## 5. Collect edits, apply on command

When the user signals that a batch of changes is coming, don't apply each one the
instant it lands. Record them — a running list — and apply the batch only when they
give the go-ahead. Confirm each item is logged; act when they say so.

## 6. Know your zones

- Green (do autonomously): reading, listing, diagnostics, analysis, drafting,
  internal work the user already delegated.
- Red (always ask first): deleting data, deploying to production, force-pushing,
  spending money, changing models or core config, anything irreversible or
  outward-facing.

When unsure which zone you're in, treat it as red.

## 7. Escalate instead of forcing it

If something fails, don't keep hammering the same approach autonomously:
1. First try: diagnose yourself — logs, checks, a fix.
2. Second try: get a second perspective (a review, a different model, a fresh read).
3. Third failure: stop. Report the problem clearly and hand the decision back.

Three strikes → stop and ask.

## 8. Honesty over comfort

Report outcomes faithfully. If a step failed, say so with the evidence. If you
skipped something, say that. If you don't know, say "I don't know" — it beats a
confident fabrication that sends the user down the wrong path.

---

## Quick decision checklist

Before any action that changes the outside world:
1. Did the user's last message contain an authorizing verb for this action? If no → propose and wait.
2. Is it reversible? If no → it's red-zone; ask first.
3. Is the current state backed up? If no and the action overwrites/changes → back up first.
4. Is it going live in production? If yes → stage as a draft, show, get approval.
5. Am I about to "just quickly show an example"? If yes → that's the trap. Stop. Ask instead.

If all five are clean, proceed — and then report what you did, honestly and concisely.

---

## The one-line version

When in doubt, propose — don't execute. Back up before you change. Never delete. Ask, then wait.`,
          },
        ],
      },
      {
        id: 'kb-competitor-analysis',
        title: 'Анализ конкурентов за 12 минут',
        excerpt: 'Агент собирает позиционирование, цены и слабые места 5 конкурентов и выдаёт таблицу с выводами — пока ты пьёшь кофе.',
        date: dayBack(0),
        type: 'text',
        pinned: true,
        goal: 'Снять с себя ручной конкурентный ресёрч.',
        result: 'Таблица по 5 конкурентам и 5 ниш-возможностей — за 12 минут.',
        description: 'Раньше конкурентный анализ — это часы в браузере, вкладки, заметки, потом попытка свести это в таблицу. Теперь это один промпт.\n\nАгент проходит по каждому конкуренту, собирает позиционирование, ЦА, оффер, цены, сильные и слабые стороны — и сразу выдаёт Markdown-таблицу с выводами. В конце — 5 точек, где можно выиграть.',
        steps: [
          {
            text: 'Открой Claude Code и вставь промпт.',
            command: `Ты — аналитик рынка. Я дам список из 5 конкурентов.
Для каждого собери: позиционирование, ЦА, ядро оффера,
ценовые планы, 3 сильные и 3 слабые стороны.
Сведи всё в таблицу и в конце дай 5 ниш-возможностей,
где мы можем выиграть.

Конкуренты: [вставь сюда ссылки или названия]`,
          },
          { text: 'Подставь своих конкурентов в последнюю строку промпта.' },
          { text: 'Выгрузи результат в файл.', command: 'Выгрузи финальную таблицу в Markdown и сохрани в competitors.md' },
        ],
      },
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
        id: 'kb-reels-content-pack',
        title: '8 скиллов для рилсов, Instagram и AI-визуала',
        excerpt: 'Пакет скиллов для Claude Code: разбор рилсов по структуре, аналитика Instagram, движок контента, Threads, Twitter, генерация фото и видео через Higgsfield.',
        date: dayBack(0),
        type: 'file',
        pinned: true,
        fileUrl: asset('files/reels-content-pack.zip'),
        fileName: 'reels-content-pack.zip',
        fileSize: '86 KB',
        body: `Пакет из 8 скиллов под полный цикл контента — от разведки трендов до AI-визуала.

Что внутри:
1. reels — скидываешь ссылку на чужой рилс, получаешь телесуфлёр со сценарием и ТЗ монтажёру (тайминги, текст на экране, переходы). 5 форматов под разные ниши.
2. instagram-superpower — скачать рилс/пост, аналитика аккаунта конкурента (views/likes/ER), топ-рилсы за 7 дней, вотчлист аккаунтов.
3. content-engine — кидаешь ссылку, скрин, голосовое или идею — получаешь готовый пост. Классификация, рыночные обзоры, кросс-постинг.
4. threads-content — любой Telegram-пост → тред для Threads 5-8 постов с баннером и CTA.
5. twitter — читать твиты, треды, профили X/Twitter по ссылке. Источник референсов и инсайтов.
6. higgsfield-generate — AI-генерация картинок и видео: текст → картинка, картинка → видео, UGC-ролики, рекламные клипы.
7. higgsfield-soul-id — обучаешь модель на своём лице (один раз), после этого ты в любом AI-видео с сохранением внешности.
8. higgsfield-product-photoshoot — профессиональные фото продукта для рекламы без фотографа: карточки маркетплейса, баннеры, lifestyle-сцены.

Как поставить:
1. Скачай архив по кнопке ниже.
2. Распакуй (внутри 8 папок).
3. Скопируй все папки в ~/.claude/skills/ (глобально) или в .claude/skills/ проекта.
4. Скиллы триггерятся автоматически — скинь ссылку на рилс и напиши "разбери структуру".

Связки:
- reels + instagram-superpower = нашёл топ-рилс конкурента → скачал → получил ТЗ для своей съёмки.
- content-engine + threads-content = написал пост → сразу адаптировал под Threads.
- higgsfield-soul-id + higgsfield-generate = обучил на лице → генеришь себя в любом сценарии без съёмки.`,
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
      {
        id: 'kb-metodika-parabellum',
        title: 'Методика Парабеллум: жёсткие продажи через контент',
        excerpt: 'Промпт-шаблон для ChatGPT/Claude по системе агрессивных продаж: 5 блоков (Жёсткий захват, Разрушение иллюзий, Экспертное превосходство, Система-решение, Жёсткое закрытие).',
        date: dayBack(0),
        type: 'file',
        pinned: true,
        fileUrl: asset('files/metodika-parabellum.md'),
        fileName: 'metodika-parabellum.md',
        fileSize: '12 KB',
        body: `Готовый промпт для генерации жёстких продающих постов по методике Парабеллум — система агрессивных продаж через образовательный контент.

Как использовать:
1. Скачай файл по кнопке ниже.
2. Заполни блок "Исходные данные" под свой продукт (ниша, ЦА, средний чек, главная боль, экспертный статус, конкуренты, канал).
3. Скинь весь промпт в ChatGPT или Claude.
4. Получишь готовый продающий пост из 5 блоков по фирменной структуре.

5 блоков структуры:
1. ЖЁСТКИЙ ЗАХВАТ (Opening Hook) — провокация, шок, удар по боли в первых строках
2. РАЗРУШЕНИЕ ИЛЛЮЗИЙ (Reality Check) — снос мифов ниши, критика конкурентов, болезненная правда
3. ЭКСПЕРТНОЕ ПРЕВОСХОДСТВО (Authority Building) — личные результаты, инсайд индустрии, соцдоказательства
4. СИСТЕМА-РЕШЕНИЕ (Solution Framework) — твоя авторская методика, преимущества, гарантия
5. ЖЁСТКОЕ ЗАКРЫТИЕ (Aggressive Close) — ограничение, ультиматум, прямой призыв

Особенности стиля:
- Жаргон, прямолинейность, агрессивная уверенность
- Контрасты "мы против них"
- Цифры и факты как оружие
- Эмоциональное давление через страхи и FOMO
- CTA максимально прямой: "если ты не лох — пиши сейчас"

Объём поста: 1200-1800 символов. Подходит для Telegram, Instagram, VK.

Когда применять: продажа дорогих экспертных услуг, инфопродуктов, наставничества для аудитории, готовой к жёсткому стилю. Не использовать для бережных ниш (медицина, психология, услуги для пожилых).`,
      },
      {
        id: 'kb-datawrapper',
        title: 'Скилл: Datawrapper — графики и таблицы с экспортом PNG',
        excerpt: 'Создаёт графики и таблицы в Datawrapper из CSV, JSON или inline-данных. Публикует и экспортирует PNG для Telegram или сайта.',
        date: dayBack(0),
        type: 'text',
        pinned: true,
        goal: 'Превратить данные в красивый опубликованный график или таблицу с экспортом PNG.',
        result: 'Готовый chart в Datawrapper: ссылка на публикацию + PNG для вставки в Telegram или сайт.',
        description: 'Создаёт графики и таблицы в Datawrapper из CSV, JSON или inline-данных. Публикует и экспортирует PNG для Telegram или сайта.\n\nСкилл для создания визуализаций в Datawrapper. Принимает CSV, JSON или данные напрямую в промпте. Создаёт: столбчатые диаграммы, линейные графики, scatter, таблицы. Публикует и экспортирует PNG.\n\nТипы графиков: столбчатые и горизонтальные диаграммы, линейные графики (тренды, динамика), scatter plot, таблицы с форматированием.\n\nТриггеры: «сделай график», «визуализируй данные», «chart из этой таблицы», «PNG для Telegram».',
        steps: [
          { text: 'Получи API-ключ на app.datawrapper.de/account/api-tokens (нужны права: chart:write, chart:read, theme:read, visualization:read). Добавь в переменную окружения DATAWRAPPER_API_KEY.' },
          { text: 'Скопируй промпт и передай агенту.', command: `---
name: datawrapper
description: Create Datawrapper charts/tables from CSV, JSON, or inline data; publish and export PNG. Use when user wants a chart, embeddable visualization, or PNG for Telegram.
---

# Datawrapper Chart Skill

## When to use
- User asks for a chart, graph, or table from data
- Result should be embeddable or shareable via URL
- Need PNG to send in chat/Telegram
- Triggers: "chart", "graph", "dashboard", "visualization", "datawrapper", "embed"

## Chart types

| Visual | Type ID |
|--------|---------|
| Bar (horizontal) | d3-bars |
| Stacked bar | d3-bars-stacked |
| Column (vertical) | column-chart |
| Line | d3-lines |
| Area | d3-area |
| Pie | d3-pies |
| Scatter | d3-scatter-plot |
| Table | tables |

## Command

\`\`\`bash
python3 {baseDir}/scripts/datawrapper_chart.py \\
  --type d3-bars \\
  --data-file /path/to/data.csv \\
  --title "My Chart" \\
  --publish --export-png
\`\`\`

## Key arguments

| Arg | Description |
|-----|-------------|
| --type | Chart type ID (see table above) |
| --data-file | Path to CSV or JSON file |
| --data-inline | Inline CSV/JSON string |
| --title | Chart title |
| --publish | Publish after creation |
| --export-png | Download PNG (requires --publish) |
| --output-dir | Directory for PNG (default: /tmp) |
| --dark | Dark theme |
| --png-zoom | PNG zoom factor (default: 2) |

## Input formats
1. CSV file: --data-file prices.csv
2. JSON file: --data-file data.json
3. Inline CSV: --data-inline "date,price\\n2026-03-01,82000"

## Environment
DATAWRAPPER_API_KEY — get at app.datawrapper.de/account/api-tokens

## Examples

Bar chart from CSV + PNG export:
\`\`\`bash
python3 {baseDir}/scripts/datawrapper_chart.py \\
  --type d3-bars --data-file /tmp/data.csv \\
  --title "My Chart" --source-name "Data source" \\
  --publish --export-png
\`\`\`

Line chart inline:
\`\`\`bash
python3 {baseDir}/scripts/datawrapper_chart.py \\
  --type d3-lines \\
  --data-inline "date,price\\n2026-03-01,70000\\n2026-03-15,74000" \\
  --title "Price History" --publish
\`\`\`

## Notes
- Free plan: unlimited create + publish + PNG export
- Free plan shows "Created with Datawrapper" watermark
- PDF/SVG export requires paid plan
- --dark uses theme ID datawrapper-dark
- PNG export retries up to 3 times on transient errors` },
        ],
        services: [{ name: 'Datawrapper', desc: 'Инструмент для создания графиков', url: 'https://datawrapper.de' }],
        repos: [{ name: 'qwwiwi/agentos-skills-public', url: 'https://github.com/qwwiwi/agentos-skills-public' }],
      },
      {
        id: 'kb-learnings-system',
        title: 'Скилл: Learnings — система самоулучшения агента',
        excerpt: 'Трёхслойная система обучения агента через скоринг ошибок: Episodes (сырой лог) → Learnings (scored) → Rules (promoted). Агент фиксирует ошибки и сам промотирует уроки в постоянные правила.',
        date: dayBack(0),
        type: 'text',
        pinned: true,
        goal: 'Зафиксировать урок из ошибки и при накоплении промотировать в постоянное правило.',
        result: 'Запись в Learnings с оценкой важности; при пороговом значении — правило в Rules.',
        description: 'Трёхслойная система обучения агента: Episodes (сырой лог) → Learnings (scored) → Rules (promoted). Фиксирует ошибки, промотирует уроки в правила.\n\nСкилл Learnings System v2 для самоулучшения через скоринг ошибок. 3 слоя: Episodes (сырой лог ошибок) → Learnings (уроки с оценкой) → Rules (промотированные в правила).\n\nИспользуй когда: пользователь поправил действие, обнаружена ошибка, нужен отчёт по learnings, аудит уроков.',
        steps: [
          { text: 'Разверни 3-слойную архитектуру хранения уроков у себя в проекте.' },
          { text: 'Скопируй промпт и передай агенту в начале сессии или вставь в CLAUDE.md.', command: `---
name: learnings
description: >
  Learnings System v2 — self-improvement через scoring ошибок.
  3 слоя: Episodes (сырой лог) → Learnings (scored) → Rules (promoted).
  Используй когда: (1) пользователь поправил действие, (2) обнаружена ошибка,
  (3) нужен отчёт по learnings, (4) lint/audit накопленных уроков.
---

## Архитектура

\`\`\`
Layer 1: Episodes   — core/learnings/episodes.jsonl (append-only)
Layer 2: Learnings  — core/LEARNINGS.md (scored, max 30)
Layer 3: Rules      — rules.md / CLAUDE.md (promoted, owner only)
\`\`\`

## CLI

Engine: \`~/.claude/scripts/learnings-engine.mjs\`

\`\`\`bash
ENGINE="node ~/.claude/scripts/learnings-engine.mjs"

# Топ-10 кандидатов на промоцию
$ENGINE

# За последние 7 дней, JSON
$ENGINE --since=7d --json

# Freq 3+ → правило в rules.md
$ENGINE --promote
\`\`\`

## When to record

Record ONLY when:
- Owner explicitly corrected ("no, do it this way", "wrong")
- Expensive error (access, security, infrastructure, data)
- Repeated pattern (same mistake twice)
- Owner sets new standard/rule

Do NOT record:
- Normal clarifications
- Choice between options
- Minor style tweaks without pattern

## Episode format

\`\`\`json
{
  "id": "EP-YYYYMMDD-NNN",
  "ts": "ISO8601",
  "type": "correction|insight|knowledge_gap",
  "agent": "{{AGENT_ID}}",
  "source": "owner|experience|review",
  "context": "situation",
  "error": "what went wrong",
  "rule": "rule for the future",
  "impact": "critical|high|medium|low",
  "tags": ["tag1"],
  "freq": 1,
  "status": "active|promoted|archived"
}
\`\`\`

## Access zones

| Zone   | Files               | Who edits  |
|--------|---------------------|------------|
| Green  | episodes.jsonl      | Auto (hook)|
| Yellow | LEARNINGS.md        | Agent      |
| Red    | rules.md / CLAUDE.md| Owner only |` },
        ],
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
