<template>
    <el-dialog
      v-model="props.dialogVisible"
      title="参数设置"
      width="50%"
      draggable
      class="paramsDialog"
      :before-close="handleParamsClose">
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="渠道糙率设置" name="1">
                <riverCourse />
            </el-tab-pane>
            <el-tab-pane label="闸门静态属性设置" name="2">
                <GateProperties />
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
import { nextTick, onMounted, ref, watch, onBeforeUnmount } from "vue";
import riverCourse from "./riverCourse";
import GateProperties from "./GateProperties";
const props = defineProps(['dialogVisible']);
const emit = defineEmits(['update:dialogVisible']);
let activeName=ref("1");





onMounted(()=>{

})

const handleParamsClose = () =>{
  emit('update:dialogVisible',false);
}

const handleClick=(val)=>{

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