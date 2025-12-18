import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2c19b2',
        secondary: '#20c6ed',
        neutral: {
          0: '#ffffff',
          10: '#f5f6fa',
          20: '#e8eaf2',
          30: '#d4d7e8',
          40: '#b8bdd4',
          50: '#9ca2c0',
          60: '#8087ac',
          70: '#646c98',
          80: '#485184',
          90: '#2c3670',
          100: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        'focus': '0 0 0 3px rgba(44, 25, 178, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;

