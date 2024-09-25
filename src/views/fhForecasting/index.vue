<template>
<div class="app-container" style="background: transparent;padding: 0;">
  <div class="top">
    <span class="head-title" style="font-size: 18px">预报参数</span>
    <div class="filter-content">
      <li>
        <div class="box">
          <span>预报模型</span>
          <el-select v-model="form.forecasttype">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>
        <div class="box">
          <span>输水隧洞状态</span>
          <el-radio-group v-model="form.gatestatus">
            <el-radio label="1" size="large">开启</el-radio>
            <el-radio label="0" size="large">关闭</el-radio>
          </el-radio-group>
        </div>
        <div class="box">
          <span>开始时间</span>
          <el-date-picker
              v-model="form.starttime"
              type="datetime"
              :disabled-date="disableDate"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm"
          />
        </div>
      </li>
      <li>
        <div class="box">
          <span>预报开始时间</span>
          <el-date-picker
              v-model="form.forecasttime"
              type="datetime"
              :disabled-date="disableDate"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm"
          />
        </div>
        <div class="box">
          <span>预热期长度(天)</span>
          <el-input-number v-model="form.warmup" :min="1" />
        </div>
        <div class="box">
          <span>预见期(小时)</span>
          <el-input-number v-model="form.forcastperiod" :min="1" />
        </div>
      </li>
      <li style="justify-content: space-evenly">
        <div class="box">
          <span style="margin-right: 20px">王英水库初始水位</span>
          <el-input v-model="form.initialzWy"  />
        </div>
        <div class="box">
          <span style="margin-right: 20px">蔡贤水库初始水位</span>
          <el-input v-model="form.initialzCx"  />
        </div>
      </li>
      <li>
        <div class="box" style="justify-content: space-around">
          <el-checkbox v-model="checkbox" label="考虑未来"  />
          <el-button :disabled="!checkbox" type="primary" style="width: 150px" @click="dialogVisible = true">未来降雨</el-button>
        </div>
        <div class="box" style="justify-content: center">
          <el-button type="success" style="width: 150px" @click="handleYb">预报</el-button>
          <el-button type="primary" style="width: 150px">保存</el-button>
        </div>
      </li>
    </div>
  </div>
  <div class="bottom">
    <div class="lf"></div>
    <div class="rg">
      <div class="head">
        <el-radio-group v-model="dio">
          <el-radio-button label="1" >王英</el-radio-button>
          <el-radio-button label="2" >蔡贤</el-radio-button>
        </el-radio-group>
        <el-button style="margin-left: 30px;width: 200px" type="primary" icon="Download">导出</el-button>
      </div>
      <el-table :data="tableData" style="height: calc(100% - 32px);margin-top: 5px">
        <el-table-column prop="date" label="时间" align="center" />
        <el-table-column label="预报数据" align="center">
          <el-table-column prop="name1" label="流量(m³/s)" align="center" />
          <el-table-column prop="name2" label="水位(m)" align="center" />
          <el-table-column prop="name3" label="库容(万m³)" align="center" />
        </el-table-column>
      </el-table>
    </div>
  </div>
  <el-dialog
      v-model="dialogVisible"
      title="未来雨量"
      width="45%"
      class="t-dialog"
  >
    <div class="head">
      <span>降雨预见期(小时)：</span>
      <el-input v-model="rain" style="width: 100px;margin-right: 20px" />
      <el-button type="primary" style="width: 100px;margin-right: 40px">确定</el-button>
      <span>降雨量(mm)：</span>
      <el-input v-model="totalRain" style="width: 100px;margin-right: 20px"  placeholder="总降雨量" />
      <el-button type="primary" style="width: 100px">平均分配</el-button>
      <el-table :data="dataets" show-summary border style="margin-top: 10px" height="450"
                :summary-method="getSummaries"
                @selection-change="handleSelectionChange"  >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" align="center" width="60" />
        <el-table-column prop="name1" label="时间" align="center" />
        <el-table-column prop="name2" label="降雨量" align="center"  />
      </el-table>
    </div>
    <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
    </template>
  </el-dialog>
</div>
</template>

<script setup>
import {ref, watch} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import dayjs from "dayjs";
import {addHl, postSw} from "@/api/fhForecasting";
const dictStore = useDictionaryStore();
let options  = ref(dictStore.getDict('FORECAST_TYPE'));
let checkbox = ref(false);
let dialogVisible = ref(false);
let rain = ref('46');
let totalRain = ref('');
let dio = ref('1');
let tableData = ref([
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
  {data:'123',name1:'2123',name2:'232',name3:'e32'},
]);
let dataets = ref([{name1:'123',name2:'3232'}]);
const form = ref({
  forecasttype:'1',
  gatestatus:'0',
  starttime:dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:00:ss'),
  forecasttime:dayjs().format('YYYY-MM-DD HH:00:ss'),
  warmup:60,
  forcastperiod:48,
  initialzWy:'',
  initialzCx:'',
});

watch(()=>form.value.forecasttime,(ecs)=>{
  postSw({
    cxStcd:'61608212',
    wyStcd:'61608180',
    tm:ecs,
  }).then(res=>{
  })
},{immediate:true})

const handleSelectionChange = () =>{

}

const disableDate = (time) => {
  return time.getTime() > Date.now()+1
}

const getSummaries = (param) =>{
  const { columns, data } = param;
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = ''
      return
    }
    else if(index ===1){
      sums[index] = ''
      return
    } else if(index ===2){
      sums[index] = '合计'
      return
    }
    const values = data.map((item) => Number(item[column.property]))
    if (!values.every((value) => Number.isNaN(value))) {
      sums[index] = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!Number.isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)
    } else {
      sums[index] = 0
    }
  })
  return sums
}

const handleYb = () =>{
  addHl(form.value).then(res=>{
  })
}
</script>

<style scoped lang="scss">
:deep(.t-dialog .el-dialog__body){
  padding-bottom: 0;
}
.head-title {
  position: relative;
  padding-left: 15px;
  font-size: 15px;
  font-weight: 600;

  &:after {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 10px;
    background: #1791FF;
  }
}
.top{
  display: flex;
  flex-direction: column;
  height: 250px;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  .filter-content{
    display: flex;
    flex: 1;
    li{
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      flex: 1;
      background: #F4F8FB;
      margin: 0 8px;
      padding: 10px;
      border-radius: 8px;
      .box{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        span{
          display: inline-block;
          white-space: nowrap;
          width: 140px;
          padding-left: 20px;
        }
      }
      &:first-child{
        margin-left: 0;
      }
      &:last-child{
        margin-right: 0;
      }
    }
  }
}
.bottom{
  display: flex;
  background: #fff;
  border-radius: 8px;
  margin-top: 15px;
  padding: 15px;
  height: calc(100vh - 410px);
  .lf{
    flex: 0.7;
  }
  .rg{
    flex: 0.3;
    .head{
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }

}
.t-dialog{
  .head{

  }
}
</style>