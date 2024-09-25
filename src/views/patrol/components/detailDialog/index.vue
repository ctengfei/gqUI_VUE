<template>
  <el-dialog
    v-model="props.dialogVisible"
    :title="props.title"
    width="48%"
    draggable
    destroy-on-close
    :before-close="close"
  >
    <div class="container">
      <div>
        <h3>图片:</h3>
        <div class="demo-image__preview">
          <el-image
            style="width: 100px; height: 100px"
            :src="item"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="props.content.srcList"
            :initial-index="index"
            fit="cover"
            v-for="(item, index) in props.content.srcList"
          />
          <div class="description">
            <h3>情况描述和初步分析:</h3>
            <div>{{ props.content.checkDesc }}</div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

let props = defineProps(["dialogVisible", "title", "content"]);
const emit = defineEmits(["closeDialog"]);

//关闭
const close = () => {
  emit("closeDialog");
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  