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
      :page-sizes="[10,20,30,40,50]"
      :total="total"
      @load="load"
      column="2"
      height="450"
      width="60%"
      align="center"
      :before-open="beforeOpen"
      :before-close="beforeClose"
      label-width="160px"
      direction="vertical"
      @search="searchSubmit"
      @search-reset="searchReset"
      @submit="submit"
  >
    <template #table-engGrad="{ size, row, column, $index }">
      {{ formatterVal(row, 'ENG_GRAD', 'engGrad') }}
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
import {ref, reactive, onMounted, computed,defineProps} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {deleteFoc, geFoceData} from "@/api/schedulingCtord/fhWarning";
const props = defineProps(['currentRow']);
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  edit:false,
  fixed:'right',
  addText: '新增',
  detail:false,
  del:false,
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
const serachForm = ref({stName:"61608180"});
let data = ref([]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '测站名称',
    prop: 'stName',
    component: 'pro-select',
    props:{
      data: dictStore.getDict('SYSTEM_RES_STATION'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择测站名称',
      clearable:true
    },
    form: true,
    search: true,
  },
  {
    label: '时间',
    prop: 'time',
    form: true,
    search: false,
  },
  {
    label: '预报水位(m)',
    prop: 'rz',
    search: false,
    form: true,
  },
  {
    label: '入库流量(m³/s)',
    prop: 'q',
    search: false,
    form: true,
  },
  {
    label:'预报总蓄水量(万m³)',
    prop: 'w',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns();
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
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

onMounted(() => {
  getData();

})

const getData = () => {
  geFoceData({
    glid:props.currentRow.id,
    stcd:serachForm.value.stName,
    pageNum:currentPage.value,
    pageSize:pageSize.value
  }).then(res=>{
    if (res.success) {
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
  if (isValid) {
    if (type == 'add'){

    }else{

    }
  }
  done();
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
  }).then(() => {
    deleteFoc(row.id).then(res=>{
      if (res.success) {
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    })
  })
};


</script>

<style scoped lang="scss">
:deep(.t-dialog .el-dialog__body){
  padding-bottom: 0;
}
</style>