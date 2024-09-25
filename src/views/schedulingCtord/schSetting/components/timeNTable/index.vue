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
      height="500"
      align="center"
      :before-open="beforeOpen"
      :before-close="beforeClose"
      label-width="150px"
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
    <template #menu-right="{ size }">
      <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
      <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
    </template>
    <template #crud-detail="{ props, columns, size }">
      <pro-form
          label-width="250px"
          v-model="form"
          @reset="crudRef.closeDialog()"
          :menu="detailMenu"
          :columns="detailColumns"
      ></pro-form>
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
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import { formatterVal } from '@/utils';
import {ref, reactive, onMounted} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {
  deleteLambda1Parameters, deleteTimeNParameters,
  getLambda1Parameters, getTimeNParameters,
  postLambda1Parameters, postTimeNParameters,
  updateLambda1Parameters, updateTimeNParameters,

} from "@/api/schedulingCtord/predOptions";
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
    label: '公式形式',
    prop: 'formulationForm',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      placeholder:'请输入公式形式'
    },
    md:12,
  },
  {
    label: '河流坡度阈值1',
    prop: 'riverSlopeThreshold1',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入河流坡度阈值1'
    },
    md:12,
  },
  {
    label: '河流坡度阈值2',
    prop: 'riverSlopeThreshold2',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入河流坡度阈值2'
    },
    md:12,
  },
  {
    label: 'n计算参数a值',
    prop: 'na',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入n计算参数a值'
    },
    md:12,
  },
  {
    label: 'n计算参数b值',
    prop: 'nb',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入n计算参数b值'
    },
    md:12,
  },
  {
    label: 'n计算参数c值',
    prop: 'nc',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入n计算参数c值'
    },
    md:12,
  },
]);
const formColumns = defineFormColumns([
  {
    label: '公式形式',
    prop: 'formulationForm',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      placeholder:'请输入公式形式'
    },
    md:12,
  },
  {
    label: '时河流坡度阈值1',
    prop: 'riverSlopeThreshold1',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入河流坡度阈值1'
    },
    md:12,
  },
  {
    label: '河流坡度阈值2',
    prop: 'riverSlopeThreshold2',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入河流坡度阈值2'
    },
    md:12,
  },
  {
    label: 'n计算参数a值',
    prop: 'na',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入n计算参数a值'
    },
    md:12,
  },
  {
    label: 'n计算参数b值',
    prop: 'nb',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入n计算参数b值'
    },
    md:12,
  },
  {
    label: 'n计算参数c值',
    prop: 'nc',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入n计算参数c值'
    },
    md:12,
  },
]);
const detailColumns = defineFormColumns([
  {
    label: '公式形式',
    prop: 'formulationForm',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      placeholder:'请输入公式形式'
    },
    md:12,
  },
  {
    label: '河流坡度阈值1',
    prop: 'riverSlopeThreshold1',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入河流坡度阈值1'
    },
    md:12,
  },
  {
    label: '河流坡度阈值2',
    prop: 'riverSlopeThreshold2',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入河流坡度阈值2'
    },
    md:12,
  },
  {
    label: 'n计算参数a值',
    prop: 'na',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入n计算参数a值'
    },
    md:12,
  },
  {
    label: 'n计算参数b值',
    prop: 'nb',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入n计算参数b值'
    },
    md:12,
  },
  {
    label: 'n计算参数c值',
    prop: 'nc',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入n计算参数c值'
    },
    md:12,
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
})

onMounted(() => {
  getData()
})

const getData = () => {
  getTimeNParameters({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      postTimeNParameters({...form.value}).then(res => {
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
      updateTimeNParameters(form.value.id, form.value).then(res => {
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
    deleteTimeNParameters(row.id).then(res => {
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
  proxy.download("/bim/irrFlood/parmApiUhCalN/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`时段单位线n相关参数_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  margin-top: 17vh!important;
}

</style>