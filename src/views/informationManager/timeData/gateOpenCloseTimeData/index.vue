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
        draggable
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
    label: '过闸流量(m³/s)',
    prop: 'gtq',
    search: false,
    form: true,
  },
  {
    label: '开启高度(m)',
    prop: 'gtophgt',
    search: false,
    form: true,
  },
  {
    label: '开启孔数',
    prop: 'gtopnum',
    search: false,
    form: true,
  },
  {
    label: '设备编号',
    prop: 'eqpno',
    form: true,
    search: false,
  },
  {
    label: '设备类别',
    prop: 'eqptp',
    search: false,
    form: true,
  },
  {
    label: '数据时间',
    prop: 'tm',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'datetimerange',
      'start-placeholder':"开始时间",
      'end-placeholder':'结束时间',
      'range-separator':'-',
      'value-format':"YYYY-MM-DD HH:mm:ss"
    },
    search: true,
    form: true,
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
  getGateOpenClose({
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
  proxy.download("/business/realData/gateR/page/export", {
    ...serachForm.value,
    pageNum:currentPage.value,
    pageSize:pageSize.value,
    startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
    endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
    tm:null,
  },`闸门启闭实时数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.pro-form:not(.el-form--inline) .pro-form-menu){
  display: flex;
  .el-form-item__content{
    justify-content: end;
    margin-right: 40px;
  }
}
</style>