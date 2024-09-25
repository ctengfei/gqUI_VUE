<template>
<div class="box-container">
  <div class="top">
    <el-row :gutter="24">
      <el-col :span="8">
        <el-card shadow="always" class="top-card" style="background-color: rgba(54, 163, 247,0.3);color: #fff">
          <div class="card-tnt">
            <div class="img user"></div>
            <div class="detail">
              <h4>总用户</h4>
              <h2 style="color: #36A3F7">{{ userNum }} <span>人</span></h2>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="always" class="top-card" style="background-color: rgba(189, 157, 255, 0.3);color: #fff">
          <div class="card-tnt">
            <div class="img dept"></div>
            <div class="detail">
              <h4>部门</h4>
              <h2 style="color: #BD9DFF">{{ deptNum.length }} <span>个</span></h2>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="always" class="top-card" style="background-color: rgba(52, 191, 163, 0.3);color: #fff">
          <div class="card-tnt ">
            <div class="img line-user"></div>
            <div class="detail">
              <h4>在线用户</h4>
              <h2 style="color: #34BFA3">{{ onLine }} <span>人</span></h2>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
  <div class="center">
    <el-row :gutter="24">
      <el-col :span="15" >
        <el-card shadow="always" class="center-card" >
          <div style="height: 100%;width: 100%" ref="lineChart">

          </div>
        </el-card>
      </el-col>
      <el-col :span="9">
        <el-card shadow="always" class="center-card">
          <div style="height: 100%;width: 100%" ref="barChart">
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
  <div class="bottom" ref="card" >
    <el-row :gutter="24" >
      <el-col :span="15">
        <el-card shadow="always" class="bottom-card" >
          <div class="tablebox1" :style="{height: height,width:'48.5%'}">
            <div class="head-title">
              月度登录次数排行
            </div>
            <el-table :height="`calc(${height} - 22px)`" style="width: 100%" :data="tableData1" border>
              <el-table-column type="index" width="60" label="排名" align="center" />
              <el-table-column prop="realName" label="姓名" align="center" />
              <el-table-column prop="userName" label="账号" align="center" />
              <el-table-column prop="loginNum" label="登录次数"   align="center"/>
            </el-table>
          </div>
          <el-divider direction="vertical" border-style="dashed" :style="{height: height,margin:'0 5px',verticalAlign:'text-bottom'}" />
          <div class="tablebox1" :style="{height: height,width:'50%'}">
            <div class="head-title">
              月度模块使用次数排行
            </div>
            <el-table :height="`calc(${height} - 20px)`" style="width: 100%"  :data="tableData2"  border>
              <el-table-column type="index" width="60" label="排名" align="center" />
              <el-table-column prop="title" label="系统模块" align="center" />
              <el-table-column prop="operNum" label="使用次数"   align="center"  />
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="9">
        <el-card shadow="always" class="bottom-card">
          <div class="tablebox1" :style="{height: height,width:'100%'}">
            <div class="head-title">
              在线用户排行
            </div>
            <el-table :height="`calc(${height} - 20px)`"  :data="tableData3" border>
              <el-table-column type="index" width="60" label="序号" align="center" />
              <el-table-column prop="realName" label="姓名" align="center" />
              <el-table-column prop="userName" label="账号" align="center" />
              <el-table-column prop="loginTime" label="登录时间" align="center" >
                <template #default="{row}">
                  {{ dayjs(row.loginTime).format('YYYY-MM-DD HH:mm:ss') }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</div>
</template>

<script setup>
import {onMounted,ref} from "vue";
import {getLoginCount, getOnlineUser, getSystemUseCount} from "@/api/system/overview";
import dayjs from "dayjs";
import * as echarts from "echarts";
import {getUserList} from "@/api/waterManager/instManagement";
import {listDept} from "@/api/system/dept";
import {treeToArray} from "@/utils";
const card = ref();
const lineChart = ref();
const barChart = ref();
const { proxy } = getCurrentInstance();
let height = ref('100%');
let tableData1 = ref([])
let tableData2 = ref([]);
let tableData3 = ref([]);
let userNum = ref(0);
let deptNum = ref(0);
let onLine = ref(0);

onMounted(()=>{
  height.value = `${card.value.clientHeight - 42}px`;
  window.addEventListener('resize', () => {
    height.value = `${card.value.clientHeight - 42}px`;
  })

  getUserList().then(res=>{
    if(res.code == 200){
      userNum.value = res.data.length;
    }
  })
  listDept().then(res=>{
    if(res.code == 200){
      const result = res.data.filter(r=> !(r.deptId == 115))
      let tree = proxy.handleTree(result, "deptId");
      tree = loop(tree);
      deptNum.value = treeToArray(tree).filter(r=>r.level == 2)
    }
  })
  getLoginCount({
   params:{
     beginTime:dayjs().subtract(29, 'days').format('YYYY-MM-DD'),
     endTime:dayjs().format('YYYY-MM-DD')
   }
  }).then(res=>{
    if(res.code == 200){
      tableData1.value = res.data;
      const chart1 = echarts.init(lineChart.value);
      const x = res.data.map(r=>r.realName);
      const data = res.data.map(r=>r.loginNum);
      chart1.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          }
        },
        grid: {
          left: '2%',
          right: '3%',
          bottom: '0%',
          top:'12%',
          containLabel: true
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
            name:'月度登录次数(次)',
            type: 'value',
          },
        ],
        series: [    {
          type: 'line',
          tooltip: {
            valueFormatter: function (value) {
              return value + ' 次';
            }
          },
          data: data
        },]
      },true);
    }
  })
  getSystemUseCount({
    params:{
      beginTime:dayjs().subtract(29, 'days').format('YYYY-MM-DD'),
      endTime:dayjs().format('YYYY-MM-DD')
    }
  }).then(res=>{
    if(res.code == 200){
      tableData2.value = res.data.sort((a,b)=>b.operNum-a.operNum);
      const chart1 = echarts.init(barChart.value);
      const x = tableData2.value.map(r=>r.title);
      const data = tableData2.value.map(r=>r.operNum);
      chart1.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          }
        },
        grid: {
          left: '6%',
          right: '3%',
          bottom: '0%',
          top:'12%',
          containLabel: true
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
            name:'月度模块使用次数(次)',
            type: 'value',
          },
        ],
        series: [    {
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return value + ' 次';
            }
          },
          data: data
        },]
      },true);
    }
  })
  getOnlineUser().then(res=>{
    if(res.code == 200){
      tableData3.value = res.rows.sort((a,b)=>a.loginTime-b.loginTime);
      onLine.value = tableData3.value.length;
    }
  })
})

const loop = (data,index=0)=>{
  return data.map((r,i)=>{
    if(r.children && r.children.length){
      r['level'] = index
      r.children = loop(r.children,index +1 )
    }
    return{
      name:r.deptName,
      value:r.deptId,
      level:index,
      children:r.children
    }
  })
}

</script>

<style scoped lang="scss">
.box-container{
  display: flex;
  flex-direction: column;
  margin: 20px;
  height: calc(100% - 40px);
  .top{
    .top-card{
      height: 100px;
      text-align: center;
      .card-tnt{
        display: flex;
        justify-content: center;
        .img{
          width: 60px;
          height: 60px;
          margin-right: 20px;
        }
        .user{
          background: url("@/assets/images/count-user.png") no-repeat center center;
          background-size: contain;
        }
        .dept{
          background: url("@/assets/images/count-dept.png") no-repeat center center;
          background-size: contain;
        }
        .line-user{
          background: url("@/assets/images/count-line-user.png") no-repeat center center;
          background-size: contain;
        }
      }
      h4{
        font-size: 16px;
        text-align: left;
      }
      h2{
        font-size: 40px;
        color: #36A3F7;
        font-weight: normal;
        margin-bottom: 0;
        span{
          font-size: 16px;
        }
      }
    }
  }
  .center{
    margin-top: 10px;
    .center-card{
      height: 300px;
      :deep(.el-card__body){
        height: 100%;
      }
    }
  }
  .bottom{
    margin-top: 10px;
    flex: 1;
    .bottom-card{
      padding-bottom:0!important;
      height:calc(100% - 10px);
      :deep(.el-card__body){
        height: 100%;
      }
      .tablebox1{
        display: inline-block;
      }
    }
  }
}
</style>