import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    // Rely on environment injection for API keys where possible,
    // only providing defaults for required non-sensitive items.
    'process.env.FIRESTORE_API_KEY': JSON.stringify(process.env.VITE_FIRESTORE_API_KEY || process.env.firestore_API_KEY || "AIzaSyC8ZxsvsUdwRRbPCV8xDJPRj93pnVWjSoI")
  }
});