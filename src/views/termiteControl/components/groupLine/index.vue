<template>
  <div class="container" :class="props.sub ? 'ml20' : ''">
    <div class="left">
      <span class="box"></span>
      <span class="title">{{ props.title }}</span>
    </div>
    <div class="right" v-if="props.isHasBtn">
      <el-button type="primary" @click="add">添加</el-button>
    </div>
  </div>
  <hr class="divide" :class="props.sub ? 'ml20' : ''" />
  <hazardDialog
    title="危害情况"
    :dialogVisible="dialogVisible"
    @closeDialog="closeDialog"
    @confirmDialog="confirmDialog"
    :formData="formData"
  />
</template>

<script setup>
import hazardDialog from "../hazardDialog";
import { nextTick, onMounted, ref, reactive, defineExpose } from "vue";
const props = defineProps(["title", "isHasBtn", "sub"]);
const emit = defineEmits(["addTableData"]);
let formData = ref({}); //表单数据
//弹窗显隐
let dialogVisible = ref(false);
//关闭
const closeDialog = () => {
  dialogVisible.value = false;
};
//确定
const confirmDialog = (data) => {
  emit("addTableData", data);
  closeDialog();
};
//新增
const add = () => {
  dialogVisible.value = true;
  formData.value = {};
};

defineExpose({
  editDialogVisible(val, row) {
    formData.value = row;
    dialogVisible.value = val;
  },
});
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>

