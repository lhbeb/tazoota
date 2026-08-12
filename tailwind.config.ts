import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2e6b3e', // Green - main brand color
        secondary: '#1a4529', // Darker green
        accent: '#2e6b3e', // Green accent
        text: '#262626', // Dark gray text (softer than black)
        'text-gray': '#666666', // Gray text
        'bg-light': '#f5f5f5', // Light gray background
        'border-gray': '#e0e0e0', // Border gray
        'nav-gray': '#e8e8e8', // Navigation bar gray
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['var(--font-dm-sans)', 'Helvetica', 'Arial', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    // line-clamp plugin removed; included by default in Tailwind 3.3+
  ],
}
export default config 