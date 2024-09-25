<template>
  <div class="app-container">
    <pro-form
      v-model="form"
      :columns="columns"
      :menu="menu"
      inline
      @submit="submit"
    />
    <NavList :navData="navData" />
    <div class="content">
      <div class="left" ref="barChart1"></div>
      <div class="right" ref="barChart2"></div>
    </div>
  </div>
</template>
  
  <script setup>
import { nextTick, onMounted, ref, reactive, computed } from "vue";
import { NavList } from "../components";
import { statisticData } from "../constant";
import { getStatisticsApi } from "../apis";
import {
  defineFormColumns,
  defineFormMenuColumns,
  defineFormSubmit,
  defineTableIndexColumns,
  defineTableMenuColumns,
} from "element-pro-components";
import dayjs from "dayjs";
import { getArrData, setChart } from "../utils.js";

let navData = ref(statisticData);
let form = ref({ dateTime: dayjs().format("YYYY") });
const barChart1 = ref();
const barChart2 = ref();
const columns = defineFormColumns([
  {
    label: "年份",
    prop: "dateTime",
    component: "el-date-picker",
    props: {
      type: "year",
      clearable: false,
      "value-format": "YYYY",
    },
  },
]);
const menu = defineFormMenuColumns({
  submitText: "查询",
  reset: false,
  submitProps: {
    type: "primary",
    icon: "Search",
  },
});
//挂载完成之后获取数据
onMounted(() => {
  getData();
});
//获取表格数据
const getData = () => {
  const { dateTime } = form.value;
  const params = {
    endTime: `${dateTime}-12`,
    startTime: `${dateTime}-01`,
  };
  getStatisticsApi(params).then((res) => {
    if (res.success) {
      const result = res.data;
      setChart(barChart1, {
        legendData: ["巡查数量", "问题数量"],
        list: result.patrolEvents,
        keys: ["patrolNum", "problemNum"],
        title: "巡查事件处理统计",
      });
      setChart(barChart2, {
        legendData: ["问题数量", "处理数量"],
        list: result.patrolProblems,
        keys: ["problemNum", "processedNum"],
        title: "问题事件类型统计",
      });
      navData.value = navData.value.map((item) => {
        return {
          ...item,
          value: result[item.key],
        };
      });
    }
  });
};
const submit = defineFormSubmit((done, isValid, invalidFields) => {
  getData();
  done();
});
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  