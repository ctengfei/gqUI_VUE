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
            <el-form-item prop="name" label="闸门或设备名称">
              <el-input
                v-model="form.name"
                placeholder="请输入闸门或设备名称"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="operateOrder" label="操作指令">
              <el-select v-model="form.operateOrder" style="width: 100%">
                <el-option
                  v-for="item in operateOrderData"
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
            <el-form-item prop="operateTime" label="操作时间">
              <el-date-picker
                style="width: 100%"
                v-model="form.operateTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择操作时间"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="operateName" label="操作人">
              <el-input v-model="form.operateName" disabled>
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
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="status" label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option
                  v-for="item in statusData"
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
            <el-form-item prop="description" label="描述信息">
              <el-input
                type="textarea"
                v-model="form.description"
                placeholder="请输入描述信息"
                maxlength="3000"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="attachment" label="">
              <AlUpload v-model:fileList="form.attachment"
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
import { UserSelectDialog } from "@/views/maintenance/components";
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  defineFormColumns,
  defineFormMenuColumns,
  defineFormSubmit,
} from "element-pro-components";
import { operateOrderData, statusData } from "../../constant";
import { addOperateLogApi, editOperateLogApi } from "../../apis";
import { changeFiles } from "@/views/maintenance/utils";

const props = defineProps(["type", "dialogVisible", "title", "formData"]);
const emit = defineEmits(["closeDialog"]);
let userDialogVisible = ref(false);
let form = ref({...props.formData,attachment:props.formData?.attachment||[]});
const rules = ref({
  name: [
    {
      required: true,
      message: "请输入闸门或设备名称",
      trigger: ["change", "blur"],
    },
  ],
  operateOrder: [
    { required: true, message: "请选择操作指令", trigger: ["change", "blur"] },
  ],
  operateTime: [
    { required: true, message: "请选择操作时间", trigger: ["change", "blur"] },
  ],
  operateName: [
    { required: true, message: "请选择养护人", trigger: ["change", "blur"] },
  ],
  status: [
    { required: true, message: "请选择状态", trigger: ["change", "blur"] },
  ],
});
const formRef = ref(null);

//挂载完成之后获取表格数据
onMounted(() => {});

const menu = defineFormMenuColumns({
  submit: false,
  reset: false,
});
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
        const { attachment, ...rest } = form.value;
        if (type == "add") {
          addOperateLogApi({
            ...rest,
            attachment: changeFiles(attachment),
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
          editOperateLogApi(form.value.id, {
            ...rest,
            attachment: changeFiles(attachment),
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
  form.value.operateName = realName;
  form.value.operateId = userId;
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  