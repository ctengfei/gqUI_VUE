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
        @reset="reset"
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
      <template #table-ifMaiDam="{ size, row, column, $index }">
        {{ formatterVal(row, 'IF_MAI_DAM', 'ifMaiDam') }}
      </template>
      <template #table-engGrad="{ size, row, column, $index }">
        {{ formatterVal(row, 'ENG_GRAD', 'engGrad') }}
      </template>
      <template #table-damGrad="{ size, row, column, $index }">
        {{ formatterVal(row, 'BUILDING_GRAD', 'damGrad') }}
      </template>
      <template #table-elevSys="{ size, row, column, $index }">
        {{ formatterVal(row, 'ELEV_SYS', 'elevSys') }}
      </template>
      <template #table-damTypeMat="{ size, row, column, $index }">
        {{ formatterVal(row, 'DAM_TYPE_MAT', 'damTypeMat') }}
      </template>
      <template #table-damTypeStr="{ size, row, column, $index }">
        {{ formatterVal(row, 'DAM_TYPE_STR', 'damTypeStr') }}
      </template>
      <template #table-engStat="{ size, row, column, $index }">
        {{ formatterVal(row, 'ENG_STAT', 'engStat') }}
      </template>
      <template #table-resCode="{ size, row, column, $index }">
        {{ formatVal(row.resCode) }}
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
import {addDam, delDam, exportDamExcel, getDam, updateDam} from "@/api/informationManager/basicData/damBasicData";
import {getResList} from "@/api/informationManager/basicData/skBasicData";
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
let resList = ref([]);
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[

  {
    label: '大坝代码',
    prop: 'damCode',
    component: 'el-input',
    props:{
      placeholder:'请输入大坝名称',
    },
    form: true,
    search: true,
  },
  {
    label: '大坝名称',
    prop: 'damName',
    component: 'el-input',
    props:{
      placeholder:'请输入大坝名称',
    },
    form: true,
    search: true,
  },
  {
    label: '所属水库',
    prop: 'resCode',
    component: 'pro-select',
    props:{
      data: resList.value,
      placeholder:'请选择所属水库',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '经度',
    prop: 'startLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'startLat',
    search: false,
    form: true,
  },
  // {
  //   label: '终点经度',
  //   prop: 'endLong',
  //   search: false,
  //   form: true,
  // },
  // {
  //   label: '终点纬度',
  //   prop: 'endLat',
  //   search: false,
  //   form: true,
  // },
  {
    label: '所在位置',
    prop: 'damLoc',
    search: false,
    form: true,
  },
  {
    label: '是否主坝',
    prop: 'ifMaiDam',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('IF_MAI_DAM'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝级别',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '工程等别',
    prop: 'engGrad',
    search: false,
    form: true,
  },
  {
    label: '大坝级别',
    prop: 'damGrad',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('BUILDING_GRAD'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝级别',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '最大坝高(m)',
    prop: 'damMaxHeig',
    search: false,
    form: true,
  },
  {
    label: '坝顶长度(m)',
    prop: 'damTopLen',
    search: false,
    form: true,
    hide:true
  },
  {
    label: '坝顶宽度(m)',
    prop: 'damTopWid',
    search: false,
    form: true,
  },
  {
    label: '坝顶高程(m)',
    prop: 'damTopElev',
    component: 'el-input',
    props:{
      placeholder:'请输入坝顶高程',
    },
    search: false,
    form: true,
  },
  {
    label: '大坝材料类型',
    prop: 'damTypeMat',
    search: false,
    form: true,
  },
  {
    label: '大坝结构类型',
    prop: 'damTypeStr',
    search: false,
    form: true,
  },
  {
    label: '工程建设情况',
    prop: 'engStat',
    search: false,
    form: true,
  },
  
  {
    label: '备注',
    prop: 'remark',
    search: false,
    form: true,
  }
]));
const formColumns = defineFormColumns(computed(()=>[

  {
    label: '大坝代码',
    prop: 'damCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入大坝代码' }],
    props:{
      disabled:!!(form.value?.damCode),
      placeholder:'请输入大坝代码',
    },
    md: 12,
  },
  {
    label: '大坝名称',
    prop: 'damName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入大坝名称' }],
    props:{
      placeholder:'请输入大坝名称',
    },
    md: 12,
  },
  {
    label: '起点经度',
    prop: 'startLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入起点纬度' }],
    props:{
      placeholder:'请输入起点纬度',
    },
    md: 12,
  },
  {
    label: '起点纬度',
    prop: 'startLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入起点纬度' }],
    props:{
      placeholder:'请输入起点纬度',
    },
    md: 12,
  },
  {
    label: '终点经度',
    prop: 'endLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入终点经度' }],
    props:{
      placeholder:'请输入终点经度',
    },
    md: 12,
  },
  {
    label: '终点纬度',
    prop: 'endLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入终点纬度' }],
    props:{
      placeholder:'请输入终点纬度',
    },
    md: 12,
  },
  {
    label: '所属水库',
    prop: 'resCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属水库' }],
    props:{
      style:{width:'100%'},
      data: resList.value,
      placeholder:'请选择所属水库',
      clearable:true
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'damLoc',
    component: 'el-input',
    props:{
      placeholder:'请输入所在位置',
    },
    md: 12,
  },
  {
    label: '是否主坝',
    prop: 'ifMaiDam',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择是否主坝' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('IF_MAI_DAM'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择是否主坝',
      clearable:true
    },
    md: 12,
  },
  {
    label: '大坝级别',
    prop: 'damGrad',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择大坝级别' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('BUILDING_GRAD'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝级别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '工程等别',
    prop: 'engGrad',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('ENG_GRAD'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝级别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '最大坝高(m)',
    prop: 'damMaxHeig',
    component: 'el-input',
    props:{
      placeholder:'请输入最大坝高',
    },
    md: 12,
  },
  {
    label: '坝顶长度(m)',
    prop: 'damTopLen',
    component: 'el-input',
    props:{
      placeholder:'请输入坝顶长度',
    },
    md: 12,
  },
  {
    label: '坝顶宽度(m)',
    prop: 'damTopWid',
    component: 'el-input',
    props:{
      placeholder:'请输入坝顶宽度',
    },
    md: 12,
  },
  {
    label:'高程系统',
    prop: 'elevSys',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('ELEV_SYS'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择高程系统',
      clearable:true
    },
    md: 12,
  },
  {
    label: '坝顶高程(m)',
    prop: 'damTopElev',
    component: 'el-input',
    props:{
      placeholder:'请输入坝顶高程',
    },
    md: 12,
  },
  {
    label: '大坝材料类型',
    prop: 'damTypeMat',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('DAM_TYPE_MAT'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝材料类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '大坝结构类型',
    prop: 'damTypeStr',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('DAM_TYPE_STR'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝结构类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('ENG_STAT'), // run_status.value
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
 
  {
    label: '备注',
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
    label: '大坝代码',
    prop: 'damCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入大坝代码' }],
    props:{
      disabled:true,
      placeholder:'请输入大坝代码',
    },
    md: 12,
  },
  {
    label: '大坝名称',
    prop: 'damName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入大坝名称' }],
    props:{
      disabled:true,
      placeholder:'请输入大坝名称',
    },
    md: 12,
  },
  {
    label: '起点经度',
    prop: 'startLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入起点纬度' }],
    props:{
      disabled:true,
      placeholder:'请输入起点纬度',
    },
    md: 12,
  },
  {
    label: '起点纬度',
    prop: 'startLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入起点纬度' }],
    props:{
      disabled:true,
      placeholder:'请输入起点纬度',
    },
    md: 12,
  },
  {
    label: '终点经度',
    prop: 'endLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入终点经度' }],
    props:{
      disabled:true,
      placeholder:'请输入终点经度',
    },
    md: 12,
  },
  {
    label: '终点纬度',
    prop: 'endLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入终点纬度' }],
    props:{
      disabled:true,
      placeholder:'请输入终点纬度',
    },
    md: 12,
  },
  {
    label: '所属水库',
    prop: 'resCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属水库' }],
    props:{
      disabled:true,
      style:{width:'100%'},
      data: resList.value,
      placeholder:'请选择所属水库',
      clearable:true
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'damLoc',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入所在位置',
    },
    md: 12,
  },
  {
    label: '是否主坝',
    prop: 'ifMaiDam',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择是否主坝' }],
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('IF_MAI_DAM'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择是否主坝',
      clearable:true
    },
    md: 12,
  },
  {
    label: '大坝级别',
    prop: 'damGrad',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择大坝级别' }],
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('BUILDING_GRAD'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝级别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '工程等别',
    prop: 'engGrad',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('ENG_GRAD'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝级别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '最大坝高(m)',
    prop: 'damMaxHeig',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入最大坝高',
    },
    md: 12,
  },
  {
    label: '坝顶长度(m)',
    prop: 'damTopLen',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入坝顶长度',
    },
    md: 12,
  },
  {
    label: '坝顶宽度(m)',
    prop: 'damTopWid',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入坝顶宽度',
    },
    md: 12,
  },
  {
    label:'高程系统',
    prop: 'elevSys',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('ELEV_SYS'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择高程系统',
      clearable:true
    },
    md: 12,
  },
  {
    label: '坝顶高程(m)',
    prop: 'damTopElev',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入坝顶高程',
    },
    md: 12,
  },
  {
    label: '大坝材料类型',
    prop: 'damTypeMat',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('DAM_TYPE_MAT'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝材料类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '大坝结构类型',
    prop: 'damTypeStr',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('DAM_TYPE_STR'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择大坝结构类型',
      clearable:true
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
      data:dictStore.getDict('ENG_STAT'), // run_status.value
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
 
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入备注',
    },
    md: 24,
  }
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  } else {
    form.value = {};
  }
  done();
});

const formatVal = (row) => {
  return resList.value.find(r=> r.value == row)?.label;
}

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
});

onMounted(() => {
  getData();
  getResList().then(res=>{
    if(res.success){
      resList.value = res.data.map(r=>({label:r.resName,value:r.resCode}));
    }
  })
})

const getData = () => {
  getDam({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
    if (type == 'add') {
      addDam({...form.value}).then(res => {
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
      updateDam(form.value.damCode, form.value).then(res => {
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
    delDam(row.damCode).then(res => {
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
  proxy.download('business/base/damBase/page/export', {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`水库大坝基础数据_${new Date().getTime()}.xlsx`);
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