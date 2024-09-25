<template>
  <div  style="padding: 20px 20px;height: 100%;overflow: auto">
    <div class="year-filter">
      <div class="lt">
        <span>年份：</span>
        <el-date-picker
            v-model="year"
            type="year"
            value-format="YYYY"
            placeholder="年份"
        />
      </div>
      <div class="rg">
        <li>
          <span class="tags">本年计划用水</span>
          <h2>{{ yearTotal.planTotal || 0 }}<span>万m³</span></h2>
        </li>
        <li>
          <span class="tags">本年实际供水</span>
          <h2>{{ yearTotal.realityTotal || 0 }}<span>万m³</span></h2>
        </li>
      </div>
    </div>
    <div class="chart" ref="chart1">
    </div>
    <el-table :data="tableData" border style="width: 100%;height: 330px">
      <el-table-column prop="type" label="类型" align="center" />
      <el-table-column prop="year" label="年份" align="center" />
      <el-table-column prop="val3" label="生态用水量(万m³)" align="center" />
      <el-table-column prop="val2" label="农业用水量(万m³)" align="center" />
      <el-table-column prop="val1" label="城镇用水量(万m³)" align="center"  />
      <el-table-column prop="val4" label="发电用水量(万m³)" align="center" />
      <el-table-column prop="val5" label="合计(万m³)" align="center" />
    </el-table>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import {nextTick, onMounted, ref, watch, watchEffect} from 'vue';
import * as echarts from "echarts";
import {getWaterUseSupplyContrast} from "@/api/digitization";

const year = ref(dayjs().format('YYYY'));
let yearTotal = ref({});
const chart1 = ref();
let tableData = ref([]);

onMounted(()=>{
  getWaterUseSupplyContrast().then(res=>{
    if(res.success){
      yearTotal.value = res.data;
    }
  })
})

watch(year,(ye)=>{
  getWaterUseSupplyContrast({year:ye}).then(res=>{
    if(res.success){
      const result = res.data;
      tableData.value = [
        {
          year:ye,
          type:'计划用水',
          val1:result.planTown,
          val2:result.planIrrigate,
          val3:result.planEcology,
          val4:result.planElectric,
          val5:parseFloat(result.planTown + result.planIrrigate + result.planEcology + result.planElectric).toFixed(1),
        },
        {
          year:ye,
          type:'实际供水',
          val1:result.town,
          val2:result.irrigate,
          val3:result.ecology,
          val4:result.electric,
          val5:parseFloat(result.town + result.irrigate + result.ecology + result.electric).toFixed(1),
        }
      ]
      const bar = echarts.init(chart1.value);
      bar.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
        },
        grid: {
          top:'10%',
          left: '3%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['生态', '农业', '城镇', '发电'],
          boundaryGap: true
        },
        yAxis: {
          type: 'value',
          name:'万m³'
        },
        series: [
          {
            name: '计划总量',
            type: 'bar',
            barWidth:20,
            data: [result.planEcology, result.planIrrigate, result.planTown, result.planElectric],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#188df0' },
                { offset: 1, color: '#83bff6' }
              ]),
              borderRadius:[5,5,0,0]
            },
            tooltip: {
              valueFormatter: function (value) {
                return value + ' 万m³';
              }
            },
          },
          {
            name: '已供总量',
            type: 'bar',
            barWidth:20,
            data: [result.ecology, result.irrigate, result.town, result.electric],
            tooltip: {
              valueFormatter: function (value) {
                return value + ' 万m³';
              }
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#18F0CCFF' },
                { offset: 1, color: '#83bff6' }
              ]),
              borderRadius:[5,5,0,0]
            },
          }
        ]
      })
    }
  })
},{immediate:true})

</script>

<style scoped lang="scss">
.year-filter{
  display: flex;
  justify-content: space-between;
  text-align: left;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 6px;
  .rg{
    display: flex;
    li{
      display: flex;
      align-items: center;
      margin: 0 20px;
      .tags{
        background: rgba(23, 145, 255, 0.1);
        height: 30px;
        padding: 0 8px;
        line-height: 30px;
        font-size: 12px;
        border-radius: 10px;
        font-weight: bold;
        color: #1791FF;
        margin-right: 10px;
      }
      h2{
        margin-bottom: 0;
        span{
          font-size: 13px;
        }
      }
    }
  }
}
.chart{
  height: 350px;
  background: #fff;
  border-radius: 5px;
  margin: 10px 0;
}
</style>