<template>
  <div class="app-container">
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
        draggable
        :page-sizes="[10,20,30,40,50]"
        :total="total"
        @load="load"
        column="2"
        width="50%"
        align="center"
        label-width="155px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
    >
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #search-menu-right="{ size }">
        <el-button  style="margin-left: 30px" type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #table-ppdwwptn="{ size, row, column, $index }">
        {{ formatterVal(row,'WPTN_CODE','ppdwwptn') }}
      </template>
      <template #table-ppupwptn="{ size, row, column, $index }">
        {{ formatterVal(row,'WPTN_CODE','ppupwptn') }}
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
import { formatterVal } from '@/utils';
import {ref, reactive, onMounted} from "vue";
import {ElMessage} from "element-plus";
import {getBz} from "@/api/informationManager/timeData/bzTimeData";
import dayjs from "dayjs";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  hide:true,
  fixed:'right',
  addText: '新增',
  detail:false,
  del:false,
  edit:false,
  reset:false,
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
const crudRef = ref();
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
    label: '测流方法',
    prop: 'msqmt',
    search: false,
    form: true,
  },
  {
    label: '开机台数',
    prop: 'omcn',
    search: false,
    form: true,
  },
  {
    label: '开机功率(kw)',
    prop: 'ompwr',
    search: false,
    form: true,
  },
  {
    label: '引排特征码',
    prop: 'pdchcd',
    search: false,
    form: true,
  },
  {
    label: '抽水流量(m³/s)',
    prop: 'pmpq',
    search: false,
    form: true,
  },
  {
    label: '站下水势',
    prop: 'ppdwwptn',
    search: false,
    form: true,
  },  {
    label: '站上水势',
    prop: 'ppupwptn',
    search: false,
    form: true,
  },
  {
    label: '站下水位(m)',
    prop: 'ppdwz',
    search: false,
    form: true,
  },
  {
    label: '站上水位(m)',
    prop: 'ppupz',
    search: false,
    form: true,
  },
  {
    label: '站水特征码',
    prop: 'ppwchrcd',
    search: false,
    form: true,
  },
  {
    label: '经度',
    prop: 'stLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'stLat',
    search: false,
    form: true,
  },
  {
    label: '测站位置',
    prop: 'stLoc',
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
    label:'备注',
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
  getBz({
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
  proxy.download("/business/realData/pumpR/page/export", {
    ...serachForm.value,
    pageNum:currentPage.value,
    pageSize:pageSize.value,
    startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
    endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
    tm:null,
  },`泵站实时数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}


</script>

<style scoped lang="scss">

</style>