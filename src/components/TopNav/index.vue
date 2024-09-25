<template>
  <el-menu
    :default-active="activeMenu"
    mode="horizontal"
    text-color="#fff"
    style="border: 0"
    active-text-color="#fff"
    @select="handleSelect"
    :ellipsis="false"
  >
    <template v-for="(item, index) in topMenus">
      <el-menu-item :index="item.path" :key="index" v-if="index < visibleNumber">
        <svg-icon :icon-class="item.meta.icon" />
        <h5 style="margin: 7px 0px 0px;color: #fff;font-size: 16px;font-weight: bold">{{ item.meta.title }}</h5>
      </el-menu-item>
    </template>

    <!-- 顶部菜单超出数量折叠 -->
    <el-sub-menu  class="custom-menu" index="more" v-if="topMenus.length > visibleNumber">
      <template #title>
        <span style="color: #fff;margin-top: 20px;font-size: 16px">更多菜单<el-icon><ArrowDownBold style="margin-top: -5px;margin-left: 5px" /></el-icon></span>
      </template>
      <template v-for="(item, index) in topMenus">
        <el-menu-item
          :index="item.path"
          :key="index"
          style="color: #000000b3"
          v-if="index >= visibleNumber"
          >
          <svg-icon :icon-class="item.meta.icon" />
          <span style="margin-left: 10px">{{ item.meta.title }}</span>
        </el-menu-item>
      </template>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { watch } from "vue";
import { constantRoutes } from "@/router"
import { isHttp } from '@/utils/validate'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

// 顶部栏初始数
const visibleNumber = ref(null);
// 当前激活菜单的 index
const currentIndex = ref(window.location.pathname);

// 隐藏侧边栏路由
const hideList = ['/index', '/user/profile'];

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const route = useRoute();
const router = useRouter();

// 主题颜色
const theme = computed(() => settingsStore.theme);
// 所有的路由信息
const routers = computed(() => permissionStore.topbarRouters);
// 顶部显示菜单
const topMenus = computed(() => {
  let topMenus = [];
  routers.value.map((menu) => {
    if (menu.hidden !== true) {
      // 兼容顶部栏一级菜单内部跳转
      if (menu.path === "/") {
          topMenus.push(menu.children[0]);
      } else {
          topMenus.push(menu);
      }
    }
  })
  return topMenus;
})
// 设置子路由
const childrenMenus = computed(() => {
  let childrenMenus = [];
  routers.value.map((router) => {
    for (let item in router.children) {
      if (router.children[item].parentPath === undefined) {
        if(router.path === "/") {
          router.children[item].path = "/" + router.children[item].path;
        } else {
          if(!isHttp(router.children[item].path)) {
            router.children[item].path = router.path + "/" + router.children[item].path;
          }
        }
        router.children[item].parentPath = router.path;
      }
      childrenMenus.push(router.children[item]);
    }
  })
  return constantRoutes.concat(childrenMenus);
})

// 默认激活的菜单
const activeMenu = computed(() => {
  const path = route.path;
  let activePath = path;
  if (path !== undefined && path.lastIndexOf("/") > 0 && hideList.indexOf(path) === -1) {
    const tmpPath = path.substring(1, path.length);
    activePath = "/" + tmpPath.substring(0, tmpPath.indexOf("/"));
    if (!route.meta.link) {
        appStore.toggleSideBarHide(false);
    }
  } else if(!route.children) {
    activePath = path;
    appStore.toggleSideBarHide(true);
  }
  activeRoutes(activePath);
  return activePath;
})

function setVisibleNumber() {
  const width = document.body.getBoundingClientRect().width / 2;
  visibleNumber.value = parseInt(width / 85);
}
let sre = ''
function handleSelect(key, keyPath) {
  currentIndex.value = key;
  const route = routers.value.find(item => item.path === key);
  if (isHttp(key)) {
    // http(s):// 路径新窗口打开
    window.open(key, "_blank");
  } else if (!route || !route.children) {
    // 没有子路由路径内部打开
    const routeMenu = childrenMenus.value.find(item => item.path === key)
    if (routeMenu && routeMenu.query) {
      let query = JSON.parse(routeMenu.query);
      router.push({ path: key, query: query });
    } else {
      router.push({ path: key });
    }
    appStore.toggleSideBarHide(true);
  } else {
    // 显示左侧联动菜单
    activeRoutes(key);
    //默认跳第一个菜单
    sre='';
    const first = route.children.length ? loop([route]) : '/system/user';
    router.replace({
      path: first.replace(/\/$/,'')
    })
    appStore.toggleSideBarHide(false);
  }
}

function loop(cop){
  cop.forEach(r=>{
    if(r.children && r.children.length){
      sre+=`${r.children[0].path}/`;
      loop([r.children[0]]);
    }
  });
  return sre;
}

function activeRoutes(key) {
  let routes = [];
  if (childrenMenus.value && childrenMenus.value.length > 0) {
    childrenMenus.value.map((item) => {
      if (key == item.parentPath || (key == "index" && "" == item.path)) {
        routes.push(item);
      }
    });
    permissionStore.setSidebarRouters(routes);
  } else {
    appStore.toggleSideBarHide(true);
  }
  return routes;
}

onMounted(() => {
  window.addEventListener('resize', setVisibleNumber)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', setVisibleNumber)
})

onMounted(() => {
  setVisibleNumber()
})
</script>
<style lang="scss" scoped>
.svg-icon{
  height: 25px;
  width: 25px;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}
:deep(.el-menu--horizontal .el-menu-item:hover){
  background: linear-gradient(180deg, rgba(116,167,255,0.4) 0%, rgba(0,167,244,0.4) 100%)!important;
}
.custom-menu{
  :deep(.el-menu){
    background: transparent!important;
  }
  :deep(.el-sub-menu__title){
    border-bottom: 0px!important;
  }
  :deep(.el-sub-menu__title:hover){
    background: transparent!important;
  }

}
</style>

<style lang="scss">
.topmenu-container.el-menu--horizontal > .el-menu-item {
  flex-direction: column;
  float: left;
  height: 65px !important;
  line-height: 65px !important;
  color: #999093 !important;
  padding: 0 22px !important;
  //margin: 0 10px !important;
  background:transparent;
}

.topmenu-container.el-menu--horizontal > .el-menu-item.is-active, .el-menu--horizontal > .el-sub-menu.is-active .el-submenu__title {
  //border-bottom: 2px solid #{'var(--theme)'} !important;
  color: #303133;
}

/* sub-menu item */
.topmenu-container.el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #999093 !important;
  padding: 0 15px !important;
  //margin: 0 10px !important;
}
</style>
