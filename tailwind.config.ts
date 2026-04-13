import type { Config } from "tailwindcss";
import aspectRatio from "@tailwindcss/aspect-ratio";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--primary-color, #1B263B)',
                    50: '#f0f7fb',
                    100: '#e0eff7',
                    200: '#bce0f0',
                    300: '#8abce0',
                    400: '#4682b4',
                    500: '#3a6c96',
                    600: '#2e5678',
                    700: '#22415a',
                    800: '#162b3c',
                    900: 'var(--primary-color, #1B263B)',
                },
                accent: {
                    DEFAULT: 'var(--button-color, #10b981)', // Refined Metallic Gold from Logo
                    hover: 'var(--button-color, #10b981)',
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [aspectRatio],
};
export default config;
