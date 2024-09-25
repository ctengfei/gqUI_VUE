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
import {addDng, delDng, exportDngExcel, getDng, updateDng} from "@/api/informationManager/basicData/dngBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
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
    label: '险工险段代码',
    prop: 'dpdsCode',
    component: 'el-input',
    props:{
      placeholder:'请输入险工险段代码',
    },
    form: true,
    search: true,
  },
  {
    label: '险工险段名称',
    prop: 'dpdsName',
    component: 'el-input',
    props:{
      placeholder:'请输入险工险段名称',
    },
    form: true,
    search: true,
  },
  {
    label: '经度',
    prop: 'dpdsLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'dpdsLat',
    search: false,
    form: true,
  },
  {
    label: '位置',
    prop: 'dpdsLoc',
    search: false,
    form: true,
  },
  {
    label: '出险数量(处)',
    prop: 'dangNum',
    search: false,
    form: true,
  },
  {
    label: '桩号',
    prop: 'dpdsNum',
    search: false,
    form: true,
  },
  {
    label:'长度(m)',
    prop: 'dpdsLen',
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
    label: '险工险段代码',
    prop: 'dpdsCode',
    component: 'el-input',
    md: 12,
    props: {
      disabled:!!(form.value?.dpdsCode),
      placeholder: '请输入险工险段代码',
    },
    rules:[{ required: true, message: '请输入险工险段代码' }],
  },
  {
    label: '险工险段名称',
    prop: 'dpdsName',
    component: 'el-input',
    md: 12,
    props: {
      placeholder: '请输入险工险段名称',
    },
    rules:[{ required: true, message: '请输入险工险段名称' }],
  },
  {
    label: '经度',
    prop: 'dpdsLong',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
    },
    rules:[{ required: true, message: '请输入经度' }],
    md: 12,
  },
  {
    label: '纬度',
    prop: 'dpdsLat',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    rules:[{ required: true, message: '请输入纬度' }],
    md: 12,
  },
  {
    label: '位置',
    prop: 'dpdsLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入位置',
    },
    md: 12,
  },
  {
    label: '出险数量(处)',
    prop: 'dangNum',
    component: 'el-input',
    props: {
      placeholder: '请输入出险数量',
    },
    md: 12,
  },
  {
    label: '桩号',
    prop: 'dpdsNum',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
    },
    md: 12,
  },
  {
    label:'长度(m)',
    prop: 'dpdsLen',
    component: 'el-input',
    props: {
      placeholder: '请输入长度',
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
    label: '险工险段代码',
    prop: 'dpdsCode',
    component: 'el-input',
    md: 12,
    props: {
      placeholder: '请输入险工险段代码',
    },
    rules:[{ required: true, message: '请输入险工险段代码' }],
  },
  {
    label: '险工险段名称',
    prop: 'dpdsName',
    component: 'el-input',
    md: 12,
    props: {
      placeholder: '请输入险工险段名称',
    },
    rules:[{ required: true, message: '请输入险工险段名称' }],
  },
  {
    label: '经度',
    prop: 'dpdsLong',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
    },
    rules:[{ required: true, message: '请输入经度' }],
    md: 12,
  },
  {
    label: '纬度',
    prop: 'dpdsLat',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    rules:[{ required: true, message: '请输入纬度' }],
    md: 12,
  },
  {
    label: '位置',
    prop: 'dpdsLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入位置',
    },
    md: 12,
  },
  {
    label: '出险数量(处)',
    prop: 'dangNum',
    component: 'el-input',
    props: {
      placeholder: '请输入出险数量',
    },
    md: 12,
  },
  {
    label: '桩号',
    prop: 'dpdsNum',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
    },
    md: 12,
  },
  {
    label:'长度(m)',
    prop: 'dpdsLen',
    component: 'el-input',
    props: {
      placeholder: '请输入长度',
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
  getData()
})

const getData = () => {
  getDng({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
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
      addDng({...form.value,wmstType:1}).then(res => {
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
      updateDng(form.value.dpdsCode, form.value).then(res => {
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
    delDng(row.dpdsCode).then(res => {
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
  proxy.download("business/base/dpdsBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`险工险段基础数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
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