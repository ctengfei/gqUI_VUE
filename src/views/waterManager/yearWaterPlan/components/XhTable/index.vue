<template>
  <pro-crud
      ref="crudRef"
      v-model="form"
      v-model:search="serachForm"
      :columns="columns"
      :form-columns="formColumns"
      :menu="menu"
      :data="data"
      column="2"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      layout="->,total,sizes,prev, pager, next, jumper"
      background
      draggable
      :page-sizes="[10,20,30,40,50]"
      :total="total"
      @load="load"
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
    <template #table-damId="{ size, row, column, $index }">
      {{ formatterSk(row.damId) }}
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
  defineCrudBeforeOpen, defineFormColumns,
} from 'element-pro-components';
import {computed, defineProps, onMounted, ref} from "vue";
import { formatterVal } from '@/utils';
import useDictionaryStore from "@/store/modules/dictionary";
import {addPlan, delPlan, getPlan, updatePlan} from "@/api/waterManager/yearWaterPlan";
import {ElMessage, ElMessageBox} from "element-plus";
import {getResList} from "@/api/informationManager/basicData/skBasicData";
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
let resList = ref([])
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '泄洪洞名称',
    prop: 'unitName',
    component: 'el-input',
    props:{
      placeholder:'请输入泄洪洞名称',
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
    label: '最大泄洪量（万m³）',
    prop: 'maxXhl',
    search: false,
    form: true,
  },
  {
    label: '泄洪区域',
    prop: 'xhArea',
    search: false,
    form: true,
  },
  {
    label: '所属水库',
    prop: 'damId',
    component: 'pro-select',
    props:{
      data:resList.value, // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择所属水库',
      clearable:true
    },
    search: true,
    form: true,
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '泄洪洞名称',
    prop: 'unitName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入泄洪洞名称' }],
    props:{
      placeholder:'请输入泄洪洞名称',
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
    label: '最大泄洪量（万m³）',
    prop: 'maxXhl',
    component:'el-input',
    props:{
      placeholder:'请输入最大泄洪量',
    },
    md: 12,
  },
  {
    label: '泄洪区域',
    prop: 'xhArea',
    component:'el-input',
    props:{
      placeholder:'请输入泄洪区域',
    },
    md: 12,
  },
  {
    label: '所属水库',
    prop: 'damId',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属水库' }],
    props:{
      data:resList.value, // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择所属水库',
      clearable:true
    },
    md: 12,
  },
]))
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '泄洪洞名称',
    prop: 'unitName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入泄洪洞名称' }],
    props:{
      disabled:true,
      placeholder:'请输入泄洪洞名称',
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
    label: '最大泄洪量（万m³）',
    prop: 'maxXhl',
    component:'el-input',
    props:{
      disabled:true,
      placeholder:'请输入最大泄洪量',
    },
    md: 12,
  },
  {
    label: '泄洪区域',
    prop: 'xhArea',
    component:'el-input',
    props:{
      disabled:true,
      placeholder:'请输入泄洪区域',
    },
    md: 12,
  },
  {
    label: '所属水库',
    prop: 'damId',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属水库' }],
    props:{
      disabled:true,
      data:resList.value, // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择所属水库',
      clearable:true
    },
    md: 12,
  },
]))
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  }else{
    form.value = {};
  }
  done();
});

const formatterSk = row => {
  return row ? resList.value.find(r => r.value == row)?.label : ''
}

onMounted(()=>{
  getData()
  getResList().then(res=>{
    if(res.success){
      resList.value = res.data.map(r=>({label:r.resName,value:r.resCode}));
    }
  })
})

const getData = () => {
  getPlan({
    ...serachForm.value,
    waterUseType:'5',
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
      addPlan({...form.value,waterUseType:'5'}).then(res=>{
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
      updatePlan(form.value.id,{...form.value,waterUseType:'5'}).then(res=>{
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
    waterUseType:'5',
    startTime:serachForm.value.year ? serachForm.value.year[0] : '',
    endTime:serachForm.value.year ? serachForm.value.year[1] : '',
    year:null,
    pageNum:currentPage.value,
    pageSize:pageSize.value
  },`泄洪水量_${new Date().getTime()}.xlsx`);
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