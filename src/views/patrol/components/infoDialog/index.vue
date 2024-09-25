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
        <GroupLine title="基本信息" />
        <el-row>
          <el-col :span="12">
            <el-form-item prop="headName" label="责任人">
              <el-input v-model="form.headName" disabled>
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
                default-expand-all
                clearable
                placeholder="请选择管理单位"
                @node-click="getCheckedNodes"
                check-strictly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="socialCreditCode" label="巡查区域名称">
              <el-input
                v-model="form.socialCreditCode"
                maxlength="20"
                placeholder="请输入巡查区域名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="engId" label="所属工程">
              <el-select
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
            <el-form-item prop="startLoc">
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
                v-model="form.startLoc"
                placeholder="请输入起桩号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="endLoc">
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
                v-model="form.endLoc"
                placeholder="请输入止桩号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="branchCanal" label="支渠">
              <el-input v-model="form.branchCanal" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="importantLot" label="重要地段">
              <el-input v-model="form.importantLot" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="canalNum" label="台渠数量(座)">
              <el-input-number
                style="width: 100%"
                v-model.number="form.canalNum"
                :min="0"
                :max="99999999"
                :precision="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="culvNum" label="涵洞数量 (条)">
              <el-input-number
                style="width: 100%"
                v-model.number="form.culvNum"
                :min="0"
                :max="99999999"
                :precision="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="flumNum" label="渡槽数量 (座)">
              <el-input-number
                style="width: 100%"
                v-model.number="form.flumNum"
                :min="0"
                :max="99999999"
                :precision="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="largeGateNum" label="大型闸门数量(座)">
              <el-input-number
                style="width: 100%"
                v-model.number="form.largeGateNum"
                :min="0"
                :max="99999999"
                :precision="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="qxhgNum" label="渠下涵管数量(个)">
              <el-input-number
                style="width: 100%"
                v-model.number="form.qxhgNum"
                :min="0"
                :max="99999999"
                :precision="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="smallGateNum" label="小型闸门数量(座)">
              <el-input-number
                style="width: 100%"
                v-model.number="form.smallGateNum"
                :min="0"
                :max="99999999"
                :precision="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="sxrqNum" label="山溪入渠数量(条)">
              <el-input-number
                style="width: 100%"
                v-model.number="form.sxrqNum"
                :min="0"
                :max="99999999"
                :precision="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="tunnelNum" label="隧洞数量 (条)">
              <el-input-number
                style="width: 100%"
                v-model.number="form.tunnelNum"
                :min="0"
                :max="99999999"
                :precision="0"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="length" label="长度（km）">
              <el-input-number
                style="width: 100%"
                v-model.number="form.length"
                :min="0"
                :max="99999999"
                :precision="4"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="remark" label="备注">
              <el-input
                type="textarea"
                maxlength="3000"
                v-model="form.remark"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <GroupLine
          title="辖区建筑物及设备"
          :isHasBtn="true"
          @addTableData="addTableData"
          @delTableData="delTableData"
          :selectionData="selectionData"
        />
        <pro-table
          :data="tableData"
          :columns="columns"
          :index="index"
          selection
          @selection-change="selectionFuc"
        />
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
import GroupLine from "../groupLine";
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  defineTableColumns,
  defineTableIndexColumns,
} from "element-pro-components";
import { departmentStatus } from "../../constant";
import { getProjectList } from "@/api/informationManager/projectManagement";
import {
  addPatrolRangeApi,
  editPatrolRangeApi,
  detailPatrolRangeApi,
} from "../../apis";

const props = defineProps([
  "type",
  "dialogVisible",
  "title",
  "deptOptions",
  "formData",
]);
const emit = defineEmits(["closeDialog"]);
const rules = ref({
  headName: [
    { required: true, message: "请输入责任人", trigger: ["change", "blur"] },
  ],
  manUnitId: [
    { required: true, message: "请选择管理单位", trigger: ["change", "blur"] },
  ],
});
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});
let userDialogVisible = ref(false);
let selectionData = ref([]); //勾选数据
let tableData = ref([]); //表格数据
let manUnitName = ref("");
let form = ref({});
const formRef = ref(null);
let projectList = ref([]); //工程数据
const columns = defineTableColumns([
  {
    label: "编码",
    prop: "engId",
  },
  {
    label: "名称",
    prop: "engName",
  },
  {
    label: "分类",
    prop: "partType",
    render: (row) => {
      return departmentStatus.find((item) => item.value === row.partType).label;
    },
  },
]);

//挂载完成之后获取表格数据
onMounted(() => {
  getProjectData();
  if (props.formData?.id) {
    getDetail(props.formData.id);
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
//获取详情
const getDetail = (id) => {
  detailPatrolRangeApi(id).then((res) => {
    if (res.success) {
      form.value = res.data;
      manUnitName.value=res.data.manUnitName
      tableData.value = res.data.addrEng;
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
        const params = {
          ...form.value,
          manUnitName: manUnitName.value,
          addrEng: tableData.value,
        };
        if (type == "add") {
          addPatrolRangeApi(params).then((res) => {
            if (res.success) {
              ElMessage({
                message: "添加成功",
                type: "success",
              });
              emit("closeDialog", true);
            }
          });
        } else {
          editPatrolRangeApi(form.value.id, params).then((res) => {
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
const addTableData = (data) => {
  let arr = [...data];
  arr.forEach((item) => {
    const fitData = tableData.value.filter((cur) => cur.engId === item.engId);
    if (fitData && fitData.length === 0) {
      tableData.value.push(item);
    }
  });
};
//单位选中赋值
const getCheckedNodes = (node) => {
  manUnitName.value = node.label || "";
};
//获取下拉label
const handleSelect = (val) => {
  form.value.engName = projectList.value.find(
    (item) => item.value === val
  ).label;
};
//勾选
const selectionFuc = (data) => {
  selectionData.value = [...data];
};
//移除
const delTableData = () => {
  const arrId = selectionData.value.map((item) => item.id);
  tableData.value = tableData.value.filter((item) => !arrId.includes(item.id));
};
//用户弹窗显隐
const handleUser = () => {
  userDialogVisible.value = true;
};
//用户选择
const selectData = (data) => {
  const { realName, userId } = data || {};
  form.value.headName = realName;
  form.value.headId = userId;
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  