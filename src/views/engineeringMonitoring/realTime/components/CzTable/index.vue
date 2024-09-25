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
      width="50%"
      align="center"
      :before-open="beforeOpen"
      label-width="155px"
      direction="vertical"
      @search="searchSubmit"
      @search-reset="searchReset"
      @submit="submit"
  >
    <template #search-menu-right="{ size }">
      <span style="margin-left: 30px">
<!--        <el-button type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>-->
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
    <template #table-damCode="{ row }">
      {{ formatDbName(row) }}
    </template>
    <template #table-resCode="{ row }">
      {{ formatSkName(row.resCode) }}
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
  defineFormColumns,
  defineTableIndexColumns,
  defineCrudBeforeOpen,
} from 'element-pro-components';
import {onMounted, ref, onActivated, onDeactivated, defineProps, watch, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import {getCz, getDamBaseList, getDamStBase} from "@/api/engineeringMonitoring";
import {getResList} from "@/api/informationManager/basicData/skBasicData";

const props = defineProps(['activeName']);
const menu = defineCrudMenuColumns({
  label: '操作',
  width: '250',
  add: false,
  addText: '新增',
  detail: true,
  edit: false,
  del:false,
  reset: false,
  addProps: {
    type: 'primary',
    plain: true,
    icon: "Plus",
  },
  editProps: {
    link: true,
    type: 'primary',
    icon: 'Edit'
  },
  detailProps: {
    link: true,
    type: 'primary',
    icon: 'View'
  },
  delProps: {
    link: true,
    type: 'danger',
    icon: 'Delete'
  },
  searchResetProps: {
    icon: "Refresh",
  },
  searchProps: {
    type: 'primary',
    icon: "Search",
  },
  editText: '修改',
  delText: '删除',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
  detailText: '查看'
});
const detailMenu = defineCrudMenuColumns({
  submit: false,
  reset: true,
  resetText: '关闭'
});
const form = ref({});
const crudRef = ref();
const serachForm = ref({damCode:'',resCode:'',stCode:''});
const data = ref([]);
const currentPage = ref(1)
const pageSize = ref(10)
let total = ref(0)
let skList = ref([]);
let damList = ref([]);
let pointList = ref([]);
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '水库',
    prop: 'resCode',
    component: 'pro-select',
    props:{
      config: {value: 'value', label: 'label'},
      style:{width:'100%'},
      data:skList.value,
      placeholder:'请选择水库',
    },
    search: true,
  },
  {
    label: '大坝',
    prop: 'damCode',
    component: 'pro-select',
    props:{
      data:damList.value,
      config: {value: 'value', label: 'label'},
      style:{width:'100%'},
      placeholder:'请选择大坝',
    },
    search: true,
  },
  {
    label: '测点',
    prop: 'stCode',
    component: 'pro-select',
    props:{
      clearable:true,
      config: {value: 'value', label: 'label'},
      style:{width:'100%'},
      data:pointList.value,
      placeholder:'请选择测点',
    },
    search: true,
  },
  {
    label: '垂直位移',
    prop: 'vrds',
  },
  {
    label: '数据时间',
    prop: 'tm',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'datetimerange',
      'start-placeholder':"开始时间",
      'end-placeholder':'结束时间',
      'range-separator':'-',
      'value-format':"YYYY-MM-DD HH:mm:ss"
    },
    search: true,
    form: true,
  },
]));
const formColumns = defineFormColumns([])
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '大坝',
    prop: 'damName',
    component: 'el-input',
    props:{
      disabled: true,
      placeholder:'请选择大坝',
    },
    md: 12
  },
  {
    label: '水库',
    prop: 'resCode',
    component: 'pro-select',
    props:{
      disabled: true,
      clearable:true,
      config: {value: 'value', label: 'label'},
      style:{width:'100%'},
      data:skList.value,
      placeholder:'请选择水库',
    },
    md: 12
  },
  {
    label: '测点',
    prop: 'stCode',
    component: 'pro-select',
    props:{
      disabled: true,
      clearable:true,
      config: {value: 'value', label: 'label'},
      style:{width:'100%'},
      data:pointList.value,
      placeholder:'请选择测点',
    },
    md: 12
  },
  {
    label: '垂直位移',
    prop: 'vrds',
    component: 'el-input',
    props: {
      disabled: true,
      placeholder: '请输入垂直位移',
    },
    md: 12
  },
  {
    label: '时间',
    prop: 'tm',
    component: 'el-input',
    props: {
      disabled: true,
      placeholder: '请输入时间',
    },
    md: 12
  }]))
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  } else {
    form.value = {};
  }
  done();
});

const formatSkName = row => {
  return skList.value.find(r=> r.value == row)?.label
}

const formatDbName = row => {
  return row.damName
}

onMounted(() => {
  Promise.all([getResList(),getDamBaseList(),getDamStBase()]).then(([res,dam,stas])=>{
    if(res.success && dam.success && stas.success){
      skList.value = res.data.map(r=>({label:r.resName,value:r.resCode,leaf:false,level:1}));
      serachForm.value.resCode = skList.value.slice(-1)[0].value
      damList.value = dam.data.map(r=>({label:r.damName,value:r.damCode,level:2}))
      serachForm.value.damCode = damList.value.slice(-1)[0].value
      pointList.value = stas.data.map(r=>({label:r.stCode || '-',value:r.stCode,level:4}))
      getData()
    }
  })
})

const getData = () => {
  getCz({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
    endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
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

const searchReset = () => {
  currentPage.value = 1;
  getData();
};
</script>

<style scoped lang="scss">
:deep(.pro-form:not(.el-form--inline) .pro-form-menu) {
  display: flex;

  .el-form-item__content {
    justify-content: end;
    margin-right: 40px;
  }
}
</style>






