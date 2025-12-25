import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    // Map process.env references to the actual values from the environment during build.
    // This allows the Gemini SDK to access process.env.API_KEY in the browser.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.FIRESTORE_API_KEY': JSON.stringify(process.env.FIRESTORE_API_KEY || "AIzaSyC8ZxsvsUdwRRbPCV8xDJPRj93pnVWjSoI")
  }
});