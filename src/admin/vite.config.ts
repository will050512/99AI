import dayjs from 'dayjs';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import pkg from './package.json';
import createVitePlugins from './vite/plugins';

// https://vitejs.dev/config/
export default async ({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  // 全局 scss 資源
  const scssResources = [];
  fs.readdirSync('src/assets/styles/resources').forEach((dirname) => {
    if (fs.statSync(`src/assets/styles/resources/${dirname}`).isFile()) {
      scssResources.push(`@use "src/assets/styles/resources/${dirname}" as *;`);
    }
  });

  // 判斷是否啟用類型檢查
  const enableTypeCheck = env.VITE_ENABLE_TYPE_CHECK === 'true';

  return defineConfig({
    base: env.VITE_BASE_PATH,
    // 開發服務器選項 https://cn.vitejs.dev/config/#server-options
    server: {
      open: true,
      port: 9000,
      proxy: {
        '/proxy': {
          target: env.VITE_APP_API_BASEURL,
          changeOrigin: command === 'serve' && env.VITE_OPEN_PROXY === 'true',
          rewrite: (path) => path.replace(/\/proxy/, ''),
        },
      },
    },
    // 構建選項 https://cn.vitejs.dev/config/#server-fsserve-root
    build: {
      outDir: mode === 'production' ? 'dist' : `dist-${mode}`,
      sourcemap: env.VITE_BUILD_SOURCEMAP === 'true',
    },
    define: {
      __SYSTEM_INFO__: JSON.stringify({
        pkg: {
          version: pkg.version,
          dependencies: pkg.dependencies,
          devDependencies: pkg.devDependencies,
        },
        lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }),
    },
    plugins: [
      ...createVitePlugins(env, command === 'build'),
      enableTypeCheck && checker({ typescript: true }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '#': path.resolve(__dirname, 'src/types'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: scssResources.join(''),
        },
      },
    },
  });
};
