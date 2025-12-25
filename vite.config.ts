import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    // Bridges environment variables from build environment (Netlify) to the browser runtime
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || process.env.API_KEY || ''),
    'process.env.FIRESTORE_API_KEY': JSON.stringify(process.env.firestore_API_KEY || process.env.FIRESTORE_API_KEY || "AIzaSyC8ZxsvsUdwRRbPCV8xDJPRj93pnVWjSoI")
  }
});