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
        width="50%"
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
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #table-pustType="{ size, row, column, $index }">
        {{ formatterVal(row, 'PUST_TYPE', 'pustType') }}
      </template>
      <template #table-engGrad="{ size, row, column, $index }">
        {{ formatterVal(row, 'ENG_GRAD', 'engGrad') }}
      </template>
      <template #table-engScal="{ size, row, column, $index }">
        {{ formatterVal(row, 'PROJ_SCAL', 'engScal') }}
      </template>
      <template #table-engStat="{ size, row, column, $index }">
        {{ formatterVal(row, 'ENG_STAT', 'engStat') }}
      </template>
      <template #table-mainBuildGrad="{ size, row, column, $index }">
        {{ formatterVal(row, 'BUILDING_GRAD', 'mainBuildGrad') }}
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        ></pro-form>
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
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {addBz, delBz, exportBzExcel, getBz, updateBz} from "@/api/informationManager/basicData/bzBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {getCanList} from "@/api/informationManager/basicData/canalBasicData";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: true,
  reset: false,
  width: '250',
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
let channelList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '泵站代码',
    prop: 'pustCode',
    component: 'el-input',
    props:{
      placeholder:'请输入泵站代码',
    },
    form: true,
    search: true,
  },
  {
    label: '泵站名称',
    prop: 'pustName',
    component: 'el-input',
    props: {
      placeholder: '请输入泵站名称',
    },
    form: true,
    search: true,
  },
  {
    label: '经度',
    prop: 'pustLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'pustLat',
    search: false,
    form: true,
  },
  {
    label: '所在位置',
    prop: 'pustLoc',
    search: false,
    form: true,
  },
  {
    label: '泵站类型',
    prop: 'pustType',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('PUST_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择泵站类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '装机流量(m³/s)',
    prop: 'insFlow',
    search: false,
    form: true,
  },
  {
    label: '装机流量功率(kw)',
    prop: 'insPow',
    search: false,
    form: true,
  },
  {
    label: '水泵数量(台)',
    prop: 'pumpNum',
    search: false,
    form: true,
  },
  {
    label: '设计扬程(m)',
    prop: 'desHead',
    search: false,
    form: true,
  },
  {
    label: '工程等别',
    prop: 'engGrad',
    search: false,
    form: true,
  },
  {
    label: '建成时间',
    prop: 'compDate',
    search: false,
    form: true,
  },
  {
    label: '归属管理部门',
    prop: 'admDep',
    search: false,
    form: true,
  },
  {
    label: '备注',
    prop: 'remark',
    search: false,
    form: true,
  }
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '泵站代码',
    prop: 'pustCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入泵站代码' }],
    props: {
      disabled:!!(form.value?.pustCode),
      placeholder: '请输入泵站代码',
    },
    md: 12,
  },
  {
    label: '泵站名称',
    prop: 'pustName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入泵站名称' }],
    props: {
      placeholder: '请输入泵站名称',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'pustLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入经度' }],
    props: {
      placeholder: '请输入经度',
    },
    md: 12,
  },
  {
    label: '纬度',
    prop: 'pustLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入纬度' }],
    props: {
      placeholder: '请输入纬度',
    },
    required: true,
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'pustLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '所属渠道',
    prop: 'chanCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属渠道' }],
    props: {
      style:{width:'100%'},
      data: channelList.value,
      placeholder: '请选择所属渠道',
      clearable:true
    },
    md: 12,
  },
  {
    label: '水源',
    prop: 'headWater',
    component: 'el-input',
    props: {
      placeholder: '请输入水源',
    },
    md: 12,
  },
  {
    label: '灌溉面积',
    prop: 'irrArea',
    component: 'el-input-number',
    props: {
      style:{width:'100%'},
      placeholder: '请输入灌溉面积',
    },
    md: 12,
  },
  {
    label: '泵站类型',
    prop: 'pustType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择泵站类型' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('PUST_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择泵站类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '装机流量(m³/s)',
    prop: 'insFlow',
    component: 'el-input',
    props: {
      placeholder: '请输入装机流量',
    },
    md: 12,
  },
  {
    label: '装机流量功率(kw)',
    prop: 'insPow',
    component: 'el-input',
    props: {
      placeholder: '请输入装机流量功率',
    },
    md: 12,
  },
  {
    label: '水泵数量(台)',
    prop: 'pumpNum',
    component: 'el-input',
    props: {
      placeholder: '请输入水泵数量',
    },
    md: 12,
  },
  {
    label: '设计扬程(m)',
    prop: 'desHead',
    component: 'el-input',
    props: {
      placeholder: '请输入设计扬程',
    },
    md: 12,
  },
  {
    label: '工程任务',
    prop: 'endTask',
    component: 'el-input',
    props: {
      placeholder: '请输入工程任务',
    },
    md: 12,
  },
  {
    label: '工程等别',
    prop: 'engGrad',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ENG_GRAD'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程等别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '工程规模',
    prop: 'engScal',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('PROJ_SCAL'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程规模',
      clearable:true
    },
    md: 12,
  },
  {
    label: '主要建筑物级别',
    prop: 'mainBuildGrad',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('BUILDING_GRAD'), // ENG_STAT.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择主要建筑物级别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label: '开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder: "请输入开工时间",
    },
    md: 12,
  },
  {
    label: '建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      placeholder: "请输入建成时间",
    },
    md: 12,
  },
  {
    label: '归属管理部门',
    prop: 'admDep',
    component: 'el-input',
    props: {
      placeholder: '请输入归属管理部门',
    },
    md: 12,
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  }
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '泵站代码',
    prop: 'pustCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入泵站代码' }],
    props: {
      disabled:true,
      placeholder: '请输入泵站代码',
    },
    md: 12,
  },
  {
    label: '泵站名称',
    prop: 'pustName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入泵站名称' }],
    props: {
      disabled:true,
      placeholder: '请输入泵站名称',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'pustLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入经度' }],
    props: {
      disabled:true,
      placeholder: '请输入经度',
    },
    md: 12,
  },
  {
    label: '纬度',
    prop: 'pustLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入纬度' }],
    props: {
      disabled:true,
      placeholder: '请输入纬度',
    },
    required: true,
    md: 12,
  },
  {
    label: '所属渠道',
    prop: 'chanCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属渠道' }],
    props: {
      style:{width:'100%'},
      data: channelList.value,
      placeholder: '请选择所属渠道',
      clearable:true
    },
    md: 12,
  },
  {
    label: '水源',
    prop: 'headWater',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入水源',
    },
    md: 12,
  },
  {
    label: '灌溉面积',
    prop: 'irrArea',
    component: 'el-input-number',
    props: {
      disabled:true,
      placeholder: '请输入灌溉面积',
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'pustLoc',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '泵站类型',
    prop: 'pustType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择泵站类型' }],
    props: {
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('PUST_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择泵站类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '装机流量(m³/s)',
    prop: 'insFlow',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入装机流量',
    },
    md: 12,
  },
  {
    label: '装机流量功率(kw)',
    prop: 'insPow',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入装机流量功率',
    },
    md: 12,
  },
  {
    label: '水泵数量(台)',
    prop: 'pumpNum',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入水泵数量',
    },
    md: 12,
  },
  {
    label: '设计扬程(m)',
    prop: 'desHead',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入设计扬程',
    },
    md: 12,
  },
  {
    label: '工程任务',
    prop: 'endTask',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入工程任务',
    },
    md: 12,
  },
  {
    label: '工程等别',
    prop: 'engGrad',
    component: 'pro-select',
    props: {
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('ENG_GRAD'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程等别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '工程规模',
    prop: 'engScal',
    component: 'pro-select',
    props: {
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('PROJ_SCAL'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程规模',
      clearable:true
    },
    md: 12,
  },
  {
    label: '主要建筑物级别',
    prop: 'mainBuildGrad',
    component: 'pro-select',
    props: {
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('BUILDING_GRAD'), // ENG_STAT.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择主要建筑物级别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props: {
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label: '开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: "请输入开工时间",
    },
    md: 12,
  },
  {
    label: '建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: "请输入建成时间",
    },
    md: 12,
  },
  {
    label: '归属管理部门',
    prop: 'admDep',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入归属管理部门',
    },
    md: 12,
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      disabled:true,
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  }
].map(r=>({...r,props:{...r.props,disabled:true}}))));
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
  getData();
  getCanList().then(res=>{
    if(res.success){
      channelList.value = res.data.map(r=>({label:r.chanName,value:r.chanCode}));
    }
  })
})

const getData = () => {
  getBz({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  });
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
      addBz({...form.value}).then(res => {
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    }else{
      updateBz(form.value.pustCode, form.value).then(res => {
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
    delBz(row.pustCode).then(res => {
      if (res.success) {
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
};

const exportData = () => {
  proxy.download("business/base/pustBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`泵站基础数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

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