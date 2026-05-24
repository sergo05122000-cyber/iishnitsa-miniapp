import { useEffect, useMemo, useState } from 'react'
import { folders, channelName, channelSubtitle, tgUrlFor, type Folder, type Post } from './data'

type Tab = 'folders' | 'search' | 'saved' | 'settings'
type View =
  | { kind: 'home' }
  | { kind: 'folder'; folderId: string }
  | { kind: 'post'; folderId: string; postId: string }

const TYPE_LABEL: Record<Post['type'], string> = {
  text: 'TEXT', video: 'VIDEO', pdf: 'PDF', mixed: 'MIXED', voice: 'VOICE', file: 'FILE',
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
    default: return null
  }
}

function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl px-5 pt-4 pb-3 flex items-center gap-3"
      style={{ background: 'rgba(6,7,9,0.85)', borderBottom: '1px solid var(--tg-border)' }}>
      {onBack && (
        <button onClick={onBack} className="-ml-2 px-2 py-1 active:scale-95 transition" aria-label="Назад" style={{ color: 'var(--tg-accent)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-[16px] leading-tight truncate uppercase tracking-wide">{title}</div>
        {subtitle && <div className="text-tg-hint text-[10px] mt-1 truncate font-mono uppercase tracking-[0.18em]">{subtitle}</div>}
      </div>
      <span className="inline-block w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--tg-accent)' }} />
    </div>
  )
}

// Topographic ridge SVG — золотые линии холмов как на референсе
function TopoRidge() {
  return (
    <svg className="absolute left-0 right-0 bottom-0 w-full" height="120" viewBox="0 0 400 120" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD27A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E5B247" stopOpacity="0.15" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      {/* back layers */}
      <path d="M0,80 Q40,70 80,75 T160,65 T240,72 T320,60 T400,68 V120 H0 Z" fill="rgba(229,178,71,0.05)" />
      <path d="M0,90 Q50,82 100,85 T200,75 T300,82 T400,75 V120 H0 Z" fill="rgba(229,178,71,0.07)" />
      {/* main ridge with glow */}
      <path d="M0,95 Q30,80 60,85 Q90,90 120,70 Q150,55 180,72 Q210,85 240,68 Q270,50 300,65 Q340,80 400,72" stroke="url(#ridge)" strokeWidth="1.2" fill="none" filter="url(#glow)" />
      <path d="M0,95 Q30,80 60,85 Q90,90 120,70 Q150,55 180,72 Q210,85 240,68 Q270,50 300,65 Q340,80 400,72" stroke="#FFD27A" strokeWidth="0.6" fill="none" />
      {/* peak dots */}
      <circle cx="120" cy="70" r="2" fill="#FFD27A" filter="url(#glow)" />
      <circle cx="300" cy="65" r="2" fill="#FFD27A" filter="url(#glow)" />
    </svg>
  )
}

function HomeHero({ totalPosts, openCount }: { totalPosts: number; openCount: number }) {
  return (
    <div className="hero-bg relative px-5 pt-6 pb-4 overflow-hidden" style={{ minHeight: 280 }}>
      {/* Top status strip */}
      <div className="flex items-center justify-between mb-8 text-[9px] font-mono uppercase tracking-[0.2em] text-tg-hint relative z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--tg-accent)' }} />
          ONLINE
        </span>
        <span>v0.3.0 · BUILD {new Date().getFullYear()}</span>
      </div>

      {/* Hero title */}
      <div className="relative z-10">
        <div className="text-tg-hint text-[10px] uppercase tracking-[0.32em] font-mono mb-3 fade-up">приватный клуб</div>
        <h1 className="font-display font-bold text-[40px] leading-none fade-up text-glow"
          style={{ animationDelay: '60ms', color: 'var(--tg-accent)' }}>
          {channelName}
        </h1>
        <div className="mt-3 text-tg-text/85 text-[12px] leading-snug max-w-[280px] fade-up" style={{ animationDelay: '120ms' }}>
          {channelSubtitle}
        </div>
      </div>

      {/* Stats grid bar */}
      <div className="relative z-10 mt-8 grid grid-cols-3 gap-3 fade-up" style={{ animationDelay: '200ms' }}>
        <StatChip label="Разделов" value={folders.length} />
        <StatChip label="Открыто" value={openCount} accent />
        <StatChip label="Постов" value={totalPosts} />
      </div>

      <TopoRidge />
    </div>
  )
}

function StatChip({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="p-3 rounded-lg border" style={{
      background: 'rgba(14,16,20,0.6)',
      borderColor: accent ? 'rgba(229,178,71,0.32)' : 'var(--tg-border)',
      backdropFilter: 'blur(6px)',
    }}>
      <div className="font-display font-bold text-[22px] tabular-nums leading-none"
        style={{ color: accent ? 'var(--tg-accent)' : 'var(--tg-text)', textShadow: accent ? '0 0 12px rgba(229,178,71,0.45)' : undefined }}>
        {value}
      </div>
      <div className="text-tg-hint text-[9px] uppercase tracking-[0.16em] font-mono mt-1.5">{label}</div>
    </div>
  )
}

function FolderCard({ f, index, onOpen }: { f: Folder; index: number; onOpen: () => void }) {
  const locked = !!f.closed
  const num = String(index + 1).padStart(2, '0')

  return (
    <button
      onClick={onOpen}
      style={{ animationDelay: `${index * 50}ms` }}
      className={`fade-up card relative w-full text-left p-4 transition-all active:scale-[0.98] flex flex-col gap-3 min-h-[170px] overflow-hidden ${locked ? 'opacity-50' : ''}`}
    >
      {/* Top-right: номер моноспейс */}
      <span className="absolute top-3 right-3.5 text-[10px] font-mono uppercase tracking-wider text-tg-hint">
        {num} {locked && '· LOCKED'}
      </span>

      {/* Icon block */}
      <div className="w-11 h-11 rounded-lg border flex items-center justify-center"
        style={{
          borderColor: locked ? 'var(--tg-border)' : 'rgba(229,178,71,0.32)',
          background: locked ? 'transparent' : 'rgba(229,178,71,0.06)',
          color: locked ? 'var(--tg-locked-text)' : 'var(--tg-accent)',
          boxShadow: locked ? undefined : '0 0 18px rgba(229,178,71,0.08), inset 0 0 12px rgba(229,178,71,0.04)',
        }}>
        <FolderIcon name={f.icon} className="w-[20px] h-[20px]" stroke={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className={`font-display font-bold text-[15px] leading-tight uppercase tracking-wide ${locked ? 'text-tg-locked-text' : 'text-tg-text'}`}>
          {f.title}
        </div>
        <div className={`text-[11px] mt-1.5 leading-snug line-clamp-2 ${locked ? 'text-tg-locked-text' : 'text-tg-hint'}`}>
          {f.subtitle}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--tg-border)' }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{ color: locked ? 'var(--tg-locked-text)' : 'var(--tg-accent)' }}>
          {locked ? '— —' : `${String(f.posts.length).padStart(2, '0')} ПОСТ${f.posts.length === 1 ? '' : 'ОВ'}`}
        </span>
        {locked
          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tg-locked-text"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--tg-accent)' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em]">
        <span style={{ color: 'var(--tg-accent)' }}>{TYPE_LABEL[p.type]}</span>
        <div className="flex items-center gap-2 text-tg-hint">
          {p.pinned && <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'rgba(229,178,71,0.32)', color: 'var(--tg-accent)' }}>PIN</span>}
          <span>{p.date}</span>
        </div>
      </div>
      <div className="font-display font-bold text-[16px] leading-snug uppercase tracking-wide">{p.title}</div>
      <div className="text-tg-hint text-[12px] leading-snug line-clamp-2">{p.excerpt}</div>
    </button>
  )
}

function HomeView({ onOpen }: { onOpen: (id: string) => void }) {
  const totalPosts = folders.reduce((s, f) => s + f.posts.length, 0)
  const openCount = folders.filter(f => !f.closed).length

  return (
    <>
      <HomeHero totalPosts={totalPosts} openCount={openCount} />
      <div className="px-5 pt-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[12px] uppercase tracking-[0.22em]" style={{ color: 'var(--tg-accent)' }}>
            <span className="opacity-50 mr-2">/</span>Разделы
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-tg-hint">
            {String(folders.length).padStart(2, '0')} / 07
          </span>
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
  return (
    <>
      <Header
        title={f.title}
        subtitle={f.closed ? 'ARCHIVED · LOCKED' : `${f.posts.length} ENTR${f.posts.length === 1 ? 'Y' : 'IES'}`}
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
              <div className="font-display font-bold text-[15px] uppercase tracking-wide">{f.closed ? 'Доступ закрыт' : 'Канал пуст'}</div>
              <div className="text-tg-hint text-[11px] mt-2 max-w-[240px] mx-auto font-mono uppercase tracking-wider">awaiting first entry</div>
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
  const bodyParagraphs = (p.body ?? '').trim().split(/\n\n+/).filter(Boolean)
  const tgLink = p.tgUrl || tgUrlFor(f.tgChannel)

  return (
    <>
      <Header title={f.title} subtitle={p.date} onBack={onBack} />
      <div className="px-5 py-6 pb-24 fade-up">
        <div className="flex items-center gap-2 mb-3 text-[10px] font-mono uppercase tracking-[0.2em]">
          <span style={{ color: 'var(--tg-accent)' }}>{TYPE_LABEL[p.type]}</span>
          {p.pinned && <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'rgba(229,178,71,0.32)', color: 'var(--tg-accent)' }}>PIN</span>}
        </div>
        <h1 className="font-display font-bold text-[26px] leading-[1.05] mb-4 uppercase tracking-wide">{p.title}</h1>

        <div className="text-[14px] leading-relaxed space-y-3" style={{ color: 'var(--tg-text)' }}>
          <p className="text-tg-hint">{p.excerpt}</p>
          {bodyParagraphs.length > 0
            ? bodyParagraphs.map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)
            : <p>Здесь будет полный текст поста из ИИшницы — картинки, видео, голосовые, файлы, ссылки на источники.</p>}
        </div>

        {p.fileUrl && (
          <div className="card p-4 my-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg border flex items-center justify-center shrink-0"
              style={{ borderColor: 'rgba(229,178,71,0.32)', background: 'rgba(229,178,71,0.06)', color: 'var(--tg-accent)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[13px] truncate uppercase tracking-wide">{p.fileName}</div>
              <div className="font-mono text-[10px] text-tg-hint mt-0.5 uppercase tracking-wider">{p.fileSize} · SKILL ARCHIVE</div>
            </div>
            <a href={p.fileUrl} download={p.fileName}
              className="shrink-0 px-3.5 py-2 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider active:scale-95 transition flex items-center gap-1.5 border"
              style={{ background: 'rgba(229,178,71,0.12)', borderColor: 'rgba(229,178,71,0.32)', color: 'var(--tg-accent)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </a>
          </div>
        )}

        <button
          onClick={() => openTgLink(tgLink)}
          className="w-full py-3.5 rounded-lg font-display font-bold text-[13px] uppercase tracking-[0.16em] active:scale-[0.98] transition flex items-center justify-center gap-2 mt-4 border-2"
          style={{
            background: 'rgba(229,178,71,0.08)',
            borderColor: 'rgba(229,178,71,0.36)',
            color: 'var(--tg-accent)',
            boxShadow: '0 0 20px rgba(229,178,71,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
          Открыть в Telegram
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </button>
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
            className="w-full pl-12 pr-4 py-3.5 rounded-lg border text-tg-text placeholder:text-tg-hint outline-none text-[14px] font-mono uppercase tracking-wider transition"
            style={{ background: 'var(--tg-sec)', borderColor: 'var(--tg-border)' }} />
        </div>
        <div className="text-center mt-16 fade-up">
          <div className="font-display font-bold text-[14px] uppercase tracking-[0.2em]" style={{ color: 'var(--tg-accent)' }}>NO QUERY</div>
          <div className="text-tg-hint text-[11px] mt-2 font-mono uppercase tracking-wider">enter query to search archive</div>
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
          <div className="text-center py-20 fade-up text-tg-hint text-[11px] font-mono uppercase tracking-wider">no pinned entries</div>
        ) : pinned.map(({ f, p }, i) => (
          <div key={p.id} style={{ animationDelay: `${i * 40}ms` }} className="fade-up card p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5" style={{ color: 'var(--tg-accent)' }}>{f.title}</div>
            <div className="font-display font-bold text-[15px] leading-snug uppercase tracking-wide">{p.title}</div>
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
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--tg-accent)' }}>THEME</div>
          <div className="font-display font-bold text-[15px] uppercase tracking-wide">Cinematic Dark</div>
          <div className="text-tg-hint text-[11px] mt-1 leading-relaxed">Премиум-режим. Светлая тема отключена для сохранения визуальной целостности клуба.</div>
        </div>

        <div className="card p-4 fade-up" style={{ animationDelay: '40ms' }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--tg-accent)' }}>ABOUT</div>
          <div className="font-display font-bold text-[15px] uppercase tracking-wide">ИИшница</div>
          <div className="text-tg-hint text-[11px] mt-1 leading-relaxed">
            Приватный клуб про путь из стройки в ИИ. Кейсы, автоматизации, AI-агенты, контент-скиллы для Claude Code.
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t divider font-mono">
            <span className="text-[10px] uppercase tracking-wider text-tg-hint">build</span>
            <span className="text-[11px]" style={{ color: 'var(--tg-accent)' }}>0.3.0 · CINEMATIC</span>
          </div>
        </div>
      </div>
    </>
  )
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: Array<{ id: Tab; label: string; icon: JSX.Element }> = [
    { id: 'folders',  label: 'CLUB',     icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id: 'search',   label: 'SEARCH',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { id: 'saved',    label: 'PINNED',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
    { id: 'settings', label: 'SYSTEM',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ]
  return (
    <div className="sticky bottom-0 backdrop-blur-xl grid grid-cols-4 pb-[max(env(safe-area-inset-bottom),10px)] pt-2"
      style={{ background: 'rgba(6,7,9,0.92)', borderTop: '1px solid var(--tg-border)' }}>
      {items.map(it => {
        const active = tab === it.id
        return (
          <button key={it.id} onClick={() => setTab(it.id)}
            className="relative flex flex-col items-center gap-1 py-1.5 transition-colors"
            style={{ color: active ? 'var(--tg-accent)' : 'var(--tg-hint)' }}>
            {active && <span className="absolute -top-2 w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--tg-accent)' }} />}
            {it.icon}
            <span className="text-[9px] font-mono font-bold tracking-[0.16em]">{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function App() {
  const [tab, setTab] = useState<Tab>('folders')
  const [view, setView] = useState<View>({ kind: 'home' })

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready(); tg.expand()
      // Принудительно остаёмся в тёмной (cinematic)
      if (typeof tg.setHeaderColor === 'function') {
        try { tg.setHeaderColor('#060709') } catch {}
      }
    }
    document.documentElement.classList.add('tg-dark')
  }, [])

  const body = useMemo(() => {
    if (tab !== 'folders') {
      if (tab === 'search') return <SearchView />
      if (tab === 'saved') return <SavedView />
      return <SettingsView />
    }
    if (view.kind === 'home') return <HomeView onOpen={(id) => setView({ kind: 'folder', folderId: id })} />
    if (view.kind === 'folder') return <FolderView folderId={view.folderId} onBack={() => setView({ kind: 'home' })}
      onOpen={(postId) => setView({ kind: 'post', folderId: view.folderId, postId })} />
    return <PostView folderId={view.folderId} postId={view.postId} onBack={() => setView({ kind: 'folder', folderId: view.folderId })} />
  }, [tab, view])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">{body}</div>
      <TabBar tab={tab} setTab={(t) => { setTab(t); setView({ kind: 'home' }) }} />
    </div>
  )
}
