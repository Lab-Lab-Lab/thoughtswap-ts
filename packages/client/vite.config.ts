import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8000';
const PORT = Number(process.env.PORT) || 5173;

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: PORT,
        proxy: {
            '/api': {
                // Proxy all /api requests to the server
                target: SERVER_URL,
                changeOrigin: true,
                secure: false,
            },
            '/accounts': {
                target: SERVER_URL,
                changeOrigin: true,
                secure: false,
            },
            '/socket.io': {
                target: SERVER_URL,
                ws: true,
            },
        },
        allowedHosts: ['localhost', '9ca1-128-130-184-40.ngrok-free.app', '95ce-128-130-255-179.ngrok-free.app', '742c-2607-b400-810-0-4c85-6c3-5b5-86ca.ngrok-free.app', 'fac0-2607-b400-810-0-4c85-6c3-5b5-86ca.ngrok-free.app','*.ngrok-free.app', '*']
    },
});
