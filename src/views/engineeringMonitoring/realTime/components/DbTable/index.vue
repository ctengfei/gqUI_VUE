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
    <template #table-status="{ size, row, column, $index }">
      {{ formatterVal(row,'run_status','status') }}
    </template>
    <template #table-stType="{ size, row, column, $index }">
      {{ formatterVal(row,'DAM_ST_TYPE','stType') }}
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
import { formatterVal } from '@/utils';
import {ElMessage, ElMessageBox} from "element-plus";
import {getDamBaseList, getDamStBase, getDb} from "@/api/engineeringMonitoring";
import {getResList} from "@/api/informationManager/basicData/skBasicData";
const props = defineProps(['activeName']);
const menu = defineCrudMenuColumns({
  label: '操作',
  width: '100',
  add: false,
  fixed:'right',
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
const serachForm = ref({});
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
  // {
  //   label: '测点名称',
  //   prop: 'stName',
  //   component: 'el-input',
  //   props: {
  //     placeholder: '请输入测点名称',
  //   },
  //   search: true,
  // },
  {
    label: '测点类型',
    prop: 'stType',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data:dictStore.getDict('DAM_ST_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择测点类型',
      clearable:true
    },
    search: true,
  },
  {
    label: '桩号',
    prop: 'bnch',
  },
  {
    label: '仪器编码',
    prop: 'deviceCode',
  },
  {
    label: '基础情况',
    prop: 'basicInfo',
  },
  {
    label: '高程',
    prop: 'gc',
  },
  {
    label: '经度',
    prop: 'longitude',
  },
  {
    label: '纬度',
    prop: 'latitude',
  },
  {
    label: '透水段底高程',
    prop: 'pmbtGc',
  },
  {
    label: '透水段顶高程',
    prop: 'pmtpGc',
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data:dictStore.getDict('run_status'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择状态',
      clearable:true
    },
    search: true,
  },
  {
    label: '型式',
    prop: 'tp',
  },
  {
    label: '轴距',
    prop: 'wb',
  },
  {
    label: '安装时间',
    prop: 'installDate',
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
      clearable:true,
      config: {value: 'value', label: 'label'},
      style:{width:'100%'},
      data:skList.value,
      placeholder:'请选择水库',
    },
    md:12
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
    md:12
  },
  // {
  //   label: '测点名称',
  //   prop: 'stName',
  //   component: 'el-input',
  //   props: {
  //     placeholder: '请输入测点名称',
  //   },
  //   md:12
  // },
  {
    label: '测点类型',
    prop: 'stType',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data:dictStore.getDict('DAM_ST_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择测点类型',
      clearable:true
    },
    md:12
  },
  {
    label: '桩号',
    prop: 'bnch',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
    },
    md:12
  },
  {
    label: '仪器编码',
    prop: 'deviceCode',
    component: 'el-input',
    props: {
      placeholder: '请输入仪器编码',
    },
    md:12
  },
  {
    label: '基础情况',
    prop: 'basicInfo',
    component: 'el-input',
    props: {
      placeholder: '请输入基础情况',
    },
    md:12
  },
  {
    label: '高程',
    prop: 'gc',
    component: 'el-input',
    props: {
      placeholder: '请输入高程',
    },
    md:12
  },
  {
    label: '经度',
    prop: 'longitude',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
    },
    md:12
  },
  {
    label: '纬度',
    prop: 'latitude',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    md:12
  },
  {
    label: '透水段底高程',
    prop: 'pmbtGc',
    component: 'el-input',
    props: {
      placeholder: '请输入透水段底高程',
    },
    md:12
  },
  {
    label: '透水段顶高程',
    prop: 'pmtpGc',
    component: 'el-input',
    props: {
      placeholder: '请输入透水段顶高程',
    },
    md:12
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data:dictStore.getDict('run_status'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择状态',
      clearable:true
    },
    md:12
  },
  {
    label: '基准值X',
    prop: 'stvlX',
    component: 'el-input',
    props: {
      placeholder: '请输入基准值X',
    },
    md:12
  },
  {
    label: '基准值Y',
    prop: 'stvlY',
    component: 'el-input',
    props: {
      placeholder: '请输入基准值Y',
    },
    md:12
  },
  {
    label: '型式',
    prop: 'tp',
    component: 'el-input',
    props: {
      placeholder: '请输入型式',
    },
    md:12
  },
  {
    label: '轴距',
    prop: 'wb',
    component: 'el-input',
    props: {
      placeholder: '请输入轴距',
    },
    md:12
  },
  {
    label: '安装时间',
    prop: 'installDate',
    component: 'el-input',
    props: {
      placeholder: '请输入安装时间',
    },
    md:12
  },
].map(r=>({...r,props:{...r.props,disabled:true}}))))
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
  getDb({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value
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






