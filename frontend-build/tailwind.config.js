/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2563EB', // Indigo Blue
          dark: '#3B82F6', // Sky Blue/Indigo
        },
        background: {
          light: '#F9FAFB',
          dark: '#1F2937',
        },
        card: {
          light: '#FFFFFF',
          dark: '#374151',
        },
        border: {
          light: '#E5E7EB',
          dark: '#374151',
        },
        text: {
          light: '#111827',
          dark: '#F9FAFB',
        },
        textSecondary: {
          light: '#6B7280',
          dark: '#D1D5DB',
        },
        success: {
          light: '#10B981',
          dark: '#34D399',
        },
        error: {
          light: '#EF4444',
          dark: '#F87171',
        },
        warning: {
          light: '#F59E0B',
          dark: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Open Sans', 'sans-serif'],
        heading: ['Inter', 'DM Sans', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
