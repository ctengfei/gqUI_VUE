<template>
  <div style="padding: 20px 20px;height: 100%;overflow: auto">
    <div class="year-filter">
      <span>月份：</span>
      <el-date-picker
          v-model="month"
          type="monthrange"
          range-separator="-"
          format="YYYY-MM"
          clearable
          value-format="YYYY-MM"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
      />
    </div>
    <div class="card-wapper">
      <li>
        <div class="title"><i></i>城镇用水量</div>
        <div class="val-box">
          <div class="val">
            <span>{{ items.town }}</span>
            <span>万m³</span>
          </div>
          <i></i>
        </div>
      </li>
      <li>
        <div class="title"><i></i>泄洪水量</div>
        <div class="val-box">
          <div class="val">
            <span>{{ items.industry }}</span>
            <span>万m³</span>
          </div>
          <i></i>
        </div>
      </li>
      <li>
        <div class="title"><i></i>发电用水量</div>
        <div class="val-box">
          <div class="val">
            <span>{{ items.electric }}</span>
            <span>万m³</span>
          </div>
          <i></i>
        </div>
      </li>
      <li>
        <div class="title"><i></i>农业用水量</div>
        <div class="val-box">
          <div class="val">
            <span>{{ items.agriculture }}</span>
            <span>万m³</span>
          </div>
          <i></i>
        </div>
      </li>
      <li>
        <div class="title"><i></i>生态用水量</div>
        <div class="val-box">
          <div class="val">
            <span>{{ items.ecology }}</span>
            <span>万m³</span>
          </div>
          <i></i>
        </div>
      </li>


    </div>
    <div class="char-wrapper">
      <div class="head">
        <h3>用水统计详情</h3>
        <div class="switch">
          <li :class="{active:index == 1}" @click="index = 1">城镇用水量</li>
          <li :class="{active:index == 2}" @click="index = 2">泄洪水量</li>
          <li :class="{active:index == 3}" @click="index = 3">发电用水量</li>
          <li :class="{active:index == 4}" @click="index = 4">农业用水量</li>
          <li :class="{active:index == 5}" @click="index = 5">生态用水量</li>
        </div>
      </div>
      <div ref="chart" id="chart"></div>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import {nextTick, onMounted, ref, watch, watchEffect} from 'vue';
import * as echarts from "echarts";
import {getMonth} from "@/api/waterManager/monthWaterAnalysis";
const month =ref([dayjs().subtract(11,'month').format('YYYY-MM'),dayjs().format('YYYY-MM')]);
let index = ref(1);
const chart=  ref(null);
let items = ref({
  agriculture: "0",
  ecology: "0",
  electric: "0",
  industry: "0",
  town: "0"
});
onMounted(()=>{
  watchEffect(()=>{
    const chart1 = echarts.init(chart.value);
    getMonth({startTime:month.value[0], endTime:month.value[1], waterUse:index.value}).then(res=>{
      if(res.success){
        const dates = res.data.useList;
        chart1.setOption({
          grid: {
            left: '2%',
            right: '2%',
            bottom: '1%',
            top:'6.5%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates.map(r=> r.applyTime)
          },
          tooltip: {
            trigger: 'axis'
          },
          yAxis: {
            type: 'value',
            name: "万m³",
            nameTextStyle: {
              color: "#aaa",
              nameLocation: "start",
            },
          },
          series: [
            {
              data:  dates.map(r=> r.waterAmount),
              type: 'line',
              name:'城镇用水',
              showSymbol: false,
              smooth: true,
              areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0.,
                    color: 'rgba(51, 196, 255, 0.30)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(23, 145, 255, 0)'
                  }
                ])
              },
              lineStyle:{
                color:'rgba(23, 145, 255, 1)'
              }
            }
          ]
        },true);
      }
    });
    getMonth({startTime:month.value[0], endTime:month.value[1], waterUse:null}).then(res=>{
      if(res.success){
        const data = res.data;
        items.value = {
          agriculture: data.agriculture,
          ecology: data.ecology,
          electric: data.electric,
          industry: data.industry,
          town: data.town
        };
      }
    })
  },{ immediate:true });
})
</script>

<style lang="scss" scoped>
:deep(.app-main){
  overflow: hidden!important;
}
li{
  list-style-type: none;
}
.year-filter{
  height: 76px;
  line-height: 76px;
  padding-left: 50px;
  text-align: left;
  background: #FFFFFF;
  border-radius: 6px;
}
.card-wapper{
  display: flex;
  margin: 10px 0;
  li{
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 140px;
    flex: 1;
    margin: 0 5px;
    background: #FFFFFF;
    border-radius: 6px;
    padding:15px;
    .title{
      font-size: 16px;
      color: #666666;
      i{
        position: relative;
        display: inline-block;
        vertical-align: text-top;
        width: 24px;
        height: 24px;
        border-radius: 50px;
        margin-right: 10px;
        &:after{
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          background: url("@/assets/images/shui002.png") no-repeat center center;
          background-size: contain;
          display: block;
          height: 15px;
          width: 15px;
        }
      }
    }
    &:nth-child(1) .title i{
      background: #2C9BFD;
    }
    &:nth-child(2) .title i{
      background: #6BB2F3;
    }
    &:nth-child(3) .title i{
      background: #57C777;
    }
    &:nth-child(4) .title i{
      background: #FC7F00;
    }
    &:nth-child(5) .title i{
      background: #F8AF66;
    }
    &:first-child{
      margin-left: 0;
    }
    &:last-child{
      margin-right: 0;
    }
    .val-box{
      display: flex;
      justify-content: space-around;
      margin-top: 5px;
      .val{
        span:first-child{
          font-size: 36px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #505A6E;
        }
        span:last-child{
          font-size: 16px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #666666;
        }
      }
      i{
        display: inline-block;
        width: 120px;
        height: 50px;
        margin-left: 30px;
      }
    }
    &:nth-child(1) .val-box i{
      background: url("@/assets/images/line-1.png") no-repeat center center;
      background-size: contain;
    }
    &:nth-child(2) .val-box i{
      background: url("@/assets/images/line-2.png") no-repeat center center;
      background-size: contain;
    }
    &:nth-child(3) .val-box i{
      background: url("@/assets/images/line-3.png") no-repeat center center;
      background-size: contain;
    }
    &:nth-child(4) .val-box i{
      background: url("@/assets/images/line-4.png") no-repeat center center;
      background-size: contain;
    }
    &:nth-child(5) .val-box i{
      background: url("@/assets/images/line-5.png") no-repeat center center;
      background-size: contain;
    }
  }
}
.char-wrapper{
  display: flex;
  flex-direction: column;
  height: 555px;
  background: #FFFFFF;
  border-radius: 6px;
  padding: 20px;
  .head{
    display: flex;
    justify-content: space-between;
    padding: 0 30px;
    margin-bottom: 20px;
    h3{
      font-size: 18px;
      color: #22283F;
      font-weight: bold;
      margin: 0;
    }
    .switch{
      display: flex;
      li{
        padding: 5px 0px;
        border-radius: 15px;
        font-size: 14px;
        width: 120px;
        text-align: center;
        cursor: pointer;
        color: #505A6E;
        border-radius: 20px;
        border: 1px solid #EEEEEE;
        margin-left: 20px;
      }
      li.active{
        background: #1791FF;
        color: #fff;
        border: 0;
      }
    }
  }
  #chart{
    flex: 1;
  }
}
</style>