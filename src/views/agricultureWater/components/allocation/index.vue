<template>
<div class="allocation">
  <div class="lf">
    <vxe-table
        border
        show-overflow
        ref="xTable"
        keep-source
        style="z-index: 1"
        height="422"
        :column-config="{resizable: false}"
        :edit-config="{trigger: 'click', mode: 'cell'}"
        :data="data">
      <vxe-column field="growthStage" title="水稻生育阶段" align="center">
      </vxe-column>
      <vxe-column field="startDate" title="开始日期" width="180px" align="center" >
        <template #default="{ row }">
          <el-date-picker
              @change="debFunc"
              style="width: 150px"
              v-model="row.startDate"
              format="MM-DD"
              value-format="MM-DD"
              type="date"
              placeholder="开始日期"
          />
        </template>
      </vxe-column>
      <vxe-column field="endDate" title="结束日期" width="180px" align="center" >
        <template #default="{ row }">
          <el-date-picker
              @change="debFunc"
              style="width: 150px"
              v-model="row.endDate"
              format="MM-DD"
              value-format="MM-DD"
              type="date"
              placeholder="结束日期"
          />
        </template>
      </vxe-column>
      <vxe-column field="daysStage" title="阶段天数" align="center"></vxe-column>
      <vxe-column field="irrigationQuota"  title="阶段灌溉定额(m³/亩)" align="center">
        <template #default="{ row }">
          <vxe-input v-model="row.irrigationQuota" min="1" type="number" placeholder="阶段灌溉定额" @change="debFunc"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="irrigationtotal" title="阶段灌水总量(万m³)" align="center"></vxe-column>
    </vxe-table>
  </div>
  <div class="rg" style="margin-left: 10px">
    <div class="condition">
      <el-radio-group v-model="cropTypeQuota" style="flex-wrap: nowrap;margin-right: 10px;margin-bottom: 10px">
        <el-radio-button label="0">当前频率：{{ frequency }}%</el-radio-button>
        <el-radio-button label="1">枯水年配置</el-radio-button>
        <el-radio-button label="2">平水年配置</el-radio-button>
        <el-radio-button label="3" >丰水年配置</el-radio-button>
      </el-radio-group>
      <li style="margin-bottom: 10px">
        片区灌溉面积：
        <el-input style="width: 140px" v-model="irrigationAreaTotal" type="number" @change="debFuns">
          <template #suffix>亩</template>
        </el-input>
      </li>

    </div>
    <div class="topInfo">
      <li>灌溉周期<span>{{ topInfo.irrigationPeriod }}</span>天</li>
      <li>灌溉定额<span>{{ topInfo.irrigationQuota }}</span>m³/亩</li>
      <li>净灌溉总水量<span>{{ topInfo.irrigationNetWorth }}</span>万m³</li>
    </div>
    <div id="chartQSG" ref="chartQSG"></div>
  </div>
</div>
</template>

<script setup>
import {onMounted, ref, watch,defineProps} from 'vue';
import {getCurrentFrequency, getInitCrop, postCrop, postSaveCropArea} from "@/api/agricultureWater";
import * as echarts from "echarts";
import {debounce, sleep} from '@/utils';
const xTable = ref({});
const chartQSG = ref();
const props = defineProps(['unitCode','allocCode','refreshGq'])
let frequency = ref('-');
let topInfo = ref({
  "irrigationNetWorth": 0,
  "irrigationPeriod": 0,
  "irrigationQuota": 0,
});
let cropTypeQuota = ref(0);
let irrigationAreaTotal = ref(0);
let insIrrigationAreaTotal = ref(0);
let clonData = ref([]);
const debFunc = debounce(panelChange,400,false);
const debFuns = debounce(handleChange,400,false);

let data = ref([]);


onMounted(()=>{
  // 获取频率
  getCurrentFrequency({caseCode:props.allocCode}).then(res=>{
    if(res.success){
      frequency.value = res.data ? parseInt(res.data.frequency * 100) : 0
    }
  })
})

watch([cropTypeQuota,insIrrigationAreaTotal,()=>clonData.value,()=>props.unitCode,()=>props.refreshGq],([cro,irr,g,unitCode,rfes])=>{
  postCrop({
    irrigationAreaTotal:irr,
    cropTypeQuota:cro,
    quotaTableList:g,
    unitCode: unitCode,
    allocCode:props.allocCode,
    frequency: cro == 0 ? frequency.value / 100 : null
  }).then(res=>{
    if(res.success){
      const result = res.data;
      data.value = result.quotaTableList;
      topInfo.value = {
        "irrigationNetWorth": result.irrigationNetWorth,
        "irrigationPeriod":result.irrigationPeriod,
        "irrigationQuota": result.irrigationQuota,
      };
      irrigationAreaTotal.value = result.irrigationAreaTotal || 0
      const x = result.quotaChartList.map(r=>r.xdate);
      const line1 = result.quotaChartList.map(r=>r.irrigationNetWorth);
      const line2 = result.quotaChartList.map(r=>r.irrigationQuota);
      const series = [
        {
          name: '净灌溉总水量',
          type: 'line',
          yAxisIndex: 0,
          tooltip: {
            valueFormatter: function (value) {
              return value + ' 万m³';
            }
          },
          data: line1
        },
        {
          name: '灌溉定额',
          type: 'line',
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function (value) {
              return value + ' 万m³';
            }
          },
          data: line2
        }
      ];
      const chart1 = echarts.init(chartQSG.value);
      chart1.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '1%',
          top:'10%',
          containLabel: true
        },
        legend: {
          data:['净灌溉总水量','灌溉定额']
        },
        xAxis:{
          type: 'category',
          data: x,
          axisPointer: {
            type: 'shadow'
          }
        },
        yAxis:[
          {
            name:'净灌溉总水量(万m³)',
            type: 'value',
          },
          {
            name:'灌溉定额(万m³)',
            type: 'value',
          }
        ],
        series: series
      },true);
    }
  })
},{deep:true,immediate:true})

// 面积
function handleChange(val) {
  postSaveCropArea({
    unitCode: props.unitCode,
    irrigationAreaTotal:val
  }).then(res=>{
    if(res.success){
      insIrrigationAreaTotal.value = val;
    }
  })
}

function panelChange() {
  clonData.value = xTable.value.getTableData().tableData;
}

</script>

<style scoped lang="scss">
li{
  list-style-type: none;

}
.allocation{
  display: flex;
  flex: 1;
  .lf{
    flex: 1;
  }
  .rg{
    display: flex;
    flex-direction: column;
    flex: 1;
    .condition{
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      li{
        margin-right: 10px;
      }
    }
    .topInfo{
      display: flex;
      margin-top: 10px;
      li{
        flex: 1;
        text-align: center;
        span{
          font-size: 17px;
          font-weight: bold;
          margin: 0 8px;
          color: #2f76b3;
        }
      }
    }
    #chartQSG{
      flex: 1;
    }
  }
}
</style>