<template>
  <el-dialog
      v-model="props.dialogVisible"
      title="参数设置"
      width="60%"
      draggable
      class="paramsDialog"
      :before-close="handleParamsClose"
  >
    <el-tabs v-model="activeName" >
      <el-tab-pane label="产流参数" name="1">
        <clTable />
      </el-tab-pane>
      <el-tab-pane label="时段单位线m1相关参数" name="2">
        <m1Table/>
      </el-tab-pane>
      <el-tab-pane label="非线性修正系数Lambda1关系" name="3">
        <lambda1Table/>
      </el-tab-pane>
      <el-tab-pane label="非线性修正系数Lambda2关系" name="4">
        <lambda2Table/>
      </el-tab-pane>
      <el-tab-pane label="时段单位线n相关参数" name="5">
        <timeNTable/>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleParamsClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  defineFormColumns,
  defineFormMenuColumns,
  defineFormSubmit,
} from 'element-pro-components'
import {defineEmits, defineProps, ref} from "vue";
import clTable from '../clTable';
import m1Table from '../m1Table';
import lambda1Table from '../lambda1Table';
import lambda2Table from '../lambda2Table';
import timeNTable from '../timeNTable';
const props = defineProps(['dialogVisible']);
const emit = defineEmits(['update:dialogVisible']);
const menu = defineFormMenuColumns({
  submitText: '提交',
  resetText:'重置'
})
let activeName = ref('1');

const handleParamsClose = () =>{
  emit('update:dialogVisible',false);
}

</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  margin-top: 17vh!important;
}

:deep(.el-dialog__body){
  padding-top: 15px!important;
}
</style>