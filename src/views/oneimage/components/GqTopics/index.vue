<template>
  <el-tag type="success" class="man-tags" @click="dialogVisible = true">灌区管理专题</el-tag>
  <el-dialog
      v-model="dialogVisible"
      title="灌区管理专题"
      width="70%"
      append-to-body
      custom-class="dialog1"
  >
    <el-tabs v-model="activeName"  class="custom-tab">
      <el-tab-pane label="灌区业务统计" name="1" style="height: 100%">
        <Statistics  />
      </el-tab-pane>
      <el-tab-pane label="流域水系图"  name="2" style=" height: 100%">
        <div style="width: 100%; height: 100%">
          <el-image
              style="width: 100%; height:100%"
              :src="url1"
              :preview-src-list="[URL1]">
          </el-image>
        </div>

      </el-tab-pane>
      <el-tab-pane label="供水范围图" name="3" style=" height: 100%">
        <div style="width: 100%; height: 100%">
          <el-image
              style="width: 100%; height: 100%"
              :src="url2"
              :preview-src-list="[URL2]">
          </el-image>
        </div>
      </el-tab-pane>
      <el-tab-pane label="灌区水利工程图" name="4" style=" height: 100%">
        <div style="width: 100%; height: 100%">
          <el-image
            :src="url3"
            style="width: 100%; height: 100%"
            :preview-src-list="[URL3]">
          </el-image>
        </div>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import Statistics from './components/Statistics';
import {onMounted, ref} from 'vue';
import URL1 from '@/assets/images/shuixi.png';
import URL2 from '@/assets/images/gs_water.png';
import URL3 from '@/assets/images/gongcheng.png';
const url1 = ref(URL1);
const url2 = ref(URL2);
const url3 = ref(URL3);
let dialogVisible = ref(false);
let activeName = ref('1');

</script>
<style scoped lang="scss">
.man-tags{
  padding: 17px;
  margin: 5px;
  cursor: pointer;
}
.el-col {
  text-align: center;
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
.dialog1 .el-dialog__body{
  padding-top: 0!important;
  padding-bottom: 0!important;
  height: 700px;
}


</style>