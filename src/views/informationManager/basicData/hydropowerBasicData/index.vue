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
      <template #table-damCode="{ size, row, column, $index }">
        {{ formatterSk(row.damCode) }}
      </template>
      <template #table-hystType="{ size, row, column, $index }">
        {{ formatterVal(row, 'HYST_TYPE', 'hystType') }}
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
import {ElMessage, ElMessageBox} from "element-plus";
import {addHyd, delHyd, exportHydExcel, getHyd, updateHyd} from "@/api/informationManager/basicData/hydropowerBasicData";
import {getResList} from "@/api/informationManager/basicData/skBasicData";
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
let resList = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '水电站代码',
    prop: 'hystCode',
    component: 'el-input',
    props:{
      placeholder:'请输入水电站代码',
    },
    form: true,
    search: true,
  },
  {
    label: '水电站名称',
    prop: 'hystName',
    component: 'el-input',
    props:{
      placeholder:'请输入水电站名称',
    },
    form: true,
    search: true,
  },
  {
    label: '经度',
    prop: 'hystLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'hystLat',
    search: false,
    form: true,
  },
  {
    label: '位置',
    prop: 'hystLoc',
    search: false,
    form: true,
  },
  {
    label: '类型',
    prop: 'hystType',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('HYST_TYPE'), //  PROJ_SCAL.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '总装机容量(kW)',
    prop: 'totInsCap',
    search: false,
    form: true,
  },
  {
    label:'保证出力(kW)',
    prop: 'firmPow',
    search: false,
    form: true,
  },
  {
    label:'额定水头',
    prop: 'ratHead',
    search: false,
    form: true,
  },
  {
    label:'工程等别',
    prop: 'engGrad',
    search: false,
    form: true,
  },
  {
    label:'工程规模',
    prop: 'engScal',
    search: false,
    form: true,
  },
  {
    label:'建筑物级别',
    prop: 'mainBuildGrad',
    search: false,
    form: true,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    search: false,
    form: true,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    search: false,
    form: true,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    search: false,
    form: true,
  },
  {
    label:'管理部门',
    prop: 'admDep',
    search: false,
    form: true,
  },
  {
    label:'所属水库',
    prop: 'damCode',
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
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  }
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '水电站代码',
    prop: 'hystCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入水电站代码' }],
    props: {
      disabled:!!(form.value?.hystCode),
      placeholder: '请输入水电站代码',
    },
    md: 12,
  },
  {
    label: '水电站名称',
    prop: 'hystName',
    component: 'el-input',
    props: {
      placeholder: '请输入水电站名称',
    },
    rules:[{ required: true, message: '请输入水电站名称' }],
    md: 12,
  },
  {
    label: '经度',
    prop: 'hystLong',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
    },
    rules:[{ required: true, message: '请输入经度' }],
    md: 12,
  },
  {
    label: '纬度',
    prop: 'hystLat',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    rules:[{ required: true, message: '请输入纬度' }],
    md: 12,
  },
  {
    label: '位置',
    prop: 'hystLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入位置',
    },
    md: 12,
  },
  {
    label: '类型',
    prop: 'hystType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('HYST_TYPE'), //  PROJ_SCAL.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '总装机容量(kW)',
    prop: 'totInsCap',
    component: 'el-input',
    props: {
      placeholder: '请输入总装机容量',
    },
    md: 12,
  },
  {
    label:'保证出力(kW)',
    prop: 'firmPow',
    props: {
      placeholder: '请输入保证出力',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label:'额定水头',
    prop: 'ratHead',
    component: 'el-input',
    props: {
      placeholder: '请输入额定水头',
    },
    md: 12,
  },
  {
    label:'工程等别',
    prop: 'engGrad',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ENG_GRAD'),
      placeholder: '请选择工程等别',
      clearable:true
    },
    md: 12,
  },
  {
    label:'工程规模',
    prop: 'engScal',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('PROJ_SCAL'), //  PROJ_SCAL.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程规模',
      clearable:true
    },
    md: 12,
  },
  {
    label:'建筑物级别',
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
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      placeholder:"请输入建成时间",
    },
    md: 12,
  },
  {
    label:'管理部门',
    prop: 'admDep',
    component: 'el-input',
    props: {
      placeholder: '请输入管理部门',
    },
    md: 12,
  },
  {
    label:'所属水库',
    prop: 'damCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属水库' }],
    props:{
      style:{width:'100%'},
      data:resList.value, // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择所属水库',
      clearable:true
    },
    md: 12,
  },
  {
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入备注',
    },
    md: 24,
  }
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '水电站代码',
    prop: 'hystCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入水电站代码' }],
    props: {
      placeholder: '请输入水电站代码',
    },
    md: 12,
  },
  {
    label: '水电站名称',
    prop: 'hystName',
    component: 'el-input',
    props: {
      placeholder: '请输入水电站名称',
    },
    rules:[{ required: true, message: '请输入水电站名称' }],
    md: 12,
  },
  {
    label: '经度',
    prop: 'hystLong',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
    },
    rules:[{ required: true, message: '请输入经度' }],
    md: 12,
  },
  {
    label: '纬度',
    prop: 'hystLat',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    rules:[{ required: true, message: '请输入纬度' }],
    md: 12,
  },
  {
    label: '位置',
    prop: 'hystLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入位置',
    },
    md: 12,
  },
  {
    label: '类型',
    prop: 'hystType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('HYST_TYPE'), //  PROJ_SCAL.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '总装机容量(kW)',
    prop: 'totInsCap',
    component: 'el-input',
    props: {
      placeholder: '请输入总装机容量',
    },
    md: 12,
  },
  {
    label:'保证出力(kW)',
    prop: 'firmPow',
    props: {
      placeholder: '请输入保证出力',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label:'额定水头',
    prop: 'ratHead',
    component: 'el-input',
    props: {
      placeholder: '请输入额定水头',
    },
    md: 12,
  },
  {
    label:'工程等别',
    prop: 'engGrad',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ENG_GRAD'),
      placeholder: '请选择工程等别',
      clearable:true
    },
    md: 12,
  },
  {
    label:'工程规模',
    prop: 'engScal',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('PROJ_SCAL'), //  PROJ_SCAL.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程规模',
      clearable:true
    },
    md: 12,
  },
  {
    label:'建筑物级别',
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
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      placeholder:"请输入建成时间",
    },
    md: 12,
  },
  {
    label:'管理部门',
    prop: 'admDep',
    component: 'el-input',
    props: {
      placeholder: '请输入管理部门',
    },
    md: 12,
  },
  {
    label:'所属水库',
    prop: 'damCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属水库' }],
    props:{
      style:{width:'100%'},
      data:resList.value, // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择所属水库',
      clearable:true
    },
    md: 12,
  },
  {
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入备注',
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

const formatterSk = row => {
  return row ? resList.value.find(r => r.value == row)?.label : ''
}

onMounted(() => {
  getData()
})

const getData = () => {
  getHyd({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  })
  getResList().then(res=>{
    if(res.success){
      resList.value = res.data.map(r=>({label:r.resName,value:r.resCode}));
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
      addHyd({...form.value,wmstType:1}).then(res => {
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    } else {
      updateHyd(form.value.hystCode, form.value).then(res => {
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

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    delHyd(row.hystCode).then(res => {
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
  proxy.download("business/base/hystBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`水电站基础数据_${new Date().getTime()}.xlsx`);
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