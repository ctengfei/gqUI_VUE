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
      width="45%"
      height="500"
      align="center"
      :before-open="beforeOpen"
      :before-close="beforeClose"
      label-width="150px"
      direction="vertical"
      @search="searchSubmit"
      @search-reset="searchReset"
      @submit="submit"
      @delete="deleteRow"
  >
    <template #form-menu-right="{ size,row }">
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
import {computed, onMounted, ref, watch} from "vue";
import {ElMessageBox} from "element-plus";
import {getInc} from "@/api/incomingWater";
const emit = defineEmits([ "setVisible","getCurrentRow" ]);
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del:false,
  fixed: 'right',
  edit:true,
  addText: '新增方案',
  detail: false,
  reset: false,
  width: '180',
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
  delText: '删除',
  editText: '方案定制',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
});
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
let data = ref([
]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const columns = defineCrudColumns([
  {
    label: '方案名称',
    prop: 'allocName',
    component: 'el-input',
    props: {
      clearable: true,
      placeholder: '请输入方案名称',
    },
    form: true,
    search: true,
  },
  {
    label: '预报开始时间',
    prop: 'forecastSdate',
    props: {
      placeholder: '请选择预报开始时间',
    },
    search: false,
    form: true,
  },
  {
    label: '预报结束时间',
    prop: 'forecastEdate',
    props: {
      placeholder: '请选择预报结束时间',
    },
    search: false,
    form: true,
  },
  {
    label: '需水总量(万m³)',
    prop: 'wreqEco',
    search: false,
    form: true,
  },
  {
    label: '预测年总量(万m³)',
    prop: 'wreqEcoFcst',
    width:'130',
    search: false,
    form: true,
  },
  {
    label: '制定时间',
    prop: 'createTime',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      style: {width: '100%'},
      'value-format': "YYYY-MM-DD",
    },
    search: true,
    form: true,
  },
  {
    label: '制定人',
    prop: 'createBy',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns([
  {
    label: '方案名称',
    prop: 'allocName',
    component: 'el-input',
    props: {
      clearable: true,
      placeholder: '请输入方案名称',
    },
    rules: [{required: true, message: '请输入方案名称'}],
    md: 12,
  },
  {
    label: '预测年度',
    prop: 'name2',
    component: 'el-date-picker',
    props: {
      placeholder: '请选择预测年度',
      type: 'year',
      style: {width: '100%'}
    },
    rules: [{required: true, message: '请选择预测年度'}],
    md: 12,
  },
  {
    label: '预测年总量(万m³)',
    prop: 'name3',
    component: 'el-input',
    props: {
      placeholder: '请输入预测年总量',
    },
    rules: [{required: true, message: '请输入预测年总量'}],
    md: 12,
  },
]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
    emit('getCurrentRow',row);
    emit('setVisible',false);
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
  getData();
})

const getData = () => {
  const { allocName, createTime } = serachForm.value||{}
  getInc({
    allocName,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    startTime: createTime ? createTime[0] : '',
    endTime: createTime ? createTime[1] : '',
    // planModule:'YEARLY'
  }).then(res => {
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
    if (type == 'add') {

    } else {

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
  }).then(() => {

  })
};

</script>

<style scoped lang="scss">

</style>