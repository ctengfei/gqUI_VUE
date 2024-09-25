<template>
  <div class="card-box">
  <div class="lf">
    <li>
      <h4>年计划供水总量</h4>
      <div class="txt">
        <strong>{{ topStatics.waterPlanTotal }}</strong>
        <span>万m³</span>
      </div>
      <span class="date">{{ dayjs().format('YYYY-MM-DD') }}</span>
    </li>
    <li>
      <h4>年实际用水总量</h4>
      <div class="txt">
        <strong>{{ topStatics.waterActurlUseTotal }}</strong>
        <span>万m³</span>
      </div>
      <span class="date">{{ dayjs().format('YYYY-MM-DD') }}</span>
    </li>
  </div>
  <div class="rg">
    <h4>水库蓄水量</h4>
   <div class="sum">
     <li>
      <h3>王英水库</h3>
       <div class="txt">
         <strong>{{ wy }}</strong>
         <span>亿m³</span>
       </div>
     </li>
     <li>
       <h3>蔡英水库</h3>
       <div class="txt">
         <strong>{{ cx }}</strong>
         <span>亿m³</span>
       </div>
     </li>
   </div>
    <span class="date">{{ dayjs().format('YYYY-MM-DD') }}</span>
  </div>
</div>
  <div class="wa-item">
    <li>
      <div class="title">
        <h4>实际用水量类型统计</h4>
      </div>
     <div class="wrapper">
       <div class="SZYchart1" ref="SZYchart1"></div>
       <div class="legend">
         <div class="item">
           <div class="co-head">
             <i></i><span>城镇用水</span>
           </div>
           <strong>{{ water.town || 0 }}<span>万m³</span></strong>
         </div>
         <div class="item">
           <div class="co-head">
             <i></i><span>农业用水</span>
           </div>
           <strong>{{ water.irrigate || 0 }}<span>万m³</span></strong>
         </div>
         <div class="item">
           <div class="co-head">
             <i></i><span>发电用水量</span>
           </div>
           <strong>{{ water.electric || 0 }}<span>万m³</span></strong>
         </div>
         <div class="item">
           <div class="co-head">
             <i></i><span>泄洪水量</span>
           </div>
           <strong>{{ water.flood || 0 }}<span>万m³</span></strong>
         </div>
         <div class="item">
           <div class="co-head">
             <i></i><span>生态用水</span>
           </div>
           <strong>{{ water.ecology || 0 }}<span>万m³</span></strong>
         </div>
       </div>
     </div>
    </li>
    <li>
      <div class="title">
        <h4>实际用水量统计</h4>
      </div>
      <div class="chart SZYchart2" ref="SZYchart2"></div>
    </li>
  </div>
  <div class="we-item">
    <div class="title">
      <h4>用水申报统计</h4>
    </div>
    <div class="chart-box">
      <div class="head">
        <div class="lf" v-if=" radio < 5">
          <li><i></i>计划用水</li>
          <li v-show="radio > 1"><i></i>计划配水</li>
          <li><i></i>实际用水</li>
        </div>
        <div class="lf" v-if="radio == 5">
          <li><i></i>计划配水</li>
          <li><i></i>实际用水</li>
        </div>
        <div class="rg">
          <el-radio-group v-model="radio">
            <el-radio-button  label="1" >城镇用水</el-radio-button>
            <el-radio-button  label="2" >泄洪水量</el-radio-button>
            <el-radio-button  label="3" >发电供水</el-radio-button>
            <el-radio-button  label="4" >农业供水</el-radio-button>
            <el-radio-button  label="5" >生态用水</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="SZYchart3" ref="SZYchart3">
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, nextTick, watch, ref} from "vue";
import dayjs from "dayjs";
import * as echarts from "echarts";
import {getResTotal, getSk, getWaterUseTotal, getWaterUseTypeTotal} from "@/api/oneimage";
import {getActualWaterUseStatistics} from "@/api/digitization";
let water = ref({});
let topStatics = ref({});
const radio = ref('1');
const SZYchart1 = ref();
const SZYchart2 = ref();
const SZYchart3 = ref();
let wy = ref(0); //王英
let cx = ref(0); //蔡贤
onMounted(()=>{
  nextTick(()=>{
    getResTotal().then(res=>{
      if(res.success){
        topStatics.value = res.data;
      }
    })
    getSk().then(res=>{
      if(res.success){
        res.data.forEach(r=>{
          if(r.resCode == '42022220001'){ // 王英
            wy.value = (r.w /100).toFixed(3);
          }else if(r.resCode == '42022230001'){
            cx.value = (r.w /100).toFixed(3);
          }
        });
      }
    })
    getActualWaterUseStatistics().then(res=>{
      if(res.success){
        water.value = res.data;
        const chart1 = echarts.init(SZYchart1.value);
        chart1.setOption({
          tooltip: {
            trigger: 'item',
            // 相对位置
            position: 'bottom'
          },
          series: [
            {
              type: 'pie',
              radius: ['50%', '80%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              labelLine: {
                show: false
              },
              color:['#2C9BFD', '#6BB2F3','#FC7F00','#F8AF66','#57C777'],
              data: [
                { value: water.value.town, name: '城镇用水' },
                { value: water.value.agriculture, name: '农业用水' },
                { value: water.value.electric, name: '发电用水量' },
                { value: water.value.industry, name: '泄洪水量' },
                { value: water.value.ecology, name: '生态用水' }
              ]
            }
          ]
        },true);
        const chart2 = echarts.init(SZYchart2.value);
        const xAxis = res.data.waterUseList.map(r=>r.month);
        const mergedData = {};
        const series = [];
        res.data.waterUseList.forEach(arr=>{
          const keys = Object.keys(arr);
          keys.forEach(key=>{
            mergedData[key] = mergedData[key] || [];
            mergedData[key].push(arr[key]);
          })
        });
        delete mergedData.applyTime
        for (const key in mergedData) {
          if(key === 'townTotal'){
            series.push({
              name:'城镇用水',
              data: mergedData[key],
              type: 'bar',
              barWidth:15,
              stack: 'total',
              itemStyle: {
                color: '#2C9BFD'
              },
            })
          }else if(key === 'electricTotal'){
            series.push({
              name:'发电用水',
              data: mergedData[key],
              type: 'bar',
              barWidth:15,
              stack: 'total',
              itemStyle: {
                color: '#FC7F00'
              },
            })
          }else if(key === 'floodTotal'){
            series.push({
              name:'泄洪水量',
              data: mergedData[key],
              type: 'bar',
              barWidth:15,
              stack: 'total',
              itemStyle: {
                color:'#FF6347'
              },
            })
          }else if(key === 'ecologyTotal'){
            series.push({
              name:'生态用水',
              data: mergedData[key],
              type: 'bar',
              barWidth:15,
              stack: 'total',
              itemStyle: {
                color: '#57C777'
              },
            })
          }else if(key === 'irrigateTotal'){
            series.push({
              name:'农业用水',
              data: mergedData[key],
              type: 'bar',
              barWidth:15,
              stack: 'total',
              itemStyle: {
                color: '#AB82FF'
              },
            })
          }
        }
        chart2.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            order: 'valueAsc'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top:'18%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: xAxis.map(r=>`${r.replace(/^0/g,'')}月`),
          },
          yAxis: {
            type: 'value',
            name: "万m³",
            nameTextStyle: {
              color: "#aaa",
              nameLocation: "start",
            },
          },
          series: series
        },true);
      }
    });
    watch(radio,async (val)=>{
      const chart3 = echarts.init(SZYchart3.value);
      const result = await getWaterUseTypeTotal({waterUse:val});
      switch (val){
        case '1':
          if(result.success){
            chart3.setOption({
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow'
                }
              },
              grid: {
                left: '3%',
                right: '1%',
                bottom: '5%',
                top:'16%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                data: result.data.map(r=>`${r.applyTime.split('-')[1].replace(/^0/g,'')}月`)
              },
              yAxis: {
                type: 'value',
                name: "万m³",
                nameTextStyle: {
                  color: "#aaa",
                  nameLocation: "start",
                },
              },
              color:['rgba(44, 155, 253, 1)', 'rgba(87, 199, 119, 1)',],
              series: [
                {
                  data: result.data.map(r=>r.planWaterAmount),
                  type: 'bar',
                  name:'计划用水',
                  barWidth:20,
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(44, 155, 253, 1)' },
                      { offset: 1, color: 'rgba(44, 155, 253, 0.2)' },
                    ])
                  },
                },
                {
                  data: result.data.map(r=>r.waterAmount),
                  type: 'bar',
                  name:'实际用水',
                  barWidth:20,
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(87, 199, 119, 1)' },
                      { offset: 1, color: 'rgba(87, 199, 119, 0.2)' },
                    ])
                  },
                }
              ]
            },true);
          }
          break;
        case '5':
          if(result.success){
            chart3.setOption({
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow'
                }
              },
              grid: {
                left: '3%',
                right: '1%',
                bottom: '5%',
                top:'16%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                data: result.data.map(r=>`${r.applyTime.split('-')[1].replace(/^0/g,'')}月`)
              },
              yAxis: {
                type: 'value',
                name: "万m³",
                nameTextStyle: {
                  color: "#aaa",
                  nameLocation: "start",
                },
              },
              color:['rgba(44, 155, 253, 1)','rgba(252, 127, 0, 1)'],
              series: [
                {
                  data: result.data.map(r=>r.planAllocationWaterAmount),
                  type: 'bar',
                  name:'计划配水',
                  barWidth:20,
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(44, 155, 253, 1)' },
                      { offset: 1, color: 'rgba(44, 155, 253, 0.2)' },
                    ])
                  },
                },
                {
                  data: result.data.map(r=>r.waterAmount),
                  type: 'bar',
                  barWidth:20,
                  name:'实际用水',
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(252, 127, 0, 1)' },
                      { offset: 1, color: 'rgba(252, 127, 0, 0.2)' },
                    ])
                  },
                }
              ]
            },true);
          }
          break;
        case '2':
        case '3':
        case '4':
          if(result.success){
            chart3.setOption({
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow'
                }
              },
              grid: {
                left: '3%',
                right: '1%',
                bottom: '5%',
                top:'16%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                data: result.data.map(r=>`${r.applyTime.split('-')[1].replace(/^0/g,'')}月`)
              },
              yAxis: {
                type: 'value',
                name: "万m³",
                nameTextStyle: {
                  color: "#aaa",
                  nameLocation: "start",
                },
              },
              color:['rgba(44, 155, 253, 1)', 'rgba(87, 199, 119, 1)','rgba(252, 127, 0, 1)'],
              series: [
                {
                  data: result.data.map(r=>r.planWaterAmount),
                  type: 'bar',
                  name:'计划用水',
                  barWidth:20,
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(44, 155, 253, 1)' },
                      { offset: 1, color: 'rgba(44, 155, 253, 0.2)' },
                    ])
                  },
                },
                {
                  data: result.data.map(r=>r.waterAmount),
                  type: 'bar',
                  barWidth:20,
                  name:'实际用水',
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(87, 199, 119, 1)' },
                      { offset: 1, color: 'rgba(87, 199, 119, 0.2)' },
                    ])
                  },
                },
                {
                  data: result.data.map(r=>r.planAllocationWaterAmount),
                  type: 'bar',
                  barWidth:20,
                  name:'计划配水',
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(252, 127, 0, 1)' },
                      { offset: 1, color: 'rgba(252, 127, 0, 0.2)' },
                    ])
                  },
                }
              ]
            },true);
          }
          break;
      }
    },{ immediate:true });
  })
})
</script>

<style scoped lang="scss">
li{
  list-style-type: none;
}
.card-box{
  height: 108px;
  display: flex;
  margin: 10px 0;
  padding: 0;
  .lf{
    display: flex;
    flex: 1;
    margin-right: 20px;
    li{
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      flex: 1;
      background: #F4F8FB;
      border-radius: 4px;
      h4{
        display: block;
        width: 130px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        color: #333;
        margin: 0;
        font-size: 16px;
        font-weight: bold;
        background: rgba(23, 145, 255, .1);
        border-radius: 0px 0px 12px 12px;
      }
      .txt{
        margin-top: 8px;
        padding-bottom: 8px;
        display: block;
        width: 100%;
        border-bottom: 1px dashed rgba(23, 145, 255, .2);
        text-align: center;
        strong{
          color: #1791FF;
          font-size: 30px;
          font-weight: 500;
          font-family: PingFangSC-Medium, PingFang SC;
        }
        span{
          color: #999999;
          font-size: 14px;
        }
      }
      .date{
        color: #999999;
        font-size: 12px;
      }
      &:nth-child(1){
        margin-right: 10px;
      }
    }
  }
  .rg{
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    background: #F4F8FB;
    border-radius: 4px;
    h4{
      display: block;
      width: 130px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      color: #333;
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      background: rgba(23, 145, 255, .1);
      border-radius: 0px 0px 12px 12px;
    }
    .sum{
      display: flex;
      width: 100%;
      li{
        flex: 1;
        h3{
          color: #666666;
          font-size: 14px;
          text-align: center;
          font-weight: bold;
          margin: 0;
        }
        &:nth-child(1) .txt{
            border-right: 1px dashed rgba(23, 145, 255, .2);
        }
        .txt {
          display: block;
          width: 100%;
          border-bottom: 1px dashed rgba(23, 145, 255, .2);
          text-align: center;
          strong {
            color: #1791FF;
            font-size: 30px;
            font-weight: 500;
            font-family: PingFangSC-Medium, PingFang SC;
          }
          span {
            color: #999999;
            font-size: 14px;
          }
        }

      }
    }
    .date{
      display: inline-block;
      width: 100%;
      text-align: center;
      color: #999999;
      font-size: 12px;
    }
  }
}
.wa-item{
  display: flex;
  height: 240px;
  width: 100%;
  margin-bottom: 20px;
  li{
    display: flex;
    flex-direction: column;
    flex: 1;
    border-radius: 4px;
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
    .chart,.wrapper{
      flex: 1;
      background: #F4F8FB;
      margin-top: 2px;
    }
    .wrapper{
      display: flex;
      width: 100%;
      height: 100%;
      .SZYchart1,.legend{
        flex: 1;
      }
      .legend{
        display: flex;
        flex-wrap: wrap;
        .item{
          width: calc(100% / 2);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          i{
            display: inline-block;
            width: 10px;
            height: 10px;
            margin-right: 5px;
            margin-top: 3px;
          }
          .co-head{
            display: flex;
            align-items: center;
            color: #999999;
            font-size: 14px;
          }
          strong{
            font-weight: bold;
            color: #666666;
            font-size: 18px;
            margin-top: 8px;
            span{
              color: #999;
              font-size: 12px;
            }
          }
        }
        .item:nth-child(1) .co-head i{
          box-shadow: 0px 0px 4px 1px rgba(44,155,253,0.5);
          border: 2px solid #2C9BFD;
          border-radius: 50px;
        }
        .item:nth-child(2) .co-head i{
          box-shadow: 0px 0px 4px 1px rgba(107,178,243,0.5);
          border: 2px solid #6BB2F3;
          border-radius: 50px;
        }
        .item:nth-child(3) .co-head i{
          box-shadow: 0px 0px 4px 1px rgba(252,127,0,0.5);
          border: 2px solid #FC7F00;
          border-radius: 50px;
        }
        .item:nth-child(4) .co-head i{
          box-shadow: 0px 0px 4px 1px rgba(248,175,102,0.5);
          border: 2px solid #F8AF66;
          border-radius: 50px;
        }
        .item:nth-child(5) .co-head i{
          box-shadow: 0px 0px 4px 1px rgba(87,199,119,0.5);
          border: 2px solid #57C777;
          border-radius: 50px;
        }
      }
    }
    &:nth-child(1){
      margin-right: 20px;
    }
  }
}
.we-item{
  display: flex;
  flex-direction: column;
  height: 290px;
  width: 100%;
  border-radius: 4px;
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
  .chart-box{
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #F4F8FB;
    margin-top: 2px;
  }
  .head{
    display: flex;
    justify-content: space-around;
    margin: 8px 0;
    .lf{
      display: flex;
      li{
        display: flex;
        align-items: center;
        color: #999999;
        font-size: 12px;
        margin: 0 20px;
        i{
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-right: 5px;
        }
      }
      li:nth-child(1) i{
        box-shadow: 0px 0px 4px 1px rgba(44,155,253,0.5);
        border: 2px solid rgba(44, 155, 253, 1);
        border-radius: 50px;
      }
      li:nth-child(2) i{
        box-shadow: 0px 0px 4px 1px rgba(252, 127, 0, 0.5);
        border: 2px solid rgba(252, 127, 0, 1);
        border-radius: 50px;
      }
      li:nth-child(3) i{
        box-shadow: 0px 0px 4px 1px rgba(87, 199, 119, 0.5);
        border: 2px solid rgba(87, 199, 119, 1);
        border-radius: 50px;
      }
    }
    .rg{

    }
  }
  .SZYchart3{
    flex: 1;
  }
}
</style>