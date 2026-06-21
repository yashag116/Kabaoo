import { defineConfig } from 'vite'
import { TanStackStartVite } from '@tanstack/react-start/plugin'
// ... your other imports

export default defineConfig({
  plugins: [
    TanStackStartVite({
      server: {
        preset: 'vercel', // <--- ADD THIS LINE
      },
    }),
    // ... your other plugins like react()
  ],
})