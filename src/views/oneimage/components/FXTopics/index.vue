<template>
  <el-tag  type="success"  @click="dialogVisible = true" class="man-tags">防汛抗旱专题</el-tag>
  <el-dialog
      v-model="dialogVisible"
      title="防汛抗旱专题"
      width="50%"
      append-to-body
      custom-class="dialog3"
  >
    <el-tabs v-model="activeName"  class="custom-tab" >
      <el-tab-pane label="防洪抗旱业务统计" name="1" style="height: 100%;width: 100%;overflow-y: auto;overflow-x: hidden">
        <Statistical />
      </el-tab-pane>
      <el-tab-pane label="受灾人群转移安置图" name="2" style="height: 100%;width: 100%">
        <!-- <TabMap v-if="activeName == 2"/> -->
        <el-image
            style="width: 100%; height: 100%"
            :src="URL"
            :preview-src-list="[URL]">
        </el-image>
      </el-tab-pane>
    </el-tabs>
    <!-- <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template> -->
  </el-dialog>
</template>

<script setup>
import Statistical from './components/Statistical';
import TabMap from './components/TabMap';
import URL from '@/assets/images/anzhi.jpg';
import {ref} from 'vue';
let dialogVisible = ref(false);
let activeName = ref('1')

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
    overflow-y: hidden;
    overflow-x: hidden;
  }
  :deep(.el-tabs__header){
    margin: 0!important;
  }
}
</style>
<style lang="scss" >
.dialog3 .el-dialog__body{
  padding-top: 0!important;
  padding-bottom: 20!important;
  height: 730px;
}
</style>