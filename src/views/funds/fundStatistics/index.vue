<template>
  <div class="app-container">
    <pro-form
      v-model="form"
      :columns="columns"
      :menu="menu"
      inline
      @submit="submit"
      @reset="searchReset"
    />
    <div class="content">
      <div class="left" ref="barChart"></div>
      <div class="right" ref="xsChart"></div>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      max-height="300"
      row-key="id"
      default-expand-all
    >
      <el-table-column prop="manUnitName" label="管理单位" />
      <el-table-column prop="projectName" label="项目名称" />
      <el-table-column prop="projectType" label="项目类型">
        <template #default="{ row }">
          {{ formatterVal(row, "project_type_list", "projectType") }}
        </template>
      </el-table-column>
      <el-table-column prop="projectStartDate" label="开始日期" />
      <el-table-column prop="planCompDate" label="完成日期" />
      <el-table-column prop="planFunds" label="计划金额(万元)" />
      <el-table-column prop="actualFunds" label="实际金额(万元)" />
      <el-table-column prop="planRate" label="计划完成率(%)" />
      <el-table-column fixed="right" label="操作" width="100">
        <template #default="{ row }">
          <el-button
            type="primary"
            v-if="row?.id"
            @click="handleDetail(row)"
            link
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <StatisticDialog
      v-if="dialogVisible"
      :dialogVisible="dialogVisible"
      @closeDialog="dialogVisible = false"
      :formData="formData"
    />
  </div>
</template>

<script setup>
import { formatterVal } from "@/utils";
import * as echarts from "echarts";
import { nextTick, onMounted, ref, reactive, computed } from "vue";
import {
  defineFormColumns,
  defineFormMenuColumns,
  defineFormSubmit,
  defineTableIndexColumns,
  defineTableMenuColumns,
} from "element-pro-components";
import dayjs from "dayjs";
import { getFundStatisticsApi, getAmountApi, getUnitApi } from "../apis";
import { deptTreeSelect } from "@/api/system/user";
import { StatisticDialog } from "../components";
import { getList } from "../utils";

//获取proxy
const { proxy } = getCurrentInstance();
const { project_type_list } = proxy.useDict("project_type_list");
const menu = defineFormMenuColumns({
  submitText: "查询",
  resetText: "重置",
  resetProps: {
    icon: "Refresh",
  },
  submitProps: {
    type: "primary",
    icon: "Search",
  },
});
const columns = defineFormColumns(
  computed(() => [
    {
      label: "日期",
      prop: "projectDate",
      component: "el-date-picker",
      props: {
        clearable: true,
        type: "daterange",
        "start-placeholder": "开始时间",
        "end-placeholder": "结束时间",
        "value-format": "YYYY-MM-DD",
      },
    },
    {
      label: "管理单位",
      prop: "manUnitId",
      component: "el-tree-select",
      props: {
        data: deptOptions.value || [],
        style: { width: "100%" },
        clearable: true,
        checkStrictly: true,
        valueKey: "id",
        "default-expand-all": true,
      },
    },
    {
      label: "项目类型",
      prop: "projectType",
      component: "pro-select",
      props: {
        clearable: true,
        data: project_type_list.value || [],
        style: { width: "100%" },
      },
    },
  ])
);
const submit = defineFormSubmit((done, isValid, invalidFields) => {
  getAmountData();
  getData();
  done();
});
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});
const tableMenu = defineTableMenuColumns({
  label: "操作",
  align: "center",
});

//当前查看数据
let formData = ref({});
let tableData = ref([{}]);
let deptOptions = ref([]); //部门数据
//详情弹窗显隐
let dialogVisible = ref(false);
let curManUnitId = ref("");
let form = ref({
  projectDate: [
    dayjs().subtract(1, "year").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD"),
  ],
});
//金额柱状图表
const barChart = ref();
//单位经费排名柱状图表
const xsChart = ref();
//金额数据
let barData = ref({});
//单位经费数据
let xsBarData = ref({ yData: [] });
//计划完成率
const labelSetting = {
  show: true,
  position: "right",
  offset: [0, 10],
  formatter: function (param) {
    return xsBarData.value.xsBarLabelData[param.dataIndex] + "%";
  },
  fontSize: 18,
  fontFamily: "Arial",
};
//挂载完成之后获取表格数据
onMounted(() => {
  getDeptTree();
});
//重置
const searchReset = () => {
  form.value.manUnitId = curManUnitId.value;
  getData();
  getAmountData();
};
//获取表格数据
const getData = () => {
  const { projectDate, manUnitId, ...rest } = form.value || {};
  getFundStatisticsApi({
    ...rest,
    manUnitId: manUnitId || curManUnitId.value,
    startTime: projectDate && projectDate[0],
    endTime: projectDate && projectDate[1],
  }).then((res) => {
    if (res.success) {
      tableData.value = res.data;
    }
  });
};
//获取金额数据
const getAmountData = () => {
  const { projectDate, manUnitId, ...rest } = form.value || {};
  getAmountApi({
    ...rest,
    manUnitId: manUnitId || curManUnitId.value,
    startTime: projectDate && projectDate[0],
    endTime: projectDate && projectDate[1],
  }).then((res) => {
    if (res.success) {
      getUnitData();
      const result = res.data;
      barData.value = {
        xData: getList(result, "year"),
        yData1: getList(result, "planFunds"),
        yData2: getList(result, "actualFunds"),
      };
      setChart1();
    }
  });
};
//获取管理单位经费统计数据
const getUnitData = () => {
  const { projectDate, manUnitId, ...rest } = form.value || {};
  getUnitApi({
    ...rest,
    manUnitId: manUnitId || curManUnitId.value,
    startTime: projectDate && projectDate[0],
    endTime: projectDate && projectDate[1],
  }).then((res) => {
    if (res.success) {
      const result = res.data;
      xsBarData.value = {
        yData: getList(result, "manUnitName"),
        xsBarLabelData: getList(result, "planRate"),
        yData1: getList(result, "planFunds"),
        yData2: getList(result, "actualFunds"),
      };
      setChart2();
    }
  });
};

const handleDetail = (row) => {
  dialogVisible.value = true;
  formData.value = row || {};
};
//查询部门下拉树结构
const getDeptTree = () => {
  deptTreeSelect().then((response) => {
    const list = response.data || [];
    //搜索管理单位设置默认值
    if (list && list?.length > 0) {
      form.value.manUnitId = list[0]?.id;
      curManUnitId.value = list[0]?.id;
      getAmountData();
      getData();
    }
    deptOptions.value = response.data;
  });
};
//金额柱状图
const setChart1 = () => {
  const bar = echarts.init(barChart.value);
  //金额柱状图
  bar.setOption(
    {
      title: {
        text: "金额/万元",
      },
      legend: { data: ["计划金额", "实际金额"] },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "8%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: barData.value.xData,
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      series: [
        {
          name: "计划金额",
          type: "bar",
          barWidth: "15",
          data: barData.value.yData1,
          itemStyle: {
            normal: {
              barBorderRadius: [10, 10, 0, 0], // 设置柱状图圆角
            },
          },
        },
        {
          name: "实际金额",
          type: "bar",
          barWidth: "15",
          data: barData.value.yData2,
          itemStyle: {
            normal: {
              barBorderRadius: [10, 10, 0, 0], // 设置柱状图圆角
            },
          },
        },
      ],
    },
    true
  );
};
//单位经费排名柱状图
const setChart2 = () => {
  const xsBar = echarts.init(xsChart.value);
  //管理单位柱状图
  xsBar.setOption(
    {
      title: {
        text: "管理单位经费统计",
      },
      legend: {},
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "8%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        show: false,
        boundaryGap: [0, 0.01],
      },
      yAxis: {
        inverse: true, //如果数据数组倒置排序，加上此代码
        data: xsBarData.value.yData,
        offset: 5,
        axisLabel: {
          fontSize: 18,
          color: "#5DB3DC",
          margin: 5, // 距离右侧图形距离，配合axisLabel.left 和 grid.left 使用
          align: "right",
          rich: {
            a1: {
              color: "#fff",
              backgroundColor: "#EA2739",
              width: 18,
              height: 18,
              align: "center",
              borderRadius: 4,
            },
            a2: {
              color: "#fff",
              backgroundColor: "#FF8C40",
              width: 18,
              height: 18,
              align: "center",
              borderRadius: 4,
            },
            a3: {
              color: "#fff",
              backgroundColor: "#FFC600",
              width: 18,
              height: 18,
              align: "center",
              borderRadius: 4,
            },
            a4: {
              color: "#fff",
              backgroundColor: "#3C7DF9",
              width: 18,
              height: 18,
              align: "center",
              borderRadius: 4,
            },
          },
          formatter: (params, index) => {
            // ${" ".repeat(5)} 是添加5个空格
            let result;
            if (index == 0) {
              result = `{a1|${index + 1}}${" ".repeat(2)}${params}`;
            } else if (index == 1) {
              result = `{a2|${index + 1}}${" ".repeat(2)}${params}`;
            } else if (index == 2) {
              result = `{a3|${index + 1}}${" ".repeat(2)}${params}`;
            } else {
              result = `{a4|${index + 1}}${" ".repeat(2)}${params}`;
            }
            return result;
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          //修改背景线条样式
          show: false,
        },
      },
      series: [
        {
          name: "计划金额",
          type: "bar",
          barWidth: "15",
          label: labelSetting,
          data: xsBarData.value.yData1,
        },
        {
          name: "实际金额",
          type: "bar",
          barWidth: "15",
          data: xsBarData.value.yData2,
        },
      ],
    },
    true
  );
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>

