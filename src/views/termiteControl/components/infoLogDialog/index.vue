<template>
  <el-dialog
    v-model="props.dialogVisible"
    title="查看"
    width="52%"
    draggable
    destroy-on-close
    :before-close="handleClose"
  >
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane
        :label="item.label"
        :name="item.name"
        v-for="(item, index) in tabsData"
        :key="index"
      />
    </el-tabs>

    <BasicInfo
      ref="basicInfoRef"
      v-show="activeTab === 1"
      :deptOptions="props.deptOptions"
      :type="props.type"
      @changeTab="changeTab"
    />
    <Inspection
      ref="inspectionRef"
      :type="props.type"
      v-show="activeTab === 2"
    />
    <FollowUp ref="followUpRef" :type="props.type" v-if="false" />
    <Specialized ref="specializedRef" :type="props.type" v-if="false" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { BasicInfo, Inspection, FollowUp, Specialized } from "../index";
import { tabsData } from "../../constant";
//当前点击tab
let activeTab = ref(1);
const form1 = ref({});
const formRef1 = ref({});
const basicInfoRef = ref(null);
const inspectionRef = ref(null);
const followUpRef = ref(null);
const specializedRef = ref(null);

const props = defineProps(["type", "dialogVisible", "deptOptions"]);
const emit = defineEmits(["closeDialog"]);

watch(activeTab, (newValue, oldValue) => {
  console.log("值发生了变更", newValue, oldValue);
});
const handleClose = () => {
  close();
};
//关闭
const close = () => {
  emit("closeDialog");
};
//修改tabs
const changeTab = (val) => {
  activeTab.value = val;
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  