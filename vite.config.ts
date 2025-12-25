import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    'process.env': {
      // Map Netlify's GEMINI_API_KEY to the SDK expected API_KEY
      API_KEY: process.env.GEMINI_API_KEY || process.env.API_KEY,
      // Map Netlify's firestore_API_KEY for Firebase initialization
      FIRESTORE_API_KEY: process.env.firestore_API_KEY || "AIzaSyC8ZxsvsUdwRRbPCV8xDJPRj93pnVWjSoI"
    }
  }
});