import { useEffect, useMemo, useState } from 'react'
import { folders, channelName, channelSubtitle, type Folder, type Post } from './data'

type Tab = 'folders' | 'search' | 'saved' | 'settings'
type View =
  | { kind: 'home' }
  | { kind: 'folder'; folderId: string }
  | { kind: 'post'; folderId: string; postId: string }

const TYPE_LABEL: Record<Post['type'], string> = {
  text: 'TEXT', video: 'VIDEO', pdf: 'PDF', mixed: 'MIXED', voice: 'VOICE',
}

function Header({ title, subtitle, onBack, display }: { title: string; subtitle?: string; onBack?: () => void; display?: boolean }) {
  return (
    <div className="sticky top-0 z-10 backdrop-blur-xl bg-tg-bg/80 border-b divider px-5 pt-4 pb-3 flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="-ml-2 px-2 py-1 text-tg-hint hover:text-tg-text active:scale-95 transition text-[15px]" aria-label="Назад">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className={`${display ? 'font-display font-bold text-[22px]' : 'font-semibold text-[16px]'} leading-tight truncate flex items-center gap-2`}>
          {display && <span className="dot-accent" />}
          <span className="truncate">{title}</span>
        </div>
        {subtitle && <div className="text-tg-hint text-[11px] mt-1 uppercase tracking-[0.12em] font-medium truncate">{subtitle}</div>}
      </div>
    </div>
  )
}

function FolderCard({ f, index, onOpen }: { f: Folder; index: number; onOpen: () => void }) {
  const num = String(index + 1).padStart(2, '0')
  const locked = !!f.closed

  return (
    <button
      onClick={onOpen}
      style={{ animationDelay: `${index * 40}ms` }}
      className={`fade-up relative w-full text-left p-4 rounded-2xl border transition-all active:scale-[0.98]
        ${locked
          ? 'bg-tg-locked-bg border-transparent'
          : 'bg-tg-sec border-tg-border hover:border-tg-accent/30'}
        flex flex-col gap-3 min-h-[150px]`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
          ${locked ? 'bg-tg-locked-bg border border-tg-border opacity-50' : `bg-gradient-to-br ${f.accent} shadow-sm`}`}>
          {f.icon}
        </div>
        <span className={`font-mono text-[11px] font-medium tabular-nums tracking-tight ${locked ? 'text-tg-locked-text' : 'text-tg-hint'}`}>
          {num}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className={`font-display font-semibold text-[15px] leading-tight ${locked ? 'text-tg-locked-text' : 'text-tg-text'}`}>
          {f.title}
        </div>
        <div className={`text-[11px] mt-1.5 leading-snug line-clamp-2 ${locked ? 'text-tg-locked-text' : 'text-tg-hint'}`}>
          {f.subtitle}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className={`font-mono text-[10px] uppercase tracking-wider ${locked ? 'text-tg-locked-text' : 'text-tg-hint'}`}>
          {locked ? 'СКОРО' : `${f.posts.length} ${f.posts.length === 1 ? 'пост' : 'постов'}`}
        </span>
        {locked
          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tg-locked-text"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-tg-text/70"><polyline points="9 18 15 12 9 6"/></svg>
        }
      </div>
    </button>
  )
}

function PostRow({ p, index, onOpen }: { p: Post; index: number; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      style={{ animationDelay: `${index * 35}ms` }}
      className="fade-up card w-full text-left p-4 flex flex-col gap-2 active:scale-[0.99] transition-transform">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
        <span className="text-tg-accent">{TYPE_LABEL[p.type]}</span>
        <div className="flex items-center gap-2 text-tg-hint">
          {p.pinned && <span className="px-1.5 py-0.5 rounded bg-tg-accent-soft text-tg-accent font-semibold">PIN</span>}
          <span>{p.date}</span>
        </div>
      </div>
      <div className="font-display font-semibold text-[16px] leading-snug">{p.title}</div>
      <div className="text-tg-hint text-[13px] leading-snug line-clamp-2">{p.excerpt}</div>
    </button>
  )
}

function HomeView({ onOpen }: { onOpen: (id: string) => void }) {
  const totalPosts = folders.reduce((s, f) => s + f.posts.length, 0)
  const openCount = folders.filter(f => !f.closed).length

  return (
    <>
      <Header title={channelName} subtitle={channelSubtitle} display />
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-4 mb-5 fade-up" style={{ animationDelay: '0ms' }}>
          <Stat value={folders.length} label="разделов" />
          <span className="w-px h-7 bg-tg-border" />
          <Stat value={openCount} label="открыты" />
          <span className="w-px h-7 bg-tg-border" />
          <Stat value={totalPosts} label="постов" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-tg-hint">Разделы</h2>
          <span className="font-mono text-[10px] tabular-nums text-tg-hint">{folders.length} / {folders.length}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pb-24">
          {folders.map((f, i) => <FolderCard key={f.id} f={f} index={i} onOpen={() => onOpen(f.id)} />)}
        </div>
      </div>
    </>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-[22px] font-bold tabular-nums leading-none">{value}</span>
      <span className="text-tg-hint text-[10px] uppercase tracking-wider mt-1 font-medium">{label}</span>
    </div>
  )
}

function FolderView({ folderId, onBack, onOpen }: { folderId: string; onBack: () => void; onOpen: (postId: string) => void }) {
  const f = folders.find(x => x.id === folderId)!
  return (
    <>
      <Header
        title={f.title}
        subtitle={f.closed ? 'архив · раздел закрыт' : `${f.posts.length} ${f.posts.length === 1 ? 'пост' : 'постов'}`}
        onBack={onBack}
      />
      <div className="px-5 pt-4 pb-24 space-y-2.5">
        {f.posts.length > 0
          ? f.posts.map((p, i) => <PostRow key={p.id} p={p} index={i} onOpen={() => onOpen(p.id)} />)
          : (
            <div className="text-center py-20 fade-up">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-tg-locked-bg border border-tg-border items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-tg-hint"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className="font-display font-semibold text-[16px]">{f.closed ? 'Раздел закрыт' : 'Пока пусто'}</div>
              <div className="text-tg-hint text-[12px] mt-1.5 max-w-[240px] mx-auto">Контент появится после первой публикации</div>
            </div>
          )}
      </div>
    </>
  )
}

function PostView({ folderId, postId, onBack }: { folderId: string; postId: string; onBack: () => void }) {
  const f = folders.find(x => x.id === folderId)!
  const p = f.posts.find(x => x.id === postId)!
  return (
    <>
      <Header title={f.title} subtitle={p.date} onBack={onBack} />
      <div className="px-5 py-6 fade-up">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-tg-accent">{TYPE_LABEL[p.type]}</span>
          {p.pinned && <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-tg-accent-soft text-tg-accent font-semibold">PIN</span>}
        </div>
        <h1 className="font-display text-[26px] font-bold leading-tight mb-4">{p.title}</h1>
        <div className="text-tg-text/85 text-[15px] leading-relaxed space-y-3">
          <p>{p.excerpt}</p>
          <p>Здесь будет полный текст поста из ИИшницы — картинки, видео, голосовые, файлы, ссылки на источники.</p>
        </div>

        <div className="card p-4 my-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-tg-hint mb-2">Превью</div>
          <div className="text-[14px] text-tg-text/80 leading-snug">Когда зальём реальный контент канала — здесь будет оригинальный пост с форматированием.</div>
        </div>

        <button className="w-full py-3.5 rounded-2xl bg-tg-btn text-tg-bg font-display font-semibold text-[15px] active:scale-[0.98] transition flex items-center justify-center gap-2">
          Открыть в Telegram
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </button>
      </div>
    </>
  )
}

function SearchView() {
  return (
    <>
      <Header title="Поиск" />
      <div className="px-5 pt-4">
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tg-hint"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="По названию, тэгу, тексту"
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-tg-sec border border-tg-border text-tg-text placeholder:text-tg-hint outline-none text-[15px] focus:border-tg-accent transition" />
        </div>
        <div className="text-center mt-16 fade-up">
          <div className="font-display font-semibold text-[16px]">Что ищем?</div>
          <div className="text-tg-hint text-[12px] mt-1.5">Введи запрос — найду по всем разделам</div>
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
      <div className="px-5 pt-4 space-y-2.5">
        {pinned.length === 0 ? (
          <div className="text-center py-20 fade-up text-tg-hint text-[13px]">Здесь будут твои закладки</div>
        ) : pinned.map(({ f, p }, i) => (
          <div key={p.id} style={{ animationDelay: `${i * 35}ms` }} className="fade-up card p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-tg-accent mb-1.5">{f.title}</div>
            <div className="font-display font-semibold text-[15px] leading-snug">{p.title}</div>
            <div className="text-tg-hint text-[12px] mt-1.5 line-clamp-2">{p.excerpt}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function SettingsView({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <>
      <Header title="Настройки" />
      <div className="px-5 pt-4 space-y-2.5">
        <div className="card p-4 flex items-center justify-between fade-up">
          <div>
            <div className="font-display font-semibold text-[15px]">Тёмная тема</div>
            <div className="text-tg-hint text-[12px] mt-0.5">Подстраивается под Telegram</div>
          </div>
          <button onClick={() => setDark(!dark)}
            aria-label="Переключить тему"
            className={`relative w-12 h-7 rounded-full transition-colors ${dark ? 'bg-tg-accent' : 'bg-tg-border'}`}>
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow ${dark ? 'left-[1.375rem]' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="card p-4 fade-up" style={{ animationDelay: '40ms' }}>
          <div className="font-display font-semibold text-[15px]">О приложении</div>
          <div className="text-tg-hint text-[12px] mt-1 leading-relaxed">
            ИИшница mini-app v0.2 — приватный клуб про путь из стройки в ИИ.
            Демо-режим. Контент канала подключается отдельно.
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t divider">
            <span className="font-mono text-[10px] uppercase tracking-wider text-tg-hint">build</span>
            <span className="font-mono text-[11px] text-tg-text">0.2.0</span>
          </div>
        </div>
      </div>
    </>
  )
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: Array<{ id: Tab; label: string; icon: JSX.Element }> = [
    { id: 'folders',  label: 'Клуб',      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
    { id: 'search',   label: 'Поиск',     icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { id: 'saved',    label: 'Избранное', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
    { id: 'settings', label: 'Настройки', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ]
  return (
    <div className="sticky bottom-0 bg-tg-bg/95 backdrop-blur-xl border-t divider grid grid-cols-4 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
      {items.map(it => {
        const active = tab === it.id
        return (
          <button key={it.id} onClick={() => setTab(it.id)}
            className={`relative flex flex-col items-center gap-1 py-1 transition-colors ${active ? 'text-tg-text' : 'text-tg-hint'}`}>
            {active && <span className="absolute top-0 w-8 h-0.5 rounded-full bg-tg-accent" />}
            {it.icon}
            <span className="text-[10px] font-medium tracking-tight">{it.label}</span>
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
