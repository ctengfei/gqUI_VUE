<template>
  <template v-if="!isShowResult && visible">
    <div style="padding: 20px 20px;height: 100%;display: flex;flex-direction:column;overflow: auto">
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
          <template #form-a-label>
            <span class="head-title">方案设置</span>
          </template>
          <template #form-b-label='{ size, row }'>
            <span class="head-title">给定渠首流量设置</span>
          </template>
          <template #form-c-label='{ size, row }'>
            <span class="head-title">水动力模型设置</span>
          </template>
          <template #form-d-label='{ size, row }'>
            <span class="head-title">闸门控制设置</span>
          </template>
          <template #form-menu-right="{ size }">
            <el-button :size="size" @click="crudRef.closeDialog()">
              关闭
            </el-button>
          </template>
          <template #menu="{ size, row }">
            <el-button :size="size" type="text" icon='SwitchButton' @click="runModel(row)">
              运行模型
            </el-button>
            <el-button :size="size" type="success" icon="Search" link @click="lookResult(row)">
              查看结果
            </el-button>
          </template>
        </pro-crud>
      </div>
    </div>
  </template>
  <template v-if="isShowResult">
    <div class="app-container">
      <div class="parameters">
        <div class="title">
          <span class="head-title" style="font-size: 18px">{{ curCaseName }}</span>
          <el-button type="primary" link :icon="ArrowLeftBold" @click="isShowResult = false">返回</el-button>
        </div>
        <div class="settings-content">
          <earlyWarning :curCaseCode='curCaseCode' :curCaseName="curCaseName"/>
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
import { earlyWarning } from './components';
import { 
  getResultList, 
  getIwrWraRealBy, 
  getChanBase, 
  getChanBaseList, 
  getIwrWraReal, 
  addIwrWraReal, 
  updateIwrWraReal, 
  deleteIwrWraReal,
  getCaseDetail,
  runExcute,
} from "@/api/evolutionPlanData";
import { on } from "events";
import { number } from "echarts";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '制定新方案',
  detail: false,
  reset: false,
  width: '400',
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
const form = ref();
const crudRef = ref();
const serachForm = ref({});
let visible = ref(true);
let tableData = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let currentRow = ref({});
let curCaseName = ref('');//当前编辑方案
let curCaseCode = ref(0);//当前编辑方案
let isShowResult = ref(false);//结果
let waterResultArr = ref([])
let isTrue = reactive([
  {
    label: "配水方案",
    value: 1,
  },
  {
    label: "给定渠首流量",
    value: 2,
  }
]);
let gateNameList = ref([])
let isFalse = reactive({disabled: true});
let isWaterFalse = reactive({disabled: false});
let desFlowTemp = ref();
const columns = defineCrudColumns([
  {
    label: '方案名称',
    prop: 'caseName',
    component: 'el-input',
    props: {
      placeholder: '请输入方案名称',
    },
    search: true,
  },
  {
    label: '计算时间步长(秒)',
    prop: 'intervalRouting',
  },
  {
    label: '输出时间步长(秒)',
    prop: 'intervalOutput',
  },
  {
    label: '预热期长度(小时)',
    prop: 'spinupHours',
  },
  // {
  //   label: '闸门名称',
  //   prop: 'wirrUser',
  //   search: false,
  //   form: true,
  // },
  // {
  //   label: '闸门开度',
  //   prop: 'wirrUser',
  //   search: false,
  //   form: true,
  // },
  // {
  //   label: '闸门边界',
  //   prop: 'wirrUser',
  //   search: false,
  //   form: true,
  // },
  // {
  //   label: '制定时间',
  //   prop: 'iimsFormulateTime',
  //   component: 'el-date-picker',
  //   props: {
  //     type: 'daterange',
  //     'start-placeholder': '开始时间',
  //     'end-placeholder': '结束时间',
  //     style: { width: '100%' },
  //     'value-format': "YYYY-MM-DD",
  //   },
  //   search: false,
  // },
  // {
  //   label: '制定人',
  //   prop: 'createBy',
  // },
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '',
    prop: 'a',
    type: 'group',
    children: [
      {
        label: '方案名称',
        prop: 'caseName',
        'label-width': "auto",
        component: 'el-input',
        props: {
          placeholder: '请输入方案名称',
        },
        rules: [
          { required: true, message: '请输入方案名称' },
          { max: 50, message: '最长不超过50个字符' },
        ],
      },
      {
        label: '',
        'label-width': "auto",
        prop: 'moduleCal',
        component: 'pro-radio',
        props: {
          data: isTrue,
          onChange: radioChange,
        },
        md: 12,
      },
      {
        label: '配水方案',
        'label-width': "auto",
        prop: 'allocCode',
        component: 'pro-select',
        props: {
          onChange: waterChange,
          disabled: isWaterFalse.disabled,
          style:{width:'100%'},
          data: waterResultArr.value,
          clearable:true,
          config: {value: 'allocCode', label: 'iimsAllocName'},
          placeholder:'请选择配水方案',
        },
        rules: isWaterFalse.disabled ? [] : [{ required: true, message: '请选择配水方案' }],
        md: 12,
      },
    ]
  },
  {
    label: '给定渠首流量设置',
    prop: 'b',
    type: 'group',
    children: [
      {
        label: '开始时间',
        'label-width': "auto",
        prop: 'stime',
        component: 'el-date-picker',
        props: {
          onChange: getIwrWraRealByData,
          disabled: isFalse.disabled,
          placeholder: '请选择配水开始时间',
          type: 'datetime',
          style: { width: '100%' },
          'value-format': "YYYY-MM-DD HH:mm:ss",
        },
        rules: isFalse.disabled ? [] : [{ required: true, message: '请选择配水开始时间', trigger: ['blur','change'] }],
        md: 12,
      },
      {
        label: '灌溉需水量(万m3)',
        'label-width': "auto",
        prop: 'requireWater',
        component: 'el-input',
        props: {
          min: 0,
          clearable: true,
          disabled: true,
          style: { width: '100%' },
        },
        md: 12,
      },
      {
        label: '渠首闸流量(m3/s)',
        'label-width': "auto",
        prop: 'q',
        component: 'el-input',
        props: {
          min: 0,
          clearable: true,
          disabled: isFalse.disabled,
          placeholder: '请输入渠首闸流量',
          style: { width: '100%' },
        },
        rules: isFalse.disabled ? [] : [{ required: true, message: '请输入渠首闸流量', trigger: ['blur','change'] },
                                        {pattern: /^[0-9]*$/, message: '入渠首闸流量需为数字', trigger: 'blur'}],
        md: 12,
      },
    ]
  },
  {
    label: '水动力模型设置',
    prop: 'c',
    type: 'group',
    children: [
      {
        label: '计算时间步长(秒)',
        prop: 'intervalRouting',
        'label-width': "auto",
        component: 'el-input-number',
        props: {
          min:0,
          step: 60,
          placeholder: '请输入计算时间步长',
          style: { width: '100%' },
        },
        rules: [{ required: true, message: '请输入时间步长' }],
        md: 12,
      },
      {
        label: '输出时间步长(秒)',
        prop: 'intervalOutput',
        'label-width': "auto",
        component: 'el-input-number',
        props: {
          min:0,
          step: 60,
          placeholder: '请输入输出时间步长',
          style: { width: '100%' },
        },
        rules: [{ required: true, message: '请输入输出时间步长' }],
        md: 12,
      },
      {
        label: '预热期长度(小时)',
        prop: 'spinupHours',
        'label-width': "auto",
        component: 'el-input-number',
        props: {
          min:0,
          step: 1,
          placeholder: '请输入预热期长度',
          style: { width: '100%' },
        },
        rules: [{ required: true, message: '请输入预热期长度' }],
        md: 12,
      },
      {
        label: '预热期长度1(小时)',
        prop: 'spinup2Hours',
        'label-width': "auto",
        component: 'el-input-number',
        props: {
          min:0,
          step: 1,
          placeholder: '请输入预热期长度1',
          style: { width: '100%' },
        },
        rules: [{ required: true, message: '请输入预热期长度1' }],
        md: 12,
      },
      {
        label: '延长期长度(小时)',
        prop: 'moreHours',
        'label-width': "auto",
        component: 'el-input-number',
        props: {
          min:0,
          step: 1,
          placeholder: '请输入延长期长度',
          style: { width: '100%' },
        },
        rules: [{ required: true, message: '请输入延长期长度' }],
        md: 12,
      },
    ]
  },
  {
    label: '闸门控制设置',
    prop: 'd',
    type: 'group',
    children: [
      {
        label: '闸门名称',
        'label-width': "auto",
        prop: 'wraRepCd',
        component: 'pro-select',
        props: {
          placeholder: '请输入闸门名称',
          style: { width: '100%' },
          filterable: true,
          data: gateNameList.value,
          clearable:true,
          onChange: wraChange,
          // config: {value: 'allocCode', label: 'iimsAllocName'},
          config: {value: 'wraRepCd', label: 'wraRepNm'},
        },
        rules: [{ required: true, message: '请选择或输入闸门名称' }],
        md: 12,
      },
      {
        label: '控制闸门开度',
        'label-width': "auto",
        prop: 'status',
        component: 'el-input-number',
        props: {
          min: 0,
          max: 100,
          step: 10,
          placeholder: '请输入控制闸门开度',
          style: { width: '100%' },
        },
        rules: [{ required: true, message: '请输入控制闸门开度' }],
        md: 12,
      },
      {
        label: '控制闸门边界',
        'label-width': "auto",
        prop: 'bound',
        component: 'el-input',
        props: {
          min: 0,
          clearable: true,
          placeholder: '请输入控制闸门边界',
          style: { width: '100%' },
        },
        // rules: [{ required: true, message: '请输入控制闸门边界' },{pattern: /^[0-9]*$/, message: '入渠首闸流量需为数字', trigger: 'blur'}],
        md: 12,
      },
    ]
  },
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  gateNames();
  getResultListData();
  if (type === 'edit') {
    getCaseDetail(row.caseCode).then(res=>{
      if(res.success) {
        form.value = res.data;
        currentRow.value = res.data
        curCaseCode.value = res.data.caseCode
        curCaseName.value = res.data.caseName
        if(res.data.moduleCal == 2){
          getIwrWraRealByData(res.data.stime)
          changeBase();
          isWaterFalse.disabled = true;
          isFalse.disabled = false;
        }else{
          isWaterFalse.disabled = false;
          isFalse.disabled = true;
        }
      }
    })
    // console.log(row,"row")
    // form.value = row || {};
    // currentRow.value = row;
    // curCaseCode.value = row.caseCode
    // curCaseName.value = row.caseName
    done();
  } else {
    form.value = { moduleCal: 1, intervalRouting: 600, intervalOutput: 3600, spinupHours: 12,spinup2Hours:6,moreHours:48 };
    done();
  }
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  isWaterFalse.disabled = false
  isFalse.disabled = true
  done()
});

onMounted(() => {
  getData();
  // getResultListData();
})

// 选择是否选择配水方案
const radioChange = (val) => {
  isWaterFalse.disabled = (val == 1) ? false : true;
  isFalse.disabled = (val == 1) ? true : false;
  if(val == 2){
    changeBase();
  }else{
    form.value.desFlow = ''
  }
}

// 获取灌溉需水量
const changeBase = () => {
  getChanBase().then(res=>{
    if(res.success){
      desFlowTemp.value = res.data.desFlow
      form.value = { ...form.value, q: res.data.desFlow }
    }
  })
}

// 获取配水方案
const getResultListData = () => { 
  getResultList().then(res => {
    waterResultArr.value = res.data
  })
}
// 获取渠首闸流量值
const getIwrWraRealByData = (val) => {
  getIwrWraRealBy({allocCode: 'CASE_SLSB',startTime: val}).then(res => {
    if (res.success) {
      form.value = { ...form.value, requireWater: res.data.iwrMao }
    }
  })
}
// 获取闸门名称列表
const gateNames = (val) => {
  getChanBaseList().then(res => {
    gateNameList.value = res.data
  })
}
const wraChange = (val) => {
  let temp = gateNameList.value.filter(item=>item.wraRepCd == val)
  console.log(temp,"temp")
  form.value = {...form.value, bound: temp[0].bound, status: temp[0].status , wraRepNm: temp[0].wraRepNm}
}
// 运行模型
const runModel = (row) => {
  runExcute({id: row.caseCode}).then(res => {
    if(res.success) {
      ElMessage({
          message: '运行成功',
          type: 'success',
        });
    }
  })
}
const getData = () => {
  const { caseName } = serachForm.value
  const params = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    caseName,
  }
  getIwrWraReal(params).then(res => {
    if (res.success) {
      tableData.value = res.data.data;
      total.value = res.data.total;
    }
  })
}
const waterChange = (val)=> {
  console.log(val,"1111")
}
const searchSubmit = defineCrudSearch((done) => {
  getData();
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
}
const lookResult = (row) => {
  curCaseCode.value = row.caseCode
  curCaseName.value = row.caseName
  isShowResult.value = true
}
const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  console.log(form.value,"form.value")
  if (isValid) {
    if (type == 'add') {
      const params = {
        ...form.value,
      }
      addIwrWraReal(params).then(res => {
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
      updateIwrWraReal(curCaseCode.value, { ...form.value }).then(res=> {
        if (res.success) {
          ElMessage({
            message: '修改成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
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
    deleteIwrWraReal(row.caseCode).then(res => {
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

.head-title {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  border-bottom: 1px dotted;
}

.head-title:after {
  height: 15px !important;
}
</style>