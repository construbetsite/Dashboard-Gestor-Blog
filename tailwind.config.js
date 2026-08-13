/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", // Inclui arquivos CSS explicitamente
    // Removido "node_modules/flowbite/**/*.js" pois não será mais necessário
  ],
 
  plugins: [
    // Removido require('flowbite/plugin'),
    require('tailwind-scrollbar-hide'),
    require("@tailwindcss/aspect-ratio"),
  ],
};