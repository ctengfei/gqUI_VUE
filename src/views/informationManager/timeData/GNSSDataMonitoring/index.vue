<template>
    <!--gnss数据监测-->
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
  import {ElMessage} from "element-plus";
  import {getGateOpenClose} from "@/api/informationManager/timeData/gateOpenCloseTimeData";
  import dayjs from "dayjs";
  import {getSkList} from "@/api/informationManager/timeData/lakeIndicatorTimeData";
  import {gettblJcGnss} from "@/api/informationManager/timeData/GNSSDataMonitoringTimeData";
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
  let skList = ref([]);
  const { proxy } = getCurrentInstance();
  const columns = defineCrudColumns([
    {
        label: '序号',
        prop: 'index',
        search: false,
        form: true
    },
  {
        label: '名称',
        prop: 'name',
        component: 'el-input',
        props: {
            placeholder: '请输入名称',
            clearable: true
        },
        form: true,
        search: true
    },
    {
        label: 'X方向位移(mm)',
        prop: 'gpstotalx',
        search: false,
        form: true
    },
    {
        label: 'Y方向位移(mm)',
        prop: 'gpstotaly',
        search: false,
        form: true
    },
    {
        label: 'Z方向位移(mm)',
        prop: 'gpstotalz',
        search: false,
        form: true
    },
    {
        label: '监测时间',
        prop: 'monitortime',
        component: 'el-date-picker',
        props: {
            clearable: true,
            type: 'daterange',
            'start-placeholder': '开始时间',
            'end-placeholder': '结束时间',
            'range-separator': '-',
            'value-format': 'YYYY-MM-DD'
        },
        search: true,
        form: true
    },
    {
        label: '入库时间',
        prop: 'storagetime',
        component: 'el-date-picker',
        props: {
            clearable: true,
            type: 'daterange',
            'start-placeholder': '开始时间',
            'end-placeholder': '结束时间',
            'range-separator': '-',
            'value-format': 'YYYY-MM-DD'
        },
        search: false,
        form: true
    }
  ]);
  const formColumns = defineFormColumns([]);
  
  onMounted(() => {
    getData();
    // getSkList({stType:'RR'}).then(res=>{
    //   if (res.success) {
    //     skList.value = res.data.map(r=>({label:r.stName,value:r.stCode}));
    //   }
    // })
  })
  
  const getData = () => {
    gettblJcGnss({
      ...serachForm.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
      endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
      tm:null,
    }).then(res => {
      console.log(res);
      if (res.success) {
        res.data.data.map((item,index)=>{
          item.index = (currentPage.value - 1) * pageSize.value + index + 1
        })
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
    proxy.download("/business/huangtangMonitor/tblJcGnss/page/export", {
      ...serachForm.value,
      pageNum:currentPage.value,
      pageSize:pageSize.value,
      startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
      endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
      tm:null,
    },`gnss数据监测_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  }
  </script>
  
  <style scoped lang="scss">
  
  </style>