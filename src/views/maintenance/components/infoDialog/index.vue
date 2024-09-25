<template>
  <el-dialog
    v-model="props.dialogVisible"
    :title="props.title"
    width="78%"
    draggable
    destroy-on-close
    :before-close="handleClose"
  >
    <div class="container">
      <GroupLine title="基本信息" />
      <el-form
        ref="formRef"
        :model="form"
        :disabled="props.type === 'detail'"
        :rules="rules"
        label-width="180px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="recorder" label="记录人">
              <el-input v-model="form.recorder" disabled>
                <template #append>
                  <el-button
                    :class="props.type === 'detail' ? '' : 'btnStyle'"
                    @click="handleUser"
                    >选择用户</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="manUnitId" label="管理单位">
              <el-tree-select
                style="width: 100%"
                v-model="form.manUnitId"
                :data="props.deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                placeholder="请选择管理单位"
                check-strictly
                clearable
                default-expand-all
                @node-click="getCheckedNodes"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="recordDate" label="记录日期">
              <el-date-picker
                style="width: 100%"
                v-model="form.recordDate"
                type="datetime"
                clearable
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择记录日期"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="maintenanceTime" label="养护时段">
              <el-date-picker
                style="width: 100%"
                v-model="form.maintenanceTime"
                type="daterange"
                clearable
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                placeholder="请选择维护时段"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="maintenanceEngId" label="维护工程名称">
              <el-select
                v-model="form.maintenanceEngId"
                @change="handleSelect"
                style="width: 100%"
              >
                <el-option
                  v-for="item in patrolRangeData"
                  :key="item.id"
                  :label="item.socialCreditCode"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="buildingId" label="所属建筑物">
              <el-select v-model="form.buildingId" style="width: 100%">
                <el-option
                  v-for="item in buildingData"
                  :key="item.engId"
                  :label="item.engName"
                  :value="item.engId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="maintenanceType" label="养护类型">
              <el-select v-model="form.maintenanceType" style="width: 100%">
                <el-option
                  v-for="item in maintenance_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="recordType" label="记录类型">
              <el-select v-model="form.recordType" style="width: 100%">
                <el-option
                  v-for="item in record_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="bnchStartLoc">
              <template #label>
                <span>
                  桩号范围(m): 起
                  <el-tooltip placement="top">
                    <template #content>
                      桩号由公里数和米数构成，格式：字母(可省)<br />+公里数+“+”+米数(3位数字，不足前面自动补0)，<br />例：10+120，z10+012
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input
                v-model="form.bnchStartLoc"
                placeholder="请输入起桩号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="bnchEndLoc">
              <template #label>
                <span>
                  止
                  <el-tooltip placement="top">
                    <template #content>
                      桩号由公里数和米数构成，格式：字母(可省)<br />+公里数+“+”+米数(3位数字，不足前面自动补0)，<br />例：10+120，z10+012
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.bnchEndLoc" placeholder="请输入止桩号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="engId" label="所属工程">
              <el-select
                v-model="form.engId"
                @change="handleEngSelect"
                style="width: 100%"
              >
                <el-option
                  v-for="item in projectList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="position" label="位置描述">
              <el-input
                type="textarea"
                v-model="form.position"
                maxlength="3000"
                placeholder="请输入位置描述"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <GroupLine title="维护情况" />
        <el-row>
          <el-col :span="24">
            <el-form-item prop="maintenanceDesc" label="维护养护情况">
              <el-input
                type="textarea"
                v-model="form.maintenanceDesc"
                maxlength="3000"
                placeholder="请输入维护养护情况"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="problem" label="存在问题">
              <el-input
                type="textarea"
                v-model="form.problem"
                maxlength="3000"
                placeholder="请输入存在问题"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="processOpinion" label="问题原因及处理意见">
              <el-input
                type="textarea"
                v-model="form.processOpinion"
                maxlength="3000"
                placeholder="请输入问题原因及处理意见"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="processResult" label="处理结果">
              <el-input
                type="textarea"
                v-model="form.processResult"
                maxlength="3000"
                placeholder="请输入处理结果"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="operation" label="运行情况">
              <el-input
                type="textarea"
                v-model="form.operation"
                maxlength="3000"
                placeholder="请输入运行情况"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <GroupLine title="附件" />
        <el-row>
          <el-col :span="24">
            <el-form-item prop="maintenanceAttachmentBefore" label="维护前">
              <AlUpload
                v-model:fileList="form.maintenanceAttachmentBefore"
                :disabled="props.type === 'detail'"
                limit="9"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="maintenanceAttachmentUnder" label="维护中">
              <AlUpload
                v-model:fileList="form.maintenanceAttachmentUnder"
                :disabled="props.type === 'detail'"
                limit="9"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="maintenanceAttachmentAfter" label="维护后">
              <AlUpload
                v-model:fileList="form.maintenanceAttachmentAfter"
                :disabled="props.type === 'detail'"
                limit="9"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="maintenanceAttachmentOther" label="其他">
              <AlUpload
                v-model:fileList="form.maintenanceAttachmentOther"
                :disabled="props.type === 'detail'"
                limit="9"
              />
            </el-form-item>
          </el-col>
        </el-row>
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
    <UserSelectDialog
      v-if="userDialogVisible"
      :dialogVisible="userDialogVisible"
      type="radio"
      @closeDialog="userDialogVisible = false"
      @selectData="selectData"
    />
  </el-dialog>
</template>

<script setup>
import UserSelectDialog from "../userSelectDialog";
import { GroupLine } from "@/views/funds/components";
import { ref, reactive, onMounted, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { addProtectEngRecordsApi, editProtectEngRecordsApi } from "../../apis";
import { getToken } from "@/utils/auth";
import { getPatrolRangeApi, detailPatrolRangeApi } from "@/views/patrol/apis";
import { getProjectList } from "@/api/informationManager/projectManagement";
import { changeFiles } from "../../utils";

const { proxy } = getCurrentInstance();
const { maintenance_type, record_type } = proxy.useDict(
  "maintenance_type",
  "record_type"
);
const props = defineProps([
  "type",
  "dialogVisible",
  "title",
  "deptOptions",
  "formData",
]);
const emit = defineEmits(["closeDialog"]);
let buildingData = ref([]); //所属建筑物数据
let patrolRangeData = ref([]);
let userDialogVisible = ref(false);
let fileList = ref([]);
let projectList = ref([]); //工程数据
const headers = ref({ Authorization: "Bearer " + getToken() });
const uploadFileUrl = ref(
  import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"
); // 上传文件服务器地址
const rules = ref({
  recorder: [
    { required: true, message: "请选择记录人", trigger: ["change", "blur"] },
  ],
  manUnitId: [
    { required: true, message: "请选择管理单位", trigger: ["change", "blur"] },
  ],
});
let form = ref(
  {
    ...props.formData,
    maintenanceAttachmentBefore:
      props.formData?.maintenanceAttachmentBefore || [],
    maintenanceAttachmentUnder:
      props.formData?.maintenanceAttachmentUnder || [],
    maintenanceAttachmentAfter:
      props.formData?.maintenanceAttachmentAfter || [],
    maintenanceAttachmentOther:
      props.formData?.maintenanceAttachmentOther || [],
    maintenanceTime: [
      props.formData.maintenanceStartTime,
      props.formData.maintenanceEndTime,
    ],
  } || {}
);
const formRef = ref(null);

onMounted(() => {
  getPatrolData();
  getProjectData();
  if (props.formData?.maintenanceEngId) {
    getBuildingData(props.formData.maintenanceEngId);
  }
});
//查询工程
const getProjectData = () => {
  getProjectList().then((res) => {
    if (res.success) {
      projectList.value = res.data.map((r) => ({
        label: r.engName,
        value: r.id,
      }));
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
  formRef.value
    .validate()
    .then((flag) => {
      if (flag) {
        const { type } = props;
        const {
          maintenanceTime,
          maintenanceAttachmentBefore,
          maintenanceAttachmentUnder,
          maintenanceAttachmentAfter,
          maintenanceAttachmentOther,
          ...rest
        } = form.value || {};
        const params = {
          ...rest,
          maintenanceAttachmentBefore: changeFiles(maintenanceAttachmentBefore),
          maintenanceAttachmentUnder: changeFiles(maintenanceAttachmentUnder),
          maintenanceAttachmentAfter: changeFiles(maintenanceAttachmentAfter),
          maintenanceAttachmentOther: changeFiles(maintenanceAttachmentOther),
          maintenanceStartTime: maintenanceTime && maintenanceTime[0],
          maintenanceEndTime: maintenanceTime && maintenanceTime[1],
        };
        if (type == "add") {
          addProtectEngRecordsApi(params).then((res) => {
            if (res.success) {
              ElMessage({
                message: "添加成功",
                type: "success",
              });
              emit("closeDialog", true);
            }
          });
        } else {
          editProtectEngRecordsApi(params.id, params).then((res) => {
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
//显示选择用户弹窗
const handleUser = () => {
  userDialogVisible.value = true;
};
const selectData = (data) => {
  const { realName, userId } = data || {};
  form.value.recorder = realName;
  form.value.recorderId = userId;
};
//获取巡查范围下拉数据
const getPatrolData = () => {
  getPatrolRangeApi({
    pageNum: 1,
    pageSize: 9999,
  }).then((res) => {
    if (res.success) {
      patrolRangeData.value = res.data.data;
    }
  });
};
const getCheckedNodes = (node) => {
  form.value.manUnitName = node.label || "";
};
//获取下拉label
const handleSelect = (val) => {
  getBuildingData(val);
  form.value.buildingId = "";
  form.value.maintenanceEngName = patrolRangeData.value.find(
    (item) => item.id === val
  ).socialCreditCode;
};
//获取工程下拉label
const handleEngSelect = (val) => {
  form.value.engName = projectList.value.find(
    (item) => item.value === val
  ).label;
};
const getBuildingData = (id) => {
  detailPatrolRangeApi(id).then((res) => {
    if (res.success) {
      buildingData.value = res.data.addrEng;
    }
  });
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
