<template>
<div class="wrapper">
  <div class="head-title" style="margin-bottom: 10px;display: flex">
    <span>报汛保险统计</span>
    <div style="margin-left: 30px" >
      <span style="color: #409EFF">一般：{{ alarm.generalNum }} </span>
      <span style="margin: 0 10px;color: #E6A23C">较重：{{ alarm.heavyNum }}</span>
      <span style="color: #F56C6C">严重：{{ alarm.seriousNum }}</span>
    </div>
  </div>
  <li>
    <div class="lf">
      <div class="title">
        <h4>防汛责任人</h4>
      </div>
      <div ref="FXchart1" id="FXchart1"></div>
    </div>
    <div class="rg">
      <div class="title">
        <h4>抢险队伍</h4>
      </div>
      <div ref="FXchart2" id="FXchart2"></div>
    </div>
  </li>
  <div class="head-title" style="margin-top: 10px">防汛物资</div>
  <el-table border :data="tableData" style="width: 100%;height:310px;margin-top: 10px">
    <el-table-column prop="objectName" label="物资名称" />
    <el-table-column prop="quantity" label="数量" align="center" />
    <el-table-column prop="unit" label="单位" align="center" />
  </el-table>
</div>
</template>

<script setup>
import {nextTick, ref} from "vue";
import * as echarts from "echarts";
import {getDutyPersonNum, getFxObject, getRescueTeamNum, getSafetyDangerNum} from "@/api/oneimage";
const FXchart1 = ref();
const FXchart2 = ref();
let alarm = ref({
  "generalNum": 0,
  "heavyNum": 0,
  "seriousNum": 0
});
let tableData = ref([]);
const barWidth = 20;
nextTick(()=>{
  // 报汛保险
  getSafetyDangerNum().then(res=>{
    if(res.success){
      alarm.value = res.data[0];
    }
  })

  // 防汛责任人
  getDutyPersonNum().then(res=>{
    if(res.success){
      const xAxis = res.data.map(r=> r.engName);
      const data = res.data.map(r=>r.num);
      const chart1 = echarts.init(FXchart1.value);
      chart1.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend:{},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '5%',
          top:'14%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxis
        },
        yAxis: {
          name:'人',
          type: 'value',
          minInterval:1,
        },
        series: [
          {
            data: data,
            type: 'bar',
            barWidth:barWidth,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' 人';
              }
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(87, 199, 119, 1)' },
                { offset: 1, color: 'rgba(87, 199, 119, 0.20)' },
              ])
            },
          }
        ]
      },true);
    }
  })

  //抢险队伍
  getRescueTeamNum().then(res=>{
    if(res.success){
      const xAxis = res.data.map(r=> r.teamName);
      const data = res.data.map(r=>r.num);
      const chart2 = echarts.init(FXchart2.value);
      chart2.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend:{},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '5%',
          top:'14%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxis
        },
        yAxis: {
          name:'人',
          type: 'value',
          minInterval:1,
        },
        series: [
          {
            data: data,
            type: 'bar',
            barWidth:barWidth,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' 人';
              }
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(51, 196, 255, 1)' },
                { offset: 1, color: 'rgba(23, 145, 255, 0.20)' },
              ])
            },
          }
        ]
      },true);
    }
  })
  // 防汛物资
  getFxObject().then(res=>{
    if(res.success){
      tableData.value = res.data;
    }
  })

})
</script>

<style scoped lang="scss">
li{
  list-style-type: none;
}
.wrapper{
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  // margin-top: 10px;
  overflow-y: hidden;
  overflow-x: hidden;
  li{
    display: flex;
    .title{
      background: #F4F8FB;
      height: 40px;
      line-height: 40px;
      h4{
        position: relative;
        display: inline-block;
        margin: 0;
        margin-left: 10px;
        padding-left: 10px;
        color: #666666;
        font-size: 14px;
        font-weight: bold;
        &:after{
          content:'';
          display: block;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 10px;
          background: #1791FF;
        }
      }
    }
    .lf,.rg{
      flex:1;
    }
    .lf{
      margin-right: 10px;
    }
    #FXchart1,#FXchart2{
      display: flex;
      flex-direction: column;
      border-radius: 4px;
      height: 250px;
      margin-top: 2px;
      background: #F4F8FB;
    }
  }
}
</style>