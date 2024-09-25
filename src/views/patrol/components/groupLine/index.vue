<template>
  <div class="container">
    <div class="left">
      <span class="box"></span>
      <span class="title">{{ props.title }}</span>
    </div>
    <div class="right" v-if="props.isHasBtn">
      <el-button
        type="primary"
        @click="moveDel"
        :disabled="props.selectionData.length === 0"
        >移除</el-button
      >
      <el-button type="primary" @click="add">添加</el-button>
    </div>
  </div>
  <hr class="divide" />
  <BuildingDialog
    v-if="dialogVisible"
    :dialogVisible="dialogVisible"
    @closeDialog="dialogVisible = false"
    @confirmDialog="confirmDialog"
  />
</template>

<script setup>
import BuildingDialog from "../buildingDialog";
import { nextTick, onMounted, ref, reactive, defineExpose } from "vue";
const props = defineProps(["title", "isHasBtn", "selectionData"]);
const emit = defineEmits(["addTableData", "delTableData"]);
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
};
//移除
const moveDel = () => {
  emit("delTableData");
};

defineExpose({});
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>

