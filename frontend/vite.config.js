import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,      // or '0.0.0.0' to allow access from local network
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'cert/key.pem')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'cert/cert.pem'))
    // },
    allowedHosts: [
      'mainstream-educational-strategy-ethnic.trycloudflare.com' // ngrok domain
    ],
    port: 5173,      // (optional) customize the port if needed
  },
})
