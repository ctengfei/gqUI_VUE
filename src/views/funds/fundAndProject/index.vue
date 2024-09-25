<template>
  <div class="app-container">
    <ProjectList :projectData="projectData" />
    <div class="table-container">
      <pro-crud
        ref="crudRef"
        v-model:search="searchForm"
        :columns="columns"
        :index="index"
        :gutter="20"
        :menu="menu"
        :data="data"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        layout="->,total,sizes,prev, pager, next, jumper"
        background
        :page-sizes="[10, 20, 30, 40, 50]"
        :total="pagination.total"
        @load="load"
        column="2"
        width="52%"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="160px"
        @search="searchSubmit"
        @search-reset="searchReset"
      >
        <template #form-menu-right="{ size }">
          <el-button :size="size" @click="crudRef.closeDialog()">
            关闭
          </el-button>
        </template>
        <template #menu="{ size, row }">
          <el-button
            :size="size"
            icon="Edit"
            type="primary"
            v-if="row.projectStatus !== '2'"
            @click="handleEdit(row)"
            link
          >
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除吗"
            @confirm="handleDelete(row)"
            v-if="row.projectStatus !== '2'"
          >
            <template #reference>
              <el-button link :size="size" icon="Delete" type="danger"
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
            <el-button type="success" plain icon="Download" @click="exportData"
              >导出</el-button
            >
          </span>
        </template>
      </pro-crud>
    </div>
    <InfoDialog
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
import { ProjectList, InfoDialog } from "../components";
import { PROJECT_TYPE, projectColumns, projectMenu } from "../constant.js";
import {
  getFundManageListApi,
  delFundManageApi,
  getProjectStatisticsApi,
} from "../apis";
import { deptTreeSelect } from "@/api/system/user";

//获取proxy
const { proxy } = getCurrentInstance();
const { project_status, project_type_list } = proxy.useDict(
  "project_status",
  "project_type_list"
);

let deptOptions = ref([]); //部门数据
//表格配置数据
const columns = defineCrudColumns(
  computed(() =>
    projectColumns(
      deptOptions.value,
      project_status.value,
      project_type_list.value
    )
  )
);
//操作按钮配置
const menu = defineCrudMenuColumns(projectMenu);

//序号
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});

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
//项目统计数据
let projectData = reactive(PROJECT_TYPE);
//表格实例
const crudRef = ref();
//当前查看数据
let formData = ref({});
//表单搜索数据
const searchForm = ref({});
//表格数据
let data = ref([]);
//分页数据
let pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

//挂载完成之后获取表格数据
onMounted(() => {
  getProjectStatistics();
  getDeptTree();
  getData();
});
//获取表格数据
const getData = () => {
  const { projectDate, ...rest } = searchForm.value || {};
  getFundManageListApi({
    ...rest,
    startTime: projectDate && projectDate[0],
    endTime: projectDate && projectDate[1],
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
  }).then((res) => {
    if (res.success) {
      data.value = res.data.data;
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
  formData.value = row || {};
});
//弹窗关闭之前
const beforeClose = defineCrudBeforeClose((done) => {
  done();
});
//搜索
const searchSubmit = defineCrudSearch((done) => {
  getData();
  done();
});
//重置
const searchReset = () => {
  pagination.pageNum = 1;
  getData();
};
//关闭弹窗
const closeDialog = (flag = false) => {
  if (flag) {
    getProjectStatistics();
    getData();
  }
  dialogVisible.value = false;
};
//新增弹窗
const addDialog = () => {
  dialogType.value = "add";
  formData.value = {};
  dialogVisible.value = true;
};
//查询部门下拉树结构
const getDeptTree = () => {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data;
  });
};
//查询项目类型数量
const getProjectStatistics = () => {
  getProjectStatisticsApi({}).then((res) => {
    if (res.success) {
      projectData = projectData.map((item) => {
        return {
          ...item,
          value: res.data[item.key],
        };
      });
    }
  });
};
// 删除按钮操作
const handleDelete = (row) => {
  delFundManageApi(row.id).then((res) => {
    if (res.success) {
      getProjectStatistics();
      getData();
    }
  });
};
// 编辑按钮操作
const handleEdit = (row) => {
  formData.value = { ...row };
  dialogType.value = "edit";
  dialogVisible.value = true;
};
//表格导出
const exportData = () => {
  const { projectDate, ...rest } = searchForm.value || {};
  const params = {
    ...rest,
    startTime: projectDate && projectDate[0],
    endTime: projectDate && projectDate[1],
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
  };
  proxy.download(
    "/business/standard/fundManage/page/export",
    params,
    `资金项目管理_${dayjs().format("YYYY-MM-DD")}.xlsx`
  );
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>

