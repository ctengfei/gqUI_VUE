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
        ref="formRef1"
        v-model="form"
        :columns="columns1"
        label-width="220px"
        :menu="menu"
        column="2"
        :rules="rules"
        :disabled="props.type === 'detail'"
      >
        <template #form-projectName>
          <el-select
            v-model="form.projectName"
            @change="handleSelect"
            style="width: 100%"
            :disabled="props.type !== 'add'"
          >
            <el-option
              v-for="item in projectData"
              :key="item.id"
              :label="item.projectName"
              :value="item.id"
            />
          </el-select>
        </template>
      </pro-form>
      <GroupLine title="进度信息" />
      <pro-form
        ref="formRef2"
        v-model="form"
        :columns="columns2"
        label-width="220px"
        :menu="menu"
        column="2"
        :rules="rules"
        :disabled="props.type === 'detail'"
      />
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
import { ref, reactive, computed, onMounted } from "vue";
import GroupLine from "../groupLine";
import { cumulativeColumns, progressColumns } from "../../constant";
import {
  defineFormColumns,
  defineFormMenuColumns,
  defineFormSubmit,
} from "element-pro-components";
import { ElMessage } from "element-plus";
import {
  getFundManageDataApi,
  getFundManageInfoApi,
  addFundPayManageApi,
  editFundPayManageApi,
} from "../../apis";
import { changeFiles } from "@/views/maintenance/utils";

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
const menu = defineFormMenuColumns({
  submit: false,
  reset: false,
});
let form = ref({...props.formData,attachment:props.formData?.attachment||[]});

//表单配置数据
const columns1 = defineFormColumns(
  computed(() => cumulativeColumns(project_type_list.value))
);
const columns2 = defineFormColumns(
  computed(() => progressColumns(project_status.value, form))
);
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
let projectData = ref([]);
let formRef1 = ref();
let formRef2 = ref();
let manageId = ref(props.formData.manageId || ""); //项目id

onMounted(() => {
  if (props.type === "add") {
    getFundManageData();
  } else {
    if (props.formData.manageId) {
      getFundManageInfoData(props.formData.manageId);
    }
  }
});
//获取项目数据
const getFundManageData = () => {
  getFundManageDataApi({
    pageNum: 1,
    pageSize: 9999,
  }).then((res) => {
    if (res.success) {
      projectData.value = res.data;
    }
  });
};
//获取下拉label
const handleSelect = (val) => {
  manageId.value = val;
  getFundManageInfoData(val);
};
//获取项目详情
const getFundManageInfoData = (id) => {
  getFundManageInfoApi(id).then((res) => {
    if (res.success) {
      const {
        fillDate,
        projectStatus,
        currProjectImageProgress,
        currCenterAidFunds,
        currInvestmentFunds,
        currLocalFinancialFunds,
        id,
        currPay,
        attachment,
      } = form.value;
      form.value = {
        ...res.data,
        fillDate,
        projectStatus,
        currProjectImageProgress,
        id,
        currCenterAidFunds,
        currInvestmentFunds,
        currLocalFinancialFunds,
        currPay,
        attachment,
      };
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
//确认
const confirm = () => {
  Promise.all([formRef1.value.validate(), formRef2.value.validate()])
    .then((arr) => {
      if (arr[0] && arr[1]) {
        const {
          fillDate,
          currCenterAidFunds,
          currInvestmentFunds,
          currLocalFinancialFunds,
          currProjectImageProgress,
          projectStatus,
          attachment,
        } = form.value || {};
        const params = {
          fillDate,
          currCenterAidFunds,
          currInvestmentFunds,
          currLocalFinancialFunds,
          currProjectImageProgress,
          projectStatus,
          manageId: manageId.value,
          attachment:changeFiles(attachment),
        };
        if (props.type === "add") {
          addFundPayManageApi(params).then((res) => {
            if (res.success) {
              ElMessage({
                message: "添加成功",
                type: "success",
              });
              emit("closeDialog", true);
            }
          });
        } else {
          editFundPayManageApi(form.value.id, params).then((res) => {
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
      ElMessage.error("请填写表单必填项");
    });
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  