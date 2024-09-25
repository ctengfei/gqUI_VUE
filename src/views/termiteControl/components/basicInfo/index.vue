<template>
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
          <el-form-item prop="checkTime" label="检查时间">
            <el-date-picker
              v-model="form.checkTime"
              type="datetimerange"
              clearable
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm"
              format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="engId" label="所属工程">
            <el-select
                clearable
              placeholder="请选择所属工程"
              v-model="form.engId"
              @change="handleSelect"
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
        <el-col :span="12">
          <el-form-item prop="checkPos" label="检查地点或部位">
            <el-input
              maxlength="50"
              v-model="form.checkPos"
              placeholder="请输入检查地点或部位"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="checkUnitId" label="检查单位">
            <el-tree-select
              style="width: 100%"
              v-model="form.checkUnitId"
              :data="props.deptOptions"
              :props="{ value: 'id', label: 'label', children: 'children' }"
              value-key="id"
              placeholder="请选择检查单位"
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
          <el-form-item prop="checkPsnChrg" label="检查负责人">
            <el-input v-model="form.checkPsnChrg" disabled>
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
          <el-form-item prop="partiName" label="参与人员">
            <el-input v-model="form.partiName" disabled>
              <template #append>
                <el-button
                  :class="props.type === 'detail' ? '' : 'btnStyle'"
                  @click="handlePartUser"
                  >选择用户</el-button
                >
              </template>
            </el-input>
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
              maxlength="20"
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
            <el-input
              maxlength="20"
              v-model="form.bnchEndLoc"
              placeholder="请输入止桩号"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="weather" label="天气">
            <el-input maxlength="20" v-model="form.weather" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="tmp" label="气温（℃）">
            <el-input-number
              style="width: 100%"
              v-model.number="form.tmp"
              :min="-99"
              :max="999"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item prop="signExplain" label="蚁害迹象说明">
            <el-input
              maxlength="3000"
              type="textarea"
              v-model="form.signExplain"
              placeholder="请输入蚁害迹象说明"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item prop="attachment" label="附件上传">
            <AlUpload v-model:fileList="form.attachment"
                :disabled="props.type === 'detail'"
                limit="9"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <UserSelectDialog
      v-if="userDialogVisible"
      :dialogVisible="userDialogVisible"
      type="radio"
      @closeDialog="userDialogVisible = false"
      @selectData="selectData"
    />
    <UserSelectDialog
      v-if="partUserShow"
      :dialogVisible="partUserShow"
      type="checkbox"
      @closeDialog="partUserShow = false"
      @selectData="selectPartData"
    />
  </div>
</template>

<script setup>
import { UserSelectDialog } from "@/views/maintenance/components";
import { nextTick, onMounted, ref, toRef, reactive, defineExpose } from "vue";
import { getToken } from "@/utils/auth";
import { ElMessage } from "element-plus";
import { getProjectList } from "@/api/informationManager/projectManagement";

const props = defineProps(["deptOptions", "type", "recordData"]);
const emit = defineEmits(["changeTab", "getFormData"]);
const curRecordData = toRef(props, "recordData");

let form = ref(curRecordData);
const formRef = ref();
let fileList = ref([]);
let userDialogVisible = ref(false); //选择用户弹窗显隐
let partUserShow = ref(false); //选择参与人员弹窗显隐
let projectList = ref([]); //工程数据

const rules = ref({
  // engId: [
  //   { required: true, message: "请选择所属工程", trigger: ["change", "blur"] },
  // ],
  checkTime: [
    { required: true, message: "请输入检查时间", trigger: ["change", "blur"] },
  ],
  checkUnitId: [
    {
      required: true,
      message: "请选择检查单位",
      trigger: ["change", "blur"],
    },
  ],
  checkPsnChrg: [
    {
      required: true,
      message: "检查负责人为必填",
      trigger: ["change", "blur"],
    },
  ],
});

defineExpose({
  toConfirm() {
    formRef.value
      .validate()
      .then((flag) => {
        if (flag) {
          emit("getFormData", form.value);
        }
      })
      .catch((err) => {
        emit("changeTab", 1);
      });
  },
});
//挂载完成之后获取数据
onMounted(() => {
  getProjectData();
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
//获取检查单位名称
const getCheckedNodes = (node) => {
  form.value.checkUnitName = node.label || "";
};
//显示选择用户弹窗
const handleUser = () => {
  userDialogVisible.value = true;
};
//显示选参与人员弹窗
const handlePartUser = () => {
  partUserShow.value = true;
};
//获取下拉label
const handleSelect = (val) => {
  form.value.engName = projectList.value.find(
    (item) => item.value === val
  ).label;
};
//检查负责人赋值
const selectData = (data) => {
  const { realName, userId } = data || {};
  form.value.checkPsnChrg = realName;
  form.value.checkPsnChrgId = userId;
};
//参与人员赋值
const selectPartData = (data) => {
  const { realName, userId } = data || {};
  form.value.partiName = realName;
  form.value.partiId = userId;
};
</script>

<style lang="scss">
@import "./index.scss";
</style>

