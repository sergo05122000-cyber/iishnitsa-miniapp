export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      tg: {
        bg: 'var(--tg-bg, #FFFFFF)',
        sec: 'var(--tg-sec, #F0F0F4)',
        text: 'var(--tg-text, #0F1014)',
        hint: 'var(--tg-hint, #707579)',
        link: 'var(--tg-link, #007AFF)',
        btn: 'var(--tg-btn, #007AFF)',
      },
    },
  }},
}
