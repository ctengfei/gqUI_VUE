<template>
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
      width="70%"
      height="500"
      align="center"
      :before-open="beforeOpen"
      :before-close="beforeClose"
      label-width="235px"
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
  </pro-crud>
</template>

<script setup>
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import {ref, reactive, onMounted} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import {parmArgList, putParmArg} from "@/api/agricultureWater";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: false,
  reset: false,
  del:false,
  width: '100',
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
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '农业灌溉分区编码',
    prop: 'unitCode',
    component: 'el-input',
    props:{
      clearable: true,
      placeholder:'请输入农业灌溉分区编码',
    },
    search: true,
  },
  {
    label: '农业灌溉分区名称',
    prop: 'unitName',
    component: 'el-input',
    props:{
      clearable: true,
      placeholder:'请输入农业灌溉分区名称',
    },
  },
  {
    label: '内部塘堰复蓄系',
    prop: 'coeRestorageSma',
  },
  {
    label: '内部小型水库复蓄系数',
    prop: 'coeRestorageXxsk',
  },
  {
    label: '内部中型水库复蓄系数',
    prop: 'coeRestorageZxsk',
  },
  {
    label: '渠道水有效利用系数',
    prop: 'coeWaterUseChannel',
  },
  {
    label: '田间水有效利用系数',
    prop: 'coeWaterUseFiled',
  },
  {
    label:'内部塘堰灌溉水有效利用系数',
    prop: 'coeWaterUseSma',
  },
  {
    label:'内部小型水库灌溉水有效利用系数',
    prop: 'coeWaterUseXxsk',
  },
  {
    label:'内部中型水库灌溉水有效利用系数',
    prop: 'coeWaterUseZxsk',
  },
]);
const formColumns = defineFormColumns([
  {
    label: '农业灌溉分区编码',
    prop: 'unitCode',
    component: 'el-input',
    props:{
      clearable: true,
      disabled:true,
      style:{width:'100%'},
      placeholder:'请输入农业灌溉分区编码',
    },
    md:12,
  },
  {
    label: '农业灌溉分区名称',
    prop: 'unitName',
    component: 'el-input',
    props:{
      clearable: true,
      disabled:true,
      style:{width:'100%'},
      placeholder:'请输入农业灌溉分区名称',
    },
    md:12,
  },
  {
    label: '内部塘堰复蓄系',
    prop: 'coeRestorageSma',
    component: 'el-input-number',
    props:{
      min: 0,
      max: 1,
      step: 0.01,
      style:{width:'100%'},
      placeholder:'请输入内部塘堰复蓄系',
    },
    md:12,
  },
  {
    label: '内部小型水库复蓄系数',
    prop: 'coeRestorageXxsk',
    component: 'el-input-number',
    props:{
      min: 0,
      max: 1,
      step: 0.01,
      style:{width:'100%'},
      placeholder:'请输入内部小型水库复蓄系数',
    },
    md:12,
  },
  {
    label: '内部中型水库复蓄系数',
    prop: 'coeRestorageZxsk',
    component: 'el-input-number',
    props:{
      min: 0,
      max: 1,
      step: 0.01,
      style:{width:'100%'},
      placeholder:'请输入内部中型水库复蓄系数',
    },
    md:12,
  },
  {
    label: '渠道水有效利用系数',
    prop: 'coeWaterUseChannel',
    component: 'el-input-number',
    props:{
      min: 0,
      max: 1,
      step: 0.01,
      style:{width:'100%'},
      placeholder:'请输入渠道水有效利用系数',
    },
    md:12,
  },
  {
    label: '田间水有效利用系数',
    prop: 'coeWaterUseFiled',
    component: 'el-input-number',
    props:{
      min: 0,
      max: 1,
      step: 0.01,
      style:{width:'100%'},
      placeholder:'请输入田间水有效利用系数',
    },
    md:12,
  },
  {
    label:'内部塘堰灌溉水有效利用系数',
    prop: 'coeWaterUseSma',
    component: 'el-input-number',
    props:{
      min: 0,
      max: 1,
      step: 0.01,
      style:{width:'100%'},
      placeholder:'请输入内部塘堰灌溉水有效利用系数',
    },
    md:12,
  },
  {
    label:'内部小型水库灌溉水有效利用系数',
    prop: 'coeWaterUseXxsk',
    component: 'el-input-number',
    props:{
      min: 0,
      max: 1,
      step: 0.01,
      style:{width:'100%'},
      placeholder:'请输入内部小型水库灌溉水有效利用系数',
    },
    md:12,
  },
  {
    label:'内部中型水库灌溉水有效利用系数',
    prop: 'coeWaterUseZxsk',
    component: 'el-input-number',
    props:{
      min: 0,
      max: 1,
      step: 0.01,
      style:{width:'100%'},
      placeholder:'请输入内部中型水库灌溉水有效利用系数',
    },
    md:12,
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
})

onMounted(() => {
  getData()
})

const getData = () => {
  parmArgList({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res=>{
    if (res.success) {
      data.value = res.data;
      total.value = res.data.total;
    }
  })
}

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  getData()
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
}

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == 'add') {

    } else {
      putParmArg(form.value).then(res => {
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
  getData();
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