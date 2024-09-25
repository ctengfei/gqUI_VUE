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
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="180px"
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
      <template #table-damCode="{ row }">
        {{ formatDbName(row) }}
      </template>
      <template #table-resCode="{ row }">
        {{ formatSkName(row.resCode) }}
      </template>
      <template #form-node>
        <el-cascader :style="{width:'100%'}" :props="{
           lazy:true,
           lazyLoad:lazyLoad
        }" v-model="form.node" :options="skList"/>
      </template>
      <template #table-stType="{ size, row, column, $index }">
        {{ formatterVal(row,'DAM_ST_TYPE','stType') }}
      </template>
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="180px"
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
  deleteDamManualReportSpgR,
  deleteDamManualReportWyR, getDamBaseList, getDamManualReportSpgR,
  getDamManualReportWyR, getDamStBase, postDamManualReportSpgR,
  postDamManualReportWyR, putDamManualReportSpgR,
  putDamManualReportWyR
} from "@/api/engineeringMonitoring";
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
const serachForm = ref({damCode:'',resCode:'',stCode:''});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let skList = ref([]);
let damList = ref([]);
let pointList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '水库',
    prop: 'resCode',
    component: 'pro-select',
    props:{
      config: {value: 'value', label: 'label'},
      style:{width:'100%'},
      data:skList.value,
      placeholder:'请选择水库',
    },
    search: true,
  },
  {
    label: '大坝',
    prop: 'damCode',
    component: 'pro-select',
    props:{
      data:damList.value,
      config: {value: 'value', label: 'label'},
      style:{width:'100%'},
      placeholder:'请选择大坝',
    },
    search: true,
  },
  {
    label: '测点类型',
    prop: 'stType',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data:dictStore.getDict('DAM_ST_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择测点类型',
      clearable:true
    },
    search: true,
  },
  {
    label: '测点',
    prop: 'stCode',
    component: 'el-input',
    props:{
      placeholder:'请输入测点',
    },
    search: true,
  },
  {
    label:'温度',
    prop: 'temp',
  },
  {
    label:'渗流压力水位',
    prop: 'z',
  },
  {
    label:'人工监测时间',
    prop: 'tm',
  },
  {
    label:'备注',
    prop: 'remark',
  }
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '水库/大坝/测点类型/测点',
    prop: 'node',
    md: 24,
  },
  {
    label:'温度',
    prop: 'temp',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入温度',
    },
    md:12
  },
  {
    label:'渗流压力水位',
    prop: 'z',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入渗流压力水位',
    },
    md:12
  },
  {
    label:'人工监测时间',
    prop: 'tm',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type:'datetime',
      style: {width: '100%'},
      'value-format':'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择人工监测时间',
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
    label: '水库/大坝/测点类型/测点',
    prop: 'node',
    component: 'el-input',
    props:{
      placeholder:'请输入',
    },
    md: 24,
  },
  {
    label:'温度',
    prop: 'temp',
    component: 'el-input',
    props:{
      placeholder:'请输入温度',
    },
    md:12
  },
  {
    label:'渗流压力水位',
    prop: 'z',
    component: 'el-input',
    props:{
      placeholder:'请输入渗流压力水位',
    },
    md:12
  },
  {
    label:'人工监测时间',
    prop: 'tm',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type:'datetime',
      style: {width: '100%'},
      'value-format':'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择人工监测时间',
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
  if (type === 'edit') {
    form.value = {...row,node:[row.resCode,row.damCode,row.stType || '-',row.stCode]}
  } else if(type === 'detail'){
    form.value = {...row,node:`${row.resName} / ${row.damName} / ${formatterVal(row,'DAM_ST_TYPE','stType') || '-'} / ${row.stCode}`}
  } else{
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

const lazyLoad = (node,resolve) =>{
  const { value,level } = node
  if(level == 1){
    getDamBaseList({resCode:value}).then(res=>{
      if(res.success){
        resolve(res.data.map(r=>({label:r.damName,value:r.damCode,level:2})))
      }
    })
  }else if(level == 2){
    const dic = dictStore.getDict('DAM_ST_TYPE').map(r=>({...r,level:3}))
    resolve(dic)
  }else if(level == 3){
    getDamStBase({stType:value}).then(res=>{
      if(res.success){
        resolve(res.data.map(r=>({label:r.stCode || '-',value:r.stCode,level:4,leaf:true})))
      }
    })
  }
}


const formatSkName = row => {
  return skList.value.find(r=> r.value == row)?.label
}

const formatDbName = row => {
  return row.damName
}

const formatPointName = row => {
  return pointList.value.find(r=>r.value == row)?.label
}

onMounted(() => {
  Promise.all([getResList(),getDamBaseList(),getDamStBase()]).then(([res,dam,stas])=>{
    if(res.success && dam.success && stas.success){
      skList.value = res.data.map(r=>({label:r.resName,value:r.resCode,leaf:false,level:1}));
      serachForm.value.resCode = skList.value.slice(-1)[0].value
      damList.value = dam.data.map(r=>({label:r.damName,value:r.damCode,level:2}))
      serachForm.value.damCode = damList.value.slice(-1)[0].value
      pointList.value = stas.data.map(r=>({label:r.stCode || '-',value:r.stCode,level:4}))
      getData()
    }
  })
})

const getData = () => {
  getDamManualReportSpgR({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      postDamManualReportSpgR({
        ...form.value,
        resCode:form.value.node[0],
        damCode:form.value.node[1],
        stType:form.value.node[2],
        stCode:form.value.node[3]
      }).then(res => {
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
      putDamManualReportSpgR(form.value.id, {
        ...form.value,
        resCode:form.value.node[0],
        damCode:form.value.node[1],
        stType:form.value.node[2],
        stCode:form.value.node[3]
      }).then(res => {
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
    deleteDamManualReportSpgR(row.id).then(res => {
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
  proxy.download("/business/standard/damManualReportSpgR/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`渗流压力水位数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
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