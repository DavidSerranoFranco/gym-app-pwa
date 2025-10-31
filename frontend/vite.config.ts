import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    
    // 2. Configurar el plugin
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      
      // Configuración del Web App Manifest
      manifest: {
        name: 'Gym App PWA',
        short_name: 'GymApp',
        description: 'App de gestión de gimnasio, reservas y check-in.',
        theme_color: '#F97316', // El color naranja principal
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'web-app-manifest-192x192.png', // Debe estar en /public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'web-app-manifest-512x512.png', // Debe estar en /public
            sizes: '512x512',
            type: 'image/png'
          },
        ]
      },

      // Configuración del Service Worker (para caché offline)
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  
  // Configuración para el contenedor Docker
  server: {
    host: true,
    strictPort: true,
    port: 5173, 
  }
})