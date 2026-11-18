import { useEffect, useMemo, useState } from 'react'
import { folders, channelName, tgUrlFor, TG_QUESTIONS_TOPIC, type Folder, type Post, type LessonTimecode, type LessonStep, type LessonService, type LessonRepo } from './data'
import { IntroForm } from './IntroForm'
import { COURSE_TOTAL } from './course'

/** Open a Telegram link safely from within Telegram WebApp (or just window.open as fallback). */
function openTelegram(url: string) {
  const tg = (window as any).Telegram?.WebApp
  try {
    if (tg?.openTelegramLink && /^https:\/\/t\.me\//.test(url)) {
      tg.openTelegramLink(url)
      return
    }
    if (tg?.openLink) { tg.openLink(url); return }
  } catch {}
  window.open(url, '_blank', 'noopener')
}

type Tab = 'folders' | 'search' | 'saved' | 'settings'
type View =
  | { kind: 'home' }
  | { kind: 'folder'; folderId: string }
  | { kind: 'post'; folderId: string; postId: string }

const TYPE_LABEL: Record<Post['type'], string> = {
  text: 'Текст', video: 'Видео', pdf: 'PDF', mixed: 'Материал', voice: 'Аудио', file: 'Файл',
}

function FolderIcon({ name, className = 'w-6 h-6', stroke = 1.4 }: { name: string; className?: string; stroke?: number }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className }
  switch (name) {
    case 'message': return <svg {...common}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    case 'trophy': return <svg {...common}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    case 'zap': return <svg {...common}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    case 'cpu': return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
    case 'book': return <svg {...common}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    case 'users': return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'help': return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    case 'play': return <svg {...common}><polygon points="5 3 19 12 5 21 5 3"/></svg>
    default: return null
  }
}

function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl px-5 pt-4 pb-3 flex items-center gap-3"
      style={{ background: 'var(--tg-bg)', borderBottom: '1px solid var(--tg-border)' }}>
      {onBack && (
        <button onClick={onBack} className="-ml-2 px-2 py-1 active:scale-95 transition" aria-label="Назад" style={{ color: 'var(--tg-accent)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-[16px] leading-tight truncate">{title}</div>
        {subtitle && <div className="text-tg-hint text-[12px] mt-1 truncate ">{subtitle}</div>}
      </div>
      <span className="inline-block w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--tg-accent)' }} />
    </div>
  )
}

const plural = (n: number, one: string, few: string, many: string) => {
  const d = n % 10, h = n % 100
  if (d === 1 && h !== 11) return one
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few
  return many
}

function HomeHero({ totalPosts }: { totalPosts: number }) {
  return (
    <div className="px-5 pt-8 pb-2 fade-up">
      <div className="flex items-center gap-3">
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <circle cx="17" cy="17" r="16" fill="var(--tg-sec)" stroke="var(--tg-border-strong)" />
          <circle cx="17" cy="17" r="7" fill="var(--tg-fill)" />
        </svg>
        <h1 className="font-display text-[30px] leading-none">{channelName}</h1>
      </div>
      <p className="mt-3 text-[15px] leading-snug text-tg-hint">Клуб про ИИ-агентов и автоматизацию</p>
      <p className="mt-1 text-[13px] text-tg-hint">
        {folders.length} {plural(folders.length, 'раздел', 'раздела', 'разделов')} · {totalPosts} {plural(totalPosts, 'материал', 'материала', 'материалов')}
      </p>
    </div>
  )
}

function FolderCard({ f, index, onOpen }: { f: Folder; index: number; onOpen: () => void }) {
  const locked = !!f.closed
  const num = String(index + 1).padStart(2, '0')

  const liveClass = locked ? 'card-locked' : 'card-live'
  const shimmerDelay = `${(index * 0.9) % 7}s`

  return (
    <button
      onClick={onOpen}
      style={{ animationDelay: `${index * 50}ms`, ['--shimmer-delay' as any]: shimmerDelay }}
      className={`fade-up card ${liveClass} relative w-full text-left p-4 transition-all active:scale-[0.96] active:rotate-[0.4deg] flex flex-col gap-3 min-h-[170px] overflow-hidden ${locked ? 'opacity-50' : ''}`}
    >
      {/* Top-right: номер моноспейс */}
      <span className={`card-number absolute top-3 right-3.5 text-[12px] ${locked ? 'text-tg-hint' : ''}`}
        style={!locked ? { color: 'var(--tg-accent)' } : undefined}>
        {num} {locked && '· закрыт'}
      </span>

      {/* Icon block */}
      <div className="card-icon w-9 h-9 flex items-center justify-start"
        style={{ color: locked ? 'var(--tg-locked-text)' : 'var(--tg-text)' }}>
        <FolderIcon name={f.icon} className="w-[20px] h-[20px]" stroke={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className={`font-display font-bold text-[15px] leading-tight ${locked ? 'text-tg-locked-text' : 'text-tg-text'}`}>
          {f.title}
        </div>
        <div className={`text-[12px] mt-1.5 leading-snug line-clamp-2 ${locked ? 'text-tg-locked-text' : 'text-tg-hint'}`}>
          {f.subtitle}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--tg-border)' }}>
        <span className="text-[12px]"
          style={{ color: locked ? 'var(--tg-locked-text)' : 'var(--tg-icon)' }}>
          {locked ? '— —' : `${f.posts.length} ${f.course ? plural(f.posts.length, 'урок', 'урока', 'уроков') : plural(f.posts.length, 'материал', 'материала', 'материалов')}`}
        </span>
        {locked
          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tg-locked-text"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--tg-icon)' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        }
      </div>
    </button>
  )
}

function PostRow({ p, index, onOpen }: { p: Post; index: number; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      style={{ animationDelay: `${index * 40}ms` }}
      className="fade-up card w-full text-left p-4 flex flex-col gap-2 active:scale-[0.99] transition-transform">
      <div className="flex items-center justify-between text-[12px] ">
        <span style={{ color: 'var(--tg-accent)' }}>{TYPE_LABEL[p.type]}</span>
        <div className="flex items-center gap-2 text-tg-hint">
          {p.pinned && <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'rgba(var(--accent-rgb),0.32)', color: 'var(--tg-accent)' }}>Закреплено</span>}
          <span>{p.date}</span>
        </div>
      </div>
      <div className="font-display font-bold text-[16px] leading-snug">{p.title}</div>
      <div className="text-tg-hint text-[12px] leading-snug line-clamp-2">{p.excerpt}</div>
    </button>
  )
}

function WelcomeGuide({ onOpen }: { onOpen: (id: string) => void }) {
  const steps = [
    {
      n: '01',
      target: 'intro',
      title: 'Заполни анкету',
      sub: 'Имя, город, чем занимаешься, зачем пришёл — раздел «Знакомства».',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      n: '02',
      target: 'kb',
      title: 'Поставь свой первый скилл',
      sub: 'Раздел «База знаний» — скачай готовый скилл и подключи к Claude Code.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
    },
    {
      n: '03',
      target: 'qna',
      title: 'Задай первый вопрос',
      sub: 'Раздел «Вопросы и разборы». Опиши контекст, что пробовал и где застрял.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="px-5 pt-6 fade-up" style={{ animationDelay: '260ms' }}>
      <div className="card relative p-5 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(var(--accent-rgb),0.06) 0%, var(--tg-sec) 60%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-[18px]" style={{ color: 'var(--tg-accent)' }}>
              С чего начать
            </h3>
          </div>
          <div className="text-[12px] text-tg-hint">3 шага</div>
        </div>

        {/* Шаги */}
        <div className="flex flex-col gap-2">
          {steps.map((s) => (
            <button
              key={s.n}
              onClick={() => onOpen(s.target)}
              className="group flex items-start gap-3 p-3 rounded-lg border text-left active:scale-[0.98] transition-all welcome-step"
              style={{
                borderColor: 'rgba(var(--accent-rgb),0.18)',
                background: 'var(--tg-sec)',
              }}
            >
              {/* Номер шага */}
              <div className="shrink-0 font-display font-bold text-[20px] leading-none w-7 tabular-nums" style={{ color: 'var(--tg-accent)' }}>
                {s.n}
              </div>
              {/* Иконка */}
              <div className="shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center"
                style={{
                  borderColor: 'rgba(var(--accent-rgb),0.34)',
                  background: 'rgba(var(--accent-rgb),0.07)',
                  color: 'var(--tg-icon)',
                }}>
                {s.icon}
              </div>
              {/* Текст */}
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[13px] text-tg-text leading-tight">{s.title}</div>
                <div className="text-tg-hint text-[12px] mt-1 leading-snug">{s.sub}</div>
              </div>
              {/* Стрелка */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-1" style={{ color: 'var(--tg-icon)' }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-4 pt-3 border-t flex items-center gap-2 text-[12px] text-tg-hint" style={{ borderColor: 'var(--tg-border)' }}>
          <span className="w-1.5 h-1.5 rounded-full pulse-dot shrink-0" style={{ background: 'var(--tg-accent)' }} />
          <span>прошёл все три шага — ты в клубе</span>
        </div>
      </div>
    </div>
  )
}

function FolderRow({ f, index, onOpen }: { f: Folder; index: number; onOpen: () => void }) {
  const locked = !!f.closed
  return (
    <button
      onClick={onOpen}
      style={{ animationDelay: `${index * 50}ms` }}
      className={`fade-up card w-full text-left p-3.5 flex items-center gap-3 active:scale-[0.98] transition-all ${locked ? 'opacity-50' : ''}`}
    >
      <div className="shrink-0 w-9 h-9 flex items-center justify-center"
        style={{ color: locked ? 'var(--tg-locked-text)' : 'var(--tg-text)' }}>
        <FolderIcon name={f.icon} className="w-[18px] h-[18px]" stroke={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-display font-bold text-[15px] leading-tight ${locked ? 'text-tg-locked-text' : 'text-tg-text'}`}>
          {f.title}
        </div>
        <div className={`text-[12px] mt-0.5 ${locked ? 'text-tg-locked-text' : 'text-tg-hint'}`}>
          {locked ? '— —' : `${f.posts.length} ${f.course ? plural(f.posts.length, 'урок', 'урока', 'уроков') : plural(f.posts.length, 'материал', 'материала', 'материалов')}`}
        </div>
      </div>
      {locked
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-tg-locked-text"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: 'var(--tg-icon)' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      }
    </button>
  )
}

function HomeView({ onOpen }: { onOpen: (id: string) => void }) {
  const totalPosts = folders.reduce((s, f) => s + f.posts.length, 0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <>
      <HomeHero totalPosts={totalPosts} />
      <WelcomeGuide onOpen={onOpen} />
      <div className="px-5 pt-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[12px]" style={{ color: 'var(--tg-accent)' }}>
            <span className="opacity-50 mr-2">/</span>Разделы
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('grid')}
              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all"
              style={{
                borderColor: viewMode === 'grid' ? 'rgba(var(--accent-rgb),0.6)' : 'var(--tg-border)',
                background: viewMode === 'grid' ? 'rgba(var(--accent-rgb),0.12)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--tg-accent)' : 'var(--tg-hint)',
              }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="0" y="0" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="8" y="0" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="0" y="8" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="8" y="8" width="6" height="6" rx="1.5" fill="currentColor"/></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all"
              style={{
                borderColor: viewMode === 'list' ? 'rgba(var(--accent-rgb),0.6)' : 'var(--tg-border)',
                background: viewMode === 'list' ? 'rgba(var(--accent-rgb),0.12)' : 'transparent',
                color: viewMode === 'list' ? 'var(--tg-accent)' : 'var(--tg-hint)',
              }}>
              <svg width="13" height="10" viewBox="0 0 14 10" fill="none"><rect x="0" y="0" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="4" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="8" width="14" height="2" rx="1" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
        {viewMode === 'grid'
          ? <div className="grid grid-cols-2 gap-3">
              {folders.map((f, i) => <FolderCard key={f.id} f={f} index={i} onOpen={() => onOpen(f.id)} />)}
            </div>
          : <div className="flex flex-col gap-2.5">
              {folders.map((f, i) => <FolderRow key={f.id} f={f} index={i} onOpen={() => onOpen(f.id)} />)}
            </div>
        }
      </div>
    </>
  )
}

function FolderView({ folderId, onBack, onOpen }: { folderId: string; onBack: () => void; onOpen: (postId: string) => void }) {
  const f = folders.find(x => x.id === folderId)!
  return (
    <>
      <Header
        title={f.title}
        subtitle={f.closed ? 'Раздел закрыт' : `${f.posts.length} ${plural(f.posts.length, 'материал', 'материала', 'материалов')}`}
        onBack={onBack}
      />
      <div className="px-5 pt-4 pb-24 space-y-3">
        {f.posts.length > 0
          ? f.posts.map((p, i) => <PostRow key={p.id} p={p} index={i} onOpen={() => onOpen(p.id)} />)
          : (
            <div className="text-center py-20 fade-up">
              <div className="inline-flex w-16 h-16 rounded-lg items-center justify-center mb-4 border"
                style={{ borderColor: 'var(--tg-border)', color: 'var(--tg-accent)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className="font-display font-bold text-[15px]">{f.closed ? 'Доступ закрыт' : 'Канал пуст'}</div>
              <div className="text-tg-hint text-[12px] mt-2 max-w-[240px] mx-auto ">awaiting first entry</div>
            </div>
          )}
      </div>
    </>
  )
}

function openTgLink(url: string) {
  const tg = (window as any).Telegram?.WebApp
  if (tg && typeof tg.openTelegramLink === 'function') tg.openTelegramLink(url)
  else window.open(url, '_blank')
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    let ok = false
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      // Запасной способ для старых WebView в Telegram
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      area.setSelectionRange(0, text.length)
      try { ok = document.execCommand('copy') } catch { ok = false }
      document.body.removeChild(area)
    }
    if (!ok) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button onClick={copy}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[12px] active:scale-95 transition border"
      style={{ background: 'rgba(var(--accent-rgb),0.12)', borderColor: 'rgba(var(--accent-rgb),0.32)', color: 'var(--tg-accent)' }}>
      {copied
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
      {copied ? 'Скопировано' : 'Скопировать'}
    </button>
  )
}

function CodeBlock({ label, text, prose = false }: { label: string; text: string; prose?: boolean }) {
  return (
    <div className="card rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--tg-border)' }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: 'var(--tg-accent)' }} />
          <span className="text-[12px] text-tg-hint truncate">{label}</span>
        </div>
        <CopyButton text={text} />
      </div>
      <pre className={`px-3 py-3 text-[12px] leading-relaxed whitespace-pre-wrap ${prose ? 'font-sans break-words' : 'font-mono break-all'}`}
        style={{ color: prose ? 'var(--tg-text)' : 'var(--tg-accent)' }}>
        {text}
      </pre>
    </div>
  )
}

function LessonSectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: 'var(--tg-accent)' }} />
      <span className="text-[12px]" style={{ color: 'var(--tg-hint)' }}>{text}</span>
    </div>
  )
}

function LessonPostBody({ p }: { p: Post }) {
  const hasStructure = !!(p.timecodes || p.goal || p.steps || p.services || p.repos)

  if (!hasStructure) {
    const bodyParagraphs = (p.body ?? '').trim().split(/\n\n+/).filter(Boolean)
    return (
      <div className="text-[14px] leading-relaxed space-y-3" style={{ color: 'var(--tg-text)' }}>
        <p className="text-tg-hint">{p.excerpt}</p>
        {bodyParagraphs.length > 0
          ? bodyParagraphs.map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)
          : <p>Здесь будет полный текст урока.</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ЦЕЛЬ */}
      {p.goal && (
        <div className="card p-4 border-l-4 rounded-l-none" style={{ borderLeftColor: 'var(--tg-accent)' }}>
          <LessonSectionLabel text="Цель" />
          <p className="text-[15px] leading-snug font-medium" style={{ color: 'var(--tg-text)' }}>{p.goal}</p>
        </div>
      )}

      {/* РЕЗУЛЬТАТ */}
      {p.result && (
        <div className="card p-4 border-l-4 rounded-l-none"
          style={{ borderLeftColor: 'var(--tg-accent)', background: 'rgba(var(--accent-rgb),0.06)' }}>
          <LessonSectionLabel text="Результат" />
          <p className="text-[15px] leading-snug font-medium" style={{ color: 'var(--tg-text)' }}>{p.result}</p>
        </div>
      )}

      {/* ОПИСАНИЕ */}
      {p.description && (
        <div>
          <LessonSectionLabel text="Описание" />
          <div className="space-y-3">
            {p.description.split(/\n\n+/).map((para, i) => (
              <p key={i} className={`leading-relaxed ${i === 0 ? 'text-[16px] font-semibold' : 'text-[14px] text-tg-hint'}`}
                style={{ color: i === 0 ? 'var(--tg-text)' : undefined }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ПОШАГОВЫЕ ДЕЙСТВИЯ */}
      {p.steps && p.steps.length > 0 && (
        <div>
          <LessonSectionLabel text="Пошаговые действия" />
          <div className="space-y-4">
            {(p.steps as LessonStep[]).map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-display font-bold text-[14px]"
                  style={{ borderColor: 'var(--tg-accent)', color: 'var(--tg-accent)', background: 'rgba(var(--accent-rgb),0.08)' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  {step.title && (
                    <h3 className="font-display font-bold text-[16px] leading-snug mb-1.5" style={{ color: 'var(--tg-text)' }}>{step.title}</h3>
                  )}
                  <p className="text-[14px] font-medium leading-snug mb-2" style={{ color: 'var(--tg-text)' }}>{step.text}</p>
                  <div className="space-y-2">
                    {step.command && <CodeBlock label={step.commandWin ? 'Mac' : 'Команда'} text={step.command} />}
                    {step.commandWin && <CodeBlock label="Windows" text={step.commandWin} />}
                    {step.prompt && <CodeBlock label="Промпт" text={step.prompt} prose />}
                    {step.image && (
                      <figure>
                        <img src={step.image} alt={step.caption ?? step.title ?? ''} loading="lazy"
                          className="w-full rounded-lg border" style={{ borderColor: 'var(--tg-border-strong)' }} />
                        {step.caption && <figcaption className="text-[12px] leading-snug mt-1.5 text-tg-hint">{step.caption}</figcaption>}
                      </figure>
                    )}
                    {step.warn && (
                      <p className="card p-3 border-l-4 rounded-l-none text-[13px] leading-snug font-medium"
                        style={{ borderLeftColor: '#E5484D', color: 'var(--tg-text)' }}>
                        {step.warn}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* СЕРВИСЫ */}
      {p.services && p.services.length > 0 && (
        <div>
          <LessonSectionLabel text="Сервисы" />
          <div className="card divide-y" style={{ '--divide-color': 'var(--tg-border)' } as any}>
            {(p.services as LessonService[]).map((svc, i) => (
              <button key={i}
                onClick={() => svc.url && openTelegram(svc.url)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/5 transition">
                <div className="shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center"
                  style={{ borderColor: 'rgba(var(--accent-rgb),0.24)', background: 'rgba(var(--accent-rgb),0.06)', color: 'var(--tg-icon)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[14px] leading-tight" style={{ color: 'var(--tg-text)' }}>{svc.name}</div>
                  <div className="text-[12px] mt-0.5 text-tg-hint">{svc.desc}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-tg-hint"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* РЕПОЗИТОРИИ */}
      {p.repos && p.repos.length > 0 && (
        <div>
          <LessonSectionLabel text="Репозитории" />
          <div className="card divide-y" style={{ '--divide-color': 'var(--tg-border)' } as any}>
            {(p.repos as LessonRepo[]).map((repo, i) => {
              const shortUrl = repo.url.replace('https://', '')
              return (
                <button key={i}
                  onClick={() => openTelegram(repo.url)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/5 transition">
                  <div className="shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center"
                    style={{ borderColor: 'rgba(var(--accent-rgb),0.24)', background: 'rgba(var(--accent-rgb),0.06)', color: 'var(--tg-icon)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[14px] leading-tight" style={{ color: 'var(--tg-text)' }}>{repo.name}</div>
                    <div className="text-[12px] mt-0.5 text-tg-hint truncate">{shortUrl}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-tg-hint"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function PostView({ folderId, postId, onBack, onOpenPost }: { folderId: string; postId: string; onBack: () => void; onOpenPost: (postId: string) => void }) {
  const f = folders.find(x => x.id === folderId)!
  const p = f.posts.find(x => x.id === postId)!
  const tgLink = p.tgUrl || tgUrlFor(f.tgChannel)
  const isLesson = !!(p.timecodes || p.goal || p.steps || p.services || p.repos)
  const lessonIndex = f.course ? f.posts.findIndex(x => x.id === postId) : -1
  const nextLesson = lessonIndex >= 0 ? f.posts[lessonIndex + 1] : undefined

  useEffect(() => { if (f.course) window.scrollTo(0, 0) }, [f.course, postId])

  return (
    <>
      <Header title={f.title} subtitle={f.course ? `Урок ${lessonIndex + 1} из ${COURSE_TOTAL}` : p.date} onBack={onBack} />
      <div className="px-5 py-6 pb-24 fade-up">
        <div className="flex items-center gap-2 mb-3 text-[12px] ">
          {!f.course && <span style={{ color: 'var(--tg-accent)' }}>{TYPE_LABEL[p.type]}</span>}
          {p.pinned && <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'rgba(var(--accent-rgb),0.32)', color: 'var(--tg-accent)' }}>Закреплено</span>}
        </div>
        <h1 className="font-display font-bold text-[26px] leading-[1.05] mb-6">{p.title}</h1>

        <LessonPostBody p={p} />

        {f.course && (
          <div className="mt-8">
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--tg-border)' }}>
              <div className="h-full rounded-full" style={{ width: `${((lessonIndex + 1) / COURSE_TOTAL) * 100}%`, background: 'var(--tg-fill)' }} />
            </div>
            <p className="text-[12px] text-tg-hint mb-4">Урок {lessonIndex + 1} из {COURSE_TOTAL}</p>
            {nextLesson ? (
              <button onClick={() => onOpenPost(nextLesson.id)}
                className="w-full py-3.5 px-4 rounded-lg font-display font-bold text-[14px] active:scale-[0.98] transition"
                style={{ background: 'var(--tg-fill)', color: '#111111' }}>
                Следующий урок: {nextLesson.title}
              </button>
            ) : (
              <p className="card p-4 text-[14px] leading-snug" style={{ color: 'var(--tg-text)' }}>Курс пройден. Твой агент готов к работе.</p>
            )}
          </div>
        )}

        {p.fileUrl && (
          <div className="card p-4 my-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg border flex items-center justify-center shrink-0"
              style={{ borderColor: 'rgba(var(--accent-rgb),0.32)', background: 'rgba(var(--accent-rgb),0.06)', color: 'var(--tg-accent)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[13px] truncate">{p.fileName}</div>
              <div className="text-[12px] text-tg-hint mt-0.5">{p.fileSize}</div>
            </div>
            <a href={p.fileUrl} download={p.fileName}
              className="shrink-0 px-3.5 py-2 rounded-lg font-bold text-[12px] active:scale-95 transition flex items-center gap-1.5 border"
              style={{ background: 'rgba(var(--accent-rgb),0.12)', borderColor: 'rgba(var(--accent-rgb),0.32)', color: 'var(--tg-accent)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Скачать
            </a>
          </div>
        )}

        {!isLesson && !f.course && (
          <button
            onClick={() => openTgLink(tgLink)}
            className="w-full py-3.5 rounded-lg font-display font-bold text-[13px] active:scale-[0.98] transition flex items-center justify-center gap-2 mt-4 border-2"
            style={{
              background: 'rgba(var(--accent-rgb),0.08)',
              borderColor: 'rgba(var(--accent-rgb),0.36)',
              color: 'var(--tg-accent)',
            }}>
            Открыть в Telegram
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        )}
      </div>
    </>
  )
}

function SearchView() {
  return (
    <>
      <Header title="Search" subtitle="across all channels" />
      <div className="px-5 pt-4">
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="absolute left-4 top-1/2 -translate-y-1/2 text-tg-hint"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="QUERY..."
            className="w-full pl-12 pr-4 py-3.5 rounded-lg border text-tg-text placeholder:text-tg-hint outline-none text-[14px] transition"
            style={{ background: 'var(--tg-sec)', borderColor: 'var(--tg-border)' }} />
        </div>
        <div className="text-center mt-16 fade-up">
          <div className="font-display font-bold text-[14px]" style={{ color: 'var(--tg-accent)' }}>Введите запрос</div>
          <div className="text-tg-hint text-[12px] mt-2 ">enter query to search archive</div>
        </div>
      </div>
    </>
  )
}

function SavedView() {
  const pinned = folders.flatMap(f => f.posts.filter(p => p.pinned).map(p => ({ f, p })))
  return (
    <>
      <Header title="Saved" subtitle="pinned entries" />
      <div className="px-5 pt-4 pb-24 space-y-3">
        {pinned.length === 0 ? (
          <div className="text-center py-20 fade-up text-tg-hint text-[12px] ">no pinned entries</div>
        ) : pinned.map(({ f, p }, i) => (
          <div key={p.id} style={{ animationDelay: `${i * 40}ms` }} className="fade-up card p-4">
            <div className="text-[12px] mb-1.5" style={{ color: 'var(--tg-accent)' }}>{f.title}</div>
            <div className="font-display font-bold text-[15px] leading-snug">{p.title}</div>
            <div className="text-tg-hint text-[12px] mt-1.5 line-clamp-2">{p.excerpt}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function SettingsView() {
  return (
    <>
      <Header title="Settings" subtitle="system parameters" />
      <div className="px-5 pt-4 pb-24 space-y-3">
        <div className="card p-4 fade-up">
          <div className="text-[12px] mb-2" style={{ color: 'var(--tg-accent)' }}>Тема</div>
          <div className="font-display font-bold text-[15px]">Как в Telegram</div>
          <div className="text-tg-hint text-[12px] mt-1 leading-relaxed">Премиум-режим. Светлая тема отключена для сохранения визуальной целостности клуба.</div>
        </div>

        <div className="card p-4 fade-up" style={{ animationDelay: '40ms' }}>
          <div className="text-[12px] mb-2" style={{ color: 'var(--tg-accent)' }}>О клубе</div>
          <div className="font-display font-bold text-[15px]">ИИшница</div>
          <div className="text-tg-hint text-[12px] mt-1 leading-relaxed">
            Клуб про путь из стройки в ИИ. Кейсы, автоматизации, AI-агенты, контент-скиллы для Claude Code.
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t divider ">
            <span className="text-[12px] text-tg-hint">build</span>
            <span className="text-[12px]" style={{ color: 'var(--tg-accent)' }}>0.3.0 · CINEMATIC</span>
          </div>
        </div>
      </div>
    </>
  )
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: Array<{ id: Tab; label: string; icon: JSX.Element }> = [
    { id: 'folders',  label: 'Клуб',     icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id: 'search',   label: 'Поиск',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { id: 'saved',    label: 'Закладки',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
    { id: 'settings', label: 'Настройки',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ]
  return (
    <div className="sticky bottom-0 backdrop-blur-xl grid grid-cols-4 pb-[max(env(safe-area-inset-bottom),10px)] pt-2"
      style={{ background: 'var(--tg-bg)', borderTop: '1px solid var(--tg-border)' }}>
      {items.map(it => {
        const active = tab === it.id
        return (
          <button key={it.id} onClick={() => setTab(it.id)}
            className="relative flex flex-col items-center gap-1 py-1.5 transition-colors"
            style={{ color: active ? 'var(--tg-icon)' : 'var(--tg-hint)' }}>
            {active && <span className="absolute -top-2 w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--tg-icon)' }} />}
            {it.icon}
            <span className="text-[12px] font-bold">{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function App() {
  const [tab, setTab] = useState<Tab>('folders')
  const [view, setView] = useState<View>({ kind: 'home' })
  const [introOpen, setIntroOpen] = useState(false)

  // Centralised navigation handler — intercepts 'intro' folder and 'i1' post
  // and pops the intro form modal instead of standard navigation.
  function handleOpenFolder(id: string) {
    if (id === 'intro') { setIntroOpen(true); return }
    if (id === 'qna') { openTelegram(TG_QUESTIONS_TOPIC); return }
    setView({ kind: 'folder', folderId: id })
  }
  function handleOpenPost(folderId: string, postId: string) {
    if (postId === 'i1') { setIntroOpen(true); return }
    if (folderId === 'qna') { openTelegram(TG_QUESTIONS_TOPIC); return }
    setView({ kind: 'post', folderId, postId })
  }

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready(); tg.expand()
    }
    const applyTheme = () => {
      const dark = tg?.colorScheme ? tg.colorScheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('tg-dark', dark)
      const bg = dark ? '#0F0F10' : '#FAFAF8'
      try { tg?.setHeaderColor?.(bg); tg?.setBackgroundColor?.(bg) } catch {}
    }
    applyTheme()
    tg?.onEvent?.('themeChanged', applyTheme)

    // Auto-open intro form when launched via ?form=intro (used by /anketa keyboard button)
    try {
      const params = new URLSearchParams(window.location.search)
      const startParam = tg?.initDataUnsafe?.start_param
      if (params.get('form') === 'intro' || startParam === 'intro' || window.location.hash === '#intro') {
        setIntroOpen(true)
      }
    } catch {}
  }, [])

  const body = useMemo(() => {
    if (tab !== 'folders') {
      if (tab === 'search') return <SearchView />
      if (tab === 'saved') return <SavedView />
      return <SettingsView />
    }
    if (view.kind === 'home') return <HomeView onOpen={handleOpenFolder} />
    if (view.kind === 'folder') return <FolderView folderId={view.folderId} onBack={() => setView({ kind: 'home' })}
      onOpen={(postId) => handleOpenPost(view.folderId, postId)} />
    return <PostView folderId={view.folderId} postId={view.postId} onBack={() => setView({ kind: 'folder', folderId: view.folderId })}
      onOpenPost={(postId) => handleOpenPost(view.folderId, postId)} />
  }, [tab, view])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">{body}</div>
      <TabBar tab={tab} setTab={(t) => { setTab(t); setView({ kind: 'home' }) }} />
      <IntroForm open={introOpen} onClose={() => setIntroOpen(false)} />
    </div>
  )
}
