import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace 'Copy-Claude' with your exact GitHub repo name (case-sensitive)
  base: '/Copy-Claude/',
})
