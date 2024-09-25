<template>
  <el-dialog
    v-model="props.dialogVisible"
    :title="props.title"
    width="60%"
    draggable
    destroy-on-close
    :before-close="handleClose"
  >
    <div class="container">
      <GroupLine title="基本信息" />
      <pro-form
        ref="formRef"
        v-model="form"
        :columns="columns"
        label-width="200px"
        :menu="menu"
        column="2"
        :rules="rules"
        :disabled="props.type === 'detail'"
      >
        <template #form-manUnitId>
          <el-tree-select
            style="width: 100%"
            v-model="form.manUnitId"
            :data="props.deptOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="id"
            default-expand-all
            clearable
            placeholder="请选择管理单位"
            @node-click="getCheckedNodes"
            check-strictly
          />
        </template>
      </pro-form>
      <GroupLine title="附件" />
      <el-form
        :model="form"
        :disabled="props.type === 'detail'"
        label-width="180px"
      >
        <el-form-item prop="attachment" label="">
          <AlUpload v-model:fileList="form.attachment"
                :disabled="props.type === 'detail'"
                limit="9"
            />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">{{
          props.type === "detail" ? "关闭" : "取消"
        }}</el-button>
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
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import GroupLine from "../groupLine";
import { infoColumns } from "../../constant";
import {
  defineFormColumns,
  defineFormMenuColumns,
  defineFormSubmit,
} from "element-pro-components";
import BigNumber from "bignumber.js";
import { changeFiles } from "@/views/maintenance/utils";
import { addFundManageApi, editFundManageApi } from "../../apis";

//获取proxy
const { proxy } = getCurrentInstance();
const { project_status, project_type_list } = proxy.useDict(
  "project_status",
  "project_type_list"
);
const props = defineProps([
  "type",
  "dialogVisible",
  "title",
  "deptOptions",
  "formData",
]);
const emit = defineEmits(["closeDialog"]);
//计算资金预算合计
const { centerAidFunds, localFinancialFunds, investmentFunds } =
  props.formData || {};
const totalFunds = new BigNumber(centerAidFunds || 0)
  .plus(localFinancialFunds || 0)
  .plus(investmentFunds || 0)
  .toFixed(2);
let form = ref({ ...props.formData, totalFunds,attachment:props.formData?.attachment||[] });
const formRef = ref(null);

//表单配置数据
const columns = defineFormColumns(
  computed(() =>
    infoColumns(project_status.value, project_type_list.value, form)
  )
);
const menu = defineFormMenuColumns({
  submit: false,
  reset: false,
});
const rules = ref({
  projectName: [
    { required: true, message: "请输入项目名称", trigger: ["change", "blur"] },
  ],
  projectStatus: [
    { required: true, message: "请选择项目状态", trigger: ["change", "blur"] },
  ],
  manUnitId: [
    { required: true, message: "请选择管理单位", trigger: ["change", "blur"] },
  ],
  projectStartDate: [
    {
      required: true,
      message: "请选择项目启动日期",
      trigger: ["change", "blur"],
    },
  ],
  planCompDate: [
    {
      required: true,
      message: "请选择计划完成日期",
      trigger: ["change", "blur"],
    },
  ],
  budgetFundProgress: [
    {
      required: true,
      message: "请输入资金预算执行进度",
      trigger: ["change", "blur"],
    },
  ],
});

const handleClose = () => {
  close();
};
//关闭
const close = () => {
  emit("closeDialog");
};
//确认
const confirm = () => {
  formRef.value
    .validate()
    .then((flag) => {
      if (flag) {
        const { attachment, ...rest } = form.value;
        if (props.type === "add") {
          addFundManageApi({
            ...rest,
            attachment: changeFiles(attachment)
          }).then((res) => {
            if (res.success) {
              ElMessage({
                message: "添加成功",
                type: "success",
              });
              emit("closeDialog", true);
            }
          });
        } else {
          editFundManageApi(form.value.id, { ...rest,attachment: changeFiles(attachment) }).then((res) => {
            if (res.success) {
              ElMessage({
                message: "添加成功",
                type: "success",
              });
              emit("closeDialog", true);
            }
          });
        }
      }
    })
    .catch((err) => {
      console.log("err", err);
      ElMessage.error("请填写表单必填项");
    });
};
//选择管理单位
const getCheckedNodes = (node) => {
  form.value.manUnitName = node.label || "";
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  