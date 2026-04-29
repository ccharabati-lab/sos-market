/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#ffffff',
        canvas: '#f4f6f3',
        'canvas-soft': '#eef0ec',
        line: '#e0e3dc',
        'line-strong': '#cdd1c8',
        ink: '#1a1f18',
        'ink-soft': '#3d4439',
        muted: '#8a9485',
        green: '#1e6b45',
        'green-bright': '#28a060',
        'green-light': '#e8f5ee',
        'green-mid': '#c2e8d1',
        red: '#c0312b',
        'red-light': '#fdf0ef',
        'red-mid': '#f5c5c2',
        amber: '#b45309',
        'amber-light': '#fdf8ef',
        'amber-mid': '#f5dfa8',
        'blue-bright': '#3b82f6',
        'blue-deep': '#2563eb',
        'blue-soft': '#eff6ff',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      animation: {
        blink: 'blink 1.8s ease-in-out infinite',
        pop: 'popIn 0.2s cubic-bezier(.36,2,.5,1)',
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
      },
      maxWidth: {
        content: '1080px',
      },
    },
  },
  plugins: [],
};
