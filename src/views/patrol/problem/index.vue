<template>
  <div class="app-container">
    <el-tabs v-model="activeName" style="width: 100%; height: calc(100vh - 205px);">
      <el-tab-pane label="问题上报" name="1" style="height: 75vh; width: 100%;">
        <reportCom class="reportComs"/>
      </el-tab-pane>
      <el-tab-pane label="巡查问题" name="2" style="height: 75vh; width: 100%;">
        <patrolCom/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup name="problem">
import { nextTick, onMounted, ref, reactive, computed } from "vue";

import patrolCom from './components/patrolCom'
import reportCom from './components/reportCom'
import mapPoint from './components/mapPoint'
// import mapPoint from "./mapPoint";
const activeName = ref('1')

</script>
<style lang="scss" scoped>
.reportComs{
  width: 100%;
  height: 75vh;
}
// ::v-deep .el-tabs__content{
//   height: 70vh;
//   width: 100%;
//   .el-tab-pane{
//     width: 100%;
//     height: 100%;
//   }
// }
</style>
  
  