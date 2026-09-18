/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        'surface-hero': '#9FE870',
        'surface-muted': '#ECF9F9',
        'surface-forest': '#163300',
        'text-primary': '#0E0F0C',
        'text-secondary': '#454745',
        'text-tertiary': '#6A6C6A',
        'accent-lime': '#9FE870',
        'accent-blue': '#0097C7',
        'accent-positive': '#008026',
        'accent-warning': '#B85C00',
        'accent-medium': '#B8860B',
        'border-hairline': '#101008',
      },
      borderRadius: {
        control: '9999px',
        card: '30px',
        hairline: '2px',
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Inter Tight"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        legal: ['"Times New Roman"', 'serif'],
      },
      fontSize: {
        // ─── Legacy tokens (keep for landing page / existing usage) ─────────
        'hero-display': ['96px', { lineHeight: '0.85', fontWeight: '900' }],
        'headline-md': ['64px', { lineHeight: '0.85', fontWeight: '900' }],
        'body-dense': ['18px', { lineHeight: '1.4', fontWeight: '400' }],
        'label-md': ['20px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.1px' }],
        'data-numeral': ['48px', { lineHeight: '1', fontWeight: '700' }],
        // ─── App typography scale ────────────────────────────────────────────
        'display-lg': ['48px', { lineHeight: '1.05', fontWeight: '800', letterSpacing: '-0.02em' }],
        'display-md': ['32px', { lineHeight: '1.1',  fontWeight: '800', letterSpacing: '-0.01em' }],
        'display-sm': ['24px', { lineHeight: '1.15', fontWeight: '700' }],
        'numeral-lg': ['56px', { lineHeight: '1',    fontWeight: '700' }],
        'numeral-md': ['36px', { lineHeight: '1',    fontWeight: '700' }],
        'body-lg':    ['17px', { lineHeight: '1.5' }],
        'body-md':    ['15px', { lineHeight: '1.5' }],
        'body-sm':    ['13px', { lineHeight: '1.45' }],
        'label-sm':   ['12px', { lineHeight: '1.3',  letterSpacing: '0.02em' }],
      },
      spacing: {
        section: '60px',
        'section-lg': '88px',
        'gap': '40px',
      },
      transitionTimingFunction: {
        'wise': 'cubic-bezier(0.8, 0.05, 0.2, 0.95)',
      },
      transitionDuration: {
        '350': '350ms',
        'micro': '150ms',
        'standard': '200ms',
        'modal': '250ms',
      },
      boxShadow: {
        'hairline': 'rgba(14, 15, 12, 0.12) 0px 0px 0px 1px',
        'hairline-light': 'rgba(255, 255, 255, 0.2) 0px 0px 0px 1px',
      },
      maxWidth: {
        'content': '1440px',
      },
      width: {
        'sidebar': '264px',
        'sidebar-collapsed': '72px',
      },
    },
  },
  plugins: [],
};

