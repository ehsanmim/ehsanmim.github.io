import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The dev server runs inside this slot's container and is reached only through
// Traefik — see ~/web/.platform/docs/setup.md. The platform injects
// `--host --port $VITE_PORT --strictPort` on every route that starts Vite, so
// the bind itself is not asserted here; what IS asserted is everything the
// browser needs once the request arrives over https on 443.
const devUrl = new URL(process.env.VITE_DEV_SERVER_URL ?? 'https://e.test')
const appUrl = new URL(process.env.APP_URL ?? 'https://e.test')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Vite refuses Host headers it does not know; every hostname Traefik can
    // route to this container has to be listed or the answer is a 403.
    allowedHosts: [appUrl.hostname, `www.${appUrl.hostname}`, devUrl.hostname],
    origin: devUrl.origin,
    // Traefik terminates TLS, so the HMR socket the client dials is
    // wss://<host>:443 — not ws://<host>:5173, which is not published at all.
    hmr: { host: appUrl.hostname, protocol: 'wss', clientPort: 443 },
    // Bind-mounted source: set VITE_POLL=1 in the slot file if file events from
    // the host do not reach the container and HMR stops firing.
    watch: process.env.VITE_POLL ? { usePolling: true, interval: 300 } : undefined,
  },
})
