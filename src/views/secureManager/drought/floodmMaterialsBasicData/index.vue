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
        width="40%"
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
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #table-objectType="{ size, row, column, $index }">
        {{ formatterVal(row,'OBJECT_YTPE','objectType') }}
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
import useDictionaryStore from "@/store/modules/dictionary";
import {addFx, delFx, exportFxExcel, getFx, updateFx} from "@/api/secureManager/drought/floodmMaterialsBasicData";
import {ElMessage,ElMessageBox} from "element-plus";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed:'right',
  addText: '新增',
  detail:true,
  reset:false,
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
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '物资名称',
    prop: 'objectName',
    component: 'el-input',
    props:{
      placeholder:'请输物资名称',
    },
    form: true,
    search: true,
  },
  {
    label: '单位',
    prop: 'unit',
    search: false,
    form: true,
  },
  {
    label: '数量',
    prop: 'quantity',
    search: false,
    form: true,
  },
  {
    label: '主要规格或性能参数',
    prop: 'param',
    search: false,
    form: true,
  },
  {
    label: '所在仓库',
    prop: 'warehouse',
    search: false,
    form: true,
  },
  {
    label: '存放地点',
    prop: 'storageLoc',
    search: false,
    form: true,
  },
  {
    label:'负责人',
    prop: 'headName',
    search: false,
    form: true,
  },
  {
    label:'负责人电话',
    prop: 'headPhone',
    search: false,
    form: true,
  },
  {
    label:'物资类型',
    prop: 'objectType',
    component: 'pro-select',
    props:{
      data: dictStore.getDict('OBJECT_YTPE'),  // WASO_TYPE.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择物资类型',
      clearable:true
    },
    search: true,
    form: true,
  },
]);
const formColumns = defineFormColumns([
  {
    label: '物资名称',
    prop: 'objectName',
    component: 'el-input',
    rules: [{required: true, message: '请输物资名称'}],
    props:{
      placeholder:'请输入物资名称',
    },
    md: 12,
  },
  {
    label:'物资类型',
    prop: 'objectType',
    rules: [{required: true, message: '请输物资名称'}],
    component: 'pro-select',
    props:{
      data: dictStore.getDict('OBJECT_YTPE'),  // WASO_TYPE.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择物资类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '单位',
    prop: 'unit',
    rules: [{required: true, message: '请输入单位'}],
    component: 'el-input',
    props:{
      placeholder:'请输入单位',
    },
    md: 12,
  },
  {
    label: '数量',
    prop: 'quantity',
    component: 'el-input',
    rules: [{required: true, message: '请输入数量'}],
    props:{
      placeholder:'请输入数量',
    },
    md: 12,
  },
  {
    label: '主要规格或性能参数',
    prop: 'param',
    component: 'el-input',
    props:{
      placeholder:'请输入主要规格或性能参数',
    },
    md: 12,
  },
  {
    label: '所在仓库',
    prop: 'warehouse',
    component: 'el-input',
    props:{
      placeholder:'请输入所在仓库',
    },
    md: 12,
  },
  {
    label: '存放地点',
    prop: 'storageLoc',
    component: 'el-input',
    props:{
      placeholder:'请输入存放地点',
    },
    md: 12,
  },
  {
    label:'负责人',
    prop: 'headName',
    component: 'el-input',
    props:{
      placeholder:'请输入负责人',
    },
    md: 12,
  },
  {
    label:'负责人电话',
    prop: 'headPhone',
    component: 'el-input',
    rules: [{pattern:/^1[3-9]\d{9}$/,message:'请输入正确电话',trigger:'change'}],
    props:{
      placeholder:'请输入负责人电话',
    },
    md: 12,
  },
]);
const detailColumns = defineFormColumns([
  {
    label: '物资名称',
    prop: 'objectName',
    component: 'el-input',
    rules: [{required: true, message: '请输物资名称'}],
    props:{
      disabled:true,
      placeholder:'请输入物资名称',
    },
    md: 12,
  },
  {
    label:'物资类型',
    prop: 'objectType',
    rules: [{required: true, message: '请输物资名称'}],
    component: 'pro-select',
    props:{
      disabled:true,
      data: dictStore.getDict('OBJECT_YTPE'),  // WASO_TYPE.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择物资类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '单位',
    prop: 'unit',
    rules: [{required: true, message: '请输入单位'}],
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入单位',
    },
    md: 12,
  },
  {
    label: '数量',
    prop: 'quantity',
    component: 'el-input',
    rules: [{required: true, message: '请输入数量'}],
    props:{
      disabled:true,
      placeholder:'请输入数量',
    },
    md: 12,
  },
  {
    label: '主要规格或性能参数',
    prop: 'param',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入主要规格或性能参数',
    },
    md: 12,
  },
  {
    label: '所在仓库',
    prop: 'warehouse',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入所在仓库',
    },
    md: 12,
  },
  {
    label: '存放地点',
    prop: 'storageLoc',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入存放地点',
    },
    md: 12,
  },
  {
    label:'负责人',
    prop: 'headName',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入负责人',
    },
    md: 12,
  },
  {
    label:'负责人电话',
    prop: 'headPhone',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入负责人电话',
    },
    md: 12,
  },
]);
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
});

onMounted(()=>{
  getData()
})

const getData = () => {
  getFx({...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value}).then(res=>{
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
      addFx(form.value).then(res=>{
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
      updateFx(form.value.id,form.value).then(res=>{
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
    delFx(row.id).then(res=>{
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
  proxy.download("business/attBase/fxObject/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`防汛备料物资基础数据_${new Date().getTime()}.xlsx`);
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