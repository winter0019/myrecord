import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    // Defines global variables available at runtime
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.FIRESTORE_API_KEY': JSON.stringify(process.env.VITE_FIRESTORE_API_KEY || process.env.firestore_API_KEY || "AIzaSyC8ZxsvsUdwRRbPCV8xDJPRj93pnVWjSoI")
  }
});