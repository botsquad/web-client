import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [
      react(),
      ...(isProduction
        ? [
            dts({
              include: ['src/**/*'],
              exclude: ['dev/**/*', 'test/**/*'],
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        components: resolve(__dirname, './src/components'),
      },
    },
    root: isProduction ? '.' : 'dev',
    publicDir: isProduction ? 'public' : false,
    ...(isProduction
      ? {
          build: {
            lib: {
              entry: resolve(__dirname, 'src/index.tsx'),
              name: 'BotsquadWebClient',
              formats: ['es'],
              fileName: 'main',
            },
            rollupOptions: {
              external: ['react', 'react-dom'],
            },
            outDir: 'dist',
            sourcemap: true,
            cssCodeSplit: false,
          },
        }
      : {}),
    server: {
      port: 8082,
      host: '0.0.0.0',
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '',
          silenceDeprecations: ['import', 'legacy-js-api'],
        },
      },
      postcss: './postcss.config.cjs',
    },
    define: {
      'process.env': JSON.stringify(process.env),
    },
  }
})
