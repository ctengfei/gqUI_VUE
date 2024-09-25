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
      label-width="200px"
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
          label-width="200px"
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
  deleteLambda2Parameters,
  getLambda2Parameters,
  postLambda2Parameters, updateLambda2Parameters,
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
    label: 'lambd2值(m1非线性修正)',
    prop: 'lambda2',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入lambd2值(m1非线性修正)'
    },
    md:12,
  },
  {
    label: '流域面积阈值1(km2)',
    prop: 'basinAreaThershod1',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入流域面积阈值1(km2)'
    },
    md:12,
  },
  {
    label: '流域面积阈值2(km2)',
    prop: 'basinAreaThershod2',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入流域面积阈值2(km2)'
    },
    md:12,
  },
]);
const formColumns = defineFormColumns([
  {
    label: 'lambd2值(m1非线性修正)',
    prop: 'lambda2',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入lambd2值(m1非线性修正)'
    },
    md:12,
  },
  {
    label: '流域面积阈值1(km2)',
    prop: 'basinAreaThershod1',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入流域面积阈值1(km2)'
    },
    md:12,
  },
  {
    label: '流域面积阈值2(km2)',
    prop: 'basinAreaThershod2',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入流域面积阈值2(km2)'
    },
    md:12,
  },
]);
const detailColumns = defineFormColumns([
  {
    label: 'lambd2值(m1非线性修正)',
    prop: 'lambda2',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入lambd2值(m1非线性修正)'
    },
    md:12,
  },
  {
    label: '流域面积阈值1(km2)',
    prop: 'basinAreaThershod1',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入流域面积阈值1(km2)'
    },
    md:12,
  },
  {
    label: '流域面积阈值2(km2)',
    prop: 'basinAreaThershod2',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入流域面积阈值2(km2)'
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
  getLambda2Parameters({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      postLambda2Parameters({...form.value}).then(res => {
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
      updateLambda2Parameters(form.value.id, form.value).then(res => {
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
    deleteLambda2Parameters(row.id).then(res => {
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
  proxy.download("/bim/irrFlood/parmApiRelFLambda2/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`非线性修正系数Lambda2关系_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  margin-top: 17vh!important;
}

</style>