<template>
  <div class="app-container">
    <el-tabs v-model="activeName"  class="custom-tab">
      <el-tab-pane label="城镇用水量" name="1">
        <CzTable :activeName="activeName" />
      </el-tab-pane>
      <el-tab-pane label="农业用水量" name="2">
        <NyTable :activeName="activeName" />
      </el-tab-pane>
      <el-tab-pane label="生态用水量" name="3">
        <StTable :activeName="activeName" />
      </el-tab-pane>
      <el-tab-pane label="发电用水量" name="4">
        <FdTable :activeName="activeName" />
      </el-tab-pane>
      <el-tab-pane label="泄洪水量" name="5">
        <XhTable :activeName="activeName" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import CzTable from './components/CzTable';
import NyTable from './components/NyTable';
import StTable from './components/StTable';
import FdTable from './components/FdTable';
import XhTable from './components/XhTable';
let activeName = ref('1');

watch(activeName,(active)=>{
  activeName.value = active
})


</script>

<style scoped lang="scss">
:deep(.pro-select){
  width: 100%;
}
:deep(.el-date-editor.el-input){
  width: 100%!important;
}
</style>
<style lang="scss">

.custom-tab{
  height: 100%;
  .el-tabs__content{
    height: 100%;
  }
}

</style>