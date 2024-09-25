<template>
  <el-dialog
    v-model="props.dialogVisible"
    :title="props.title"
    width="60%"
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
      :recordData="curRecordData"
      @changeTab="changeTab"
      @getFormData="getFormData"
    />
    <Inspection
      ref="inspectionRef"
      :type="props.type"
      :recordData="curRecordData"
      v-show="activeTab === 2"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
        <el-button
          type="primary"
          v-if="props.type !== 'detail'"
          @click="confirm"
          >确认</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, toRef, computed } from "vue";
import { ElMessage } from "element-plus";
import { BasicInfo, Inspection } from "../index";
import { tabsData } from "../../constant";
import { changeFiles } from "@/views/maintenance/utils";
import { addControlRecordsApi, editControlRecordsApi } from "../../apis";
//当前点击tab
let activeTab = ref(1);
let logDialogVisible = ref(false); //查看日志弹窗显隐
const basicInfoRef = ref(null);
const inspectionRef = ref(null);

const props = defineProps([
  "type",
  "dialogVisible",
  "title",
  "deptOptions",
  "recordData",
]);
const curRecordData = toRef(props, "recordData");
const emit = defineEmits(["closeDialog"]);

const handleClose = () => {
  close();
};
//关闭
const close = () => {
  emit("closeDialog");
};
//确认
const confirm = () => {
  basicInfoRef.value.toConfirm();
};
//获取表单数据
const getFormData = (basicInfoData) => {
  const { checkTime, attachment, ...rest } = basicInfoData || {};
  const { hazardDetail, hazardLevel, hazardDegree, bywater } =
    inspectionRef.value.form || {};
  const params = {
    ...rest,
    attachment: changeFiles(attachment),
    checkStartTime: checkTime && checkTime[0],
    checkEndTime: checkTime && checkTime[1],
    hazardDetail,
    hazardLevel,
    hazardDegree,
    bywater,
  };
  if (props.type === "add") {
    addControlRecordsApi(params).then((res) => {
      if (res.success) {
        ElMessage({
          message: "添加成功",
          type: "success",
        });
        emit("closeDialog", true);
      }
    });
  } else {
    editControlRecordsApi(props.recordData.id, params).then((res) => {
      if (res.success) {
        ElMessage({
          message: "修改成功",
          type: "success",
        });
        emit("closeDialog", true);
      }
    });
  }
};
//修改tabs
const changeTab = (val) => {
  activeTab.value = val;
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  