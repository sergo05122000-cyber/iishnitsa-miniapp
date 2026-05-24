export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      tg: {
        bg: 'var(--tg-bg)',
        sec: 'var(--tg-sec)',
        text: 'var(--tg-text)',
        hint: 'var(--tg-hint)',
        link: 'var(--tg-link)',
        btn: 'var(--tg-btn)',
        accent: 'var(--tg-accent)',
        'accent-soft': 'var(--tg-accent-soft)',
        'locked-bg': 'var(--tg-locked-bg)',
        'locked-text': 'var(--tg-locked-text)',
      },
    },
    fontFamily: {
      display: ['Space Grotesk', 'Inter', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
  }},
}
