<template>
  <div class="app-container">
    <pro-crud
      ref="crudRef"
      v-model:search="searchForm"
      :columns="columns"
      :index="index"
      :menu="menu"
      :data="tableData"
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.pageSize"
      layout="->,total,sizes,prev, pager, next, jumper"
      @load="load"
      background
      :page-sizes="[10, 20, 30, 40, 50]"
      :total="pagination.total"
      :before-open="beforeOpen"
      label-width="100px"
      :column="2"
      :width="800"
      @search="searchSubmit"
      @search-reset="searchReset"
    >
      <template #form-menu-right="{ size }">
        <el-button :size="size" @click="crudRef.closeDialog()">
          关闭
        </el-button>
      </template>
      <template #menu="{ size, row }">
        <el-popconfirm title="确定删除吗" @confirm="handleDelete(row)">
          <template #reference>
            <el-button icon="Delete" link :size="size" type="danger"
              >删除</el-button
            >
          </template>
        </el-popconfirm>
      </template>
      <template #search-menu-right="{}">
        <span style="margin-left: 30px">
          <el-button type="primary" plain icon="Plus" @click="addDialog"
            >新增</el-button
          >
        </span>
      </template>
    </pro-crud>
    <DeviceDialog
      v-if="dialogVisible"
      :type="dialogType"
      :title="dialogTitle[dialogType]"
      :dialogVisible="dialogVisible"
      @closeDialog="closeDialog"
      :deptOptions="deptOptions"
      :formData="formData"
    />
  </div>
</template>
  
  <script setup>
import { nextTick, onMounted, ref, reactive, computed } from "vue";
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineTableIndexColumns,
  defineCrudBeforeOpen,
  defineCrudBeforeClose,
} from "element-pro-components";
import dayjs from "dayjs";
import { editMenu } from "../constant";
import { getProtectRecordsApi, delProtectRecordsApi } from "../apis";
import { deptTreeSelect } from "@/api/system/user";
import { formatterVal } from "@/utils";
import { DeviceDialog } from "../components";
//表格实例
const crudRef = ref();
//表单搜索数据
const searchForm = ref({});
//表格数据
let tableData = ref([]);
//分页数据
let pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});
let formData = ref({});
let deptOptions = ref([]); //部门数据
//弹窗类型
let dialogType = ref("add");
//弹窗显隐
let dialogVisible = ref(false);
//弹窗标题
const dialogTitle = ref({
  add: "新增",
  edit: "编辑",
  detail: "查看",
});
const props = defineProps(["type"]);
const { proxy } = getCurrentInstance();
const { PATROL_TYPE } = proxy.useDict("PATROL_TYPE");

//表格配置数据
const columns = defineCrudColumns(
  computed(() => [
    {
      label: "设备名称",
      prop: "deviceName",
      width: "200px",
    },
    {
      label: "主管部门",
      prop: "admDep",
      component: "el-tree-select",
      props: {
        data: deptOptions.value || [],
        style: { width: "100%" },
        checkStrictly: true,
        clearable: true,
        valueKey: "id",
        "default-expand-all": true,
      },
      render: (row) => row.admDepName || "",
      search: true,
      width: "200px",
    },
    {
      label: "养护人",
      prop: "protectName",
      component: "el-input",
      width: "180px",
      search: true,
    },
    {
      label: "养护时间",
      prop: "time",
      component: "el-date-picker",
      props: {
        clearable: true,
        type: "daterange",
        "start-placeholder": "开始时间",
        "end-placeholder": "结束时间",
        "value-format": "YYYY-MM-DD",
      },
      search: true,
      hide: true,
    },
    {
      label: "养护时间",
      prop: "curingTime",
      render: (row) => {
        return row?.curingTime
          ? dayjs(row.curingTime).format("YYYY-MM-DD")
          : "--";
      },
      width: "200px",
    },
    {
      label: "问题描述",
      prop: "describe",
    },
  ])
);
//操作按钮配置
const menu = defineCrudMenuColumns(editMenu);
//序号
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});

//挂载完成之后获取表格数据
onMounted(() => {
  getDeptTree();
  getData();
});
//获取表格数据
const getData = () => {
  const { time, ...rest } = searchForm.value || {};
  getProtectRecordsApi({
    ...rest,
    startTime: time && time[0],
    endTime: time && time[1],
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
  }).then((res) => {
    if (res.success) {
      tableData.value = res.data.data;
      pagination.total = res.data.total;
    }
  });
};
// 分页选择
const load = () => {
  getData();
};
//弹窗开启之前
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  dialogVisible.value = true;
  dialogType.value = type;
  formData.value = row;
});
//搜索
const searchSubmit = defineCrudSearch((done) => {
  getData();
  done();
});
//关闭弹窗
const closeDialog = (flag = false) => {
  if (flag) {
    getData();
  }
  dialogVisible.value = false;
};
//新增弹窗
const addDialog = () => {
  dialogType.value = "add";
  dialogVisible.value = true;
  formData.value = {};
};
//重置
const searchReset = () => {
  pagination.pageNum = 1;
  getData();
};
//删除
const handleDelete = (row) => {
  delProtectRecordsApi(row.id).then((res) => {
    if (res.success) {
      getData();
    }
  });
};
//查询部门下拉树结构
const getDeptTree = () => {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data;
  });
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  