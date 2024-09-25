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
      <template #table-wiuType="{ size, row, column, $index }">
        {{ formatterVal(row, 'WIU_TYPE', 'wiuType') }}
      </template>
      <template #table-indCatt="{ size, row, column, $index }">
        {{ formatterVal(row, 'IND_CATT', 'indCatt') }}
      </template>
      <template #table-moniGrad="{ size, row, column, $index }">
        {{ formatterVal(row, 'MONI_GRAO', 'moniGrad') }}
      </template>
      <template #table-isVimp="{ size, row, column, $index }">
        {{ formatterVal(row, 'is_vimp', 'isVimp') }}
      </template>
      <template #table-status="{ size, row, column, $index }">
        {{ formatterVal(row, 'water_status', 'status') }}
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
import {
  addIntakeUser,
  delIntakeUser,
  exportIntakeUserExcel,
  getIntakeUser,
  updateIntakeUser
} from "@/api/informationManager/basicData/intakeuserBasicData";
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
    label: '取用水户代码',
    prop: 'wiuCode',
    component: 'el-input',
    props: {
      placeholder: '请输入取用水户代码',
    },
    form: true,
    search: true,
  },
  {
    label: '取用水户名称',
    prop: 'wiuName',
    component: 'el-input',
    props: {
      placeholder: '请输入取用水户名称',
    },
    form: true,
    search: true,
  },
  {
    label: '经度',
    prop: 'wiuLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'wiuLat',
    search: false,
    form: true,
  },
  {
    label: '所在位置',
    prop: 'wiuLoc',
    search: false,
    form: true,
  },
  {
    label: '取用水户类型',
    prop: 'wiuType',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('WIU_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择取用水户类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '取用水量(万m³)',
    prop: 'watCons',
    search: false,
    form: true,
    width:'120'
  },
  {
    label:'行业类别',
    prop: 'indCatt',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('IND_CATT'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择行业类别',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'经济类型',
    prop: 'ecoType',
    search: false,
    form: true,
  },
  {
    label:'监控级别',
    prop: 'moniGrad',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('MONI_GRAO'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择监控级别',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'是否重点取用水户',
    prop: 'isVimp',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('is_vimp'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择是否重点取用水户',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('water_status'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择状态',
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
    label: '取用水户代码',
    prop: 'wiuCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入取用水户代码' }],
    props: {
      disabled:!!(form.value?.wiuCode),
      placeholder: '请输入取用水户代码',
    },
    md: 12,
  },
  {
    label: '取用水户名称',
    prop: 'wiuName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入取用水户名称' }],
    props: {
      placeholder: '请输入取用水户名称',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'wiuLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入经度' }],
    props: {
      placeholder: '请输入经度',
    },
    md: 12,
  },
  {
    label: '纬度',
    prop:'wiuLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入纬度' }],
    props: {
      placeholder: '请输入纬度',
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'wiuLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '取用水户类型',
    prop: 'wiuType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择取用水户类型' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('WIU_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择取用水户类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '取用水量(万m³)',
    prop: 'watCons',
    component: 'el-input',
    props: {
      placeholder: '请输入取用水量',
    },
    md: 12,
  },
  {
    label:'行业类别',
    prop: 'indCatt',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择行业类别' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('IND_CATT'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择行业类别',
      clearable:true
    },
    md: 12,
  },
  {
    label:'经济类型',
    prop: 'ecoType',
    component: 'el-input',
    props: {
      placeholder: '请输入经济类型',
    },
    md: 12,
  },
  {
    label:'监控级别',
    prop: 'moniGrad',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择监控级别' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('MONI_GRAO'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择监控级别',
      clearable:true
    },
    md: 12,
  },
  {
    label:'是否重点取用水户 ',
    prop: 'isVimp',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择是否重点取用水户' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('is_vimp'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择是否重点取用水户',
      clearable:true
    },
    md: 12,
  },
  {
    label:'状态',
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
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  },
]));
const detailColumns = defineFormColumns([
  {
    label: '取用水户代码',
    prop: 'wiuCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入取用水户代码' }],
    props: {
      placeholder: '请输入取用水户代码',
    },
    md: 12,
  },
  {
    label: '取用水户名称',
    prop: 'wiuName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入取用水户名称' }],
    props: {
      placeholder: '请输入取用水户名称',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'wiuLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入经度' }],
    props: {
      placeholder: '请输入经度',
    },
    md: 12,
  },
  {
    label: '纬度',
    prop:'wiuLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入纬度' }],
    props: {
      placeholder: '请输入纬度',
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'wiuLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '取用水户类型',
    prop: 'wiuType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择取用水户类型' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('WIU_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择取用水户类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '取用水量(万m³)',
    prop: 'watCons',
    component: 'el-input',
    props: {
      placeholder: '请输入取用水量',
    },
    md: 12,
  },
  {
    label:'行业类别',
    prop: 'indCatt',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择行业类别' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('IND_CATT'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择行业类别',
      clearable:true
    },
    md: 12,
  },
  {
    label:'经济类型',
    prop: 'ecoType',
    component: 'el-input',
    props: {
      placeholder: '请输入经济类型',
    },
    md: 12,
  },
  {
    label:'监控级别',
    prop: 'moniGrad',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择监控级别' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('MONI_GRAO'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择监控级别',
      clearable:true
    },
    md: 12,
  },
  {
    label:'是否重点取用水户 ',
    prop: 'isVimp',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择是否重点取用水户' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('is_vimp'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择是否重点取用水户',
      clearable:true
    },
    md: 12,
  },
  {
    label:'状态',
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
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  },
].map(r=>({...r,props:{...r.props,disabled:true}})));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = {...row,isVimp:JSON.stringify(row.isVimp),status:JSON.stringify(row.status)} || {};
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
  getIntakeUser({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      addIntakeUser({...form.value}).then(res => {
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
      updateIntakeUser(form.value.wiuCode, form.value).then(res => {
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

const load = () => {
  getData()
}

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    delIntakeUser(row.wiuCode).then(res => {
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
  proxy.download("business/base/wiuBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`取水口用户基础数据_${new Date().getTime()}.xlsx`);
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