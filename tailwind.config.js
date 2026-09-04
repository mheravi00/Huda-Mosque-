module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f9f5',
          100: '#e3f2e5',
          500: '#198754',
          600: '#136b43',
          700: '#0f5537',
        },
        accent: '#f5b942',
        slate: '#1f2a37',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
