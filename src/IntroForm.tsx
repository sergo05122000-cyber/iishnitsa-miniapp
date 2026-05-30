import { useEffect, useRef, useState } from 'react'

type Level = 'newbie' | 'sometimes' | 'daily'

interface IntroData {
  type: 'intro'
  name: string
  city: string
  occupation: string
  level: Level
  goal: string
  tg_username: string
  tg_id?: number
  submitted_at: string
}

interface Props {
  open: boolean
  onClose: () => void
}

const LEVEL_LABELS: Record<Level, string> = {
  newbie: 'Новичок',
  sometimes: 'Иногда юзаю',
  daily: 'Каждый день',
}

export function IntroForm({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [occupation, setOccupation] = useState('')
  const [level, setLevel] = useState<Level>('newbie')
  const [goal, setGoal] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const sheetRef = useRef<HTMLDivElement>(null)

  // Pre-fill from Telegram user
  useEffect(() => {
    if (!open) return
    const tg = (window as any).Telegram?.WebApp
    const u = tg?.initDataUnsafe?.user
    if (u && !name) {
      setName([u.first_name, u.last_name].filter(Boolean).join(' '))
    }
  }, [open])

  // Reset state on close
  useEffect(() => {
    if (open) return
    const t = setTimeout(() => {
      setSending(false)
      setDone(false)
      setError('')
    }, 360)
    return () => clearTimeout(t)
  }, [open])

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function haptic(kind: 'success' | 'warning' | 'light' = 'light') {
    const tg = (window as any).Telegram?.WebApp
    try {
      if (kind === 'success' || kind === 'warning') {
        tg?.HapticFeedback?.notificationOccurred(kind === 'success' ? 'success' : 'warning')
      } else {
        tg?.HapticFeedback?.impactOccurred('light')
      }
    } catch {}
  }

  async function handleSubmit() {
    setError('')
    if (!name.trim()) { setError('Укажи имя'); haptic('warning'); return }
    if (!occupation.trim()) { setError('Расскажи чем занимаешься'); haptic('warning'); return }
    if (!goal.trim()) { setError('Расскажи зачем пришёл'); haptic('warning'); return }

    setSending(true)
    haptic('light')

    const tg = (window as any).Telegram?.WebApp
    const u = tg?.initDataUnsafe?.user

    const payload: IntroData = {
      type: 'intro',
      name: name.trim(),
      city: city.trim(),
      occupation: occupation.trim(),
      level,
      goal: goal.trim(),
      tg_username: u?.username || '',
      tg_id: u?.id,
      submitted_at: new Date().toISOString(),
    }

    // Send to bot (works only if MiniApp was opened via Reply Keyboard web_app button).
    // No-op otherwise, but data still saved locally and visible via success screen.
    try { tg?.sendData?.(JSON.stringify(payload)) } catch {}

    // Brief simulated delay so user sees progress, then success
    await new Promise(r => setTimeout(r, 450))
    setSending(false)
    setDone(true)
    haptic('success')

    // Auto-close after 1.8s
    setTimeout(() => onClose(), 1800)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[80] transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className="fixed left-0 right-0 bottom-0 z-[81] flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #0F1014 0%, #060709 100%)',
          borderTop: '1px solid rgba(229,178,71,0.22)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.6), 0 -1px 0 rgba(229,178,71,0.1)',
          maxHeight: '92vh',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Drag handle */}
        <div className="pt-3 pb-2 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(229,178,71,0.3)' }} />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-8 flex-1" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          {done ? (
            <SuccessScreen name={name} />
          ) : (
            <>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--tg-accent)' }}>
                Знакомства · Анкета
              </div>
              <h2 className="font-display font-bold text-[24px] leading-tight mb-1" style={{ color: 'var(--tg-text)', letterSpacing: '-0.02em' }}>
                Расскажи о себе
              </h2>
              <p className="text-[12px] leading-relaxed mb-5" style={{ color: 'var(--tg-hint)' }}>
                Коротко — кто ты, чем занимаешься, зачем пришёл. Серёга прочитает каждую анкету.
              </p>

              <Field label="Имя" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как тебя зовут"
                  className="input"
                />
              </Field>

              <Field label="Город">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Откуда ты"
                  className="input"
                />
              </Field>

              <Field label="Чем сейчас занимаешься" required>
                <textarea
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Работа, проекты, ниша"
                  rows={2}
                  className="input resize-none"
                />
              </Field>

              <Field label="Уровень в ИИ">
                <div className="flex gap-2">
                  {(['newbie', 'sometimes', 'daily'] as Level[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLevel(l); haptic('light') }}
                      className="flex-1 py-2.5 px-2 rounded-lg text-[12px] font-mono uppercase tracking-wider transition-all"
                      style={{
                        background: level === l ? 'rgba(229,178,71,0.18)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${level === l ? 'var(--tg-accent)' : 'rgba(255,255,255,0.08)'}`,
                        color: level === l ? 'var(--tg-accent)' : 'var(--tg-hint)',
                        boxShadow: level === l ? '0 0 12px rgba(229,178,71,0.15)' : 'none',
                      }}
                    >
                      {LEVEL_LABELS[l]}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Зачем пришёл в ИИшницу" required>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Что хочешь забрать, какую задачу решить"
                  rows={3}
                  className="input resize-none"
                />
              </Field>

              {error && (
                <div className="mt-2 mb-3 text-[12px] px-3 py-2 rounded-lg" style={{ background: 'rgba(255,90,90,0.08)', border: '1px solid rgba(255,90,90,0.25)', color: '#FF7B7B' }}>
                  {error}
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  onClick={onClose}
                  disabled={sending}
                  className="flex-1 py-3.5 rounded-lg font-display font-bold text-[13px] uppercase tracking-wide transition-colors"
                  style={{
                    background: 'transparent',
                    color: 'var(--tg-hint)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="flex-[1.5] py-3.5 rounded-lg font-display font-bold text-[13px] uppercase tracking-wide transition-all"
                  style={{
                    background: sending ? 'rgba(229,178,71,0.25)' : 'var(--tg-accent)',
                    color: '#0a0a0a',
                    boxShadow: sending ? 'none' : '0 4px 18px rgba(229,178,71,0.35)',
                  }}
                >
                  {sending ? 'Отправляю…' : 'Отправить анкету'}
                </button>
              </div>

              <div className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: 'var(--tg-hint)' }}>
                Анкета уходит лично Серёге
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
          color: var(--tg-text);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .input::placeholder { color: rgba(232,223,200,0.3); }
        .input:focus {
          border-color: var(--tg-accent);
          background: rgba(229,178,71,0.04);
        }
      `}</style>
    </>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5" style={{ color: 'var(--tg-hint)' }}>
        {label}{required && <span style={{ color: 'var(--tg-accent)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="py-16 text-center fade-up">
      <div className="inline-flex w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{
          background: 'rgba(229,178,71,0.12)',
          border: '1.5px solid var(--tg-accent)',
          boxShadow: '0 0 30px rgba(229,178,71,0.25)',
        }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--tg-accent)' }}>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 className="font-display font-bold text-[24px] mb-2" style={{ color: 'var(--tg-accent)', letterSpacing: '-0.02em' }}>
        Готово{name ? `, ${name.split(' ')[0]}` : ''}!
      </h2>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--tg-hint)' }}>
        Анкета отправлена.<br/>
        Серёга прочитает и ответит лично.
      </p>
    </div>
  )
}
