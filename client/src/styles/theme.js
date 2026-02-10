// Unified Theme Definitions
// Aligns with index.css CSS Variables
export const theme = {
  colors: {
    // Brand
    primary: '#00B0F0', // var(--primary-color)
    secondary: '#F2C811', // var(--secondary-color)
    accent: '#722ed1', // var(--accent-color)

    // Backgrounds
    background: '#000000', // var(--bg-primary)
    surface: '#141414', // var(--bg-tertiary)
    card: 'rgba(20, 20, 20, 0.6)', // var(--bg-card)

    // Text
    textPrimary: '#FFFFFF', // var(--text-primary)
    textSecondary: 'rgba(255, 255, 255, 0.7)', // var(--text-secondary)

    // Borders
    border: 'rgba(255, 255, 255, 0.08)', // var(--border-primary)
    borderLight: 'rgba(255, 255, 255, 0.15)', // var(--border-strong)
  },
  gradients: {
    text: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%)',
    primary: 'linear-gradient(135deg, #00B0F0 0%, #0096cc 100%)',
    card: 'linear-gradient(145deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
  },
  shadows: {
    card: '0 8px 16px rgba(0, 0, 0, 0.2)', // var(--shadow-md)
    button: '0 4px 12px rgba(0, 176, 240, 0.25)',
    glow: '0 0 20px rgba(0, 176, 240, 0.15)',
  }
}; 