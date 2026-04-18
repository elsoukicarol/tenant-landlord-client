/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#F4F1EC',
        paper: '#FBFAF6',
        'paper-warm': '#F8F4EC',
        ink: {
          DEFAULT: '#161613',
          soft: '#3A3A35',
          mute: '#6B6A62',
          faint: '#9A998F',
        },
        line: {
          DEFAULT: '#E2DDD2',
          soft: '#EDE8DE',
        },
        accent: {
          DEFAULT: '#E8502A',
          soft: '#FCE8DF',
        },
        ok: {
          DEFAULT: '#2F6F4E',
          soft: '#DDEAE0',
        },
        warn: {
          DEFAULT: '#B8871C',
          soft: '#F5ECD3',
        },
        danger: {
          DEFAULT: '#9B2D20',
          soft: '#F3DBD6',
        },
        info: {
          DEFAULT: '#2E4F7A',
          soft: '#DCE5F0',
        },
      },
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '14px',
        '3xl': '16px',
        pill: '999px',
      },
      fontFamily: {
        display: ['Fraunces'],
        'display-italic': ['Fraunces-Italic'],
        body: ['Inter'],
        'body-medium': ['Inter-Medium'],
        'body-semibold': ['Inter-SemiBold'],
        mono: ['JetBrainsMono'],
      },
    },
  },
  plugins: [],
};
