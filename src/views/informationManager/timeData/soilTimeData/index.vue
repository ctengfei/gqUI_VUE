<template>
  <div class="app-container">
    <pro-crud
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
        width="40%"
        align="center"
        label-width="155px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
    >
      <template #search-menu-right="{ size }">
        <el-button  style="margin-left: 30px" type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
    </pro-crud>
  </div>
</template>

<script setup>
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineTableIndexColumns,
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import {ref, reactive, onMounted} from "vue";
import {addWas, exportWasExcel, getWas} from "@/api/informationManager/timeData/gateStationTimeData";
import {ElMessage} from "element-plus";
import {getGateOpenClose} from "@/api/informationManager/timeData/gateOpenCloseTimeData";
import dayjs from "dayjs";
import {getSoil} from "@/api/informationManager/timeData/soilTimeData";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del:false,
  edit:false,
  fixed:'right',
  addText: '新增',
  detail:false,
  width:'150',
  addProps: {
    type: 'primary',
    plain: true,
    icon:"Plus",
  },
  editProps:{
    link:true,
    type: 'primary',
    icon:'Edit'
  },
  delProps:{
    link:true,
    type: 'danger',
    icon:'Delete'
  },
  searchResetProps:{
    icon:"Refresh",
  },
  searchProps:{
    type: 'primary',
    icon:"Search",
  },
  delText:'删除',
  editText: '修改',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
});
const form = ref({});
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const columns = defineCrudColumns([
  {
    label: '测站编码',
    prop: 'stcd',
    component: 'el-input',
    props:{
      placeholder:'请输入测站编码',
    },
    form: true,
    search: true,
  },
  {
    label: '测站名称',
    prop: 'stName',
    component: 'el-input',
    props:{
      placeholder:'请输入测站名称',
    },
    form: true,
    search: true,
  },
  {
    label: '作物生长期',
    prop: 'crpgrwprd',
    form: true,
    search: false,
  },
  {
    label: '作物种类',
    prop: 'crpty',
    search: false,
    form: true,
  },
  {
    label: '作物水分状态',
    prop: 'hitrsn',
    search: false,
    form: true,
  },
  {
    label: '10cm 深度含水量(%)',
    prop: 'slm10',
    search: false,
    form: true,
  },
  {
    label: '20cm 深度含水量(%)',
    prop: 'slm20',
    search: false,
    form: true,
  },
  {
    label: '30cm 深度含水量(%)',
    prop: 'slm30',
    search: false,
    form: true,
  },
  {
    label: '40cm 深度含水量(%)',
    prop: 'slm40',
    search: false,
    form: true,
  },
  {
    label: '60cm 深度含水量(%)',
    prop: 'slm60',
    search: false,
    form: true,
  },
  {
    label: '80cm 深度含水量(%)',
    prop: 'slm80',
    search: false,
    form: true,
  },
  {
    label: '100cm 深度含水量(%)',
    prop: 'slm100',
    search: false,
    form: true,
  },
  {
    label: '土壤含水量测法',
    prop: 'slmmmt',
    search: false,
    form: true,
  },
  {
    label: '表层含水量(%)',
    prop: 'srlslm',
    search: false,
    form: true,
  },
  {
    label: '垂线平均含水量',
    prop: 'vtavslm',
    search: false,
    form: true,
    fixed:'right'
  },
  {
    label: '数据时间',
    prop: 'tm',
    component: 'el-date-picker',
    props: {
      type: 'datetimerange',
      'start-placeholder':"开始时间",
      'end-placeholder':'结束时间',
      'range-separator':'-',
      'value-format':"YYYY-MM-DD HH:mm:ss"
    },
    search: true,
    form: true,
    fixed:'right'
  },
  {
    label: '备注',
    prop: 'remark',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns([]);

onMounted(() => {
  getData();
})

const getData = () => {
  getSoil({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
    endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
    tm:null,
  }).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  });
}

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
    if (type == 'add'){
    }
  }
  done();
});


// 分页选择
const load = () => {
  getData()
}

const exportData = () => {
  proxy.download("/business/realData/soilR/page/export", {
    ...serachForm.value,
    pageNum:currentPage.value,
    pageSize:pageSize.value,
    startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
    endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
    tm:null,
  },`土壤墒情实时数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>