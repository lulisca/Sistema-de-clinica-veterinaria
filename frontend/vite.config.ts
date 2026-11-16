import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Porta 3000 porque é a origem que o backend libera no CORS (docs/08-controle/handoff-frontend.md).
export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  preview: { port: 3000 },
})
