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
        :before-open="beforeOpen"
        :before-close="beforeClose"
        column="2"
        width="50%"
        align="center"
        label-width="155px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        @delete="deleteRow"
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
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #table-fstp="{ size, row, column, $index }">
        {{ formatterVal(row, 'flood_category', 'fstp') }}
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        ></pro-form>
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
import {ref, reactive, onMounted, computed} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import useDictionaryStore from "@/store/modules/dictionary";
import {addLimit, deleteLimit, getLimit, updateLimit} from "@/api/informationManager/timeData/floodLimitTimeData";
import {deleteLakeIndicator, getSkList} from "@/api/informationManager/timeData/lakeIndicatorTimeData";
const dictStore = useDictionaryStore();
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del:true,
  edit:true,
  fixed:'right',
  addText: '新增',
  reset:false,
  detail:true,
  width:'250',
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
  detailProps:{
    link:true,
    type: 'primary',
    icon:'View'
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
  detailText:'查看'
});
const detailMenu = defineCrudMenuColumns({
  submit:false,
  reset:true,
  resetText:'关闭'
});
const crudRef = ref();
const form = ref({});
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let skList = ref([]);
const { proxy } = getCurrentInstance();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '测站',
    prop: 'stcd',
    component: 'pro-select',
    props:{
      clearable:true,
      data:skList.value,
      placeholder:'请选择测站',
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
    label: '开始月日',
    prop: 'bgmd',
    form: true,
    search: false,
  },
  {
    label: '结束月日',
    prop: 'edmd',
    search: false,
    form: true,
  },
  {
    label: '汛限库容(百万m³)',
    prop: 'fsltdw',
    search: false,
    form: true,
    hide:true
  },
  {
    label: '汛限水位(m)',
    prop: 'fsltdz',
    search: false,
    form: true,
  },
  {
    label: '汛期类别',
    prop: 'fstp',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data: dictStore.getDict('flood_category'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择汛期类别',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '数据时间',
    prop: 'modiTime',
    form: true,
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '测站',
    prop: 'stcd',
    rules:[{ required: true, message: '请选择测站' }],
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:skList.value,
      placeholder:'请选择测站',
    },
    md:12
  },
  {
    label: '开始月日',
    prop: 'bgmd',
    rules:[{ required: true, message: '请选择开始月日' }],
    component: 'el-date-picker',
    props: {
      style:{width:'100%'},
      type:"date",
      clearable:true,
      'value-format':"YYYY-MM-DD",
      placeholder: '请选择开始月日',
    },
    md:12
  },
  {
    label: '结束月日',
    prop: 'edmd',
    rules:[{ required: true, message: '请选择结束月日' }],
    component: 'el-date-picker',
    props: {
      style:{width:'100%'},
      type:"date",
      clearable:true,
      'value-format':"YYYY-MM-DD",
      placeholder: '请选择结束月日',
    },
    md:12
  },
  {
    label: '汛限库容(百万m³)',
    prop: 'fsltdw',
    component: 'el-input',
    props:{
      placeholder:'请输入汛限库容',
    },
    md:12
  },
  {
    label: '汛限水位(m)',
    prop: 'fsltdz',
    component: 'el-input',
    props:{
      placeholder:'请输入汛限水位',
    },
    md:12
  },
  {
    label: '汛期类别',
    prop: 'fstp',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data: dictStore.getDict('flood_category'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择汛期类别',
      clearable:true
    },
    md:12
  },
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '测站',
    prop: 'stcd',
    rules:[{ required: true, message: '请选择测站' }],
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:skList.value,
      placeholder:'请选择测站',
    },
    md:12
  },
  {
    label: '开始月日',
    prop: 'bgmd',
    rules:[{ required: true, message: '请选择开始月日' }],
    component: 'el-date-picker',
    props: {
      style:{width:'100%'},
      type:"date",
      'value-format':"YYYY-MM-DD",
      placeholder: '请选择开始月日',
    },
    md:12
  },
  {
    label: '结束月日',
    prop: 'edmd',
    rules:[{ required: true, message: '请选择结束月日' }],
    component: 'el-date-picker',
    props: {
      style:{width:'100%'},
      type:"date",
      'value-format':"YYYY-MM-DD",
      placeholder: '请选择结束月日',
    },
    md:12
  },
  {
    label: '汛限库容(百万m³)',
    prop: 'fsltdw',
    component: 'el-input',
    props:{
      placeholder:'请输入汛限库容',
    },
    md:12
  },
  {
    label: '汛限水位(m)',
    prop: 'fsltdz',
    component: 'el-input',
    props:{
      placeholder:'请输入汛限水位',
    },
    md:12
  },
  {
    label: '汛期类别',
    prop: 'fstp',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data: dictStore.getDict('flood_category'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择汛期类别',
      clearable:true
    },
    md:12
  },
].map(r=>({...r,props:{...r.props,disabled:true}}))));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  } else {
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

const formatterName = (id) => {
  return id ? skList.value.find(r=>r.value == id)?.label : ''
}


onMounted(() => {
  getData();
  getSkList({stType:'RR'}).then(res=>{
    if (res.success) {
      skList.value = res.data.map(r=>({label:r.stName,value:r.stCode}));
    }
  })
})

const getData = () => {
  getLimit({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    startTime:serachForm.value.modiTime ? serachForm.value.modiTime[0] : '',
    endTime:serachForm.value.modiTime ? serachForm.value.modiTime[1] : '',
    modiTime:null,
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
      addLimit({...form.value}).then(res=>{
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    }else{
      updateLimit(form.value.stcd,{...form.value}).then(res=>{
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
  done();
});


// 分页选择
const load = () => {
  getData()
}

const deleteRow = (row) =>{
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    deleteLimit(row.stcd).then(res => {
      if (res.success) {
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
}

const exportData = () => {
  proxy.download("/business/realData/rsvrfsrB/page/export", {
    ...serachForm.value,
    pageNum:currentPage.value,
    pageSize:pageSize.value,
    startTime:serachForm.value.modiTime ? serachForm.value.modiTime[0] : '',
    endTime:serachForm.value.modiTime ? serachForm.value.modiTime[1] : '',
    modiTime:null,
  },`库(湖)站汛限水位${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>