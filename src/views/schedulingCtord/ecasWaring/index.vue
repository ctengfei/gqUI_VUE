<template>
<div class="app-container" style="display: flex;flex-direction: column">
  <div style="display: flex;align-items: center;justify-content: space-between">
    <div class="head-title">雨情监测总览</div>
    <span></span>
<!--    <el-button type="primary" @click="handleClick">参数设置</el-button>-->
  </div>
  <div class="general">
    <div class="lf" ref="treebox">
      <el-tree highlight-current
               node-key="id"
               :current-node-key="nodeKey"
               :data="treeData" default-expand-all
               :style="{height: height3,'overflow-y': 'auto'}"
               @node-click="handleNodeClick" />
    </div>
    <div class="center">
      <el-switch
          style="margin-left: 15px"
          size="large"
          v-model="swipe"
          active-text="图表"
          inactive-text="表格"
      />
      <div class="tablebox" ref="tablebox" v-show="!swipe">
        <el-table :data="tableData1" style="width: 100%" border :height="height1">
          <el-table-column prop="tm" label="时间" align="center" />
          <el-table-column prop="drp" label="降雨量(mm)" align="center" />
        </el-table>
      </div>
      <div class="rainChart" ref="rainChart" v-show="swipe">
      </div>
    </div>
    <div class="rg">
      <div class="top">
        <div class="head-sub-title">雨情监测</div>
        <div class="tag-box">
          <div class="sub-tab" style="background: #eb2f52"  >
            <span>暴雨以上/全部</span>
            <strong>{{ getHeavyRain(rains) }}/{{ rains.total }} 个</strong>
          </div>
          <div class="sub-tab" style="background: #ddd">
            <strong>{{ rains.noRain }} 个</strong>
            <span>0 mm</span>
          </div>
          <div class="sub-tab" style="background: #4adb1b">
            <strong>{{ rains.lightRain }} 个</strong>
            <span>0 - 10 mm</span>
          </div>
          <div class="sub-tab" style="background: #ebeb00">
            <strong>{{ rains.moderateRain }} 个</strong>
            <span>10 - 25 mm</span>
          </div>
          <div class="sub-tab" style="background: #ff8100">
            <strong>{{ rains.heavyRain }} 个</strong>
            <span>25 - 50 mm</span>
          </div>
          <div class="sub-tab" style="background: #e55050">
            <strong>{{ rains.torrentialRain }} 个</strong>
            <span>50 - 100 mm</span>
          </div>
          <div class="sub-tab" style="background: #a907a9">
            <strong>{{ rains.rainstorm }} 个</strong>
            <span>100 - 250 mm</span>
          </div>
          <div class="sub-tab" style="background: #cc00ff">
            <strong>{{ rains.bigTorrentialRain }} 个</strong>
            <span>≥250 mm</span>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="head-sub-title">水位站监测</div>
        <div class="stationTable" ref="stationTable">
          <el-table :data="tableData2" style="width: 100%" border :height="height2">
            <el-table-column prop="stName" label="站点名称" width="170" align="center" />
            <el-table-column prop="z" label="当前水位(m)" align="center" />
<!--            <el-table-column prop="name3" label="警戒水位(m)" align="center" />-->
            <el-table-column prop="q" label="当前流量(m³/s)" align="center" />
          </el-table>
        </div>
      </div>
    </div>
  </div>
  <el-dialog
      v-model="dialogVisible"
      title="参数设置"
      width="65%"
  >
    <div class="dialog-content">
      <div class="head-title">雨量等级</div>
      <div class="rain-level">
        <li v-for="(rain,index) in rainlist" :class="{active: seq == index  }" @click="seq = index ">
          <strong>{{ rain.name }}</strong>
          <div class="rain-info">
            <span :style="{background:rain.color}"></span>
            <span>{{ rain.level }}</span>
          </div>
        </li>
      </div>
      <div class="head-title">水文预警条件</div>
      <el-form :model="formInline" class="cus-form" label-width="90px" >
        <el-form-item class="form-wrapper-box" label="桩号1+100" >
          <div style="padding-left: 20px">
            <el-form-item class="marg" label="警戒水位 =">
              <el-input placeholder="警戒水位" class="wd" clearable >
                <template #suffix>m</template>
              </el-input>
            </el-form-item>
            <el-form-item label="流量 ≥">
              <el-input placeholder="流量" class="wd"  clearable >
                <template #suffix>m³/s</template>
              </el-input>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="桩号2+100"  class="form-wrapper-box">
          <div style="padding-left: 20px">
            <el-form-item class="marg" label="警戒水位 =">
              <el-input placeholder="警戒水位" class="wd" clearable >
                <template #suffix>m</template>
              </el-input>
            </el-form-item>
            <el-form-item label="流量 ≥">
              <el-input placeholder="流量" class="wd"  clearable >
                <template #suffix>m³/s</template>
              </el-input>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="桩号3+100" class="form-wrapper-box">
          <div style="padding-left: 20px">
            <el-form-item class="marg" label="警戒水位 =">
              <el-input placeholder="警戒水位" class="wd" clearable >
                <template #suffix>m</template>
              </el-input>
            </el-form-item>
            <el-form-item label="流量 ≥">
              <el-input placeholder="流量" class="wd"  clearable >
                <template #suffix>m³/s</template>
              </el-input>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="桩号4+100" class="form-wrapper-box">
          <div style="padding-left: 20px">
            <el-form-item class="marg" label="警戒水位 =">
              <el-input placeholder="警戒水位" class="wd" clearable >
                <template #suffix>m</template>
              </el-input>
            </el-form-item>
            <el-form-item label="流量 ≥">
              <el-input placeholder="流量" class="wd"  clearable >
                <template #suffix>m³/s</template>
              </el-input>
            </el-form-item>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer" style="margin-right: 30px">
        <el-button type="primary" @click="dialogVisible = false">
          确定
        </el-button>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</div>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import {getEasc, getEascList, getRainLevel} from "@/api/schedulingCtord/ecasWaring";
import {getYlMonitor} from "@/api/oneimage";
import * as echarts from "echarts";
import {getSite} from "@/api/digitization";
let tablebox = ref(null);
let stationTable = ref(null);
let treebox = ref(null);
let nodeKey = ref(null);
let height1 = ref('100%');
let height2 = ref('100%')
let height3 = ref('100%');
let swipe = ref(true);
let dialogVisible = ref(false);
let treeData = ref([]);
let tableData1 = ref([]);
let tableData2 = ref([]);
const rainChart = ref();
let seq = ref(0);
let rainlist = ref([
  {
    name:'无雨',
    color:'#ddd',
    level:'0 mm'
  },
  {
    name:'小雨',
    color:'#4adb1b',
    level:'0 - 10 mm'
  },
  {
    name:'中雨',
    color:'#ebeb00',
    level:'10 - 25 mm'
  },
  {
    name:'大雨',
    color:'#ff8100',
    level:'25 - 50 mm'
  },
  {
    name:'暴雨',
    color:'#e55050',
    level:'50 - 100 mm'
  },
  {
    name:'大暴雨',
    color:'#a907a9',
    level:'100 - 250 mm'
  },
  {
    name:'特大暴雨',
    color:'#cc00ff',
    level:'≥250 mm'
  },
]);
let xais = ref([]);
let xVal = ref([]);
let rains = ref({});
let formInline = ref({});

function getHeavyRain(rains) {
  return rains.rainstorm + rains.bigTorrentialRain + rains.torrentialRain
}

onMounted(()=>{
  height1.value = rainChart.value.clientHeight;
  height2.value = stationTable.value.clientHeight;
  height3.value = `${treebox.value.clientHeight}px`;
  window.addEventListener('resize', () => {
    height1.value = rainChart.value.clientHeight;
    height2.value = stationTable.value.clientHeight;
    height3.value = `${treebox.value.clientHeight}px`;
  })
  getEascList({
    stType:'PP',
    type:'0'
  }).then(res=>{
    if(res.success){
      treeData.value = res.data.map(r=>({ id:r.stCode,label:r.stName }));
      nodeKey.value = treeData.value.length ? treeData.value[0].id : null;
    }
  })
  // 水位监测站
  getSite({
    stType:'ZQ'
  }).then(res=>{
    if(res.success){
      tableData2.value = res.data.riverRList;
    }
  })
  getRainLevel().then(res=>{
    if(res.success){
      rains.value = res.data;
    }
  })
})

watch(nodeKey,(id)=>{
  if(id){
    getYlMonitor({stcd:id}).then(res=>{
      if(res.success){
        tableData1.value = res.data.reverse();
        const x = res.data.reverse().map(r=>r.tm.substr(5,11));
        const data = res.data.reverse().map(r=>r.drp);
        const chart1 = echarts.init(rainChart.value);
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
            bottom: '5%',
            top:'10%',
            containLabel: true
          },
          legend: {
            data:['降雨量']
          },
          xAxis:{
            type: 'category',
            data: x,
            splitNumber: 24,
            axisPointer: {
              type: 'shadow'
            },
            axisLabel:{
              interval:2,
              rotate:30,//倾斜度 -90 至 90 默认为0
            }
          },
          yAxis:[
            {
              name:'降雨量(mm)',
              type: 'value',
            },
          ],
          series: [    {
            name: '降雨量',
            type: 'line',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' mm';
              }
            },
            data: data
          },]
        },true);
      }
    })
  }
},{immediate:true})

watch([seq,dialogVisible],([se,dia])=>{
  if(dia){
    getEasc({rainfallLevel:se}).then(res=>{
      console.log(res)
    })
  }
})

const handleNodeClick = (data) =>{
  nodeKey.value = data.id;
}

const handleClick = () =>{
  dialogVisible.value = true;
}

</script>

<style scoped lang="scss">
:deep(.el-dialog__body){
  height: 650px;
  overflow-y: auto;
  padding-bottom: 0;
}
:deep(.el-dialog__footer){
  position: sticky;
  bottom: 0;
  height: 55px;
  display: flex;
  justify-content: end;
  padding-left: 0;
  padding-right: 0;
  margin: 0 15px;
  background: #fff;
  border-top: 1px solid #dcdfe6;
  .el-form-item__content{
    justify-content: end;
    margin-right: 40px;
  }
}
.dialog-content{
  .rain-level{
    display: flex;
    height: 120px;
    background: #F4F8FB;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
    li{
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      flex: 1;
      border-radius: 8px;
      background: #fff;
      margin-right: 8px;
      padding: 8px 15px;
      cursor: pointer;
      box-sizing: border-box;
      strong{
        font-size: 17px;
      }
      .rain-info{
        display: flex;
        justify-content: space-between;
        span:first-child{
          display: inline-block;
          width: 35px;
          height: 20px;
        }
        span:last-child{
          font-weight: bold;
        }
      }
      &:last-child{
        margin-right: 0;
      }
    }
    .active{
      position: relative;
      border: 1px solid #BE4242;
      &:after{
        content:'预警限';
        position: absolute;
        right: 0;
        top: 0;
        display: block;
        height: 23px;
        width: 50px;
        background: #BE4242;
        color: #fff;
        font-size: 13px;
        text-align: center;
        border-bottom-left-radius: 8px;
        border-top-right-radius: 8px;
      }
    }
  }
  .cus-form{
    :deep(.el-form-item__content){
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .form-wrapper-box{
      display: flex;
      align-items: center;
      padding: 10px;
      background: #F4F8FB;
      border-radius: 8px;
    }
    .wd{
      width: 250px;
    }
    .marg{
      margin-bottom: 10px;
    }
  }
}
.general{
  display: flex;
  flex: 1;
  min-height: 690px;
  margin-top: 10px;
  .lf{
    flex: 0.2;
    border-right: 1px solid #ebeef5;
  }
  .center{
    display: flex;
    flex-direction: column;
    flex: 0.5;
    margin: 0 10px;
    .tablebox,.rainChart{
      flex: 1;
    }
  }
  .rg{
    display: flex;
    flex-direction: column;
    flex: 0.3;
    .top{
      .tag-box{
        display: flex;
        flex-wrap: wrap;
        .sub-tab{
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
          font-size: 14px;
          height: 65px;
          width: 110px;
          color: #fff;
          border-radius: 8px;
          margin: 0 2px 5px 2px;
          strong{
            font-size: 16px;
          }
        }
      }
    }
    .bottom{
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-top: 10px;
      .stationTable{
        flex: 1;
      }
    }
  }
}
</style>