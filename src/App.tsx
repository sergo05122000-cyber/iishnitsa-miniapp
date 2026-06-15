import { useEffect, useMemo, useState } from 'react'
import { folders, channelName, channelSubtitle, tgUrlFor, TG_QUESTIONS_TOPIC, type Folder, type Post, type LessonTimecode, type LessonStep, type LessonService, type LessonRepo } from './data'
import { IntroForm } from './IntroForm'

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
    case 'play': return <svg {...common}><polygon points="5 3 19 12 5 21 5 3"/></svg>
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

function PanScene({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 220" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="ps-yolk" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFE99A" />
          <stop offset="55%" stopColor="#F4B73D" />
          <stop offset="100%" stopColor="#9C6614" />
        </radialGradient>
        <radialGradient id="ps-yolkGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(var(--accent-bright-rgb),0.55)" />
          <stop offset="100%" stopColor="rgba(var(--accent-rgb),0)" />
        </radialGradient>
        <linearGradient id="ps-pan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1208" />
          <stop offset="100%" stopColor="#060709" />
        </linearGradient>
        <linearGradient id="ps-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a18" />
          <stop offset="100%" stopColor="#1a120a" />
        </linearGradient>
      </defs>

      {/* === STEAM (steam-А, -B, -C поднимается из сковороды) === */}
      <g className="steam-group" stroke="rgba(232,223,200,0.32)" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path className="steam steam-a" d="M150 110 C 145 95, 155 85, 150 70 C 145 55, 155 45, 150 30" />
        <path className="steam steam-b" d="M180 110 C 175 95, 185 85, 180 70 C 175 55, 185 45, 180 30" />
        <path className="steam steam-c" d="M210 110 C 205 95, 215 85, 210 70 C 205 55, 215 45, 210 30" />
      </g>

      {/* === PAN + HAND group (мягкое покачивание) === */}
      <g className="pan-group">
        {/* PAN корпус */}
        <path
          d="M40 130 Q 40 180, 80 192 L 200 192 Q 240 180, 240 130 Z"
          fill="url(#ps-pan)"
          stroke="rgba(var(--accent-rgb),0.9)"
          strokeWidth="1.8"
        />

        {/* HANDLE BASE — крепёжная пластинка соединяет ручку и сковороду */}
        <path
          d="M225 170 L 252 168 L 252 196 L 225 194 Z"
          fill="url(#ps-pan)"
          stroke="rgba(var(--accent-rgb),0.95)"
          strokeWidth="1.6"
        />
        <circle cx="232" cy="176" r="2" fill="#E5B247" />
        <circle cx="232" cy="188" r="2" fill="#E5B247" />
        <circle cx="244" cy="176" r="2" fill="#E5B247" />
        <circle cx="244" cy="188" r="2" fill="#E5B247" />

        {/* HANDLE — ручка сковороды, конусится к концу */}
        <path
          d="M250 174 L 308 184 Q 316 187, 316 192 Q 316 197, 308 200 L 250 196 Z"
          fill="url(#ps-pan)"
          stroke="rgba(var(--accent-rgb),0.9)"
          strokeWidth="1.6"
        />
        {/* блик на ручке */}
        <path d="M254 178 L 304 188" stroke="rgba(var(--accent-rgb),0.4)" strokeWidth="0.8" fill="none" />

        {/* верхний край (ободок) */}
        <ellipse cx="140" cy="130" rx="100" ry="22" fill="#0a0805" stroke="rgba(var(--accent-rgb),1)" strokeWidth="2.2" className="pan-glow" />
        {/* внутренний ободок */}
        <ellipse cx="140" cy="130" rx="92" ry="18" fill="#1a1208" stroke="rgba(var(--accent-rgb),0.4)" strokeWidth="0.8" />

        {/* === HAND — кисть с пальцами поверх ручки === */}
        <g className="hand-group">
          {/* Предплечье уходит за правый край */}
          <path
            d="M322 165 L 360 158 L 360 215 L 322 212 Z"
            fill="url(#ps-skin)"
            stroke="rgba(var(--accent-rgb),0.6)"
            strokeWidth="1.4"
          />
          {/* Ладонь обхватывает ручку */}
          <path
            d="M276 170
               Q 266 178, 268 192
               Q 270 206, 286 212
               Q 305 216, 324 212
               L 324 165
               Q 300 162, 276 170 Z"
            fill="url(#ps-skin)"
            stroke="rgba(var(--accent-rgb),0.78)"
            strokeWidth="1.5"
          />
          {/* Большой палец — сверху ручки, обхватывает её */}
          <path
            d="M286 174
               Q 282 168, 290 162
               Q 302 156, 312 162
               Q 318 168, 312 176
               L 296 180 Z"
            fill="url(#ps-skin)"
            stroke="rgba(var(--accent-rgb),0.85)"
            strokeWidth="1.4"
          />
          {/* 4 пальца снизу-спереди обхватывают ручку */}
          <g stroke="rgba(var(--accent-rgb),0.7)" strokeWidth="1.2" fill="url(#ps-skin)">
            <ellipse cx="280" cy="200" rx="4.2" ry="7" />
            <ellipse cx="290" cy="206" rx="4.2" ry="7" />
            <ellipse cx="300" cy="208" rx="4.2" ry="7" />
            <ellipse cx="310" cy="208" rx="4.2" ry="6" />
          </g>
          {/* Линии-разделители пальцев (видны на верхней стороне ладони) */}
          <path d="M284 192 Q 285 184, 286 176" stroke="rgba(var(--accent-rgb),0.3)" strokeWidth="0.8" fill="none" />
          <path d="M294 196 Q 295 188, 296 178" stroke="rgba(var(--accent-rgb),0.3)" strokeWidth="0.8" fill="none" />
          <path d="M304 198 Q 305 190, 306 178" stroke="rgba(var(--accent-rgb),0.3)" strokeWidth="0.8" fill="none" />
          {/* Костяшки-блики */}
          <ellipse cx="280" cy="194" rx="2" ry="1.2" fill="rgba(255,225,180,0.45)" />
          <ellipse cx="290" cy="200" rx="2" ry="1.2" fill="rgba(255,225,180,0.45)" />
          <ellipse cx="300" cy="202" rx="2" ry="1.2" fill="rgba(255,225,180,0.45)" />
          {/* Граница запястья */}
          <path d="M322 165 Q 320 188, 322 212" stroke="rgba(var(--accent-rgb),0.45)" strokeWidth="1" fill="none" />
        </g>

        {/* === ЯИЧНИЦА В СКОВОРОДЕ === */}
        {/* мягкое внешнее сияние */}
        <ellipse cx="140" cy="132" rx="78" ry="15" fill="url(#ps-yolkGlow)" className="yolk-aura" />

        {/* Белок 1 — большой, неровный */}
        <path
          d="M80 132
             C 75 122, 90 118, 110 122
             C 120 116, 145 116, 160 122
             C 180 118, 200 124, 205 134
             C 210 142, 195 146, 175 144
             C 160 148, 130 148, 110 144
             C 90 146, 75 142, 80 132 Z"
          fill="#FFF8E4"
          opacity="0.95"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.6"
        />

        {/* Желток */}
        <ellipse cx="135" cy="130" rx="18" ry="10" fill="url(#ps-yolk)" className="yolk-main" stroke="rgba(var(--accent-rgb),0.7)" strokeWidth="0.6" />
        {/* блик на желтке */}
        <ellipse cx="128" cy="126" rx="5" ry="2.6" fill="rgba(255,255,255,0.55)" />

        {/* Второй белок поменьше */}
        <ellipse cx="180" cy="135" rx="16" ry="6" fill="#FFF8E4" opacity="0.85" />
        <ellipse cx="180" cy="134" rx="6" ry="3.2" fill="url(#ps-yolk)" className="yolk-small" />

        {/* === ПУЗЫРЬКИ (шипит) === */}
        <g className="bubbles" fill="rgba(255,248,228,0.7)">
          <circle className="bubble bubble-a" cx="100" cy="140" r="2" />
          <circle className="bubble bubble-b" cx="160" cy="142" r="1.6" />
          <circle className="bubble bubble-c" cx="195" cy="138" r="1.4" />
          <circle className="bubble bubble-d" cx="115" cy="135" r="1.2" />
          <circle className="bubble bubble-e" cx="170" cy="138" r="1.8" />
        </g>
      </g>
    </svg>
  )
}

function HomeHero({ totalPosts, openCount }: { totalPosts: number; openCount: number }) {
  return (
    <div className="hero-bg relative px-5 pt-6 pb-4 overflow-hidden" style={{ minHeight: 380 }}>
      {/* Top status strip */}
      <div className="flex items-center justify-between mb-3 text-[9px] font-mono uppercase tracking-[0.2em] text-tg-hint relative z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--tg-accent)' }} />
          ONLINE
        </span>
        <span>v0.3.0 · BUILD {new Date().getFullYear()}</span>
      </div>

      {/* PAN scene — главный визуальный акцент */}
      <PanScene className="absolute left-0 right-0 top-8 w-full h-[220px] pointer-events-none z-0" />

      {/* Hero title */}
      <div className="relative z-10 mt-[200px]">
        <div className="text-tg-hint text-[10px] uppercase tracking-[0.32em] font-mono mb-3 fade-up">клуб</div>
        <h1 className="font-display text-[52px] leading-[0.92] fade-up text-glow-strong title-outline"
          style={{ animationDelay: '60ms', color: 'var(--tg-accent)', letterSpacing: '-0.035em', fontWeight: 800 }}>
          {channelName}
        </h1>
        <div className="mt-3 text-tg-text/85 text-[12px] leading-snug max-w-[280px] fade-up" style={{ animationDelay: '120ms' }}>
          {channelSubtitle}
        </div>
      </div>

      {/* Stats grid bar */}
      <div className="relative z-10 mt-6 grid grid-cols-3 gap-3 fade-up" style={{ animationDelay: '200ms' }}>
        <StatChip label="Разделов" value={folders.length} />
        <StatChip label="Открыто" value={openCount} accent />
        <StatChip label="Постов" value={totalPosts} />
      </div>
    </div>
  )
}

function StatChip({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border ${accent ? 'neon-border' : ''}`} style={{
      background: 'rgba(14,16,20,0.6)',
      borderColor: accent ? 'rgba(var(--accent-rgb),0.55)' : 'rgba(var(--accent-rgb),0.16)',
      backdropFilter: 'blur(6px)',
      boxShadow: accent
        ? '0 0 22px -4px rgba(var(--accent-rgb),0.32), inset 0 0 16px rgba(var(--accent-rgb),0.05)'
        : '0 0 14px -6px rgba(var(--accent-rgb),0.16), inset 0 0 10px rgba(var(--accent-rgb),0.03)',
    }}>
      <div className={`font-display font-bold text-[22px] tabular-nums leading-none ${accent ? 'neon-text' : 'neon-text-soft'}`}
        style={{ color: accent ? 'var(--tg-accent)' : 'var(--tg-text)' }}>
        {value}
      </div>
      <div className="text-tg-hint text-[9px] uppercase tracking-[0.16em] font-mono mt-1.5">{label}</div>
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
      <span className={`card-number absolute top-3 right-3.5 text-[10px] font-mono uppercase tracking-wider ${locked ? 'text-tg-hint' : ''}`}
        style={!locked ? { color: 'var(--tg-accent)' } : undefined}>
        {num} {locked && '· LOCKED'}
      </span>

      {/* Icon block */}
      <div className="card-icon w-11 h-11 rounded-lg border flex items-center justify-center"
        style={{
          borderColor: locked ? 'var(--tg-border)' : 'rgba(var(--accent-rgb),0.34)',
          background: locked ? 'transparent' : 'rgba(var(--accent-rgb),0.07)',
          color: locked ? 'var(--tg-locked-text)' : 'var(--tg-icon)',
          boxShadow: locked ? undefined : '0 0 18px rgba(var(--accent-rgb),0.10), inset 0 0 12px rgba(var(--accent-rgb),0.05)',
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
          style={{ color: locked ? 'var(--tg-locked-text)' : 'var(--tg-icon)' }}>
          {locked ? '— —' : `${String(f.posts.length).padStart(2, '0')} ПОСТ${f.posts.length === 1 ? '' : 'ОВ'}`}
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
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em]">
        <span style={{ color: 'var(--tg-accent)' }}>{TYPE_LABEL[p.type]}</span>
        <div className="flex items-center gap-2 text-tg-hint">
          {p.pinned && <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'rgba(var(--accent-rgb),0.32)', color: 'var(--tg-accent)' }}>PIN</span>}
          <span>{p.date}</span>
        </div>
      </div>
      <div className="font-display font-bold text-[16px] leading-snug uppercase tracking-wide">{p.title}</div>
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
      <div className="card relative p-5 overflow-hidden welcome-glow" style={{ background: 'linear-gradient(180deg, rgba(var(--accent-rgb),0.06) 0%, var(--tg-sec) 60%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-tg-hint mb-1">START HERE</div>
            <h3 className="font-display font-bold text-[18px] uppercase tracking-wide neon-text" style={{ color: 'var(--tg-accent)' }}>
              С чего начать
            </h3>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-tg-hint">3 ШАГА</div>
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
                background: 'rgba(14,16,20,0.5)',
              }}
            >
              {/* Номер шага */}
              <div className="shrink-0 font-display font-bold text-[20px] leading-none w-7 tabular-nums neon-text" style={{ color: 'var(--tg-accent)' }}>
                {s.n}
              </div>
              {/* Иконка */}
              <div className="shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center"
                style={{
                  borderColor: 'rgba(var(--accent-rgb),0.34)',
                  background: 'rgba(var(--accent-rgb),0.07)',
                  color: 'var(--tg-icon)',
                  boxShadow: '0 0 14px rgba(var(--accent-rgb),0.10), inset 0 0 10px rgba(var(--accent-rgb),0.05)',
                }}>
                {s.icon}
              </div>
              {/* Текст */}
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[13px] uppercase tracking-wide text-tg-text leading-tight">{s.title}</div>
                <div className="text-tg-hint text-[11px] mt-1 leading-snug">{s.sub}</div>
              </div>
              {/* Стрелка */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-1" style={{ color: 'var(--tg-icon)' }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-4 pt-3 border-t flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-tg-hint" style={{ borderColor: 'var(--tg-border)' }}>
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
      <div className="shrink-0 w-11 h-11 rounded-lg border flex items-center justify-center"
        style={{
          borderColor: locked ? 'var(--tg-border)' : 'rgba(var(--accent-rgb),0.34)',
          background: locked ? 'transparent' : 'rgba(var(--accent-rgb),0.07)',
          color: locked ? 'var(--tg-locked-text)' : 'var(--tg-icon)',
        }}>
        <FolderIcon name={f.icon} className="w-[18px] h-[18px]" stroke={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-display font-bold text-[15px] uppercase tracking-wide leading-tight ${locked ? 'text-tg-locked-text' : 'text-tg-text'}`}>
          {f.title}
        </div>
        <div className={`text-[11px] mt-0.5 font-mono uppercase tracking-wider ${locked ? 'text-tg-locked-text' : 'text-tg-hint'}`}>
          {locked ? '— —' : `${String(f.posts.length).padStart(2, '0')} ПОСТ${f.posts.length === 1 ? '' : 'ОВ'}`}
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
  const openCount = folders.filter(f => !f.closed).length
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <>
      <HomeHero totalPosts={totalPosts} openCount={openCount} />
      <WelcomeGuide onOpen={onOpen} />
      <div className="px-5 pt-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[12px] uppercase tracking-[0.22em]" style={{ color: 'var(--tg-accent)' }}>
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button onClick={copy}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider active:scale-95 transition border"
      style={{ background: 'rgba(var(--accent-rgb),0.12)', borderColor: 'rgba(var(--accent-rgb),0.32)', color: 'var(--tg-accent)' }}>
      {copied
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
      {copied ? 'Скопировано' : 'Скопировать'}
    </button>
  )
}

function LessonSectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: 'var(--tg-accent)' }} />
      <span className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: 'var(--tg-hint)' }}>{text}</span>
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
                  <p className="text-[14px] font-medium leading-snug mb-2" style={{ color: 'var(--tg-text)' }}>{step.text}</p>
                  {step.command && (
                    <div className="card rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--tg-border)' }}>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-sm" style={{ background: 'var(--tg-accent)' }} />
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-tg-hint">Команда</span>
                        </div>
                        <CopyButton text={step.command} />
                      </div>
                      <pre className="px-3 py-3 text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-all"
                        style={{ color: 'var(--tg-accent)' }}>
                        {step.command}
                      </pre>
                    </div>
                  )}
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
                  <div className="font-mono text-[10px] mt-0.5 uppercase tracking-wider text-tg-hint">{svc.desc}</div>
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
                    <div className="font-mono text-[10px] mt-0.5 tracking-wide text-tg-hint truncate">{shortUrl}</div>
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

function PostView({ folderId, postId, onBack }: { folderId: string; postId: string; onBack: () => void }) {
  const f = folders.find(x => x.id === folderId)!
  const p = f.posts.find(x => x.id === postId)!
  const tgLink = p.tgUrl || tgUrlFor(f.tgChannel)
  const isLesson = !!(p.timecodes || p.goal || p.steps || p.services || p.repos)

  return (
    <>
      <Header title={f.title} subtitle={p.date} onBack={onBack} />
      <div className="px-5 py-6 pb-24 fade-up">
        <div className="flex items-center gap-2 mb-3 text-[10px] font-mono uppercase tracking-[0.2em]">
          <span style={{ color: 'var(--tg-accent)' }}>{TYPE_LABEL[p.type]}</span>
          {p.pinned && <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'rgba(var(--accent-rgb),0.32)', color: 'var(--tg-accent)' }}>PIN</span>}
        </div>
        <h1 className="font-display font-bold text-[26px] leading-[1.05] mb-6 uppercase tracking-wide">{p.title}</h1>

        <LessonPostBody p={p} />

        {p.fileUrl && (
          <div className="card p-4 my-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg border flex items-center justify-center shrink-0"
              style={{ borderColor: 'rgba(var(--accent-rgb),0.32)', background: 'rgba(var(--accent-rgb),0.06)', color: 'var(--tg-accent)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[13px] truncate uppercase tracking-wide">{p.fileName}</div>
              <div className="font-mono text-[10px] text-tg-hint mt-0.5 uppercase tracking-wider">{p.fileSize} · SKILL ARCHIVE</div>
            </div>
            <a href={p.fileUrl} download={p.fileName}
              className="shrink-0 px-3.5 py-2 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider active:scale-95 transition flex items-center gap-1.5 border"
              style={{ background: 'rgba(var(--accent-rgb),0.12)', borderColor: 'rgba(var(--accent-rgb),0.32)', color: 'var(--tg-accent)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </a>
          </div>
        )}

        {!isLesson && (
          <button
            onClick={() => openTgLink(tgLink)}
            className="w-full py-3.5 rounded-lg font-display font-bold text-[13px] uppercase tracking-[0.16em] active:scale-[0.98] transition flex items-center justify-center gap-2 mt-4 border-2"
            style={{
              background: 'rgba(var(--accent-rgb),0.08)',
              borderColor: 'rgba(var(--accent-rgb),0.36)',
              color: 'var(--tg-accent)',
              boxShadow: '0 0 20px rgba(var(--accent-rgb),0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
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
            Клуб про путь из стройки в ИИ. Кейсы, автоматизации, AI-агенты, контент-скиллы для Claude Code.
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
            style={{ color: active ? 'var(--tg-icon)' : 'var(--tg-hint)' }}>
            {active && <span className="absolute -top-2 w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--tg-icon)' }} />}
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
      // Принудительно остаёмся в тёмной (cinematic)
      if (typeof tg.setHeaderColor === 'function') {
        try { tg.setHeaderColor('#060709') } catch {}
      }
    }
    document.documentElement.classList.add('tg-dark')

    // Auto-open intro form when launched via ?form=intro (used by /anketa keyboard button)
    try {
      const params = new URLSearchParams(window.location.search)
      const startParam = tg?.initDataUnsafe?.start_param
      if (params.get('form') === 'intro' || startParam === 'intro' || window.location.hash === '#intro') {
        setIntroOpen(true)
      }
    } catch {}
  }, [])

  // Scroll-driven accent: gold at the top (hero stays "стильно"), smoothly
  // lerping to cyan as you scroll down, and back to gold on the way up.
  // Drives the single --accent-rgb var that every accent colour now reads from.
  useEffect(() => {
    const GOLD = [229, 178, 71], CYAN = [6, 182, 212]
    const GOLD_B = [255, 210, 122], CYAN_B = [110, 232, 245]
    let raf = 0
    const apply = () => {
      raf = 0
      const el = document.scrollingElement || document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const p = max > 4 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0
      const f = (a: number, b: number) => Math.round(a + (b - a) * p)
      const mix = (A: number[], B: number[]) => `${f(A[0], B[0])}, ${f(A[1], B[1])}, ${f(A[2], B[2])}`
      const root = document.documentElement.style
      root.setProperty('--accent-rgb', mix(GOLD, CYAN))
      root.setProperty('--accent-bright-rgb', mix(GOLD_B, CYAN_B))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    apply()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [view, tab])

  const body = useMemo(() => {
    if (tab !== 'folders') {
      if (tab === 'search') return <SearchView />
      if (tab === 'saved') return <SavedView />
      return <SettingsView />
    }
    if (view.kind === 'home') return <HomeView onOpen={handleOpenFolder} />
    if (view.kind === 'folder') return <FolderView folderId={view.folderId} onBack={() => setView({ kind: 'home' })}
      onOpen={(postId) => handleOpenPost(view.folderId, postId)} />
    return <PostView folderId={view.folderId} postId={view.postId} onBack={() => setView({ kind: 'folder', folderId: view.folderId })} />
  }, [tab, view])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">{body}</div>
      <TabBar tab={tab} setTab={(t) => { setTab(t); setView({ kind: 'home' }) }} />
      <IntroForm open={introOpen} onClose={() => setIntroOpen(false)} />
    </div>
  )
}
