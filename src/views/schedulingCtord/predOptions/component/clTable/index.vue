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
      width="40%"
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
    <template #search-menu-right="{ size }">
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
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {
  deleteClParameters1,
  getClParameters1, getRiverBasin,
  postClParameters,
  updateClParameters1
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
let riverCode = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '流域编码',
    prop: 'wshName',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      placeholder:'请输入流域编码',
    },
    md:12,
    search:true
  },
  {
    label: '流域名称',
    prop: 'wshCode',
    component: 'pro-select',
    props:{
      data:riverCode.value,
      style:{width:'100%'},
      placeholder:'请选择流域',
      clearable: true,
    },
    search:true
  },
  {
    label: '前期影响雨量消退系数',
    prop: 'kdegradePa',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入前期影响雨量消退系数'
    },
    md:12,
  },
  {
    label: '前期雨量最大影响天数(天)',
    prop: 'maxDayPa',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入前期雨量最大影响天数'
    },
    md:12,
  },
  {
    label: '前期影响雨量默认值(mm)',
    prop: 'paDefault',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入前期影响雨量默认值'
    },
    md:12,
  },
  {
    label: '最大土壤含水量(mm)',
    prop: 'wm',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入最大土壤含水量'
    },
    md:12,
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '流域',
    prop: 'wshCode',
    component: 'pro-select',
    props:{
      data:riverCode.value,
      style:{width:'100%'},
      placeholder:'请选择流域',
      clearable: true,
    },
    md:12,
  },
  {
    label: '前期影响雨量消退系数',
    prop: 'kdegradePa',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入前期影响雨量消退系数'
    },
    md:12,
  },
  {
    label: '前期雨量最大影响天数(天)',
    prop: 'maxDayPa',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入前期雨量最大影响天数'
    },
    md:12,
  },
  {
    label: '前期影响雨量默认值(mm)',
    prop: 'paDefault',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入前期影响雨量默认值'
    },
    md:12,
  },
  {
    label: '最大土壤含水量(mm)',
    prop: 'wm',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入最大土壤含水量'
    },
    md:12,
  },
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '流域',
    prop: 'wshCode',
    component: 'pro-select',
    props:{
      data:riverCode.value,
      style:{width:'100%'},
      placeholder:'请选择流域',
      clearable: true,
    },
    md:12,
  },
  {
    label: '前期影响雨量消退系数',
    prop: 'kdegradePa',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入前期影响雨量消退系数'
    },
    md:12,
  },
  {
    label: '前期雨量最大影响天数(天)',
    prop: 'maxDayPa',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入前期雨量最大影响天数'
    },
    md:12,
  },
  {
    label: '前期影响雨量默认值(mm)',
    prop: 'paDefault',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入前期影响雨量默认值'
    },
    md:12,
  },
  {
    label: '最大土壤含水量(mm)',
    prop: 'wm',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入最大土壤含水量'
    },
    md:12,
  },
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
  getData()
  getRiverBasin().then(res=>{
    if(res.success){
      riverCode.value = res.data.map(r=>({ label:r.wshName,value:r.wshCode }));
    }
  })
})

const getData = () => {
  getClParameters1({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
    const wshName = riverCode.value.find(r=>r.value == form.value.wshCode)?.label;
    if (type == 'add') {
      postClParameters({...form.value,wshName:wshName}).then(res => {
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
      updateClParameters1(form.value.wshCode,{...form.value,wshName:wshName}).then(res => {
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
    deleteClParameters1(row.wshCode).then(res => {
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
  proxy.download("/bim/irrFlood/parmApiBasinsRunoffCal/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`产流参数_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  margin-top: 17vh!important;
}

</style>