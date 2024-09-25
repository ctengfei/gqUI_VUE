<template>
  <div class="app-container">
    <ProjectList :projectData="projectData" />
    <div class="table-container">
      <pro-crud
        ref="crudRef"
        v-model:search="searchForm"
        :columns="columns"
        :search-columns="searchColumns"
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
        :fit="true"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        @search="searchSubmit"
        @search-reset="searchReset"
      >
        <template #form-menu-right="{ size }">
          <el-button :size="size" @click="crudRef.closeDialog()">
            关闭
          </el-button>
        </template>
        <template #search-menu-right="{}">
          <span style="margin-left: 30px">
            <el-button type="success" plain icon="Download" @click="exportData"
              >导出</el-button
            >
          </span>
        </template>
      </pro-crud>
    </div>
    <InfoDialog
      v-if="logDialogVisible"
      type="detail"
      title="查看"
      :dialogVisible="logDialogVisible"
      @closeDialog="logDialogVisible = false"
      :deptOptions="deptOptions"
      :recordData="recordData"
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
import { ProjectList } from "@/views/funds/components";
import { InfoDialog } from "../components";
import {
  PROJECT_TYPE,
  statisticsColumns,
  statisticsMenu,
} from "../constant.js";
import dayjs from "dayjs";
import { getStatisticsApi, getControlByIdApi } from "../apis";
import { deptTreeSelect } from "@/api/system/user";
import { changeJsonFiles } from "@/views/maintenance/utils";

//表格配置数据
const columns = defineCrudColumns(computed(() => statisticsColumns));
//操作按钮配置
const menu = defineCrudMenuColumns(statisticsMenu);
//获取proxy
const { proxy } = getCurrentInstance();
//序号
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});
//当前行数据
let recordData = ref({});
let logDialogVisible = ref(false); //查看弹窗显隐
//项目统计数据
let projectData = reactive(PROJECT_TYPE);
//表格实例
const crudRef = ref();
//表单搜索数据
const searchForm = ref({ declare: null, tm: [] });
//表格数据
let data = ref([]);
//分页数据
let pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});
let deptOptions = ref([]); //部门数据
const searchColumns = ref(
  computed(() => [
    {
      label: "日期",
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
        style: { width: "100%" },
        "value-key": "id",
        "default-expand-all": true,
      },
      prop: "checkUnitId",
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
  getStatisticsApi({
    ...rest,
    startTime: checkTime && checkTime[0],
    endTime: checkTime && checkTime[1],
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
  }).then((res) => {
    if (res.success) {
      data.value = res.data.pageData.data || [];
      projectData = projectData.map((item) => {
        return {
          ...item,
          value: res.data[item.key],
        };
      });
      pagination.total = res.data.pageData.total;
    }
  });
};
// 分页选择
const load = () => {
  getData();
};
//弹窗开启之前
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  getControlByIdApi(row.id).then((res) => {
    if (res.success) {
      logDialogVisible.value = true;
      const { checkStartTime, checkEndTime, attachment, ...rest } =
        res.data || {};
      recordData.value = {
        ...rest,
        attachment: changeJsonFiles(attachment),
        checkTime: [checkStartTime, checkEndTime],
      };
    }
  });
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
//查询部门下拉树结构
const getDeptTree = () => {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data;
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
    "/business/standard/termiteControlRecords/page/exportStatisticsData",
    params,
    `防治情况统计_${dayjs().format("YYYY-MM-DD")}.xlsx`
  );
};
</script>
  
  <style lang="scss" scoped>
@import "./index.scss";
</style>
  
  