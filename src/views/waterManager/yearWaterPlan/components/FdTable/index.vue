<template>
  <pro-crud
      ref="crudRef"
      v-model="form"
      v-model:search="serachForm"
      :columns="columns"
      :form-columns="formColumns"
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
      align="center"
      :before-open="beforeOpen"
      label-width="150px"
      width="40%"
      direction="horizontal"
      @search="searchSubmit"
      @search-reset="searchReset"
      @submit="submit"
      @delete="deleteRow"
  >
    <template #search-menu-right="{ size }">
      <span style="margin-left: 30px">
        <el-button type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </span>
    </template>
    <template #form-menu-right="{ size }">
      <el-button
          :size="size"
          @click="crudRef.closeDialog()"
      >
        关闭
      </el-button>
    </template>
    <template #search-year>
      <a-range-picker v-model:value="serachForm.year" valueFormat="YYYY" :placeholder="['开始年份','结束年份']" picker="year" />
    </template>
    <template #table-waterUseType="{ size, row, column, $index }">
      {{ formatterVal(row, 'MAIN_WAIN_USE', 'waterUseType') }}
    </template>
    <template #crud-detail="{ props, columns, size }">
      <pro-form
          label-width="155px"
          v-model="form"
          @reset="crudRef.closeDialog()"
          :menu="detailMenu"
          :columns="detailColumns"
      >
      </pro-form>
    </template>
  </pro-crud>
</template>

<script setup>
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineTableIndexColumns,
  defineCrudBeforeOpen,
  defineFormColumns
} from 'element-pro-components';
import { formatterVal } from '@/utils';
import {defineProps, onMounted, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {addPlan, delPlan, getPlan, updatePlan} from "@/api/waterManager/yearWaterPlan";
import useDictionaryStore from "@/store/modules/dictionary";
const props = defineProps(['activeName']);
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  width:'250',
  addText: '新增',
  addProps: {
    type: 'primary',
    plain: true,
  },
  detail:true,
  reset:false,
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
  editText: '修改',
  delText: '删除',
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
const data = ref([]);
const currentPage = ref(1)
const pageSize = ref(10)
let total = ref(0)
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '发电站名称',
    prop: 'unitName',
    component: 'el-input',
    props:{
      placeholder:'请输入发电站名称',
    },
    form: true,
    search: true,
  },
  {
    label: '管理单位编码',
    prop: 'admDep',
    form: true,
    search: false,
  },
  {
    label: '年份',
    prop: 'year',
    search: true,
    form: true,
  },
  {
    label: '年计划供水量（万m³）',
    prop: 'planWater',
    search: false,
    form: true,
  },
  {
    label: '供水区域',
    prop: 'waterSupplyArea',
    search: false,
    form: true,
  },
  {
    label: '供水用途',
    prop: 'waterUseType',
  }
]);
const formColumns = defineFormColumns([
  {
    label: '发电站名称',
    prop: 'unitName',
    component:'el-input',
    props:{
      placeholder:'请输入发电站名称',
    },
    md: 12,
  },
  {
    label: '管理单位编码',
    prop: 'admDep',
    component: 'el-input',
    props:{
      placeholder:'请输入管理单位编码',
    },
    md: 12,
  },
  {
    label: '年份',
    prop: 'year',
    component: 'el-date-picker',
    rules:[{ required: true, message: '请选择年份' }],
    props: {
      clearable:true,
      type: 'year',
      placeholder:"年份",
      'value-format':"YYYY"
    },
    md: 12,
  },
  {
    label: '年计划供水量(万m³)',
    prop: 'planWater',
    component:'el-input',
    props:{
      placeholder:'请输入年计划供水量',
    },
    md: 12,
  },
  {
    label: '供水区域',
    prop: 'waterSupplyArea',
    component:'el-input',
    props:{
      placeholder:'请输入供水区域',
    },
    md: 12,
  },
  {
    label: '供水用途',
    prop: 'waterUseType',
    component: 'pro-select',
    props:{
      disabled:true,
      data:dictStore.getDict('MAIN_WAIN_USE'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择供水用途',
      clearable:true
    },
    md: 12,
  },
])
const detailColumns = defineFormColumns([
  {
    label: '发电站名称',
    prop: 'unitName',
    component:'el-input',
    props:{
      disabled:true,
      placeholder:'请输入发电站名称',
    },
    md: 12,
  },
  {
    label: '管理单位编码',
    prop: 'admDep',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入管理单位编码',
    },
    md: 12,
  },
  {
    label: '年份',
    prop: 'year',
    component: 'el-date-picker',
    rules:[{ required: true, message: '请选择年份' }],
    props: {
      clearable:true,
      disabled:true,
      type: 'year',
      placeholder:"年份",
      'value-format':"YYYY"
    },
    md: 12,
  },
  {
    label: '年计划供水量(万m³)',
    prop: 'planWater',
    component:'el-input',
    props:{
      disabled:true,
      placeholder:'请输入年计划供水量',
    },
    md: 12,
  },
  {
    label: '供水区域',
    prop: 'waterSupplyArea',
    component:'el-input',
    props:{
      disabled:true,
      placeholder:'请输入供水区域',
    },
    md: 12,
  },
  {
    label: '供水用途',
    prop: 'waterUseType',
    component: 'pro-select',
    props:{
      disabled:true,
      data:dictStore.getDict('MAIN_WAIN_USE'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择供水用途',
      clearable:true
    },
    md: 12,
  },
])
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  }else{
    form.value = {waterUseType:props.activeName};
  }
  done();
});

onMounted(()=>{
  getData()
})

const getData = () => {
  getPlan({
    ...serachForm.value,
    waterUseType:'4',
    startTime:serachForm.value.year ? serachForm.value.year[0] : '',
    endTime:serachForm.value.year ? serachForm.value.year[1] : '',
    year:null,
    pageNum:currentPage.value,
    pageSize:pageSize.value
  }).then(res=>{
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

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if(isValid){
    if(type == 'add'){
      addPlan({...form.value,waterUseType:'4',}).then(res=>{
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
      updatePlan(form.value.id,{...form.value,waterUseType:'4',}).then(res=>{
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

const searchReset = () => {
  currentPage.value = 1;
  getData();
};
const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(()=>{
    delPlan(row.id).then(res=>{
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
  proxy.download("/business/waterUse/waterPlan/page/export", {
    ...serachForm.value,
    waterUseType:'4',
    startTime:serachForm.value.year ? serachForm.value.year[0] : '',
    endTime:serachForm.value.year ? serachForm.value.year[1] : '',
    year:null,
    pageNum:currentPage.value,pageSize:pageSize.value
  },`发电水量_${new Date().getTime()}.xlsx`);
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