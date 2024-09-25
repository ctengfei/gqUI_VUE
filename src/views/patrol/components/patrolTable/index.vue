<template>
  <div class="app-container" v-if="!isShowResult">
    <pro-crud
      ref="crudRef"
      v-model:search="searchForm"
      :columns="columns"
      :index="index"
      :detail="detail"
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
      :column="1"
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
        <el-button
          v-if="['1', '2'].includes(row.status)"
          icon="Document"
          link
          :size="size"
          @click="look(row)"
          type="success"
          >查看结果</el-button
        >
      </template>
    </pro-crud>
  </div>
  <Result @returnPage="isShowResult = false" :id="nodeId" v-if="isShowResult" />
</template>
  
  <script setup>
import Result from "../result";
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
import { detailMenu, patrolStatus } from "../../constant";
import { getPatrolPlanApi } from "../../apis";
import { formatterVal } from "@/utils";
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
const props = defineProps(["type"]);
const { proxy } = getCurrentInstance();
const { PATROL_TYPE } = proxy.useDict("PATROL_TYPE");

//表格配置数据
const columns = defineCrudColumns([
  {
    label: "巡查工程名称",
    prop: "engName",
    detail: true,
    width: "200px",
  },
  {
    label: "巡查状态",
    prop: "status",
    component: "pro-select",
    props: {
      data: patrolStatus,
      style: { width: "100%" },
      clearable:true,
    },
    render: (row) => {
      return (
        patrolStatus.filter((item) => item.value === row.status)[0].label || ""
      );
    },
    width: "100px",
    search: true,
  },
  {
    label: "检查类别",
    prop: "patrolType",
    component: "pro-select",
    props: {
      data: PATROL_TYPE.value || [],
      style: { width: "100%" },
      clearable:true,
    },
    render: (row) => {
      return formatterVal(row, "PATROL_TYPE", "patrolType");
    },
    // search: true,
    detail: true,
    width: "100px",
  },
  {
    label: "巡查范围",
    prop: "patrolRange",
    detail: true,
    hide: true,
  },
  {
    label: "巡查区域",
    prop: "region",
    width: "300px",
    render: (row) => {
      return `起点 ${row.startPoint} 终点 ${row.endPoint}`;
    },
    detail: true,
  },
  {
    label: "巡查人",
    prop: "patrolUserName",
    detail: true,
    width: "100px",
  },
  {
    label: "计划巡查时间",
    prop: "planPatrolTime",
    detail: !props.type,
    hide: props.type === "special",
    width: "120px",
  },
  {
    label: "巡查详情描述",
    prop: "patrolDesc",
    detail: true,
  },
]);
//操作按钮配置
const menu = defineCrudMenuColumns(detailMenu);
//序号
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});
let detail = ref({});
let nodeId = ref("");
let isShowResult = ref(false);
//挂载完成之后获取表格数据
onMounted(() => {
  getData();
});
//获取表格数据
const getData = () => {
  const { status } = searchForm.value;
  getPatrolPlanApi({
    status: status || [0, 1, 2] + "",
    patrolType: props.type === "special" ? "4" : [1, 2, 3] + "",
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
  detail.value = row || {};
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
//查看结果
const look = (row) => {
  nodeId.value = row.id;
  isShowResult.value = true;
};
</script>
  
  <style lang="scss" scoped>
@import "./index.scss";
</style>
  
  