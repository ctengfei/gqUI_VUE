<template>
  <template v-if="!isShowResult && visible">
    <div style="padding: 20px 20px;height: 100%;display: flex;flex-direction:column;overflow: auto">
      <div class="card-container">
        <div class="card-b">
          <li>
            <div class="top">
              <i class="shuidi-ico"></i>
              <span>本年已来水量</span>
            </div>
            <div class="bottom">
              <div class="lf">
                <div class="tags">降雨量</div>
                <h1>{{ waterData.yearRainfall || 0 }}<span style="font-size: 12px">(万m³)</span></h1>
              </div>
              <div class="rg">
                <div class="tags">来水量</div>
                <h1>{{ waterData.yearInflow || 0 }}<span style="font-size: 12px">(万m³)</span></h1>
              </div>
            </div>
          </li>
          <li>
            <div class="top">
              <i class="shuidi-ico"></i>
              <span>{{ dayjs().format('MM') }}月多年平均来水量</span>
            </div>
            <div class="bottom">
              <div class="lf">
                <div class="tags">降雨量</div>

                <h1>{{ waterData.monthRainfall || 0 }}<span style="font-size: 12px">(万m³)</span></h1>
              </div>
              <div class="rg">
                <div class="tags">来水量</div>
                <h1>{{ waterData.monthInflow || 0 }}<span style="font-size: 12px">(万m³)</span></h1>
              </div>
            </div>
          </li>
        </div>
      </div>
      <div style="background: #fff;flex: 1;padding: 20px 20px">
        <pro-crud ref="crudRef" v-model="form" v-model:search="serachForm" :columns="columns" :form-columns="formColumns"
          :gutter="20" :menu="menu" :data="tableData" v-model:current-page="currentPage" v-model:page-size="pageSize"
          layout="->,total,sizes,prev, pager, next, jumper" background :page-sizes="[10, 20, 30, 40, 50]" :total="total"
          @load="load" :column="2" width="45%" align="center" :before-open="beforeOpen" :before-close="beforeClose"
          label-width="110px" direction="vertical" @search="searchSubmit" @search-reset="searchReset" @submit="submit"
          @delete="deleteRow">
          <template #search-menu-right="{ size }">
            <el-button :size="size" type="primary" icon="Plus" plain @click="crudRef.openDialog('add')"
              style="margin-left: 30px">制定新方案</el-button>
          </template>
          <template #form-menu-right="{ size }">
            <el-button :size="size" @click="crudRef.closeDialog()">
              关闭
            </el-button>
          </template>
          <template #menu="{ size, row }">
            <el-button :size="size" type="success" icon="Search" link @click="lookResult(row)">
              查看结果
            </el-button>
          </template>
        </pro-crud>
      </div>
    </div>
  </template>
  <template v-if="!isShowResult && !visible">
    <div class="app-container">
      <div class="parameters">
        <div class="title">
          <span class="head-title" style="font-size: 18px">调度方案</span>
          <el-button type="primary" link :icon="ArrowLeftBold" @click="changeReturn">返回</el-button>
        </div>
        <div class="settings-top">
          <li>
            <span>方案名称&nbsp; &nbsp;</span>
            <el-input disabled v-model="curIimsAllocName" />
          </li>
          <div class="steps-box">
            <el-steps :active="activeStep" finish-status="success" simple style="margin-top: 20px">
              <el-step :title="item.title" :icon="item.icon" v-for="(item, index) in stepList" :key="index" />
            </el-steps>
          </div>
        </div>
        <div class="settings-content">
          <div class="content">
            <!-- <div style="display: flex;align-items: center" v-if="activeStep === 0">
              <span>可供水量填报（m³）：</span>
              <el-input style="width: 200px;height: 32px" v-model="waterFilling"  placeholder="人工确认灌溉水量" size="small" />
              <el-button type="primary" @click="handleSave" style="margin-left: 20px">保存</el-button>
            </div> -->
            <div class="titleText">{{ titleText }}</div>
            <!-- <waterDemand v-if="activeStep === 0" :allocCode="curAllocCode" @changeStep="changeStep" /> -->
            <dispatchScheme v-if="activeStep === 0" :allocCode="curAllocCode" @changeStep="changeStep" />
            <waterResult :currentRow="currentRow" v-if="activeStep === 1" :allocCode="curAllocCode" @changeStep="changeStep" isHasBtn='prevBtn' />
          </div>
        </div>
      </div>
    </div>
  </template>
  <template v-if="isShowResult">
    <div class="app-container">
      <div class="parameters">
        <div class="title">
          <span class="head-title" style="font-size: 18px">调度方案</span>
          <el-button type="primary" link :icon="ArrowLeftBold" @click="isShowResult = false">返回</el-button>
        </div>
        <div class="settings-top">
          <li>
            <span>方案名称&nbsp; &nbsp;</span>
            <el-input disabled v-model="curIimsAllocName" />
          </li>
        </div>
        <div class="settings-content">
          <div class="content">
            <div class="titleText">动态配水结果</div>
            <waterResult :currentRow="currentRow" :allocCode="curAllocCode" @changeStep="changeStep" isHasBtn='export' />
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import dayjs from "dayjs";
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineCrudBeforeOpen,
  defineCrudBeforeClose,
} from 'element-pro-components';
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeftBold, Edit, Finished, Setting } from '@element-plus/icons-vue';
import { waterDemand, dispatchScheme, waterResult } from './components';
import {addScenarios, getScenariosList, delScenarios, getResultWirrSk, putResultWirrSk, getResultWirrStorge,getWreqDetailOpenMaxMinTime } from "@/api/scheSchemeData";
import { getTopStatistics } from "@/api/incomingWater";

const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '制定新方案',
  detail: false,
  reset: false,
  width: '300',
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
  searchResetProps: {
    icon: "Refresh",
  },
  searchProps: {
    type: 'primary',
    icon: "Search",
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
const stepList = reactive([
  // { title: '水量填报', icon: Edit },
  { title: '调度方案设置', icon: Setting },
  { title: '动态配水结果', icon: Finished },
]);
let waterFilling = ref('');
let visible = ref(true);
let tableData = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let currentRow = ref({});
let curIimsAllocName = ref('');//当前编辑方案
let curAllocCode = ref(0);//当前编辑方案
let activeStep = ref(0);//当前步骤
let titleText = ref(stepList[0].title);//当前步骤
let waterData = ref({});//来水量
let isShowResult = ref(false);//结果

const columns = defineCrudColumns([
  {
    label: '方案名称',
    prop: 'iimsAllocName',
    component: 'el-input',
    props: {
      placeholder: '请输入方案名称',
    },
    form: true,
    search: true,
  },
  {
    label: '配水开始时间',
    prop: 'iimsWaterAllocationStartTime',
    search: false,
    form: true,
  },
  {
    label: '王英水库供水量(百万m³)',
    prop: 'wirrUser',
    search: false,
    form: true,
  },
  {
    label: '制定时间',
    prop: 'iimsFormulateTime',
    component: 'el-date-picker',
    props: {
      type: 'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      style: { width: '100%' },
      'value-format': "YYYY-MM-DD",
    },
    search: true,
    form: true,
  },
  {
    label: '制定人',
    prop: 'iimsFormulateUserName',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns(computed(() => [
  {
    label: '方案名称',
    prop: 'iimsAllocName',
    component: 'el-input',
    props: {
      placeholder: '请输入方案名称',
    },
    rules: [
      { required: true, message: '请输入方案名称' },
      { max: 50, message: '最长不超过50个字符' },
    ],
    md: 12,
  },
  {
    label: '需水上报时间',
    prop: 'reqWaterStarTime',
    component: 'el-date-picker',
    props: {
      placeholder: '请选择需水上报时间',
      type: 'date',
      style: { width: '100%' },
      'value-format': "YYYY-MM-DD",
      onChange: reqWaterStartTimeChange
    },
    rules: [{ required: true, message: '请选择需水上报时间' }],
    md: 12,
  },
  {
    label: '所有分水口门配水时段',
    prop: 'reqWaterGateTime',
    component: 'el-date-picker',
    labelWidth:200,
    props: {
      placeholder: '请选择分水口门配水时段',
      type: 'daterange',
      disabled: true,
      style: { width: '100%' },
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format': "YYYY-MM-DD",
      'format':'YYYY-MM-DD'
    },
    rules: [{ required: true, message: '请选择分水口门配水时段' }],
    md: 24,
  },
  {
    label: '配水开始时间',
    prop: 'iimsWaterAllocationStartTime',
    component: 'el-date-picker',
    props: {
      placeholder: '请选择配水开始时间',
      type: 'date',
      style: { width: '100%' },
      'value-format': "YYYY-MM-DD HH:mm:ss",
      'format':'YYYY-MM-DD 08:00:00'
    },
    rules: [{ required: true, message: '请选择配水开始时间' }],
    md: 12,
  },
  {
    label: '王英水库供水量(百万m³)',
    'label-width': "auto",
    prop: 'wirrUser',
    component: 'el-input',
    props: {
      min: 0,
      clearable: true,
      placeholder: '请输入王英水库供水量',
    },
    rules: [{ required: true, message: '请输入王英水库供水量' }],
    md: 12,
  },
  {
    // label: '有效蓄水量计算',
    'label-width': "auto",
    component: 'el-button',
    props: {
      onClick: getWaterResult,
      plain: true,
      type: 'primary',
      slots: '有效蓄水量计算',
      style: { width: '30%' },
    },
    md: 12,
  },
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
    visible.value = !visible.value;
    form.value = row || {};
    currentRow.value = row;
    curIimsAllocName.value = row.iimsAllocName
    curAllocCode.value = row.allocCode
  } else {
    form.value = { wirrUser: 99999999};
    done();
  }
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
});

// 保存可供水量填报
const handleSave = () => {
  putResultWirrSk(curAllocCode.value,{wirrUser:waterFilling.value}).then(res=>{
    if (res.success) {
      getResultWirrSk(curAllocCode.value).then(res=>{
        if (res.success) {
          ElMessage({
            message: '保存成功',
            type: 'success',
          });
          waterFilling.value = res.data.wirrUser
        }
      })
    }
  })
}

onMounted(() => {
  getData()
  getTopStatistics().then(res => {
    if (res.success) {
      waterData.value = res.data
    }
  })
})
watch(activeStep, (newValue) => {
  titleText.value = stepList[newValue].title
});

watch(curAllocCode,(allocCode)=>{
  //可供水量填报
  getResultWirrSk(allocCode).then(res=>{
    if (res.success) {
      waterFilling.value = res.data.wirrUser
    }
  })
})
const getWaterResult = () => {
  getResultWirrStorge().then(res=>{
    if (res.success) {
      form.value.wirrUser = res.data;
    }
  })
}
//根据需水上报时间查询闸分水口最大最小时间
const reqWaterStartTimeChange = (val) =>{
  form.value.iimsWaterAllocationStartTime = val+" 08:00:00";

  getWreqDetailOpenMaxMinTime({reqWaterStarTime:val}).then(res=>{
    if (res.success) {
      if(res.data!=null){
        form.value.reqWaterGateTime = [res.data.minTm,res.data.maxTm];
      }else{
        form.value.reqWaterGateTime =[];
      }
    }
  })
}
const getData = () => {
  const { iimsAllocName, iimsFormulateTime } = serachForm.value
  const params = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    iimsAllocName,
    startTime: iimsFormulateTime ? iimsFormulateTime[0] : '',
    endTime: iimsFormulateTime ? iimsFormulateTime[1] : '',
  }
  getScenariosList(params).then(res => {
    if (res.success) {
      tableData.value = res.data.data;
      total.value = res.data.total;
    }
  })
}

const searchSubmit = defineCrudSearch((done) => {
  getData();
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
}
const changeReturn = () => {
  visible.value = !visible.value
  titleText.value = stepList[0].title
  activeStep.value = 0
}
const lookResult = (row) => {
  curAllocCode.value = row.allocCode
  curIimsAllocName.value = row.iimsAllocName
  isShowResult.value = true
}
const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == 'add') {
      const params = {
        ...form.value,
        resCode: '42022220001',
        iimsResName: '王英水库'
      }
      addScenarios(params).then(res => {
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    } else {

    }
  }
  done()
});


// 分页选择
const load = () => {
  getData()
}
//删除
const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    delScenarios(row.allocCode).then(res => {
      if (res.success) {
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    })
  })
};
//操作步骤条
const changeStep = (val) => {
  activeStep.value = activeStep.value + Number(val)
}
</script>

<style scoped lang="scss">
li {
  list-style-type: none;
}

.shuidi-ico {
  position: relative;
  display: inline-block;
  vertical-align: text-top;
  width: 50px;
  height: 50px;
  border-radius: 50px;
  margin-right: 10px;
  background: rgba(44, 155, 253, .3);

  &:after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: url("@/assets/images/shuiD.png") no-repeat center center;
    background-size: contain;
    display: block;
    height: 25px;
    width: 25px;
  }
}

.card-container {
  margin-bottom: 10px;

  .card-t {
    display: flex;
    width: 100%;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 80px;
      padding: 10px 20px;
      flex: 1;
      background: #FFFFFF;
      border-radius: 6px;

      .lf,
      .rg {
        display: flex;
      }

      .year-max {
        margin-right: 30px;

        .tags {
          display: inline-block;
          color: #FC7F00;
          background: rgba(252, 127, 0, .1);
          padding: 0px 5px;
          border-radius: 15px;
        }

        .content {
          color: #FC7F00;
        }
      }

      .year-min {
        margin-right: 30px;

        .tags {
          display: inline-block;
          color: #57C777;
          background: rgba(87, 199, 119, .1);
          padding: 0px 5px;
          border-radius: 15px;
        }

        .content {
          color: #57C777;
        }
      }

      &:first-child {
        margin-right: 10px;
      }
    }
  }

  .card-b {
    display: flex;
    width: 100%;
    margin-top: 10px;

    li {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: space-between;
      height: 110px;
      padding: 10px 20px;
      flex: 1;
      background: #FFFFFF;
      border-radius: 6px;

      &:first-child {
        margin-right: 10px;
      }

      .top {
        display: flex;
        align-items: center;
        flex: 0.3;
        width: 100%;
        background: linear-gradient(270deg, rgba(51, 196, 255, 0) 0%, rgba(23, 145, 255, 0.2) 100%);
        border-radius: 25px;

        .shuidi-ico {
          width: 45px;
          height: 45px;
        }

        span {
          color: rgba(102, 102, 102, 1);
          font-size: 13px;
        }
      }

      .bottom {
        display: flex;
        align-items: center;
        justify-content: space-around;
        flex: 0.6;
        width: 100%;

        .lf,
        .rg {
          display: flex;
          align-items: center;

          h1 {
            margin-bottom: 0;
            margin-left: 10px;
          }
        }

        .tags {
          background: rgba(23, 145, 255, .1);
          padding: 2px 8px;
          font-size: 12px;
          border-radius: 15px;
          font-weight: bold;
          color: #1791FF;
        }
      }
    }
  }
}

.parameters {
  display: flex;
  flex-direction: column;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

  .settings-top {
    display: flex;
    margin-top: 16px;
    padding-bottom: 20px;
    border-bottom: 6px solid #eaeaea;

    li {
      display: flex;
      align-items: center;

      span {
        white-space: nowrap;
      }
    }

    .steps-box {
      width: 60%;
      margin-left: 10%;
      margin-top: -20px;
    }

    :deep .el-steps--simple {
      background-color: #fff;
    }

    :deep .el-step__title.is-process {
      color: #1791FF;
    }

    :deep .is-process>.el-step__icon.is-icon {
      color: #1791FF;
    }
  }

  .settings-content {
    width: 100%;
    height: auto;

    .content {
      margin-top: 20px;
      width: 100%;

      .titleText {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 10px;
      }
    }
  }
}
</style>