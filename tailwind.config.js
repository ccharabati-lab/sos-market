/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF',
        canvas: '#F8F9F7',
        'canvas-soft': '#F1F3EF',
        line: '#E5E7E2',
        'line-strong': '#CFD2CB',
        ink: '#1A1C18',
        'ink-soft': '#4A4E45',
        muted: '#6B7066',
        green: '#1e6b45',
        'green-dark': '#14543A',
        'green-bright': '#1e6b45',
        'green-light': '#E8F2EC',
        'green-soft': '#E8F2EC',
        'green-mid': '#c2e8d1',
        red: '#c0312b',
        'red-light': '#FDF2F1',
        'red-mid': '#f5c5c2',
        amber: '#b45309',
        'amber-light': '#FDF8EE',
        'amber-mid': '#f5dfa8',
        info: '#1F6FB2',
        'info-bg': '#EEF4FA',
        'blue-bright': '#1F6FB2',
        'blue-deep': '#1F6FB2',
        'blue-soft': '#EEF4FA',
        bg: {
          base: '#FFFFFF',
          subtle: '#F8F9F7',
          muted: '#F1F3EF',
        },
        border: {
          default: '#E5E7E2',
          emphasized: '#CFD2CB',
        },
        text: {
          primary: '#1A1C18',
          secondary: '#4A4E45',
          muted: '#6B7066',
          disabled: '#9AA095',
        },
        critical: '#C0312B',
        'critical-bg': '#FDF2F1',
        warning: '#B45309',
        'warning-bg': '#FDF8EE',
      },
      fontFamily: {
        sans: ['Inter', '"Geist Sans"', '"Inter Tight"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['"Geist Sans"', '"Inter Tight"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', '"SFMono-Regular"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h1: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        h2: ['18px', { lineHeight: '26px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['11px', { lineHeight: '16px', fontWeight: '600' }],
      },
      boxShadow: {
        'level-1': '0 1px 2px rgba(26,28,24,.04), 0 1px 1px rgba(26,28,24,.06)',
        'level-2': '0 4px 12px rgba(26,28,24,.06), 0 2px 4px rgba(26,28,24,.08)',
        'level-3': '0 16px 40px rgba(26,28,24,.12), 0 4px 12px rgba(26,28,24,.08)',
      },
      transitionDuration: {
        180: '180ms',
      },
      animation: {
        blink: 'blink 1.8s ease-in-out infinite',
        pop: 'popIn 0.2s cubic-bezier(.36,2,.5,1)',
        'fade-in': 'fadeIn 220ms ease-out both',
        'status-pulse': 'statusPulse 1.8s ease-in-out infinite',
        skeleton: 'skeletonPulse 1.3s ease-in-out infinite',
        'critical-pulse': 'criticalPulse 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        popIn: {
          from: { transform: 'scale(.93)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        statusPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(30, 107, 69, 0.35)' },
          '50%': { boxShadow: '0 0 0 5px rgba(30, 107, 69, 0)' },
        },
        skeletonPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.48' },
        },
        criticalPulse: {
          '0%, 100%': { boxShadow: '0 1px 2px rgba(26,28,24,.04), 0 0 0 0 rgba(192,49,43,.15)' },
          '50%': { boxShadow: '0 4px 12px rgba(26,28,24,.06), 0 0 0 5px rgba(192,49,43,.08)' },
        },
      },
      maxWidth: {
        content: '1080px',
        dashboard: '960px',
      },
    },
  },
  plugins: [],
};
