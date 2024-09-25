<template>
      径流计算单元选择：<pro-select
      v-model="unitCode"
      clearable
      style="margin-left: 10px"
      placeholder="请选择径流计算单元"
      :config="config"
      :data="groupList"
      @change="selectChange"/>
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
      height="500"
      width="50%"
      align="center"
      :before-open="beforeOpen"
      :before-close="beforeClose"
      label-width="235px"
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
  </pro-crud>
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
import {addDng, delDng, exportDngExcel, getDng, updateDng} from "@/api/informationManager/basicData/dngBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {getParmRpRatioGroupList,getParmRpRatioList, putParmRpRatio} from "@/api/incomingWater";
import { max } from 'xe-utils';
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
const config = ref({ value: 'unitCode', label: 'unitName' })
let data = ref([]);
let groupList = ref([])
let unitCode = ref("");
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label:'月份',
    prop: 'month',
  },
  {
    label: '径流计算单元编码',
    prop: 'unitCode',
    component: 'el-input',
    props:{
      placeholder:'请输入径流计算单元编码',
    },
    search: false,
  },
  {
    label: '径流计算单元名称',
    prop: 'unitName',
  },
  {
    label:'径流系数',
    prop: 'rpRatio',
  },
]);
const formColumns = defineFormColumns([
  {
    label: '径流计算单元编码',
    prop: 'unitCode',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入径流计算单元编码',
    },
    md:12,
  },
  {
    label: '径流计算单元名称',
    prop: 'unitName',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'径流计算单元名称',
    },
    md:12,
  },
  {
    label:'径流系数',
    prop: 'rpRatio',
    component: 'el-input-number',
    props:{
      min: 0,
      max: 1,
      step: 0.1,
      style:{width:'100%'},
      placeholder:'径流系数',
    },
    md:12,
  },
  {
    label:'月份',
    prop: 'month',
    component: 'el-input-number',
    props:{
      min: 1,
      max: 12,
      disabled:true,
      style:{width:'100%'},
      placeholder:'月份',
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
  getParmGroupList();
  getData()
})
const getParmGroupList=()=>{
  getParmRpRatioGroupList().then(res=>{
    if (res.success) {
      groupList.value = res.data;
    }
  })
}

const getData = () => {
  getParmRpRatioList({unitCode:unitCode.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res=>{
    if (res.success) {
      data.value = res.data;
      total.value = res.data.total;
    }
  })
}
const selectChange=()=>{
  getData();
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
      putParmRpRatio(form.value).then(res => {
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