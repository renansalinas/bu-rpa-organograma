// Design tokens do sistema
export const designTokens = {
  colors: {
    primary: '#2c19b2', // Smart Blue
    secondary: '#20c6ed', // Light Blue
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
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
  },
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
  },
  typography: {
    fontFamily: "'Urbane', system-ui, sans-serif",
  },
} as const;


