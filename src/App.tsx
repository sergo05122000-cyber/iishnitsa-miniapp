import { useEffect, useMemo, useState } from 'react'
import { folders, channelName, channelSubtitle, type Folder, type Post } from './data'

type Tab = 'folders' | 'search' | 'saved' | 'settings'
type View =
  | { kind: 'home' }
  | { kind: 'folder'; folderId: string }
  | { kind: 'post'; folderId: string; postId: string }

const TYPE_ICON: Record<Post['type'], string> = {
  text: '📝', video: '🎬', pdf: '📎', mixed: '✨', voice: '🎙',
}

function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-tg-bg/85 border-b divider px-4 pt-3 pb-3 flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="text-tg-link text-base">‹ Назад</button>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[17px] truncate">{title}</div>
        {subtitle && <div className="text-tg-hint text-xs mt-0.5 truncate">{subtitle}</div>}
      </div>
    </div>
  )
}

function FolderCard({ f, onOpen }: { f: Folder; onOpen: () => void }) {
  return (
    <button onClick={onOpen}
      className="card relative w-full text-left p-3 flex flex-col gap-2.5 active:scale-[0.97] transition-transform min-h-[140px]">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-2xl shrink-0`}>
        {f.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] leading-tight flex items-center gap-1">
          {f.title}
          {f.closed && <span className="text-[10px] text-tg-hint">🔒</span>}
        </div>
        <div className="text-tg-hint text-[11px] mt-1 leading-snug line-clamp-2">{f.subtitle}</div>
      </div>
      <div className="absolute top-2.5 right-2.5 text-tg-hint text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-full bg-tg-bg/70">
        {f.posts.length}
      </div>
    </button>
  )
}

function PostRow({ p, onOpen }: { p: Post; onOpen: () => void }) {
  return (
    <button onClick={onOpen}
      className="card w-full text-left p-3 flex gap-3 active:scale-[0.99] transition-transform">
      <div className="text-2xl">{TYPE_ICON[p.type]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="font-medium text-[15px] leading-tight">{p.title}</div>
          {p.pinned && <span className="text-[10px] font-semibold text-tg-link mt-0.5">PIN</span>}
        </div>
        <div className="text-tg-hint text-xs mt-1 line-clamp-2 leading-snug">{p.excerpt}</div>
        <div className="text-tg-hint text-[11px] mt-2">{p.date}</div>
      </div>
    </button>
  )
}

function HomeView({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <>
      <Header title={channelName} subtitle={channelSubtitle} />
      <div className="p-4">
        <div className="text-tg-hint text-[11px] uppercase tracking-wider px-1 pb-2">Разделы</div>
        <div className="grid grid-cols-2 gap-2.5">
          {folders.map(f => <FolderCard key={f.id} f={f} onOpen={() => onOpen(f.id)} />)}
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
        subtitle={f.closed ? 'Раздел закрыт · контент в архиве' : `${f.posts.length} ${f.posts.length === 1 ? 'пост' : 'постов'}`}
        onBack={onBack}
      />
      <div className="p-4 space-y-2.5">
        {f.posts.length > 0
          ? f.posts.map(p => <PostRow key={p.id} p={p} onOpen={() => onOpen(p.id)} />)
          : (
            <div className="text-center text-tg-hint text-sm py-16">
              <div className="text-4xl mb-3 opacity-60">{f.closed ? '🔒' : '🪺'}</div>
              <div>{f.closed ? 'Раздел закрыт' : 'Пока пусто'}</div>
              <div className="text-xs mt-1 opacity-70">Контент появится после первой публикации</div>
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
      <div className="px-4 py-5">
        <div className="text-[22px] font-semibold leading-tight mb-3">{p.title}</div>
        <div className="text-tg-hint text-[13px] leading-relaxed">
          <p className="mb-3">{p.excerpt}</p>
          <p className="mb-3">Здесь будет полный текст поста из «Яичницы». Картинки, видео, голосовые, файлы, ссылки на источники.</p>
          <div className="card p-4 my-4 text-tg-text">
            <div className="text-tg-hint text-[11px] uppercase tracking-wider mb-2">Превью</div>
            <div className="text-[14px]">Когда залью реальный контент канала -- здесь будет оригинальный пост с форматированием.</div>
          </div>
          <button className="w-full mt-2 py-3 rounded-xl bg-tg-btn text-white font-medium text-[15px]">
            Открыть в Telegram
          </button>
        </div>
      </div>
    </>
  )
}

function SearchView() {
  return (
    <>
      <Header title="Поиск" />
      <div className="p-4">
        <input placeholder="По названию, тэгу, тексту..."
          className="w-full px-4 py-3 rounded-xl bg-tg-sec text-tg-text placeholder:text-tg-hint outline-none text-[15px]" />
        <div className="text-tg-hint text-xs text-center mt-12">Введите запрос чтобы искать</div>
      </div>
    </>
  )
}
function SavedView() {
  return (
    <>
      <Header title="Избранное" subtitle="Закреплённое и любимое" />
      <div className="p-4 space-y-2.5">
        {folders.flatMap(f => f.posts.filter(p => p.pinned).map(p => ({ f, p }))).map(({ f, p }) => (
          <div key={p.id} className="card p-3">
            <div className="text-tg-hint text-[11px] uppercase tracking-wider mb-1">{f.title}</div>
            <div className="font-medium text-[15px]">{p.title}</div>
            <div className="text-tg-hint text-xs mt-1 line-clamp-2">{p.excerpt}</div>
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
      <div className="p-4 space-y-2.5">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-[15px]">Тёмная тема</div>
            <div className="text-tg-hint text-xs mt-0.5">Адаптируется под Telegram автоматически</div>
          </div>
          <button onClick={() => setDark(!dark)}
            className={`relative w-12 h-7 rounded-full transition-colors ${dark ? 'bg-tg-btn' : 'bg-tg-hint/30'}`}>
            <span className={`absolute top-0.5 ${dark ? 'left-6' : 'left-0.5'} w-6 h-6 bg-white rounded-full transition-all shadow`} />
          </button>
        </div>
        <div className="card p-4">
          <div className="font-medium text-[15px]">О приложении</div>
          <div className="text-tg-hint text-xs mt-1">Яичница mini-app v0.1 (демо). Контент канала и разделы заливаются по запросу.</div>
        </div>
      </div>
    </>
  )
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: Array<{ id: Tab; icon: string; label: string }> = [
    { id: 'folders', icon: '📁', label: 'Разделы' },
    { id: 'search', icon: '🔍', label: 'Поиск' },
    { id: 'saved', icon: '⭐', label: 'Избранное' },
    { id: 'settings', icon: '⚙️', label: 'Настройки' },
  ]
  return (
    <div className="sticky bottom-0 bg-tg-bg/95 backdrop-blur border-t divider grid grid-cols-4 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
      {items.map(it => (
        <button key={it.id} onClick={() => setTab(it.id)}
          className={`flex flex-col items-center gap-0.5 py-1 ${tab === it.id ? 'text-tg-link' : 'text-tg-hint'}`}>
          <div className="text-xl">{it.icon}</div>
          <div className="text-[10px] font-medium">{it.label}</div>
        </button>
      ))}
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
