/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                vice: {
                    charcoal: '#0f172a', // Slate 900
                    midnight: '#050505', // Deep Midnight
                    navy: '#020617',     // Slate 950
                    cyan: '#00f2ff',
                    pink: '#ff00ff',
                    glass: 'rgba(255, 255, 255, 0.05)',
                    'glass-border': 'rgba(255, 255, 255, 0.1)',
                },
            },
            boxShadow: {
                neon: '0 0 10px rgba(0, 242, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3)',
            },
        },
    },
    plugins: [],
}
