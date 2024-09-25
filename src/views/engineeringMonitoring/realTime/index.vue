<template>
  <div class="app-container">
    <el-tabs v-model="activeName"  class="custom-tab">
      <el-tab-pane label="垂直位移数据" name="1">
        <CzTable/>
      </el-tab-pane>
      <el-tab-pane label="渗流压力水位数据" name="2">
        <SlTable/>
      </el-tab-pane>
      <el-tab-pane label="水平位移数据" name="3">
        <SwTable/>
      </el-tab-pane>
      <el-tab-pane label="大坝安监测点" name="4">
        <DbTable/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import CzTable from '@/views/engineeringMonitoring/realTime/components/CzTable'
import SlTable from '@/views/engineeringMonitoring/realTime/components/SlTable'
import SwTable from '@/views/engineeringMonitoring/realTime/components/SwTable'
import DbTable from '@/views/engineeringMonitoring/realTime/components/DbTable'
import { ref} from 'vue'
let activeName = ref('1')
</script>

<style scoped lang="scss">

</style>