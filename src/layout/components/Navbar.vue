<template>
  <div class="navbar" :style="{ 'background-image': 'linear-gradient(180deg, #74A7FF 0%, #075EFF 100%)' }">
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
<!--    <hamburger v-if="!appStore.sidebar.hide" id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />-->
    <div style="display: flex;margin-left: 10px">
      <div class="custom-logo" >
        <a href="/wygq" >
          <img v-if="logo" :src="logo" />
          <h1>数字孪生王英</h1>
        </a>
      </div>
    </div>
    <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />
    <div class="right-menu">
     <template v-if="appStore.device !== 'mobile'">
<!--        <header-search id="header-search" class="right-menu-item" />-->
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <!-- <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip> -->
      </template>
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <span>{{ userStore.realName }}</span>
            <el-icon><caret-bottom style="color:#fff;" /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
             <router-link to="/user/profile">
               <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
              <el-dropdown-item command="setLayout">
                <span>布局设置</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import logo from '@/assets/logo/logo.png'
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import {ref, watch} from "vue";
const appStore = useAppStore()
const userStore = useUserStore();
const settingsStore = useSettingsStore()
const isCollapse = computed(() => !appStore.sidebar.opened);
// 主题颜色
const theme = computed(() => settingsStore.theme);
function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout();
      break;
    case "logout":
      logout();
      break;
    default:
      break;
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/wygq/login';
    }).catch(()=>{
      location.href = '/wygq/login';
    })
  }).catch(() => { });
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout');
}
</script>

<style lang='scss' scoped>
.el-menu{
  background: transparent;
  :deep(.el-menu-item){
    color: #fff!important;
  }
  .el-menu--horizontal>.el-menu-item.is-active{
    color: #fff!important;
  }
  :deep(.el-menu-item:hover){
    background: linear-gradient(180deg, rgba(116,167,255,0.4) 0%, rgba(0,167,244,0.4) 100%)!important;
  }
  :deep(.is-active){
    background: linear-gradient(180deg, rgba(116,167,255,0.4) 0%, rgba(0,167,244,0.4) 100%);
    border-bottom:3px solid #fff !important;
    box-shadow: 0px 0px 8px 1px rgba(0,0,0,0.12);
    border-image: linear-gradient(to right, #00A7F4,#fff,#00A7F4) 1;
    opacity: 1;
  }
  :deep(.is-active){
    background: linear-gradient(180deg, rgba(116,167,255,0.4) 0%, rgba(0,167,244,0.4) 100%)!important;
  }
}
.navbar {
  display: flex;
  justify-content: space-between;
  height: 65px;
  overflow: hidden;
  position: relative;
  //background: url("../../assets/images/top.png") no-repeat center center;
  //background-size: 100% 100%;
  .custom-logo{
    display: flex;
    align-items: center;
    width: auto;
    a{
      display: flex;
      align-items: center;
      img{
        width: 32px;
        height: 32px;
        vertical-align: middle;
        margin-right: 12px;
      }
      h1{
        letter-spacing: 5px;
        display: inline-block;
        margin: 0;
        color: #fff;
        font-weight: 600;
        line-height: 50px;
        font-size: 24px;
        font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
        vertical-align: middle;
      }
    }
  }
  .hamburger-container {
    line-height: 60px;
    height: 100%;
    float: left;
    color: #fff;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    //position: absolute;
    //left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    //float: right;
    height: 100%;
    line-height: 75px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 4px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 40px;

      .avatar-wrapper {
        position: relative;
        line-height: 65px;
        span{
          color: #fff;
          margin-right: 5px;
        }
        i {
          cursor: pointer;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
