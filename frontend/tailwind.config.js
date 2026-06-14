/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page:   '#F8F9FA',
        card:   '#FFFFFF',
        panel:  '#F1F3F5',
        line:   '#DEE2E6',
        line2:  '#CED4DA',
        ink:    '#1A1D23',
        ink2:   '#495057',
        ink3:   '#868E96',
        primary: { DEFAULT: '#1971C2', light: '#E7F5FF', mid: '#74C0FC', dark: '#1864AB' },
        success: { DEFAULT: '#2F9E44', light: '#EBFBEE' },
        warn:    { DEFAULT: '#E67700', light: '#FFF9DB' },
        danger:  { DEFAULT: '#C92A2A', light: '#FFF5F5' },
        admin:   { DEFAULT: '#5F3DC4', light: '#F3F0FF' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
      },
      keyframes: {
        'live-pulse': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        'away-pulse':  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.45' } },
      },
      animation: {
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
        'away-pulse': 'away-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
