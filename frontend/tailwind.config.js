const { add } = require('date-fns');
const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    // rest of the code
  },
  plugins: [
    // rest of the code
    addVariablesForColors,
  ],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({
  addBase,
  theme
}) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]));

  addBase({
    ":root": newVars,
  });
}

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
    	extend: {
			maxWidth: {
				'1920': '1920px',
			  },
			minHeight: {
				'screen-nav': 'calc(100vh - 4rem)',
			  },
    		keyframes: {
    			'loading-dot': {
    				'0%, 80%, 100%': {
    					opacity: '0',
    					transform: 'scale(0.5)'
    				},
    				'40%': {
    					opacity: '1',
    					transform: 'scale(1)'
    				}
    			}
    		},
    		animation: {
				'loading-dot': 'loading-dot 1.4s infinite ease-in-out both',
			  },
    		colors: {
    			bchannel: '#0e2742',
    			my_blue: '#46CCDA',
    			darkgreen: '#16486b',
    			btnColor: '#164465',
    			topBackground: '#16486b78',
    			customfill: 'rgba(13, 40, 69, 1)',
    			whitetrspnt: 'rgba(219, 219, 219, 0.2)',
    			bluetrspnt: 'rgba(219, 219, 219, 0.3)',
    			hrcolor: 'rgba(217, 217, 217, 0.6)',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		fontFamily: {
    			custom: ['sans-serif'],
    			open: ['Open Sans'],
    			balsamiq: ['Balsamiq Sans']
    		},
    		fontSize: {
    			unset: 'unset'
    		},
    		backgroundImage: {
    			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
    			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
			screens: {
				tablet: '990px',
				larg_screen: '1750px'
			},
			animation: {
			brightening: 'brightening 1.5s infinite',
			'bounce-3s' : 'bounce 3s'
			},
			
    	}
    },
	plugins: [
		require('tailwind-scrollbar'),
        require("tailwindcss-animate"),
		function ({addUtilities}) {
			addUtilities({
				'.brightness-70': {
					filter: 'brightness(70%)'
				},
			});
		}
    ],
};
