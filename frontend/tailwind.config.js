/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E29C9C",       // Salmon Pink (Main Theme Color)
        // primary: "#fb64b6",   
        primaryDark: "#f6339a",   // Pure (for header/footer/sidebar)
        primaryDarkFooter: "#C9788A",
        primaryLight: "#FEF2F2",  // Very light pastel pink
        background: "#E6BEAE",    // Pale Dogwood
        card: "#EEDAC5",          // Almond
        neutral: "#F5F5DC",       // Beige (Page BG / Neutral Light)
        accent: "#D4A373",        // Golden Beige (hovers, icons, highlights)
        highlight: "#DB2777",     // Vibrant Pink (pink-600 for special CTAs)
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 18px rgba(0,0,0,0.05)",
        accent: "0 6px 24px rgba(212,163,115,0.15)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
}