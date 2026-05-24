import { useEffect, useMemo, useState } from 'react'
import { folders, channelName, channelSubtitle, tgUrlFor, type Folder, type Post } from './data'

type Tab = 'folders' | 'search' | 'saved' | 'settings'
type View =
  | { kind: 'home' }
  | { kind: 'folder'; folderId: string }
  | { kind: 'post'; folderId: string; postId: string }

const TYPE_LABEL: Record<Post['type'], string> = {
  text: 'заметка', video: 'видео', pdf: 'pdf', mixed: 'разное', voice: 'голосовое', file: 'файл',
}

// Палитра аксесов разделов — мягкие "ghibli" тона, без неоновых градиентов.
const ACCENT: Record<string, { ring: string; chip: string; ink: string }> = {
  chat:        { ring: 'rgba(45,91,150,0.22)',   chip: '#E6F0FA', ink: '#2D5B96' },
  cases:       { ring: 'rgba(232,116,110,0.30)', chip: '#FBE4E2', ink: '#C95850' },
  automations: { ring: 'rgba(108,168,118,0.30)', chip: '#E1EFE4', ink: '#4F8B5E' },
  agents:      { ring: 'rgba(143,109,180,0.30)', chip: '#EAE0F2', ink: '#6F4FA1' },
  kb:          { ring: 'rgba(232,165,71,0.30)',  chip: '#F8E8C8', ink: '#B07628' },
  intro:       { ring: 'rgba(72,128,184,0.30)',  chip: '#DCEAF6', ink: '#356A9B' },
  qna:         { ring: 'rgba(216,114,148,0.30)', chip: '#F6DEE7', ink: '#B3527A' },
}
const accentFor = (id: string) => ACCENT[id] ?? ACCENT.chat

// Monoline иконки, минималистичный outline-стиль
function FolderIcon({ name, className = 'w-6 h-6', stroke = 1.6 }: { name: string; className?: string; stroke?: number }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className }
  switch (name) {
    case 'message': return <svg {...common}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    case 'trophy': return <svg {...common}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    case 'zap': return <svg {...common}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    case 'cpu': return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
    case 'book': return <svg {...common}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    case 'users': return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'help': return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    default: return null
  }
}

// Декоративные облака для hero — pure SVG, painterly
function Cloud({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 60c-14 0-22-10-22-22 0-12 10-20 22-20 4-10 16-14 26-10 6-8 18-10 26-4 10-2 22 6 22 16 8 0 14 8 14 16s-8 16-18 16H30z"
        fill="rgba(255,255,255,0.95)" />
    </svg>
  )
}

function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl px-5 pt-4 pb-3 flex items-center gap-3"
      style={{ background: 'color-mix(in srgb, var(--tg-bg) 88%, transparent)', borderBottom: '1px solid var(--tg-border)' }}>
      {onBack && (
        <button onClick={onBack} className="-ml-2 px-2 py-1 text-tg-hint active:scale-95 transition" aria-label="Назад">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-[18px] leading-tight truncate">{title}</div>
        {subtitle && <div className="text-tg-hint text-[12px] mt-0.5 truncate font-medium">{subtitle}</div>}
      </div>
    </div>
  )
}

function HomeHero({ totalPosts, openCount }: { totalPosts: number; openCount: number }) {
  return (
    <div className="sky relative px-5 pt-10 pb-12 overflow-hidden" style={{ minHeight: 260 }}>
      {/* Облака — за текстом */}
      <Cloud className="absolute float-slow" style={{ top: 14, right: -30, width: 140, opacity: 0.85, zIndex: 1 }} />
      <Cloud className="absolute float-slow" style={{ top: 70, left: -40, width: 100, opacity: 0.7, animationDelay: '1.4s', zIndex: 1 }} />
      <Cloud className="absolute float-slow" style={{ top: 165, right: 30, width: 90, opacity: 0.55, animationDelay: '2.5s', zIndex: 1 }} />

      <div className="relative" style={{ zIndex: 2 }}>
        <div className="text-white text-[10px] uppercase tracking-[0.24em] font-bold mb-3 fade-up" style={{ opacity: 0.9 }}>приватный клуб</div>
        <h1 className="font-display font-black text-[40px] leading-[0.95] text-white fade-up"
          style={{ animationDelay: '60ms', textShadow: '0 2px 16px rgba(15,30,60,0.25)' }}>
          {channelName}
        </h1>
        <div className="mt-3 text-white text-[13px] leading-snug max-w-[260px] fade-up font-medium" style={{ animationDelay: '120ms', opacity: 0.92 }}>
          {channelSubtitle}
        </div>

        <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-2 rounded-full fade-up"
          style={{ animationDelay: '180ms', background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
          <span className="font-display font-bold text-white text-[13px] tabular-nums">{openCount}</span>
          <span className="text-white text-[10px] uppercase tracking-wider font-bold" style={{ opacity: 0.85 }}>открыто</span>
          <span className="w-px h-3 mx-1" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <span className="font-display font-bold text-white text-[13px] tabular-nums">{totalPosts}</span>
          <span className="text-white text-[10px] uppercase tracking-wider font-bold" style={{ opacity: 0.85 }}>постов</span>
        </div>
      </div>
    </div>
  )
}

function FolderCard({ f, index, onOpen }: { f: Folder; index: number; onOpen: () => void }) {
  const locked = !!f.closed
  const a = accentFor(f.id)

  return (
    <button
      onClick={onOpen}
      style={{ animationDelay: `${index * 50}ms` }}
      className={`fade-up card relative w-full text-left p-4 transition-all active:scale-[0.97]
        ${locked ? 'opacity-65' : ''}
        flex flex-col gap-3 min-h-[170px]`}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: locked ? 'var(--tg-locked-bg)' : a.chip, color: locked ? 'var(--tg-locked-text)' : a.ink }}>
        <FolderIcon name={f.icon} className="w-[22px] h-[22px]" stroke={1.7} />
      </div>

      <div className="flex-1 min-w-0">
        <div className={`font-display font-bold text-[16px] leading-tight ${locked ? 'text-tg-locked-text' : 'text-tg-text'}`}>
          {f.title}
        </div>
        <div className={`text-[12px] mt-1.5 leading-snug line-clamp-2 font-medium ${locked ? 'text-tg-locked-text' : 'text-tg-hint'}`}>
          {f.subtitle}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className={`text-[11px] font-semibold ${locked ? 'text-tg-locked-text' : ''}`}
          style={!locked ? { color: a.ink } : undefined}>
          {locked ? 'скоро' : `${f.posts.length} ${f.posts.length === 1 ? 'пост' : 'постов'}`}
        </span>
        {locked
          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-tg-locked-text"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: a.ink }}><polyline points="9 18 15 12 9 6"/></svg>
        }
      </div>
    </button>
  )
}

function PostRow({ p, index, onOpen, folderId }: { p: Post; index: number; folderId: string; onOpen: () => void }) {
  const a = accentFor(folderId)
  return (
    <button
      onClick={onOpen}
      style={{ animationDelay: `${index * 40}ms` }}
      className="fade-up card w-full text-left p-4 flex flex-col gap-2 active:scale-[0.99] transition-transform">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span style={{ color: a.ink }}>{TYPE_LABEL[p.type]}</span>
        <div className="flex items-center gap-2 text-tg-hint font-medium">
          {p.pinned && <span className="px-2 py-0.5 rounded-full" style={{ background: a.chip, color: a.ink }}>закреп</span>}
          <span>{p.date}</span>
        </div>
      </div>
      <div className="font-display font-bold text-[17px] leading-snug">{p.title}</div>
      <div className="text-tg-hint text-[13px] leading-snug line-clamp-2 font-medium">{p.excerpt}</div>
    </button>
  )
}

function HomeView({ onOpen }: { onOpen: (id: string) => void }) {
  const totalPosts = folders.reduce((s, f) => s + f.posts.length, 0)
  const openCount = folders.filter(f => !f.closed).length

  return (
    <>
      <HomeHero totalPosts={totalPosts} openCount={openCount} />
      <div className="px-5 pt-5 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-[18px]">Разделы</h2>
          <span className="text-tg-hint text-[12px] font-semibold">{folders.length} всего</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {folders.map((f, i) => <FolderCard key={f.id} f={f} index={i} onOpen={() => onOpen(f.id)} />)}
        </div>
      </div>
    </>
  )
}

function FolderView({ folderId, onBack, onOpen }: { folderId: string; onBack: () => void; onOpen: (postId: string) => void }) {
  const f = folders.find(x => x.id === folderId)!
  const a = accentFor(folderId)
  return (
    <>
      <Header
        title={f.title}
        subtitle={f.closed ? 'архив · раздел закрыт' : `${f.posts.length} ${f.posts.length === 1 ? 'пост' : 'постов'}`}
        onBack={onBack}
      />
      <div className="px-5 pt-4 pb-24 space-y-3">
        {f.posts.length > 0
          ? f.posts.map((p, i) => <PostRow key={p.id} p={p} index={i} folderId={folderId} onOpen={() => onOpen(p.id)} />)
          : (
            <div className="text-center py-20 fade-up">
              <div className="inline-flex w-16 h-16 rounded-3xl items-center justify-center mb-4"
                style={{ background: a.chip, color: a.ink }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className="font-display font-bold text-[17px]">{f.closed ? 'Раздел закрыт' : 'Пока пусто'}</div>
              <div className="text-tg-hint text-[13px] mt-1.5 max-w-[260px] mx-auto font-medium">Контент появится после первой публикации</div>
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

function PostView({ folderId, postId, onBack }: { folderId: string; postId: string; onBack: () => void }) {
  const f = folders.find(x => x.id === folderId)!
  const p = f.posts.find(x => x.id === postId)!
  const a = accentFor(folderId)
  const bodyParagraphs = (p.body ?? '').trim().split(/\n\n+/).filter(Boolean)
  const tgLink = p.tgUrl || tgUrlFor(f.tgChannel)

  return (
    <>
      <Header title={f.title} subtitle={p.date} onBack={onBack} />
      <div className="px-5 py-6 pb-24 fade-up">
        <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold">
          <span style={{ color: a.ink }}>{TYPE_LABEL[p.type]}</span>
          {p.pinned && <span className="px-2 py-0.5 rounded-full" style={{ background: a.chip, color: a.ink }}>закреп</span>}
        </div>
        <h1 className="font-display font-black text-[28px] leading-[1.1] mb-4">{p.title}</h1>

        <div className="text-[15px] leading-relaxed space-y-3 font-body" style={{ color: 'var(--tg-text)' }}>
          <p className="text-tg-hint font-medium">{p.excerpt}</p>
          {bodyParagraphs.length > 0
            ? bodyParagraphs.map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)
            : <p>Здесь будет полный текст поста из ИИшницы — картинки, видео, голосовые, файлы, ссылки на источники.</p>}
        </div>

        {p.fileUrl && (
          <div className="card p-4 my-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: a.chip, color: a.ink }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[14px] truncate">{p.fileName}</div>
              <div className="text-[11px] text-tg-hint font-semibold mt-0.5">{p.fileSize} · skill для Claude Code</div>
            </div>
            <a href={p.fileUrl} download={p.fileName}
              className="shrink-0 px-4 py-2 rounded-xl font-display font-bold text-[12px] active:scale-95 transition flex items-center gap-1.5"
              style={{ background: 'var(--tg-btn)', color: 'var(--tg-bg)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Скачать
            </a>
          </div>
        )}

        <button
          onClick={() => openTgLink(tgLink)}
          className="w-full py-3.5 rounded-2xl font-display font-bold text-[15px] active:scale-[0.98] transition flex items-center justify-center gap-2 mt-4"
          style={{ background: 'var(--tg-btn)', color: 'var(--tg-bg)' }}>
          Открыть в Telegram
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </button>
      </div>
    </>
  )
}

function SearchView() {
  return (
    <>
      <Header title="Поиск" subtitle="по всем разделам" />
      <div className="px-5 pt-4">
        <div className="relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="absolute left-4 top-1/2 -translate-y-1/2 text-tg-hint"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="По названию, тэгу, тексту"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-tg-sec border border-tg-border text-tg-text placeholder:text-tg-hint outline-none text-[15px] font-medium focus:border-tg-accent transition"
            style={{ boxShadow: 'var(--tg-card-shadow)' }} />
        </div>
        <div className="text-center mt-16 fade-up">
          <div className="font-display font-bold text-[17px]">Что ищем?</div>
          <div className="text-tg-hint text-[13px] mt-1.5 font-medium">Введи запрос — найду по всем разделам</div>
        </div>
      </div>
    </>
  )
}

function SavedView() {
  const pinned = folders.flatMap(f => f.posts.filter(p => p.pinned).map(p => ({ f, p })))
  return (
    <>
      <Header title="Избранное" subtitle="закреплённые посты" />
      <div className="px-5 pt-4 pb-24 space-y-3">
        {pinned.length === 0 ? (
          <div className="text-center py-20 fade-up text-tg-hint text-[13px] font-medium">Здесь будут твои закладки</div>
        ) : pinned.map(({ f, p }, i) => {
          const a = accentFor(f.id)
          return (
            <div key={p.id} style={{ animationDelay: `${i * 40}ms` }} className="fade-up card p-4">
              <div className="text-[11px] font-semibold mb-1.5" style={{ color: a.ink }}>{f.title}</div>
              <div className="font-display font-bold text-[16px] leading-snug">{p.title}</div>
              <div className="text-tg-hint text-[12px] mt-1.5 line-clamp-2 font-medium">{p.excerpt}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function SettingsView({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <>
      <Header title="Настройки" />
      <div className="px-5 pt-4 pb-24 space-y-3">
        <div className="card p-4 flex items-center justify-between fade-up">
          <div>
            <div className="font-display font-bold text-[16px]">Тёмная тема</div>
            <div className="text-tg-hint text-[12px] mt-0.5 font-medium">Подстраивается под Telegram</div>
          </div>
          <button onClick={() => setDark(!dark)}
            aria-label="Переключить тему"
            className="relative w-12 h-7 rounded-full transition-colors"
            style={{ background: dark ? 'var(--tg-accent)' : 'var(--tg-border)' }}>
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow ${dark ? 'left-[1.375rem]' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="card p-4 fade-up" style={{ animationDelay: '40ms' }}>
          <div className="font-display font-bold text-[16px]">О приложении</div>
          <div className="text-tg-hint text-[12px] mt-1 leading-relaxed font-medium">
            ИИшница — приватный клуб про путь из стройки в ИИ.
            Кейсы, автоматизации, AI-агенты, контент-скиллы для Claude Code.
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t divider">
            <span className="text-[11px] uppercase tracking-wider text-tg-hint font-bold">build</span>
            <span className="font-display text-[12px] font-bold">0.3.0</span>
          </div>
        </div>
      </div>
    </>
  )
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: Array<{ id: Tab; label: string; icon: JSX.Element }> = [
    { id: 'folders',  label: 'Клуб',      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: 'search',   label: 'Поиск',     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { id: 'saved',    label: 'Избранное', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg> },
    { id: 'settings', label: 'Настройки', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ]
  return (
    <div className="sticky bottom-0 backdrop-blur-xl grid grid-cols-4 pb-[max(env(safe-area-inset-bottom),10px)] pt-2"
      style={{ background: 'color-mix(in srgb, var(--tg-bg) 92%, transparent)', borderTop: '1px solid var(--tg-border)' }}>
      {items.map(it => {
        const active = tab === it.id
        return (
          <button key={it.id} onClick={() => setTab(it.id)}
            className={`relative flex flex-col items-center gap-1 py-1.5 transition-colors`}
            style={{ color: active ? 'var(--tg-accent)' : 'var(--tg-hint)' }}>
            {active && <span className="absolute -top-2 w-10 h-1 rounded-full" style={{ background: 'var(--tg-accent)' }} />}
            {it.icon}
            <span className="text-[10px] font-bold tracking-tight">{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function App() {
  const [dark, setDark] = useState(false)
  const [tab, setTab] = useState<Tab>('folders')
  const [view, setView] = useState<View>({ kind: 'home' })

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready(); tg.expand()
      if (tg.colorScheme === 'dark') setDark(true)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('tg-dark', dark)
  }, [dark])

  const body = useMemo(() => {
    if (tab !== 'folders') {
      if (tab === 'search') return <SearchView />
      if (tab === 'saved') return <SavedView />
      return <SettingsView dark={dark} setDark={setDark} />
    }
    if (view.kind === 'home') return <HomeView onOpen={(id) => setView({ kind: 'folder', folderId: id })} />
    if (view.kind === 'folder') return <FolderView folderId={view.folderId} onBack={() => setView({ kind: 'home' })}
      onOpen={(postId) => setView({ kind: 'post', folderId: view.folderId, postId })} />
    return <PostView folderId={view.folderId} postId={view.postId} onBack={() => setView({ kind: 'folder', folderId: view.folderId })} />
  }, [tab, view, dark])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">{body}</div>
      <TabBar tab={tab} setTab={(t) => { setTab(t); setView({ kind: 'home' }) }} />
    </div>
  )
}
