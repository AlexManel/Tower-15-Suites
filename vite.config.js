import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    // Fix: process.cwd() might not be in the default types if @types/node is missing.
    var env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.API_KEY)
        }
    };
});
