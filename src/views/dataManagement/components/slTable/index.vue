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
      height="400"
      width="50%"
      align="center"
      :before-open="beforeOpen"
      :before-close="beforeClose"
      label-width="100px"
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
    <template #table-useType="{ row }">
      <span>{{ formatterVal(row, 'USE_TYPE', 'useType') }}</span>
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
import {ref, reactive, onMounted, defineProps, watch} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {addDng, delDng, exportDngExcel, getDng, updateDng} from "@/api/informationManager/basicData/dngBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {getParmRpRatioList, putParmRpRatio} from "@/api/incomingWater";
import {getParmAllocationList, putParmAllocation} from "@/api/interestScheme";
const props = defineProps(['allocCode']);
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
    label: '用水类型',
    prop: 'useType',
  },
  {
    label: '保证率',
    prop: 'rate',
  },
]);
const formColumns = defineFormColumns([
{
    label: '用水类型',
    prop: 'useType',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('USE_TYPE'),
      config: {value: 'value', label: 'label'},
      clearable:true,
      disabled:true,
      placeholder:'用水类型',
    },
    md:12,
  },
  {
    label: '保证率',
    prop: 'rate',
    component: 'el-input-number',
    props:{
      min: 0.0,
      max: 1.0,
      step: 0.1,
      style:{width:'100%'},
      placeholder:'请输入保证率',
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

const getData = (allocCode) => {
  getParmAllocationList({
    allocCode:allocCode
  }).then(res => {
    if (res.success) {
      data.value = res.data;
    }
  })
}

watch(props.allocCode,(allocCode)=>{
  getData(allocCode)
})

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  done();
});

const searchReset = () => {
  currentPage.value = 1;
}

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == 'add') {

    } else {
      putParmAllocation(form.value).then(res=>{
        if(res.success){
          ElMessage({
            message: '修改成功',
            type: 'success',
          });
          getData(props.allocCode);
        }
      })
    }
  }
  done()
});


defineExpose({
  getData
})

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