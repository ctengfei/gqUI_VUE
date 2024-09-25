<template>
  <div class="app-container">
    <div class="table-container">
      <pro-crud
        v-model:search="searchForm"
        :columns="columns"
        :search-columns="searchColumns"
        :index="index"
        :gutter="20"
        :menu="menu"
        :data="data"
        :detail="detail"
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
        @search="searchSubmit"
        @search-reset="searchReset"
      >
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
        <template #menu="{ size, row }">
          <el-popconfirm title="确定删除吗" @confirm="handleDelete(row)">
            <template #reference>
              <el-button icon="Delete" link :size="size" type="danger"
                >删除</el-button
              >
            </template>
          </el-popconfirm>
        </template>
        <template #crud-dialog="{}">
          <InfoDialog
            v-if="dialogVisible"
            :type="dialogType"
            :title="dialogTitle[dialogType]"
            :dialogVisible="dialogVisible"
            @closeDialog="closeDialog"
            :deptOptions="deptOptions"
            :recordData="recordData"
          />
        </template>
      </pro-crud>
    </div>
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
import { recordColumns, recordMenu } from "../constant";
import { InfoDialog } from "../components";
import { changeJsonFiles } from "@/views/maintenance/utils";
import {
  getControlRecordsApi,
  delControlRecordsApi,
  getControlByIdApi,
} from "../apis";
import { deptTreeSelect } from "@/api/system/user";

//获取proxy
const { proxy } = getCurrentInstance();
//表格配置数据
const columns = defineCrudColumns(computed(() => recordColumns));
//操作按钮配置
const menu = defineCrudMenuColumns(recordMenu);
//序号
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});
//弹窗详情数据
const detail = ref({});
//表单搜索数据
const searchForm = ref({});
//表格数据
let data = ref([]);
//当前行数据
let recordData = ref({});
//弹窗显隐
let dialogVisible = ref(false);
//分页数据
let pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});
let deptOptions = ref([]); //部门数据
//弹窗标题
const dialogTitle = ref({
  add: "新增",
  edit: "编辑",
  detail: "查看",
});
//弹窗类型
let dialogType = ref("add");
const searchColumns = ref(
  computed(() => [
    {
      label: "检查时间",
      prop: "checkTime",
      component: "el-date-picker",
      props: {
        type: "daterange",
        clearable:true,
        "start-placeholder": "开始时间",
        "end-placeholder": "结束时间",
        "value-format": "YYYY-MM-DD",
      },
    },
    {
      label: "检查单位",
      component: "el-tree-select",
      props: {
        data: deptOptions.value || [],
        checkStrictly: true,
        clearable:true,
        valueKey: "id",
        "default-expand-all": true,
      },
      prop: "checkUnitId",
    },
    {
      label: "搜索",
      component: "el-input",
      prop: "keyword",
      props: {
        placeholder: "检查地点、部位、桩号",
      },
    },
  ])
);
//挂载完成之后获取表格数据
onMounted(() => {
  getDeptTree();
  getData();
});
//获取表格数据
const getData = () => {
  const { checkTime, ...rest } = searchForm.value;
  getControlRecordsApi({
    ...rest,
    startTime: checkTime && checkTime[0],
    endTime: checkTime && checkTime[1],
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
  dialogType.value = type;
  getControlByIdApi(row.id).then((res) => {
  dialogVisible.value = true;
    if (res.success) {
      const { checkStartTime, checkEndTime, attachment, ...rest } =
        res.data || {};
      recordData.value = {
        ...rest,
        checkTime: [checkStartTime, checkEndTime],
        attachment: changeJsonFiles(attachment),
      };
    }
  });
  done();
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
    getData();
  }
  dialogVisible.value = false;
};
//新增弹窗
const addDialog = () => {
  dialogType.value = "add";
  dialogVisible.value = true;
  recordData.value = {};
};
//查询部门下拉树结构
const getDeptTree = () => {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data;
  });
};
//删除
const handleDelete = (row) => {
  delControlRecordsApi(row.id).then((res) => {
    if (res.success) {
      getData();
    }
  });
};
//表格导出
const exportData = () => {
  const { checkTime, ...rest } = searchForm.value;
  const params = {
    ...rest,
    startTime: checkTime && checkTime[0],
    endTime: checkTime && checkTime[1],
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
  };
  proxy.download(
    "/business/standard/termiteControlRecords/page/export",
    params,
    `防治记录管理_${dayjs().format("YYYY-MM-DD")}.xlsx`
  );
};
</script>
  
  <style lang="scss" scoped>
@import "./index.scss";
</style>
  
  