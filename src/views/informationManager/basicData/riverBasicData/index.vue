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
      <template #table-rvType="{ size, row, column, $index }">
        {{ formatterVal(row, 'RV_TYPE', 'rvType') }}
      </template>
      <template #table-rvGrad="{ size, row, column, $index }">
        {{ formatterVal(row, 'RV_GRAD', 'rvGrad') }}
      </template>
      <template #table-crOverType="{ size, row, column, $index }">
        {{ formatterVal(row, 'CR_OVER_TYPE', 'crOverType') }}
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
import {addRiver, delRiver, exportRiverExcel, getRiver, updateRiver} from "@/api/informationManager/basicData/riverBasicData";
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
    label: '河流代码',
    prop: 'rvCode',
    component: 'el-input',
    props: {
      placeholder: '请输入河流代码',
    },
    form: true,
    search: true,
  },
  {
    label: '河流名称',
    prop: 'rvName',
    component: 'el-input',
    props: {
      placeholder: '请输入泵站代码',
    },
    form: true,
    search: true,
  },
  {
    label: '河源经度',
    prop: 'rvSourLong',
    search: false,
    form: true,
  },
  {
    label: '河源纬度',
    prop: 'rvSourLat',
    search: false,
    form: true,
  },
  {
    label: '河口经度',
    prop: 'rvMouLong',
    search: false,
    form: true,
  },
  {
    label: '河口纬度',
    prop: 'rvMouLat',
    search: false,
    form: true,
  },
  {
    label: '河源所在位置',
    prop: 'rvSourLoc',
    search: false,
    form: true,
  },
  {
    label:'河口所在位置',
    prop: 'rvMouLoc',
    search: false,
    form: true,
  },
  {
    label:'跨界类型',
    prop: 'crOverType',
    search: false,
    form: true,
  },
  {
    label:'流经地区',
    prop: 'flowArea',
    search: false,
    form: true,
  },
  {
    label:'河流类型',
    prop: 'rvType',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('RV_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择河流类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'岸别',
    prop: 'bank',
    search: false,
    form: true,
  },
  {
    label:'河流等级',
    prop: 'rvGrad',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('RV_GRAD'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择河流等级',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'河流长度(km)',
    prop: 'rvLen',
    search: false,
    form: true,
    hide:true
  },
  {
    label:'河流流域面积(km²)',
    prop: 'rvBasArea',
    search: false,
    form: true,
    hide:true
  },
  {
    label:'平均流量(m/s)',
    prop: 'lonAverAnnFlow',
    search: false,
    form: true,
    hide:true
  },
  {
    label:'平均径流量(m/s)',
    prop: 'meaAnnRuof',
    search: false,
    form: true,
    hide:true
  },
  {
    label:'平均比降(%)',
    prop: 'averSlop',
    search: false,
    form: true,
    hide:true
  },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  }
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '河流代码',
    prop: 'rvCode',
    component: 'el-input',
    props: {
      disabled:!!(form.value?.rvCode),
      placeholder: '请输入河流代码',
    },
    rules:[{ required: true, message: '请输入河流代码' }],
    md: 12,
  },
  {
    label: '河流名称',
    prop: 'rvName',
    component: 'el-input',
    props: {
      placeholder: '请输入河流名称',
    },
    rules:[{ required: true, message: '请输入河流名称' }],
    md: 12,
  },
  {
    label: '河源经度',
    prop: 'rvSourLong',
    props: {
      placeholder: '请输入河源经度',
    },
    rules:[{ required: true, message: '请输入河源经度' }],
    component: 'el-input',
    md: 12,
  },
  {
    label: '河源纬度',
    prop: 'rvSourLat',
    component: 'el-input',
    props: {
      placeholder: '请输入河源纬度',
    },
    rules:[{ required: true, message: '请输入河源纬度' }],
    md: 12,
  },
  {
    label: '河口经度',
    prop: 'rvMouLong',
    component: 'el-input',
    props: {
      placeholder: '请输入河口经度',
    },
    rules:[{ required: true, message: '请输入河口经度' }],
    md: 12,
  },
  {
    label: '河口纬度',
    prop: 'rvMouLat',
    component: 'el-input',
    props: {
      placeholder: '请输入河口纬度',
    },
    rules:[{ required: true, message: '请输入河口纬度' }],
    md: 12,
  },
  {
    label: '河源所在位置',
    prop: 'rvSourLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入河源所在位置',
    },
    md: 12,
  },
  {
    label:'河口所在位置',
    prop: 'rvMouLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入河口所在位置',
    },
    md: 12,
  },
  {
    label:'跨界类型',
    prop: 'crOverType',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CR_OVER_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择跨界类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'流经地区',
    prop: 'flowArea',
    component: 'el-input',
    props: {
      placeholder: '请输入流经地区',
    },
    md: 12,
  },
  {
    label:'河流类型',
    prop: 'rvType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择河流类型' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('RV_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择河流类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'岸别',
    prop: 'bank',
    component: 'el-input',
    props: {
      placeholder: '请输入岸别',
    },
    md: 12,
  },
  {
    label:'河流等级',
    prop: 'rvGrad',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('RV_GRAD'),
      placeholder: '请选择河流等级',
      clearable:true
    },
    rules:[{ required: true, message: '请选择河流等级' }],
    md: 12,
  },
  {
    label:'河流长度(km)',
    prop: 'rvLen',
    component: 'el-input',
    props: {
      placeholder: '请输入河流长度',
    },
    md: 12,
  },
  {
    label:'河流流域面积(km²)',
    prop: 'rvBasArea',
    component: 'el-input',
    props: {
      placeholder: '请输入河流流域面积',
    },
    md: 12,
  },
  {
    label:'平均流量(m/s)',
    prop: 'lonAverAnnFlow',
    component: 'el-input',
    props: {
      placeholder: '请输入平均流量',
    },
    md: 12,
  },
  {
    label:'平均径流量(m/s)',
    prop: 'meaAnnRuof',
    component: 'el-input',
    props: {
      placeholder: '请输入平均径流量',
    },
    md: 12,
  },
  {
    label:'平均比降(%)',
    prop: 'averSlop',
    component: 'el-input',
    props: {
      placeholder: '请输入平均比降',
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
  }
]));
const detailColumns = defineFormColumns([
  {
    label: '河流代码',
    prop: 'rvCode',
    component: 'el-input',
    props: {
      placeholder: '请输入河流代码',
    },
    rules:[{ required: true, message: '请输入河流代码' }],
    md: 12,
  },
  {
    label: '河流名称',
    prop: 'rvName',
    component: 'el-input',
    props: {
      placeholder: '请输入河流名称',
    },
    rules:[{ required: true, message: '请输入河流名称' }],
    md: 12,
  },
  {
    label: '河源经度',
    prop: 'rvSourLong',
    props: {
      placeholder: '请输入河源经度',
    },
    rules:[{ required: true, message: '请输入河源经度' }],
    component: 'el-input',
    md: 12,
  },
  {
    label: '河源纬度',
    prop: 'rvSourLat',
    component: 'el-input',
    props: {
      placeholder: '请输入河源纬度',
    },
    rules:[{ required: true, message: '请输入河源纬度' }],
    md: 12,
  },
  {
    label: '河口经度',
    prop: 'rvMouLong',
    component: 'el-input',
    props: {
      placeholder: '请输入河口经度',
    },
    rules:[{ required: true, message: '请输入河口经度' }],
    md: 12,
  },
  {
    label: '河口纬度',
    prop: 'rvMouLat',
    component: 'el-input',
    props: {
      placeholder: '请输入河口纬度',
    },
    rules:[{ required: true, message: '请输入河口纬度' }],
    md: 12,
  },
  {
    label: '河源所在位置',
    prop: 'rvSourLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入河源所在位置',
    },
    md: 12,
  },
  {
    label:'河口所在位置',
    prop: 'rvMouLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入河口所在位置',
    },
    md: 12,
  },
  {
    label:'跨界类型',
    prop: 'crOverType',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CR_OVER_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择跨界类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'流经地区',
    prop: 'flowArea',
    component: 'el-input',
    props: {
      placeholder: '请输入流经地区',
    },
    md: 12,
  },
  {
    label:'河流类型',
    prop: 'rvType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择河流类型' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('RV_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择河流类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'岸别',
    prop: 'bank',
    component: 'el-input',
    props: {
      placeholder: '请输入岸别',
    },
    md: 12,
  },
  {
    label:'河流等级',
    prop: 'rvGrad',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('RV_GRAD'),
      placeholder: '请选择河流等级',
      clearable:true
    },
    rules:[{ required: true, message: '请选择河流等级' }],
    md: 12,
  },
  {
    label:'河流长度(km)',
    prop: 'rvLen',
    component: 'el-input',
    props: {
      placeholder: '请输入河流长度',
    },
    md: 12,
  },
  {
    label:'河流流域面积(km²)',
    prop: 'rvBasArea',
    component: 'el-input',
    props: {
      placeholder: '请输入河流流域面积',
    },
    md: 12,
  },
  {
    label:'平均流量(m/s)',
    prop: 'lonAverAnnFlow',
    component: 'el-input',
    props: {
      placeholder: '请输入平均流量',
    },
    md: 12,
  },
  {
    label:'平均径流量(m/s)',
    prop: 'meaAnnRuof',
    component: 'el-input',
    props: {
      placeholder: '请输入平均径流量',
    },
    md: 12,
  },
  {
    label:'平均比降(%)',
    prop: 'averSlop',
    component: 'el-input',
    props: {
      placeholder: '请输入平均比降',
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
  }
].map(r=>({...r,props:{...r.props,disabled:true}})));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  }else{
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done)=>{
  form.value = {};
  done()
});

onMounted(() => {
  getData();
})

const getData = () => {
  getRiver({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      addRiver({...form.value}).then(res => {
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
      updateRiver(form.value.rvCode, form.value).then(res => {
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
    delRiver(row.rvCode).then(res => {
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
  proxy.download("business/base/rvBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`河流基础数据_${new Date().getTime()}.xlsx`);
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