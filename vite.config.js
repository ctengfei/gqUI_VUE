import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'
// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, path.resolve())
  const { VITE_APP_ENV,VITE_DEV_URL,VITE_PROD_URL } = env
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
    base: VITE_APP_ENV === 'production' ? '/wygq/' : './',
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src'),
        stream: "stream-browserify",
        os:'os-browserify/browser',
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // vite 相关配置
    server: {
      port: 80,
      host: true,
      open: true,
      proxy: {
        '/dev-api': {
          target: VITE_DEV_URL,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, '')
        },
        '/prod-api': {
          target: VITE_PROD_URL,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/prod-api/, '')
        },
        '/superMapUrl': {
          target: 'http://36.135.21.38:10151/',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/superMapUrl/, '')
        },
        '/tdtUrl': {
          target: 'http://t7.tianditu.com/',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/tdtUrl/, '')
        },
        '/imgUrl': {
          target: 'http://ctyoss.chutianyun.gov.cn:8060/slt-wfwgl/',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/imgUrl/, '')
        }
      }
    },
    define: {
      'process.version':`''`,
      'process.env': {},
      'process.browser':`''`,
    },
    //fix:error:stdin>:7356:1: warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    }
  }
})
