<template>
  <el-dialog
    v-model="props.dialogVisible"
    title="选择用户"
    width="78%"
    draggable
    destroy-on-close
    :before-close="handleClose"
  >
    <div class="container">
      <el-row :gutter="20">
        <!--部门数据-->
        <el-col :span="4" :xs="24">
          <div class="head-container">
            <el-input
              v-model="deptName"
              placeholder="请输入部门名称"
              clearable
              prefix-icon="Search"
              style="margin-bottom: 20px"
            />
          </div>
          <div class="head-container">
            <el-tree
              :data="deptOptions"
              :props="{ label: 'label', children: 'children' }"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              ref="deptTreeRef"
              node-key="id"
              highlight-current
              default-expand-all
              @node-click="handleNodeClick"
            />
          </div>
        </el-col>
        <!--用户数据-->
        <el-col :span="20" :xs="24">
          <el-form
            :model="queryParams"
            ref="queryRef"
            :inline="true"
            label-width="68px"
          >
            <el-form-item label="用户姓名" prop="realName">
              <el-input
                v-model="queryParams.realName"
                placeholder="请输入用户姓名"
                clearable
                style="width: 240px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="用户账号" prop="userName">
              <el-input
                v-model="queryParams.userName"
                placeholder="请输入用户账号"
                clearable
                style="width: 240px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <!-- <el-form-item label="手机号码" prop="phoneNumber">
              <el-input
                v-model="queryParams.phoneNumber"
                placeholder="请输入手机号码"
                clearable
                style="width: 240px"
                @keyup.enter="handleQuery"
              />
            </el-form-item> -->
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery"
                >搜索</el-button
              >
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <vxe-table
            border
            ref="tableRef"
            height="400"
            :data="userList"
            :radio-config="{ highlight: true }"
            @radio-change="radioChangeEvent"
            @checkbox-all="selectAllChangeEvent"
            @checkbox-change="selectChangeEvent"
          >
            >
            <vxe-column :type="props.type" width="60"></vxe-column>
            <vxe-column field="realName" title="用户姓名"></vxe-column>
            <vxe-column field="userName" title="用户账号"></vxe-column>
            <vxe-column
              field="deptName"
              title="部门"
              show-overflow
            ></vxe-column>
            <vxe-column field="phoneNumber" title="手机号码"></vxe-column>
          </vxe-table>
          <vxe-pager
            :layouts="[
              'Total',
              'Sizes',
              'PrevPage',
              'Number',
              'NextPage',
              'FullJump',
            ]"
            :current-page="queryParams.pageNum"
            :page-size="queryParams.pageSize"
            style="margin-top: 10px"
            size="mini"
            :total="total"
            @page-change="handlePageChange"
          >
          </vxe-pager>
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  changeUserStatus,
  listUser,
  resetUserPwd,
  delUser,
  getUser,
  updateUser,
  addUser,
  deptTreeSelect,
} from "@/api/system/user";
import { getSelectData } from "../../utils";

const props = defineProps(["dialogVisible", "type"]);
const emit = defineEmits(["selectData", "closeDialog"]);
const { proxy } = getCurrentInstance();

const tableRef = ref();
const selectRow = ref(null);
let deptName = ref("");
let userList = ref([]);
let deptOptions = ref([]);
let total = ref(0);
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    realName: undefined,
    userName: undefined,
    phoneNumber: undefined,
  },
});
const { queryParams, form } = toRefs(data);
//挂载完成之后获取表格数据
onMounted(() => {
  getDeptTree();
  getList();
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
  if (selectRow.value) {
    console.log(selectRow.value);
    emit("selectData", selectRow.value);
    close();
  } else {
    ElMessage({
      message: "请选择用户",
      type: "error",
    });
  }
};
//查询部门数据
const getDeptTree = () => {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data;
  });
};
//查询用户列表
const getList = () => {
  listUser(proxy.addDateRange(queryParams.value)).then((res) => {
    userList.value = res.rows;
    total.value = res.total;
  });
};
//通过条件过滤节点
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
//节点单击事件
const handleNodeClick = (data) => {
  queryParams.value.deptId = data.id;
  handleQuery();
};
//搜索按钮操作
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
//重置按钮操作
const resetQuery = () => {
  proxy.resetForm("queryRef");
  queryParams.value.deptId = undefined;
  proxy.$refs.deptTreeRef.setCurrentKey(null);
  handleQuery();
};
const radioChangeEvent = ({ row }) => {
  const { realName, userId } = row || {};
  selectRow.value = { realName, userId };
};
const handlePageChange = ({ currentPage, pageSize }) => {
  queryParams.value.pageNum = currentPage;
  queryParams.value.pageSize = pageSize;
  getList();
};
const selectAllChangeEvent = ({ checked }) => {
  const $table = tableRef.value;
  if ($table) {
    const records = $table.getCheckboxRecords();
    selectRow.value = getSelectData(records);
  }
};
const selectChangeEvent = ({ checked }) => {
  const $table = tableRef.value;
  if ($table) {
    const records = $table.getCheckboxRecords();
    selectRow.value = getSelectData(records);
  }
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  