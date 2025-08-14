/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './shared-theme/**/*.{js,ts,jsx,tsx}',
    './super_dashboard/**/*.{js,ts,jsx,tsx}',
    './business_dashboard/**/*.{js,ts,jsx,tsx}',
    './user_dashboard/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};
  