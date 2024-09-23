/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			keyframes: {
				'loading-dot': {
					'0%, 80%, 100%': { opacity: 0, transform: 'scale(0.5)' },
					'40%': { opacity: 1, transform: 'scale(1)' },
				},
			},
			animation: {
				'loading-dot': 'loading-dot 1.4s infinite ease-in-out both',
			},
			colors: {
				bchannel: '#0e2742',
				my_blue: '#46CCDA',
				darkgreen: '#16486b',
				btnColor: '#164465',
				topBackground: '#16486b78'
			},
			fontFamily: {
				// sans: ['Inter', 'SUSE', 'Roboto', 'Lato', 'sans-serif'],
				// serif: ['Merriweather', 'serif'],
				// suse: ['SUSE', 'sans-serif'],
				// inter: ['Inter', 'sans-serif'],
				// roboto: ['Roboto', 'sans-serif'],
				// lato: ['Lato', 'sans-serif'],
				// poppins: ['Poppins', 'sans-serif'],
			},
			fontSize: {
				unset: 'unset',
			},
		},
	},
	plugins: [
		require('tailwind-scrollbar'),
	],
};
