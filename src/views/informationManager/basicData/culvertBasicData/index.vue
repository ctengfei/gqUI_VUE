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
      <template #table-engStat="{ size, row, column, $index }">
        {{ formatterVal(row, 'ENG_STAT', 'engStat') }}
      </template>
      <template #table-pipeSecType="{ size, row, column, $index }">
        {{ formatterVal(row, 'PIPE_SEC_TYPE', 'pipeSecType') }}
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
import {addCle, delCle, exportCleExcel, getCle, updateCle} from "@/api/informationManager/basicData/culvertBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
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
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '涵洞代码',
    prop: 'culvCode',
    component: 'el-input',
    props:{
      placeholder:'请输入涵洞代码',
    },
    form: true,
    search: true,
  },
  {
    label: '涵洞名称',
    prop: 'culvName',
    component: 'el-input',
    width:200,
    props:{
      placeholder:'请输入涵洞名称',
    },
    form: true,
    search: true,
  },
  {
    label: '经度',
    prop: 'culvLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'culvLat',
    search: false,
    form: true,
  },
  {
    label: '所在位置',
    prop: 'culvLoc',
    search: false,
    form: true,
  },
  {
    label: '管道断面形状',
    prop: 'pipeSecType',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('PIPE_SEC_TYPE'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择管道断面形状',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '孔数',
    prop: 'orifNum',
    search: false,
    form: true,
  },
  {
    label: '涵洞过水能力(m³/s)',
    prop: 'culvWatProp',
    width:200,
    search: false,
    form: true,
  },
  {
    label: '工程建设情况',
    prop: 'engStat',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '涵洞代码',
    prop: 'culvCode',
    component: 'el-input',
    rules:[{ required: true, message: '涵洞代码' }],
    props:{
      disabled:!!(form.value?.culvCode),
      placeholder:'请输入涵洞代码',
    },
    md: 12,
  },
  {
    label: '涵洞名称',
    prop: 'culvName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入涵洞名称' }],
    props:{
      placeholder:'请输入涵洞名称',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'culvLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入经度' }],
    props:{
      placeholder:'请输入经度',
    },
    md: 12,
  },
  {
    label: '纬度',
    prop: 'culvLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入纬度' }],
    props:{
      placeholder:'请输入纬度',
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'culvLoc',
    component: 'el-input',
    props:{
      placeholder:'请输入所在位置',
    },
    md: 12,
  },
  {
    label: '管道断面形状',
    prop: 'pipeSecType',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('PIPE_SEC_TYPE'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择管道断面形状',
      clearable:true
    },
    rules:[{ required: true, message: '请选择管道断面形状' }],
    md: 12,
  },
  {
    label: '管道净高(m)',
    prop: 'pipeNetHeig',
    component: 'el-input',
    props:{
      placeholder:'请输入管道净高',
    },
    md: 12,
  },
  {
    label: '管道净宽(m)',
    prop: 'pipeNetWid',
    component: 'el-input',
    props:{
      placeholder:'请输入管道净宽',
    },
    md: 12,
  },
  {
    label: '管道内径(m)',
    prop: 'pipeIndi',
    component: 'el-input',
    props:{
      placeholder:'请输入管道内径',
    },
    md: 12,
  },
  {
    label: '孔数',
    prop: 'orifNum',
    component: 'el-input',
    props:{
      placeholder:'请输入孔数',
    },
    md: 12,
  },
  {
    label: '涵洞过水能力(m³/s)',
    prop: 'culvWatProp',
    component: 'el-input',
    props:{
      placeholder:'请输入涵洞过水能力',
    },
    md: 12,
  },
  {
    label: '工程建设情况',
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
    label: '开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label: '建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      placeholder:"请输入建成时间",
    },
    md: 12,
  },
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '涵洞代码',
    prop: 'culvCode',
    component: 'el-input',
    rules:[{ required: true, message: '涵洞代码' }],
    props:{
      disabled:true,
      placeholder:'请输入涵洞代码',
    },
    md: 12,
  },
  {
    label: '涵洞名称',
    prop: 'culvName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入涵洞名称' }],
    props:{
      disabled:true,
      placeholder:'请输入涵洞名称',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'culvLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入经度' }],
    props:{
      disabled:true,
      placeholder:'请输入经度',
    },
    md: 12,
  },
  {
    label: '纬度',
    prop: 'culvLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入纬度' }],
    props:{
      disabled:true,
      placeholder:'请输入纬度',
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'culvLoc',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入灌区编码',
    },
    md: 12,
  },
  {
    label: '管道断面形状',
    prop: 'pipeSecType',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('PIPE_SEC_TYPE'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择管道断面形状',
      clearable:true
    },
    rules:[{ required: true, message: '请选择管道断面形状' }],
    md: 12,
  },
  {
    label: '管道净高(m)',
    prop: 'pipeNetHeig',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入管道净高',
    },
    md: 12,
  },
  {
    label: '管道净宽(m)',
    prop: 'pipeNetWid',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入管道净宽',
    },
    md: 12,
  },
  {
    label: '管道内径(m)',
    prop: 'pipeIndi',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入管道内径',
    },
    md: 12,
  },
  {
    label: '孔数',
    prop: 'orifNum',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入孔数',
    },
    md: 12,
  },
  {
    label: '涵洞过水能力(m³/s)',
    prop: 'culvWatProp',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入涵洞过水能力',
    },
    md: 12,
  },
  {
    label: '工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程建设情况',
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
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label: '建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder:"请输入建成时间",
    },
    md: 12,
  },
]));
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
});

onMounted(() => {
  getData();
})

const getData = () => {
  getCle({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      addCle({...form.value}).then(res => {
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
      updateCle(form.value.culvCode, form.value).then(res => {
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
    delCle(row.culvCode).then(res => {
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
  proxy.download("business/base/culvBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`涵洞基础数据_${new Date().getTime()}.xlsx`);
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