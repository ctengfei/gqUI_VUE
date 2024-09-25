<template>
  <div class="container">
    <div class="settings-top">
      <li>
        <span>渠道：</span>
        <el-select v-model="spChanCode" class="m-2" placeholder="请选择渠道">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </li>
      <el-radio-group v-model="curRadio" class="btn-group" @change="handoff">
        <el-radio-button label="table" >表格</el-radio-button>
        <el-radio-button label="waterChart" >灌区水量柱状图</el-radio-button>
        <el-radio-button label="qChart" >灌溉流量图</el-radio-button>
      </el-radio-group>
    </div>
    <div class="line-box" v-show="curRadio === 'qChart'">
      <el-select v-model="curChanCode" placeholder="请选择灌区" @change="getChange">
          <el-option
            v-for="item in chanOptions"
            :key="item.value"
            :label="item.chanName"
            :value="item.chanCode"
          />
        </el-select>
    </div>
    <div v-show="curRadio === 'table'">
      <div class="operate-btn">
        <el-button
          type="warning"
          v-if="props.isHasBtn === 'export'"
          @click="exportData"
          :icon="Download"
          >导出</el-button
        >
      </div>
      <vxe-table
        border
        show-overflow
        height="350"
        ref="xTable"
        :column-config="{ resizable: false }"
        :edit-config="{ trigger: 'manual', mode: 'row' }"
        :data="tableData"
      >
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="spChanName" title="上级水利工程名称" align="center">
        </vxe-column>
        <vxe-column field="chanName" title="分水口/渠道名称" align="center">
        </vxe-column>
        <vxe-column field="iwr" title="灌溉水量(万m³)" align="center">
          <template #default="{ row }">
            <span>{{row.iwr/10000}}</span>
          </template>
        </vxe-column>
        <vxe-column field="qirr" title="灌溉流量(m³/s)" align="center">
        </vxe-column>
        <vxe-column field="tm1" title="起始时间" align="center"> </vxe-column>
        <vxe-column field="tm2" title="结束时间" align="center"> </vxe-column>
        <vxe-column field="timestep" title="时长(小时)" align="center">
        </vxe-column>
      </vxe-table>
    </div>
    <div
      v-show="curRadio === 'waterChart'"
      class="bar-chart"
      ref="barChart"
    ></div>
    <div
      v-show="curRadio === 'qChart'"
      class="line-chart"
      ref="xsChart"
    ></div>
    <div class="footer">
      <el-button type="primary" size="default" @click="handleComputation"
        >计算</el-button
      >
      <el-button
        type="primary"
        v-if="props.isHasBtn === 'prevBtn'"
        size="default"
        @click="prevStep"
        >上一步</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import * as echarts from "echarts";
import {
  getResultList,
  getWaterResource,
  getStatistics,
  getAllocationWraBtn,
} from "@/api/scheSchemeData";
import { ElLoading } from "element-plus";

const emits = defineEmits(["changeStep"]);
const props = defineProps(["allocCode", "isHasBtn", "currentRow"]);
const options = ref([{ label: "阳武干渠", value: "CT42120001" }]);
let downloadLoadingInstance = null;
let curRadio = ref("table");
const xTable = ref();
const xsChart = ref();
const barChart = ref();
const spChanCode = ref("CT42120001");
let tableData = ref([]);
let barData = ref({ xData: [], yData: [] });
let seriesData = ref([]);
let timeData = ref([]);
let chanOptions = ref([]);
const curChanCode = ref("");
const curChanName = ref("");
const allLineList=ref([]);//流量全部数据
const { proxy } = getCurrentInstance();

const handoff = (val) => {
  curRadio.value = val;
};

//上一步
const prevStep = () => {
  emits("changeStep", -1);
};
onBeforeMount(() => {
  getTableData();
  resourceData();
});

const setBarChart = () => {
  const bar = echarts.init(barChart.value);
  //灌区量柱状图
  bar.setOption(
    {
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
          name: "分水口/渠道",
          type: "category",
          data: barData.value.xData,
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      yAxis: [
        {
          name: "水量(万m³)",
          type: "value",
        },
      ],
      series: [
        {
          name: "灌溉水量(万m³)",
          type: "bar",
          barWidth: "10%",
          data: barData.value.yData,
        },
      ],
    },
    true
  );
};
const setLineChart = () => {
  const lines = echarts.init(xsChart.value);
  //灌溉流量图
  lines.setOption(
    {
      grid: {
        left: "4%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        name: "时间",
        type: "category",
        boundaryGap: false,
        data: timeData.value,
      },
      tooltip: {
        trigger: "axis",
        valueFormatter: function (value) {
              return value + '(m³/s)';
            }
      },
      yAxis: {
        name: "流量(m³/s)",
        type: "value",
      },
      series: seriesData.value,
    },
    true
  );
};

// 计算
const handleComputation = () => {
  downloadLoadingInstance = ElLoading.service({
    text: "数据计算中，请稍候",
    background: "rgba(0, 0, 0, 0.7)",
  });
  getAllocationWraBtn({
    allocCode: props.allocCode,
    iimsWaterAllocationStartTime: props.currentRow.iimsWaterAllocationStartTime,
  })
    .then((res) => {
      if (res.success) {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          getTableData();
          resourceData();
          downloadLoadingInstance.close();
        }, 5000);
      }
    })
    .catch((e) => {
      downloadLoadingInstance.close();
    });
};

//列表数据
const getTableData = () => {
  const params = {
    pageNum: 1,
    pageSize: 9999,
    allocCode: props.allocCode,
    spChanCode: spChanCode.value,
  };
  getResultList(params).then((res) => {
    if (res.success) {
      tableData.value = res.data;
    }
  });
};
function dateData() {
  return function (a, b) {
    return Date.parse(a) - Date.parse(b);
  };
}
const getTimeData = (obj, key) => {
  timeData.value=[]
  obj[key].map((curItem) => {
    if (!timeData.value.includes(curItem.tm1)) {
      timeData.value.push(curItem.tm1);
    }
    if (!timeData.value.includes(curItem.tm2)) {
      timeData.value.push(curItem.tm2);
    }
  });
};
const getYData = (obj, key) => {
  let arr = []
  obj[key].map(curItem => {
    if (curItem.tm1) {
      arr.push(curItem.qirr)
    }
    if (curItem.tm2) {
      arr.push(curItem.qirr,)
    }
  })
  return arr
};
//灌溉量柱状图数据
const resourceData = () => {
  const params = {
    pageNum: 1,
    pageSize: 9999,
    allocCode: props.allocCode,
    spChanCode: spChanCode.value,
  };
  Promise.all([getWaterResource(params), getStatistics(params)]).then((arr) => {
    if (arr && arr.length > 0) {
      //柱状图
      const list = arr[0].data;
      barData.value.xData = list.map((item) => item.chanName);
      barData.value.yData = list.map((item) => (item.wirr/10000));
      setBarChart();

      //灌溉流量图
      allLineList.value=arr[1].data
      const obj = arr[1].data;
      let keyArr = Object.keys(obj);
      let newArr=[]
      keyArr.map((item) => {
        newArr.push(obj[item][0])
      });
      chanOptions.value=newArr
      if(newArr&&newArr.length>0){
        curChanCode.value=newArr[0].chanCode
        curChanName.value=newArr[0].chanName
      }
      setSeriesData(curChanCode.value,curChanName.value)
    }
  });
};
const getChange=(e)=>{
  curChanCode.value=e
  curChanName.value=chanOptions.value.find(item=>item.chanCode===e)?.chanName
  setSeriesData(curChanCode.value,curChanName.value)
}
const setSeriesData=(code,name)=>{
  getTimeData(allLineList.value, code);
  timeData.value = timeData.value.sort(dateData());
  seriesData.value=[
      {
            name,
            data: getYData(allLineList.value,code),
            type: "line",
            showSymbol: false,
            smooth: true,
            color:"rgba(23, 145, 255, 1)",
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgba(51, 196, 255, 0.30)",
                },
                {
                  offset: 1,
                  color: "rgba(23, 145, 255, 0)",
                },
              ]),
            },
            lineStyle: {
              color: "rgba(23, 145, 255, 1)",
            },
          }
      ]
      setLineChart()
}
const exportData = () => {
  const params = {
    pageNum: 1,
    pageSize: 9999,
    allocCode: props.allocCode,
    spChanCode: spChanCode.value,
  };
  proxy.download(
    "/bim/irrWaterResource/resultIrrAllocationReal/page/export",
    params,
    `动态配水结果_${new Date().getTime()}.xlsx`
  );
};
</script>

<style lang="scss" scoped>
.container {
  .settings-top {
    display: flex;
    margin: 10px 0;

    li {
      display: flex;
      align-items: center;

      span {
        white-space: nowrap;
      }
    }

    .btn-group {
      margin-left: 30px;
    }
  }
.line-box{
  text-align: right;
  margin-right: 60px;
}
  .operate-btn {
    text-align: right;
    margin-bottom: 10px;
  }

  .bar-chart,
  .line-chart {
    width: 82vw;
    height: 40vh;
  }

  .footer {
    text-align: center;
    margin-top: 30px;
  }
}
</style>
