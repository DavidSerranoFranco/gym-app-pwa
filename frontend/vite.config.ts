import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // <-- 2. Añade el plugin
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gym App',
        short_name: 'GymApp',
        description: 'App para la gestión de tu gimnasio.',
        theme_color: '#ffffff',
        icons: [ // Puedes generar estos íconos después
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})