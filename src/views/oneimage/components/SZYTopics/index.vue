<template>
  <el-tag  type="success"  @click="dialogVisible = true"  style="padding: 17px 11px"  class="man-tags">水资源调度专题</el-tag>
  <el-dialog
      v-model="dialogVisible"
      title="水资源调度专题"
      width="1400"
      style="margin-top:4vh!important;"
      append-to-body
      destroy-on-close
      custom-class="dialog4"
  >
    <el-tabs v-model="activeName"  class="custom-tab">
      <el-tab-pane lazy label="用水量统计" name="1" style="height: 100%;width: 100%">
        <Statistical />
      </el-tab-pane>
      <el-tab-pane lazy label="水量调度概化图" name="2" style="height: 680px;width: 1360px;background: #F4F8FB">
        <Generalization :activeName="activeName" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {ref} from 'vue';
import URL from '@/assets/images/gh.png';
import Generalization from './components/Generalization';
import Statistical from './components/Statistical';
let dialogVisible = ref(false);
let activeName = ref('1');
const url = ref(URL);

</script>

<style scoped lang="scss">
.man-tags{
  padding: 17px;
  margin: 5px;
  cursor: pointer;
}
.custom-tab{
  height:100%;
  :deep(.el-tabs__content){
    height: calc(100% - 40px);
  }
  :deep(.el-tabs__header){
    margin: 0!important;
  }
}
</style>
<style lang="scss">
.dialog4 .el-dialog__body{
  padding-top: 0!important;
  padding-bottom: 0!important;
  height: 720px;
}
</style>