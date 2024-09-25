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
      :before-open="beforeOpen"
      :before-close="beforeClose"
      label-width="155px"
      direction="vertical"
      @search="searchSubmit"
      @search-reset="searchReset"
      @submit="submit"
      @delete="deleteRow"
  >
    <template #table-majWausType="{ size, row, column, $index }">
      {{ formatterVal(row,'WASO_TYPE','majWausType') }}
    </template>
    <template #table-engScal="{ size, row, column, $index }">
      {{ formatterVal(row,'PROJ_SCAL','engScal') }}
    </template>
    <template #table-engStat="{ size, row, column, $index }">
      {{ formatterVal(row,'ENG_STAT','engStat') }}
    </template>
    <template #table-runStat="{ size, row, column, $index }">
      {{ formatterVal(row,'run_status','runStat') }}
    </template>
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
  defineCrudBeforeOpen,
  defineCrudBeforeClose,
} from 'element-pro-components';
import {ElMessage, ElMessageBox} from 'element-plus'
import {ref, reactive, onMounted, onBeforeMount, nextTick, computed} from "vue";
import {getType} from "@/api/system/dict/type";
import {addGq, getGq,updateGq,delGq,delAllGq,exportExcel} from "@/api/informationManager/basicData/gqBasicData";
import {useDict} from "@/utils/dict";
import useDictionaryStore from "@/store/modules/dictionary";
import {exportFlExcel} from "@/api/informationManager/basicData/floodBasicData";
import { number } from 'echarts';
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: true,
  reset: false,
  width: '250',
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
  detailProps:{
    link:true,
    type: 'primary',
    icon:'View'
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
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const dictStore = useDictionaryStore();
const { proxy } = getCurrentInstance();
const columns = defineCrudColumns([
  {
    label: '灌区编码',
    prop: 'irrCode',
    component: 'el-input',
    props:{
      placeholder:'请输入灌区编码',
    },
    form: true,
    search: true,
  },
  {
    label: '灌区名称',
    prop: 'irrName',
    component: 'el-input',
    props:{
      placeholder:'请输入灌区名称',
    },
    form: true,
    search: true,
  },
  {
    label: '左下角经度',
    prop: 'lowLeftLong',
    search: false,
    form: true,
  },
  {
    label: '左下角纬度',
    prop: 'lowLeftLat',
    search: false,
    form: true,
  },
  {
    label: '右上角经度',
    prop: 'upRightLong',
    search: false,
    form: true,
  },
  {
    label: '右上角纬度',
    prop: 'upRightLat',
    search: false,
    form: true,
  },
  {
    label: '灌区范围',
    prop: 'irrRang',
    search: false,
    form: true,
  },
  {
    label:'主要水源工程类型',
    prop: 'majWausType',
    component: 'pro-select',
    props:{
      data: dictStore.getDict('WASO_TYPE'),  // WASO_TYPE.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择主要水源工程类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'工程规模',
    prop: 'engScal',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('PROJ_SCAL'), //  PROJ_SCAL.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择补充工程规模',
      clearable:true
    },
    search: false,
    form: true,
  },
  {
    label:'总灌溉面积(万亩)',
    prop: 'totIrrArea',
    search: false,
    form: true,
  },
  {
    label:'有效灌溉面积(万亩)',
    prop: 'effIrrArea',
    search: false,
    form: true,
  },
  {
    label:'设计灌溉面积(万亩)',
    prop: 'desIrrArea',
    search: false,
    form: true,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    search: false,
    form: true,
  },
  {
    label:'运行状况',
    prop: 'runStat',
    search: false,
    form: true,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    search: false,
    form: true,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    search: false,
    form: true,
  },
  {
    label:'管理单位代码',
    prop: 'deptId',
    search: false,
    form: true,
  },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
    fixed:'right'
  }
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '灌区编码',
    prop: 'irrCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入灌区编码' }],
    props:{
      disabled:!!(form.value?.irrCode),
      placeholder:'请输入灌区编码',
    },
    md: 12,
  },
  {
    label: '灌区名称',
    prop: 'irrName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入灌区名称' }],
    props:{
      placeholder:'请输入灌区名称',
    },
    md: 12,
  },
  {
    label: '左下角经度',
    prop: 'lowLeftLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入左下角经度' }],
    props:{
      placeholder:'请输入左下角经度',
    },
    md: 12,
  },
  {
    label: '左下角纬度',
    prop: 'lowLeftLat',
    component: 'el-input',
    props:{
      placeholder:'请输入左下角纬度',
    },
    md: 12,
  },
  {
    label: '右上角经度',
    prop: 'upRightLong',
    component: 'el-input',
    props:{
      placeholder:'请输入右上角经度',
    },
    md: 12,
  },
  {
    label: '右上角纬度',
    prop: 'upRightLat',
    component: 'el-input',
    props:{
      placeholder:'请输入右上角纬度',
    },
    md: 12,
  },
  {
    label: '灌区范围',
    prop: 'irrRang',
    component: 'el-input',
    props:{
      placeholder:'请输入灌区范围',
    },
    md: 12,
  },
  {
    label:'主要水源工程类型',
    prop: 'majWausType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择主要水源工程类型' }],
    props:{
      style:{width:'100%'},
      data: dictStore.getDict('WASO_TYPE'),  // WASO_TYPE.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择主要水源工程类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'工程规模',
    prop: 'engScal',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('PROJ_SCAL'), //  PROJ_SCAL.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择补充工程规模',
      clearable:true
    },
    md: 12,
  },
  {
    label:'总灌溉面积(万亩)',
    prop: 'totIrrArea',
    component: 'el-input',
    props:{
      placeholder:'请输入总灌溉面积',
    },
    md: 12,
  },
  {
    label:'有效灌溉面积(万亩)',
    prop: 'effIrrArea',
    component: 'el-input',
    props:{
      placeholder:'请输入有效灌溉面积',
    },
    md: 12,
  },
  {
    label:'设计灌溉面积(万亩)',
    prop: 'desIrrArea',
    component: 'el-input',
    props:{
      placeholder:'请输入设计灌溉面积',
    },
    md: 12,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'运行状况',
    prop: 'runStat',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择运行状况' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('run_status'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择运行状况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      placeholder:"请输入建成时间",
    },
    md: 12,
  },
  {
    label:'管理单位代码',
    prop: 'deptId',
    component: 'el-input',
    props:{
      placeholder:'请输入管理单位代码',
    },
    md: 12,
  },
  {
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入备注',
    },
    md: 24,
  }
]));
const detailColumns = defineFormColumns([
  {
    label: '灌区编码',
    prop: 'irrCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入灌区编码' }],
    props:{
      disabled:true,
      placeholder:'请输入灌区编码',
    },
    md: 12,
  },
  {
    label: '灌区名称',
    prop: 'irrName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入灌区名称' }],
    props:{
      disabled:true,
      placeholder:'请输入灌区名称',
    },
    md: 12,
  },
  {
    label: '左下角经度',
    prop: 'lowLeftLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入左下角经度' }],
    props:{
      disabled:true,
      placeholder:'请输入左下角经度',
    },
    md: 12,
  },
  {
    label: '左下角纬度',
    prop: 'lowLeftLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入左下角纬度' }],
    props:{
      disabled:true,
      placeholder:'请输入左下角纬度',
    },
    md: 12,
  },
  {
    label: '右上角经度',
    prop: 'upRightLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入右上角经度' }],
    props:{
      disabled:true,
      placeholder:'请输入右上角经度',
    },
    md: 12,
  },
  {
    label: '右上角纬度',
    prop: 'upRightLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入右上角纬度' }],
    props:{
      disabled:true,
      placeholder:'请输入右上角纬度',
    },
    md: 12,
  },
  {
    label: '灌区范围',
    prop: 'irrRang',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入灌区范围',
    },
    md: 12,
  },
  {
    label:'主要水源工程类型',
    prop: 'majWausType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择主要水源工程类型' }],
    props:{
      style:{width:'100%'},
      disabled:true,
      data: dictStore.getDict('WASO_TYPE'),  // WASO_TYPE.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择主要水源工程类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'工程规模',
    prop: 'engScal',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('PROJ_SCAL'), //  PROJ_SCAL.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择补充工程规模',
      clearable:true
    },
    md: 12,
  },
  {
    label:'总灌溉面积(万亩)',
    prop: 'totIrrArea',
    component: 'el-input',
    props:{
      min: 0,
      type: Number,
      disabled: true,
      placeholder:'请输入总灌溉面积',
    },
    md: 12,
  },
  {
    label:'有效灌溉面积(万亩)',
    prop: 'effIrrArea',
    component: 'el-input',
    props:{
      min: 0,
      type: number,
      disabled:true,
      placeholder:'请输入有效灌溉面积',
    },
    md: 12,
  },
  {
    label:'设计灌溉面积(万亩)',
    prop: 'desIrrArea',
    component: 'el-input',
    props:{
      min: 0,
      type: number,
      disabled:true,
      placeholder:'请输入设计灌溉面积',
    },
    md: 12,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'运行状况',
    prop: 'runStat',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择运行状况' }],
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('run_status'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择运行状况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder:"请输入建成时间",
    },
    md: 12,
  },
  {
    label:'管理单位代码',
    prop: 'deptId',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入管理单位代码',
    },
    md: 12,
  },
  {
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入备注',
    },
    md: 24,
  }
]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  }else{
    form.value = {};
  }
  done();
});
const beforeClose = defineCrudBeforeClose((done)=>{
  form.value = {};
  done()
})

function formatterVal(row,DIC,key) {
  const types = dictStore.getDict(DIC);
  const type = types.find(r=> r.value == row[key]);
  return type ? type.label : '-';
}

onMounted(()=>{
  getData()
})

const getData = () => {
  getGq({...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value}).then(res=>{
    if(res.success){
      data.value = res.data.data;
      total.value = res.data.total;
    }
  })
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
  if(isValid){
    if(type == 'add'){
      addGq(form.value).then(res=>{
        if(res.success){
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    }else{
      updateGq(form.value.irrCode,form.value).then(res=>{
        if(res.success){
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

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(()=>{
    delGq(row.irrCode).then(res=>{
      if(res.success){
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
};

const exportData = () =>{
  proxy.download("business/base/irrBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`灌区基础数据_${new Date().getTime()}.xlsx`);
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