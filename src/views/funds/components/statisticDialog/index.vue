<template>
  <el-dialog
    v-model="props.dialogVisible"
    title="详情"
    width="60%"
    draggable
    destroy-on-close
    :before-close="handleClose"
  >
    <div class="container">
      <GroupLine title="基本信息" />
      <pro-form
        v-model="form"
        :columns="columns1"
        label-width="220px"
        :menu="menu"
        column="2"
        :rules="rules"
        disabled
      />
      <GroupLine title="进度信息" />
      <pro-form
        v-model="form"
        :columns="columns2"
        label-width="220px"
        :menu="menu"
        column="2"
        :rules="rules"
        disabled
      />
      <GroupLine title="附件" />
      <el-form :model="form" ref="" disabled label-width="180px">
        <el-form-item prop="attachment" label="">
          <AlUpload v-model:fileList="form.attachment"
                :disabled="true"
                limit="9"
            />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import GroupLine from "../groupLine";
import { projectStatistColumns, progressStatistColumns } from "../../constant";
import {
  defineFormColumns,
  defineFormMenuColumns,
  defineFormSubmit,
} from "element-pro-components";
import { ElMessage } from "element-plus";
import BigNumber from "bignumber.js";
import { detailFundStatisticsApi } from "../../apis";

//获取proxy
const { proxy } = getCurrentInstance();
const { project_status, project_type_list } = proxy.useDict(
  "project_status",
  "project_type_list"
);
const props = defineProps(["dialogVisible", "formData"]);
const emit = defineEmits(["closeDialog"]);
const menu = defineFormMenuColumns({
  submit: false,
  reset: false,
});
let form = ref({...props.formData,attachment:props.formData?.attachment||[]});
//表单配置数据
const columns1 = defineFormColumns(
  computed(() =>
    projectStatistColumns(project_type_list.value, project_status.value)
  )
);
const columns2 = defineFormColumns(computed(() => progressStatistColumns()));
const rules = ref({
  projectName: [
    { required: true, message: "请输入项目名称", trigger: ["change", "blur"] },
  ],
  projectStatus: [
    { required: true, message: "请选择项目状态", trigger: ["change", "blur"] },
  ],
  fillDate: [
    {
      required: true,
      message: "请选择填报日期",
      trigger: ["change", "blur"],
    },
  ],
});

onMounted(() => {
  if (props.formData.id) {
    getFundManageInfoData(props.formData.id);
  }
});
//获取项目详情
const getFundManageInfoData = (id) => {
  detailFundStatisticsApi(id).then((res) => {
    if (res.success) {
      //计算资金预算合计
      const {
        centerAidFunds,
        localFinancialFunds,
        investmentFunds,
        attachment,
      } = res.data || {};
      const totalFunds = new BigNumber(centerAidFunds || 0)
        .plus(localFinancialFunds || 0)
        .plus(investmentFunds || 0)
        .toFixed(2);
      form.value = { ...res.data, totalFunds, attachment };
    }
  });
};

const handleClose = () => {
  close();
};
//关闭
const close = () => {
  emit("closeDialog");
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  