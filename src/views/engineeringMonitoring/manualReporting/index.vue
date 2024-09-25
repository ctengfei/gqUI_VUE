<template>
<div class="app-container">
  <el-tabs v-model="activeName"  class="custom-tab">
    <el-tab-pane label="垂直水平位移数据" name="1">
      <CzTable />
    </el-tab-pane>
    <el-tab-pane label="渗流压力水位数据" name="2">
      <SlTable/>
    </el-tab-pane>
  </el-tabs>
</div>
</template>

<script setup>
import { ref} from 'vue'
import CzTable from './components/CzTable'
import SlTable from './components/SlTable';
let activeName = ref('1')
</script>

<style scoped>

</style>