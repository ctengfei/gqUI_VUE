## 平台简介

* 本系统是基于RuoYi-Vue 实现
* 前端技术栈 [Vue3](https://v3.cn.vuejs.org) + [Element Plus](https://element-plus.org/zh-CN) + [Vite](https://cn.vitejs.dev) 版本。

## 前端运行

```bash
# 克隆项目
git clone http://114.115.139.119:8888/r/Products/water/gqManageUI_VUE.git

# 进入项目目录
cd gqManageUI_VUE

# 安装依赖
yarn --registry=https://registry.npmmirror.com

# 启动服务
yarn dev

# 构建测试环境 yarn build:stage
# 构建生产环境 yarn build:prod
# 前端访问地址 http://localhost:80
```

## 系统模块

gqManageUI_VUE
├──

## 在线体验

- admin/admin123

## 发布到正式服务器外网映射，需要修改的地方-废弃：
# 1、request.js文件中：
# baseURL: '/wy'+import.meta.env.VITE_APP_BASE_API,需要添加前缀/wy
# 2、/layout/components/Navbar.vue文件中 
# 跳转地址,location.href = '/wy/wygq/login';   需要添加前缀/wy
# 3、vite.config 文件中
# base: VITE_APP_ENV === 'production' ? '/wy/wygq/' : '/', 添加前缀
# 4、在 views/digitization/index.vue 文件中
# window.location.pathname === '/wy/wygq/digitization'   添加王英前缀
# 5、在route/index.js中
#   history: createWebHistory('/wy/wygq/'), 添加前缀
# 6、地图服务地址修改 在src/global/index.js页面中


## 发布到正式服务器，内网需要修改的地方-最新使用：
# 1、地图服务地址修改 在src/global/index.js页面中
