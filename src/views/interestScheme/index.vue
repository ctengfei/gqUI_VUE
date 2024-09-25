<template>
  <template v-if="visible">
    <div class="app-container page1">
      <el-tabs v-model="activeName" >
        <el-tab-pane label="年度计划" name="YEARLY"></el-tab-pane>
        <el-tab-pane label="月度计划" name="MONTHLY"></el-tab-pane>
<!--        <el-tab-pane label="旬计划" name="XUN"></el-tab-pane>-->
      </el-tabs>
      <pro-crud
          ref="crudRef"
          v-model="form"
          v-model:search="serachForm"
          :columns="columns"
          :form-columns="formColumns"
          :gutter="20"
          :menu="menu"
          :data="data"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="->,total,sizes,prev, pager, next, jumper"
          background
          :page-sizes="[10,20,30,40,50]"
          :total="total"
          @load="load"
          column="2"
          width="45%"
          align="center"
          :before-open="beforeOpen"
          :before-close="beforeClose"
          label-width="110px"
          direction="vertical"
          @search="searchSubmit"
          @search-reset="searchReset"
          @submit="submit"
      >
        <!-- <template #table-forecastYear="{size,row}">
          {{ row.planModule == 'MONTHLY' ? `${row.forecastYear}-${row.forecastMonth}` : row.forecastYear }}
        </template> -->
        <template #form-menu-right="{ size }">
          <el-button
              :size="size"
              @click="crudRef.closeDialog()"
          >
            关闭
          </el-button>
        </template>
        <template #menu="{ size,row }">
          <el-button :size="size" :icon="Search" type="success" link @click="handleClick(row)">
            详情
          </el-button>
        </template>
      </pro-crud>
      <el-dialog
          v-model="dialogVisible2"
          title="详情"
          width="38%"
          class="k-dialog"
      >
        <el-form :inline="true" :model="formInline"  label-position="right" label-width="130px">
          <el-form-item label="方案名称" prop="allocName">
            <el-input  disabled v-model="formInline.allocName" />
          </el-form-item>
          <el-form-item label="计划月份" prop="planMonth">
            <el-input  disabled v-model="formInline.planMonth" />
          </el-form-item>
          <el-form-item label="上月末水位(m)" prop="ZEndLast">
            <el-input  disabled v-model="formInline.ZEndLast" />
          </el-form-item>
          <el-form-item label="上月末库容(万m³)" prop="VEndLast">
            <el-input  disabled v-model="formInline.VEndLast"  />
          </el-form-item>
          <el-form-item label="净来水量(万m³)" prop="winJing">
            <el-input  disabled v-model="formInline.winJing"  />
          </el-form-item>
          <el-form-item label="农业供水量(万m³)" prop="wuseArg">
            <el-input  disabled  v-model="formInline.wuseArg"  />
          </el-form-item>
          <el-form-item label="城乡供水量(万m³)" prop="wuseUrban">
            <el-input  disabled v-model="formInline.wuseUrban"  />
          </el-form-item>
          <el-form-item label="发电用水量(万m³)" prop="wuseElec">
            <el-input  disabled v-model="formInline.wuseElec"  />
          </el-form-item>
          <el-form-item label="生态用水量(万m³)" prop="wuseEco">
            <el-input  disabled v-model="formInline.wuseEco"  />
          </el-form-item>
          <el-form-item label="取水量(万m³)" prop="wShort">
            <el-input  disabled v-model="formInline.wShort" />
          </el-form-item>
          <el-form-item label="总用水量(万m³)" prop="wuseTotal">
            <el-input  disabled v-model="formInline.wuseTotal" />
          </el-form-item>
          <el-form-item label="月末水位(m)" prop="ZEnd">
            <el-input  disabled v-model="formInline.ZEnd"  />
          </el-form-item>
          <el-form-item label="月末库容(万m³)" prop="VEnd">
            <el-input  disabled v-model="formInline.VEnd"  />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button type="primary" @click="dialogVisible2 = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  <template v-else>
    <div class="app-container page2">
      <div class="head">
        <div class="lf">
          <div class="head-title" style="font-size: 18px;line-height: 38px;">方案制定</div>
          <li>
            <span>方案名称：</span>
            <el-input v-model="currentRow.allocName" readonly placeholder="请输入方案名称"/>
          </li>
          <li>
            <span style="margin-left: 15px">预报时段：</span>
            <el-input style="width:240px" v-model="year" readonly/>
          </li>
          <li>
            <el-button type="primary"  @click="handleCount">计算</el-button>
            <el-button type="primary"  @click="handleOptimizingComputation">优化计算</el-button>
            <el-button type="primary"  @click="handleParamsSetting">参数设置</el-button>
          </li>
        </div>
        <div class="rg">
          <el-button type="primary"  :icon="Document" @click="handleStaement">生成报表</el-button>
          <el-button type="primary" link :icon="ArrowLeftBold" @click="visible = !visible ">返回</el-button>
        </div>
      </div>
      <div class="items-box">
        <li>
          <div class="title"><i></i>来水总量(万m³)</div>
          <div class="content">
            <div class="top"><strong>{{ statistics.inflowTotal || 0 }}</strong></div>
          </div>
        </li>
        <li>
          <div class="title"><i></i>用水总量(万m³)</div>
          <div class="content">
            <div class="top"><strong>{{ statistics.useWaterTotal || 0}}</strong></div>
          </div>
        </li>
        <li>
          <div class="title"><i></i>年末水位(m)</div>
          <div class="content">
            <div class="top"><strong>{{ statistics.endYearWaterLevel || 0 }}</strong></div>
          </div>
        </li>
        <li>
          <div class="title"><i></i>年末蓄水量(万m³)</div>
          <div class="content">
            <div class="top"><strong>{{ statistics.endYearWaterCapacity || 0 }}</strong></div>
          </div>
        </li>
        <li>
          <div class="title"><i></i>最高水位(m)</div>
          <div class="content">
            <div class="top"><strong>{{ statistics.yearMaxWaterLevel || 0 }}</strong></div>
          </div>
        </li>
        <li>
          <div class="title"><i></i>最高蓄水量((万m³))</div>
          <div class="content">
            <div class="top"><strong>{{ statistics.yearMaxWaterStorage || 0 }}</strong></div>
          </div>
        </li>
      </div>
      <subTable :tableData="tableData1" />
      <el-dialog
          v-model="dialogVisible1"
          title="水量平衡表"
          class="x-table"
          width="80%"
      >
      <el-button type="success" class="download" plain icon="Download" @click="exportTable"
              >导出</el-button
            >
        <reportTable :tableData="tableData2" />
        <template #footer>
          <el-button type="primary" @click="dialogVisible1 = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  <el-dialog  v-model="dialogVisible3"
              title="参数设置"
              draggable
              width="50%">
    <paramsSetting :currentRow="currentRow" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible3 = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible3 = false">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import dayjs from "dayjs";
import {computed, onMounted, ref, watch} from "vue";
import {
  defineCrudBeforeClose,
  defineCrudBeforeOpen,
  defineCrudColumns,
  defineCrudMenuColumns, defineCrudSearch, defineCrudSubmit,
  defineFormColumns
} from "element-pro-components";
import reportTable from './reportTable';
import subTable from './subTable';
import paramsSetting from './paramsSetting';
import { Search,Upload,ArrowLeftBold,Download,Document } from '@element-plus/icons-vue';
import {ElMessageBox} from "element-plus";
import {getInc} from "@/api/incomingWater";
import {ElLoading} from "element-plus";
import {getMonthScn, getYearStatement, getYearStatistics, getYearTable,getAllocationBtnApi} from "@/api/interestScheme";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  edit:false,
  fixed: 'right',
  addText: '新增',
  detail: false,
  reset: false,
  del:false,
  width: '320',
  addProps: {
    type: 'primary',
    plain: true,
    icon: 'Plus'
  },
  editProps: {
    link: true,
    type: 'primary',
    icon: 'Edit'
  },
  delProps: {
    link: true,
    type: 'danger',
    icon: 'Delete'
  },
  searchResetProps:{
    icon:"Refresh",
  },
  searchProps:{
    type: 'primary',
    icon:"Search",
  },
  delText: '删除',
  editText: '方案定制',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
});
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
let activeName = ref('YEARLY');
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let tableData1 = ref([]);
let tableData2 = ref([]);
let dialogVisible1 = ref(false);
let visible = ref(true);
let dialogVisible2 = ref(false);
let dialogVisible3 = ref(false);
let checkedi = ref(false);
let formInline = ref({});
let statistics = ref({});
let currentRow = ref({});
let year = ref('');
let downloadLoadingInstance = null
//获取proxy
const { proxy } = getCurrentInstance();
const columns = defineCrudColumns([
  {
    label: '方案名称',
    prop: 'allocName',
    component: 'el-input',
    props: {
      clearable: true,
      placeholder: '请输入方案名称',
    },
    form: true,
    search: true,
  },
  {
    label: '预报开始时间',
    prop: 'forecastSdate',
    props: {
      placeholder: '请选择预报开始时间',
    },
    search: false,
    form: true,
  },
  {
    label: '预报结束时间',
    prop: 'forecastEdate',
    props: {
      placeholder: '请选择预报结束时间',
    },
    search: false,
    form: true,
  },
  {
    label: '净来水量(万m³)',
    prop: 'winJing',
    search: false,
    form: true,
  },
  {
    label: '总用水量(万m³)',
    prop: 'wuseTotal',
    search: false,
    form: true,
  },
  {
    label: '期末库水位(m)',
    prop: 'zend',
    search: false,
    form: true,
  },
  {
    label: '期末库容(万m³)',
    prop: 'vend',
    search: false,
    form: true,
  },
  {
    label: '制定时间',
    prop: 'createTime',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      style: {width: '100%'},
      'value-format': "YYYY-MM-DD",
    },
    search: true,
    form: true,
  },
  {
    label: '制定人',
    prop: 'createBy',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns([]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
    form.value = row || {};
  } else {
    form.value = {};
    done();
  }
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
});

const handleStaement = () => {
  dialogVisible1.value = true;
  getYearStatement({
    allocCode:currentRow.value.allocCode,
  }).then(res=>{
    if(res.success){
      console.log(res.data)
      tableData2.value = res.data;
    }
  })
}

const handleClick = (row) =>{
  // if(row.planModule == "YEARLY" ){
    visible.value = !visible.value;
    currentRow.value = row;
    year.value =`${row.forecastSdate} ~ ${row.forecastEdate}`;
    getAllData()
  // }else{
  //   dialogVisible2.value = true;
  //   getMonthScn({allocCode:row.allocCode}).then(res=>{
  //     if(res.success){
  //       formInline.value = res.data || {};
  //     }
  //   })
  // }
}
//获取列表数据
const getAllData=()=>{
  getYearStatistics({allocCode:currentRow.value.allocCode}).then(res=>{
      if(res.success){
        statistics.value = res.data || {};
      }
    });
    getYearTable({allocCode:currentRow.value.allocCode}).then(res=>{
      if(res.success){
        tableData1.value = res.data;
      }
    })
}
const getData = () => {
  const { allocName, createTime } = serachForm.value||{}
  getInc({
    allocName,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    planModule:activeName.value,
    startTime: createTime ? createTime[0] : '',
    endTime: createTime ? createTime[1] : '',
  }).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  })
}

watch(activeName,(a)=>{
  getData()
},{immediate:true})

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  getData();
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
}


const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == 'add') {

    } else {

    }
  }
  done()
});


// 分页选择
const load = () => {
  getData()
}

//计算
const handleCount=()=>{
  downloadLoadingInstance = ElLoading.service({ text: "数据计算中，请稍候", background: "rgba(0, 0, 0, 0.7)", });
  getAllocationBtnApi({caseCode:currentRow.value.allocCode,resCode:'42022220001',type:1}).then(res=>{
    if(res.success){
      downloadLoadingInstance.close();
        getAllData()
    }
  }).catch(e=>{
    downloadLoadingInstance.close();
  })
}

// 优化计算
const handleOptimizingComputation = () => {
  downloadLoadingInstance = ElLoading.service({ text: "数据计算中，请稍候", background: "rgba(0, 0, 0, 0.7)", });
  getAllocationBtnApi({caseCode:currentRow.value.allocCode,resCode:'42022220001',type:2}).then(res=>{
    if(res.success){
      downloadLoadingInstance.close();
      getAllData()
    }
  }).catch(e=>{
    downloadLoadingInstance.close();
  })
}

//参数设置
const handleParamsSetting = () => {
  dialogVisible3.value = true;
}

const exportTable=()=>{
  const params = {
    allocCode:currentRow.value.allocCode
  };
  proxy.download(
    "/bim/resWaterResource/allocation/yearPlanDetail/export",
    params,
    `水量平衡表_${dayjs().format("YYYY-MM-DD")}.xlsx`
  );
}
</script>

<style scoped lang="scss">
:deep(.x-table .el-dialog__body){
  padding-bottom: 0!important;
}
:deep(.k-dialog .el-dialog__body){
  padding-bottom: 0!important;
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
.page2{
  .head{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    .lf{
      display: flex;
      li{
        display: flex;
        align-items: center;
        margin-left: 15px;
        span{
          white-space: nowrap;
        }
      }
    }
    .rg{

    }
  }
  .items-box{
    display: flex;
    height: 130px;
    li{
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      flex: 1;
      margin: 0 5px;
      background: #ccc;
      .title{
        text-align: center;
        color: #fff;
        margin-top: 32px;
        margin-bottom: 10px;
        i {
          position: relative;
          display: inline-block;
          vertical-align: text-top;
          width: 24px;
          height: 24px;
          border-radius: 50px;
          margin-right: 10px;

          &:after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: url("@/assets/images/shui002.png") no-repeat center center;
            background-size: contain;
            display: block;
            height: 15px;
            width: 15px;
          }
        }
      }

      .content{
        flex: 1;
        .top{
          display: flex;
          justify-content: center;
          color: #fff;
          strong{
            font-size: 25px;
            color: #fff;
            line-height: 18px;
          }
        }
      }
    }
    li:nth-child(1){
      background: #4ca2f1;
    }
    li:nth-child(2){
      background: #bd9dff;
    }
    li:nth-child(3){
      background: #4acbb9;
    }
    li:nth-child(4){
      background: #4ca2f1;
    }
    li:nth-child(5){
      background: #bd9dff;
    }
    li:nth-child(6){
      background: #4acbb9;
    }

    li:nth-child(1) .title i {
      background: #2C9BFD;
    }

    li:nth-child(2) .title i {
      background: #57C777;
    }

    li:nth-child(3) .title i {
      background: #FC7F00;
    }

    li:nth-child(4) .title i {
      background: #2C9BFD;
    }

    li:nth-child(5) .title i {
      background: #57C777;
    }

    li:nth-child(6) .title i {
      background: #FC7F00;
    }
  }
  .download{
    margin-bottom: 10px;
  }
}

</style>