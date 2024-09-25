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
      <template #table-wainType="{ size, row, column, $index }">
        {{ formatterVal(row, 'WAIN_TYPE', 'wainType') }}
      </template>
      <template #table-scalType="{ size, row, column, $index }">
        {{ formatterVal(row, 'SCAL_TYPE', 'scalType') }}
      </template>
      <template #table-mainWainUse="{ size, row, column, $index }">
        {{ formatterVal(row, 'MAIN_WAIN_USE', 'mainWainUse') }}
      </template>
      <template #table-status="{ size, row, column, $index }">
        {{ formatterVal(row, 'water_status', 'status') }}
      </template>
      <template #table-wainWasoType="{ size, row, column, $index }">
        {{ formatterVal(row, 'WASO_TYPE', 'wainWasoType') }}
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
import {addIntake, delIntake, exportIntakeExcel, getIntake, updateIntake} from "@/api/informationManager/basicData/intakeBasicData";
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
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '取水口代码',
    prop: 'wainCode',
    component: 'el-input',
    props:{
      placeholder:'请输入取水口代码',
    },
    form: true,
    search: true,
  },
  {
    label: '取水口名称',
    prop: 'wainName',
    component: 'el-input',
    props:{
      placeholder:'请输入取水口名称',
    },
    form: true,
    search: true,
  },
  {
    label: '经度',
    prop: 'wainLong',
    search: false,
    form: true,
    hide:true
  },
  {
    label: '纬度',
    prop: 'wainLat',
    search: false,
    form: true,
    hide:true
  },
  {
    label: '所在位置',
    prop: 'wainLoc',
    search: false,
    form: true,
    hide:true
  },
  {
    label: '取水水源类型',
    prop: 'wainWasoType',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('WASO_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择取水水源类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '取水方式',
    prop: 'wainType',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('WAIN_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择取水方式',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'取水流量(m²/s)',
    prop: 'wainFlow',
    search: false,
    form: true,
  },
  {
    label:'开始取水日期',
    prop: 'begWainDate',
    search: false,
    form: true,
  },
  {
    label:'规模类型',
    prop: 'scalType',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('SCAL_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择规模类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'供水范围',
    prop: 'wasuRang',
    search: false,
    form: true,
  },
  {
    label:'主要取水用途',
    prop: 'mainWainUse',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('MAIN_WAIN_USE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择主要取水用途',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'取水许可证代码',
    prop: 'watLicCode',
    component: 'el-input',
    props: {
      placeholder: '请输入取水许可证代码',
    },
    search: true,
    form: true,
  },
  {
    label:'状态',
    prop: 'status',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('water_status'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择状态',
      clearable:true
    },
    search: false,
    form: true,
  },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '取水口代码',
    prop: 'wainCode',
    component: 'el-input',
    props: {
      disabled:!!(form.value?.wainCode),
      placeholder: '请输入取水口代码',
    },
    rules:[{ required: true, message: '请输入取水口代码' }],
    md: 12,
  },
  {
    label: '取水口名称',
    prop: 'wainName',
    component: 'el-input',
    props: {
      placeholder: '请输入取水口名称',
    },
    rules:[{ required: true, message: '请输入取水口名称' }],
    md: 12,
  },
  {
    label: '经度',
    prop: 'wainLong',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
    },
    rules:[{ required: true, message: '请输入经度' }],
    md: 12,
  },
  {
    label: '纬度',
    prop: 'wainLat',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    rules:[{ required: true, message: '请输入纬度' }],
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'wainLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '取水水源类型',
    prop: 'wainWasoType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择取水水源类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('WASO_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择取水水源类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '取水方式',
    prop: 'wainType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择取水方式' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('WAIN_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择取水方式',
      clearable:true
    },
    md: 12,
  },
  {
    label:'取水流量(m²/s)',
    prop: 'wainFlow',
    component: 'el-input',
    props: {
      placeholder: '请输入取水流量',
    },
    md: 12,
  },
  {
    label:'开始取水日期',
    prop: 'name9',
    component: 'el-date-picker',
    props: {
      style:{width:'100%'},
      clearable:true,
      type: 'date',
      placeholder:"开始取水日期",
      'value-format':"YYYY-MM-DD"
    },
    md: 12,
  },
  {
    label:'规模类型',
    prop: 'scalType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择规模类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('SCAL_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择规模类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'供水范围',
    prop: 'wasuRang',
    component: 'el-input',
    props: {
      placeholder: '请输入供水范围',
    },
    md: 12,
  },
  {
    label:'主要取水用途',
    prop: 'mainWainUse',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择主要取水用途' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('MAIN_WAIN_USE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择主要取水用途',
      clearable:true
    },
    md: 12,
  },
  {
    label:'取水许可证代码',
    prop: 'watLicCode',
    rules:[{ required: true, message: '请输入取水许可证代码' }],
    component: 'el-input',
    props: {
      placeholder: '请输入取水许可证代码',
    },
    md: 12,
  },
  {
    label:'状态',
    prop: 'status',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('water_status'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择状态',
      clearable:true
    },
    md: 12,
  },
  {
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  },
]));
const detailColumns = defineFormColumns([
  {
    label: '取水口代码',
    prop: 'wainCode',
    component: 'el-input',
    props: {
      placeholder: '请输入取水口代码',
    },
    rules:[{ required: true, message: '请输入取水口代码' }],
    md: 12,
  },
  {
    label: '取水口名称',
    prop: 'wainName',
    component: 'el-input',
    props: {
      placeholder: '请输入取水口名称',
    },
    rules:[{ required: true, message: '请输入取水口名称' }],
    md: 12,
  },
  {
    label: '经度',
    prop: 'wainLong',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
    },
    rules:[{ required: true, message: '请输入经度' }],
    md: 12,
  },
  {
    label: '纬度',
    prop: 'wainLat',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    rules:[{ required: true, message: '请输入纬度' }],
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'wainLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '取水水源类型',
    prop: 'wainWasoType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择取水水源类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('WASO_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择取水水源类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '取水方式',
    prop: 'wainType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择取水方式' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('WAIN_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择取水方式',
      clearable:true
    },
    md: 12,
  },
  {
    label:'取水流量(m²/s)',
    prop: 'wainFlow',
    component: 'el-input',
    props: {
      placeholder: '请输入取水流量',
    },
    md: 12,
  },
  {
    label:'开始取水日期',
    prop: 'name9',
    component: 'el-date-picker',
    props: {
      style:{width:'100%'},
      clearable:true,
      type: 'date',
      placeholder:"开始取水日期",
      'value-format':"YYYY-MM-DD"
    },
    md: 12,
  },
  {
    label:'规模类型',
    prop: 'scalType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择规模类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('SCAL_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择规模类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'供水范围',
    prop: 'wasuRang',
    component: 'el-input',
    props: {
      placeholder: '请输入供水范围',
    },
    md: 12,
  },
  {
    label:'主要取水用途',
    prop: 'mainWainUse',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择主要取水用途' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('MAIN_WAIN_USE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择主要取水用途',
      clearable:true
    },
    md: 12,
  },
  {
    label:'取水许可证代码',
    prop: 'watLicCode',
    rules:[{ required: true, message: '请输入取水许可证代码' }],
    component: 'el-input',
    props: {
      placeholder: '请输入取水许可证代码',
    },
    md: 12,
  },
  {
    label:'状态',
    prop: 'status',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('water_status'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择状态',
      clearable:true
    },
    md: 12,
  },
  {
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  },
].map(r=>({...r,props:{...r.props,disabled:true}})));
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
  getIntake({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      addIntake({...form.value}).then(res => {
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
      updateIntake(form.value.wainCode, form.value).then(res => {
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
    delIntake(row.wainCode).then(res => {
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
  proxy.download("business/base/wainBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`取水口基础数据_${new Date().getTime()}.xlsx`);
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