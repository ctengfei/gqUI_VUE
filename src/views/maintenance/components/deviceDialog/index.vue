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
      <el-form
        ref="formRef"
        :model="form"
        :disabled="props.type === 'detail'"
        :rules="rules"
        label-width="180px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="deviceCode" label="设备名称">
              <el-select
                v-model="form.deviceCode"
                @change="handleSelect"
                style="width: 100%"
              >
                <el-option
                  v-for="item in deviceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="admDep" label="主管部门">
              <el-tree-select
                disabled
                style="width: 100%"
                v-model="form.admDep"
                :data="props.deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                clearable
                placeholder="根据设备自动带出"
                check-strictly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="protectName" label="养护人">
              <el-input v-model="form.protectName" disabled>
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
            <el-form-item prop="curingTime" label="养护时间">
              <el-date-picker
                style="width: 100%"
                v-model="form.curingTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择养护时间"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="describe" label="问题描述">
              <el-input
                type="textarea"
                v-model="form.describe"
                placeholder="请输入问题描述"
                maxlength="3000"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="protectUrl" label="附件">
              <AlUpload v-model:fileList="form.protectUrl"
                :disabled="props.type === 'detail'"
                limit="9"
                accept=".png, .jpeg, .jpg"
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
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  addProtectRecordsApi,
  editProtectRecordsApi,
  getDeviceBaseApi,
} from "../../apis";
import { changeFiles } from "../../utils";

const props = defineProps([
  "type",
  "dialogVisible",
  "title",
  "deptOptions",
  "formData",
]);
const emit = defineEmits(["closeDialog"]);

let userDialogVisible = ref(false);
let deviceOptions = ref([]);
let fileList = ref([]);
const rules = ref({
  deviceCode: [
    { required: true, message: "请选择设备", trigger: ["change", "blur"] },
  ],
  protectName: [
    { required: true, message: "请选择养护人", trigger: ["change", "blur"] },
  ],
  curingTime: [
    { required: true, message: "请选择主管部门", trigger: ["change", "blur"] },
  ],
});
let form = ref(
  {
    ...props.formData,
    protectUrl: props.formData?.protectUrl||[],
  } || {}
);
const formRef = ref(null);

//挂载完成之后获取表格数据
onMounted(() => {
  getDeviceBaseData();
});
//查询设备列表
const getDeviceBaseData = () => {
  getDeviceBaseApi({ pageNum: 1, pageSize: 9999 }).then((res) => {
    if (res.success) {
      const result = res.data;
      deviceOptions.value = result.map((item) => {
        return {
          label: item.deviceName,
          value: item.deviceCode,
          admDep: item.admDep,
        };
      });
    }
  });
};
const handleClose = () => {
  close();
};
//关闭
const close = () => {
  emit("closeDialog");
  form.value = {};
};
//确认
const confirm = () => {
  formRef.value
    .validate()
    .then((flag) => {
      if (flag) {
        const { type } = props;
        const { protectUrl, ...rest } = form.value;
        if (type == "add") {
          addProtectRecordsApi({
            ...rest,
            protectUrl: changeFiles(protectUrl),
          }).then((res) => {
            if (res.success) {
              ElMessage({
                message: "添加成功",
                type: "success",
              });
              emit("closeDialog", true);
              form.value = {};
            }
          });
        } else {
          editProtectRecordsApi(form.value.id, {
            ...rest,
            protectUrl: changeFiles(protectUrl),
          }).then((res) => {
            if (res.success) {
              ElMessage({
                message: "修改成功",
                type: "success",
              });
              emit("closeDialog", true);
              form.value = {};
            }
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      ElMessage.error("请填写表单必填项");
    });
};
//用户弹窗显隐
const handleUser = () => {
  userDialogVisible.value = true;
};
//用户选择
const selectData = (data) => {
  const { realName, userId } = data || {};
  form.value.protectName = realName;
  form.value.headId = userId;
};
const handleSelect = (val) => {
  const data = deviceOptions.value.find((item) => {
    return item.value === val;
  });
  form.value.admDep = data.admDep;
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  