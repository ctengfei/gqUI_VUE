<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }" >
      <transition name="fade-transform">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component v-if="!route.meta.link" :is="Component" :key="route.path"/>
        </keep-alive>
      </transition>
    </router-view>
    <iframe-toggle />
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router';

import iframeToggle from "./IframeToggle/index"
import useTagsViewStore from '@/store/modules/tagsView'
import useAppStore from "@/store/modules/app";
const tagsViewStore = useTagsViewStore()
const appStore = useAppStore()
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  //min-height: calc(100vh - 50px);
  height: calc(100vh - 105px);
  width: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

.fixed-header + .app-main {
  //padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
  }

  .fixed-header + .app-main {
    padding-top: 105px;
    height: 100%;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 6px;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}
</style>

