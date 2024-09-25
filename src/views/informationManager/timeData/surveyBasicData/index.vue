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
        label-width="170px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        @delete="deleteRow"
    >
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #table-stType="{ size, row, column, $index }">
        {{ formatterVal(row, 'ST_TYPE', 'stType') }}
      </template>
      <template #table-status="{ size, row, column, $index }">
        {{ formatterVal(row, 'water_status', 'status') }}
      </template>
      <template #table-type="{ size, row, column, $index }">
        {{ formatterVal(row, 'sur_type', 'type') }}
      </template>
      <template #table-dataSource="{ size, row, column, $index }">
        {{ formatterVal(row, 'DATA_SOURCE_TYPE', 'dataSource') }}
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="170px"
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
import {ref, reactive, onMounted} from "vue";
import { formatterVal } from '@/utils';
import {addSve, delSve, exportSveExcel, getSve, updateSve} from "@/api/informationManager/timeData/surveyBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
import useDictionaryStore from "@/store/modules/dictionary";
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
    label: '监测站代码',
    prop: 'stCode',
    component: 'el-input',
    props: {
      placeholder: '请输入监测站代码',
      clearable:true,
    },
    form: true,
    search: true,
  },
  {
    label: '监测站名称',
    prop: 'stName',
    component: 'el-input',
    props: {
      placeholder: '请输入监测站名称',
      clearable:true,
    },
    form: true,
    search: true,
  },
  {
    label: '所属类型',
    prop: 'type',
    component: 'pro-select',
    props: {
      clearable:true,
      data: dictStore.getDict('sur_type'),
      placeholder: '请选择所属类型',
    },
    search: true,
    form: true,
  },
  {
    label: '监测站类型',
    prop: 'stType',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('ST_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择监测站类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '经度',
    prop: 'stLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'stLat',
    search: false,
    form: true,
  },
  {
    label: '所在位置',
    prop: 'stLoc',
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
    label: '数据来源',
    prop: 'dataSource',
    search: true,
    form: true,
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('DATA_SOURCE_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择数据来源',
      clearable:true
    },
  },
  {
    label: '状态',
    prop: 'status',
    search: false,
    form: true,
  },
  {
    label: '备注',
    prop: 'remark',
    search: false,
    form: true,
  }
]);
const formColumns = defineFormColumns([
  {
    label: '监测站代码',
    prop: 'stCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入监测站代码' }],
    props: {
      placeholder: '请输入监测站代码',
    },
    md: 12,
  },
  {
    label: '监测站名称',
    prop: 'stName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入监测站名称' }],
    props: {
      placeholder: '请输入监测站名称',
    },
    md: 12,
  },
  {
    label: '所属类型',
    prop: 'type',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属类型' }],
    props: {
      clearable:true,
      style:{width:'100%'},
      data: dictStore.getDict('sur_type'),
      placeholder: '请选择所属类型',
    },
    md: 12,
  },
  {
    label: '所属灌区或者水库编码',
    prop: 'sourceCode',
    component: 'el-input',
    //rules:[{ required: true, message: '请输入所属灌区或者水库编码' }],
    props: {
      placeholder: '请输入所属灌区或者水库编码',
    },
    md: 12,
  },
  {
    label: '监测站经度',
    prop: 'stLong',
    component: 'el-input',
    props: {
      placeholder: '请输入监测站经度',
    },
    md: 12,
    rules:[{ required: true, message: '请输入监测站经度' }],
  },
  {
    label: '监测站纬度',
    prop: 'stLat',
    component: 'el-input',
    props: {
      placeholder: '请输入监测站纬度',
    },
    md: 12,
    rules:[{ required: true, message: '请输入监测站纬度' }],
  },
  {
    label: '监测站类型',
    prop: 'stType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择监测站类型' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ST_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择监测站类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'stLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '设站年月',
    prop: 'stYearMon',
    component: 'el-date-picker',
    props: {
      clearable:true,
      style:{width:'100%'},
      type: 'month',
      placeholder: "设站年月",
      'value-format':"YYYY-MM"
    },
    md: 12,
  },
  {
    label: '始报年月',
    prop: 'begRfpoYearMon',
    component: 'el-date-picker',
    props: {
      clearable:true,
      style:{width:'100%'},
      type: 'month',
      placeholder: "始报年月",
      'value-format':"YYYY-MM"
    },
    md: 12,
  },
  {
    label: '岸别',
    prop: 'bank',
    component: 'el-input',
    props: {
      placeholder: '请输入岸别',
    },
    md: 12,
  },
  {
    label: '方位',
    prop: 'stDir',
    component: 'el-input',
    props: {
      placeholder: '请输入方位',
    },
    md: 12,
  },
  {
    label: '集水面积(km²)',
    prop: 'catArea',
    component: 'el-input',
    props: {
      placeholder: '请输入集水面积',
    },
    md: 12,
  },
  // {
  //   label: '监测项目',
  //   prop: 'moniItem',
  //   component: 'el-input',
  //   props: {
  //     placeholder: '请输入监测项目',
  //   },
  //   md: 12,
  // },
  {
    label: '监测项目',
    prop: 'moniItem',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择监测项目' }],
    props: {
      clearable:true,
      style:{width:'100%'},
      data: dictStore.getDict('moni_Item'),
      placeholder: '请选择监测项目',
    },
    md: 12,
  },
  {
    label: '基准基面名称',
    prop: 'dtmName',
    component: 'el-input',
    props: {
      placeholder: '请输入基准基面名称',
    },
    md: 12,
  },
  {
    label: '基面高差',
    prop: 'dtmElev',
    component: 'el-input',
    props: {
      placeholder: '请输入基面高差',
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
    label: '数据来源',
    prop: 'dataSource',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择数据来源' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('DATA_SOURCE_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择数据来源',
      clearable:true
    },
    md: 12,
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择状态' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('water_status'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择状态',
      clearable:true
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
  },
]);
const detailColumns = defineFormColumns([
  {
    label: '监测站代码',
    prop: 'stCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入监测站代码' }],
    props: {
      placeholder: '请输入监测站代码',
    },
    md: 12,
  },
  {
    label: '监测站名称',
    prop: 'stName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入监测站名称' }],
    props: {
      placeholder: '请输入监测站名称',
    },
    md: 12,
  },
  {
    label: '所属类型',
    prop: 'type',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属类型' }],
    props: {
      clearable:true,
      style:{width:'100%'},
      data: dictStore.getDict('sur_type'),
      placeholder: '请选择所属类型',
    },
    md: 12,
  },
  {
    label: '所属灌区或者水库编码',
    prop: 'sourceCode',
    component: 'el-input',
    //rules:[{ required: true, message: '请输入所属灌区或者水库编码' }],
    props: {
      placeholder: '请输入所属灌区或者水库编码',
    },
    md: 12,
  },
  {
    label: '监测站经度',
    prop: 'stLong',
    component: 'el-input',
    props: {
      placeholder: '请输入监测站经度',
    },
    md: 12,
    rules:[{ required: true, message: '请输入监测站经度' }],
  },
  {
    label: '监测站纬度',
    prop: 'stLat',
    component: 'el-input',
    props: {
      placeholder: '请输入监测站纬度',
    },
    md: 12,
    rules:[{ required: true, message: '请输入监测站纬度' }],
  },
  {
    label: '监测站类型',
    prop: 'stType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择监测站类型' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ST_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择监测站类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'stLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '设站年月',
    prop: 'stYearMon',
    component: 'el-date-picker',
    props: {
      clearable:true,
      style:{width:'100%'},
      type: 'month',
      placeholder: "设站年月",
      'value-format':"YYYY-MM"
    },
    md: 12,
  },
  {
    label: '始报年月',
    prop: 'begRfpoYearMon',
    component: 'el-date-picker',
    props: {
      clearable:true,
      style:{width:'100%'},
      type: 'month',
      placeholder: "始报年月",
      'value-format':"YYYY-MM"
    },
    md: 12,
  },
  {
    label: '岸别',
    prop: 'bank',
    component: 'el-input',
    props: {
      placeholder: '请输入岸别',
    },
    md: 12,
  },
  {
    label: '方位',
    prop: 'stDir',
    component: 'el-input',
    props: {
      placeholder: '请输入方位',
    },
    md: 12,
  },
  {
    label: '集水面积(km²)',
    prop: 'catArea',
    component: 'el-input',
    props: {
      placeholder: '请输入集水面积',
    },
    md: 12,
  },
  {
    label: '监测项目',
    prop: 'moniItem',
    component: 'el-input',
    props: {
      placeholder: '请输入监测项目',
    },
    md: 12,
  },
  {
    label: '基准基面名称',
    prop: 'dtmName',
    component: 'el-input',
    props: {
      placeholder: '请输入基准基面名称',
    },
    md: 12,
  },
  {
    label: '基面高差',
    prop: 'dtmElev',
    component: 'el-input',
    props: {
      placeholder: '请输入基面高差',
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
    label: '数据来源',
    prop: 'dataSource',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择数据来源' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('DATA_SOURCE_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择数据来源',
      clearable:true
    },
    md: 12,
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择状态' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('water_status'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择状态',
      clearable:true
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
  },
].map(r=>({...r,props:{...r.props,disabled:true}})));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  }else {
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
  console.log(dictStore.getDict('DATA_SOURCE_TYPE'))
})

const getData = () => {
  getSve({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      addSve({...form.value}).then(res => {
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
      updateSve(form.value.stCode, form.value).then(res => {
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
    delSve(row.stCode).then(res => {
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
  proxy.download("business/base/stBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`测站基础数据_${new Date().getTime()}.xlsx`);
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