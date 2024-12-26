import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        uni(),
        vueJsx(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    server: {
        port: 3000,
        host: '0.0.0.0',
        https: false,
        cors: true,
        strictPort: true
    },
    base: './',
    build: {
        target: 'es2015',
        cssTarget: 'chrome80',
        outDir: 'dist'
    }
}) 