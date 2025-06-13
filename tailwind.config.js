/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for educational app
        primary: {
          50: '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Ice cream button colors
        icecream: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        // Success/progress colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Warning colors for hints
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Learning path specific colors
        conceptual: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        applied: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        comprehensive: {
          50: '#faf5ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
        }
      },
      fontFamily: {
        sans: [
          'Inter', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Helvetica Neue', 
          'Arial', 
          'sans-serif'
        ],
        mono: [
          'Fira Code', 
          'Monaco', 
          'Cascadia Code', 
          'Segoe UI Mono', 
          'Roboto Mono', 
          'Ubuntu Mono',
          'Menlo',
          'Consolas',
          'Courier New',
          'monospace'
        ]
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-subtle': 'bounceSubtle 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        'thinking': 'thinking 1.4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px) scale(0.95)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        thinking: {
          '0%, 20%': { 
            opacity: '0.3', 
            transform: 'scale(0.8)' 
          },
          '50%': { 
            opacity: '1', 
            transform: 'scale(1.1)' 
          },
          '100%': { 
            opacity: '0.3', 
            transform: 'scale(0.8)' 
          }
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 5px rgba(99, 102, 241, 0.4)' 
          },
          '100%': { 
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' 
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      minHeight: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
        'screen': '100vh',
      },
      backdropBlur: {
        xs: '2px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            '[class~="lead"]': {
              color: '#4b5563',
            },
            a: {
              color: '#2563eb',
              textDecoration: 'underline',
              fontWeight: '500',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            strong: {
              color: '#111827',
              fontWeight: '600',
            },
            'ul > li::before': {
              backgroundColor: '#6b7280',
            },
            'ol > li::before': {
              color: '#6b7280',
            },
            code: {
              color: '#111827',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#f9fafb',
            },
            blockquote: {
              borderLeftColor: '#d1d5db',
              color: '#6b7280',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // Custom plugin for educational components
    function({ addComponents, theme }) {
      addComponents({
        '.learning-card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.sm'),
          border: `1px solid ${theme('colors.gray.200')}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme('boxShadow.md'),
            transform: 'translateY(-2px)',
          },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.600'),
          color: theme('colors.white'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme('colors.primary.700'),
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:disabled': {
            backgroundColor: theme('colors.gray.400'),
            cursor: 'not-allowed',
            transform: 'none',
          },
        },
        '.message-bubble': {
          maxWidth: theme('maxWidth.md'),
          padding: theme('spacing.3'),
          borderRadius: theme('borderRadius.lg'),
          wordWrap: 'break-word',
          transition: 'all 0.3s ease',
        },
        '.progress-indicator': {
          width: '100%',
          backgroundColor: theme('colors.gray.200'),
          borderRadius: theme('borderRadius.full'),
          height: theme('spacing.3'),
          overflow: 'hidden',
          position: 'relative',
        },
      });
    },
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
}