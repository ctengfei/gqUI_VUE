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
      <template #menu="{ size,row }">
        <el-button
            :size="size"
            type="success"
            link
            @click="handleChangeStatus(row)"
        >
          {{ parseInt(row.status) ? '作废' : '启用' }}
        </el-button>
      </template>
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #table-examFreq="{ size, row, column, $index }">
        {{ formatterVal(row,'frequency_assessment','examFreq') }}
      </template>
      <template #table-examObjType="{ size, row, column, $index }">
        {{ formatterVal(row,'examObjType','examObjType') }}
      </template>
      <template #table-examAddrId="{ size, row, column, $index }">
        {{ formatExamVal(row.examAddrId) }}
      </template>
      <template #table-templateUnitId="{ size, row, column, $index }">
        {{ formatDepartmentVal(row.templateUnitId) }}
      </template>
      <template #table-status="{ size, row, column, $index }">
        <el-tag>{{ parseInt(row.status) ? '启用' : '作废'  }}</el-tag>
      </template>
      <template #form>
        <assessmentTable  :tempId="tempId" @getXTable="getXTable"  :form_type="form_type" />
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        >
          <assessmentTable  :tempId="tempId" @getXTable="getXTable" :form_type="form_type" />
        </pro-form>
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
import {formatterVal, loopTree, treeToArray} from '@/utils';
import {ref, reactive, onMounted, computed} from "vue";
import assessmentTable from './components/assessmentTable';
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {addMesTemp, delMesTemp, getMesTemp, updateMesTemp, updateStatus} from "@/api/evaluationManager/mesTempManager";
import {deptTreeSelect} from "@/api/system/user";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: true,
  reset: false,
  width: '280',
  addProps: {
    type: 'primary',
    plain: true,
    icon: 'Plus'
  },
  editProps: {
    link: true,
    type: 'primary',
    icon: 'Edit',
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
const form = ref({status:1});
const crudRef = ref();
const serachForm = ref({});
let XTable = ref({});
let form_type = ref(''); // 编辑 新增 查看
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let department = ref([]);
let assessment = ref([]);
let tempId = ref('');
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '模版编号',
    prop: 'templateCode',
    component: 'el-input',
    props: {
      style: { width: "100%" },
      placeholder: '请输入模版编号',
    },
    search: true,
  },
  {
    label: '模板编制单位',
    prop: 'templateUnitId',
    component: 'el-tree-select',
    props: {
      placeholder: '请选择模板编制单位',
      data: department.value,
      style: { width: "200px" },
      checkStrictly: true,
      clearable:true,
      "default-expand-all": true,
    },
    search: true,
  },
  {
    label: '模板名称',
    prop: 'templateName',
    component: 'el-input',
    props: {
      style: { width: "100%" },
      placeholder: '请输入模板名称',
    },
    search: true,
  },
  {
    label: '适用考核范围',
    prop: 'examAddrId',
    component: 'el-tree-select',
    props: {
      placeholder: '请选择适用考核范围',
      data: assessment.value,
      style: { width: "200px" },
      checkStrictly: true,
      clearable:true,
      "default-expand-all": true,
    },
    search: true,
  },
  {
    label: '考核频次',
    prop: 'examFreq',
  },
  {
    label: '标准分数',
    prop: 'totalTempStandardScore',
  },
  {
    label: '状态',
    prop: 'status',
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '模板编号',
    prop: 'templateCode',
    component: 'el-input',
    props: {
      placeholder: '请输入模板编号',
    },
    rules:[{ required: true, message: '请输入模板编号' }],
    md:12,
    form: true,
  },
  {
    label: '模板名称',
    prop: 'templateName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入模板名称' }],
    props: {
      placeholder: '请输入模板名称',
    },
    md:12,
  },
  {
    label: '适用考察范围',
    prop: 'examAddrId',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: assessment.value,
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考适用考察范围',
      clearable:true
    },
    rules:[{ required: true, message: '请选择考适用考察范围' }],
    md:12,
  },
  {
    label: '考核频次',
    prop: 'examFreq',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核频次' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('frequency_assessment'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核频次',
      clearable:true
    },
    md:12,
  },
  {
    label: '考核对象类型',
    prop: 'examObjType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核对象类型' }],
    props: {
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('examObjType'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核对象类型',
      clearable:true
    },
    md:12,
  },
  {
    label: '模板编制单位',
    prop: 'templateUnitId',
    component: 'el-tree-select',
    rules:[{ required: true, message: '请选择模板编制单位' }],
    props: {
      placeholder: '请选择模板编制单位',
      data: department.value,
      style: { width: "100%" },
      checkStrictly: true,
      clearable:true,
      "default-expand-all": true,
    },
    md:12,
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-radio',
    props: {
      data:[
        { value: 1, label: '启用' },
        { value: 0, label: '作废' },
      ],
      style: { width: "100%" },
    },
    md:24,
  },
  {
    label: '优秀',
    prop: 'excellentScore',
    component: 'el-input-number',
    rules:[{ required: true, message: '请输入分数' }],
    md:8,
  },
  {
    label: '良好',
    prop: 'goodScore',
    component: 'el-input-number',
    rules:[{ required: true, message: '请输入分数' }],
    md:8,
  },
  {
    label: '合格',
    prop: 'passScore',
    component: 'el-input-number',
    rules:[{ required: true, message: '请输入分数' }],
    md:8,
  },
]));
const detailColumns = defineFormColumns([
  {
    label: '模板编号',
    prop: 'templateCode',
    component: 'el-input',
    props: {
      placeholder: '请输入模板编号',
    },
    rules:[{ required: true, message: '请输入模板编号' }],
    md:12,
    form: true,
  },
  {
    label: '模板名称',
    prop: 'templateName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入模板名称' }],
    props: {
      placeholder: '请输入模板名称',
    },
    md:12,
  },
  {
    label: '适用考察范围',
    prop: 'examAddrId',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: assessment.value,
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考适用考察范围',
      clearable:true
    },
    rules:[{ required: true, message: '请选择考适用考察范围' }],
    md:12,
  },
  {
    label: '考核频次',
    prop: 'examFreq',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核频次' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('frequency_assessment'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核频次',
      clearable:true
    },
    md:12,
  },
  {
    label: '考核对象类型',
    prop: 'examObjType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核对象类型' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('examObjType'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核对象类型',
      clearable:true
    },
    md:12,
  },
  {
    label: '模板编制单位',
    prop: 'templateUnitId',
    component: 'el-tree-select',
    rules:[{ required: true, message: '请选择模板编制单位' }],
    props: {
      placeholder: '请选择模板编制单位',
      data: department.value,
      style: { width: "100%" },
      checkStrictly: true,
      clearable:true,
      "default-expand-all": true,
    },
    md:12,
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-radio',
    props: {
      data:[
        { value: 1, label: '启用' },
        { value: 0, label: '作废' },
      ],
      style: { width: "100%" },
    },
    md:24,
  },
  {
    label: '优秀',
    prop: 'excellentScore',
    component: 'el-input-number',
    rules:[{ required: true, message: '请输入分数' }],
    md:8,
  },
  {
    label: '良好',
    prop: 'goodScore',
    component: 'el-input-number',
    rules:[{ required: true, message: '请输入分数' }],
    md:8,
  },
  {
    label: '合格',
    prop: 'passScore',
    component: 'el-input-number',
    rules:[{ required: true, message: '请输入分数' }],
    md:8,
  },
].map(r=>({...r,props:{...r.props,disabled:true}})));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  form_type.value = type;
  if (type === 'edit' || type === 'detail') {
    tempId.value = row.id;
    form.value = {...row,status:parseInt(row.status),examObjType:'1'} || {};
  }else if(type === 'add'){
    form.value = {status: 1,examObjType:'1',excellentScore: 100,goodScore: 100, passScore: 100};
  } else {
    form.value = {};
  }
  done();
});

const handleChangeStatus = (row) => {
  updateStatus(row.id,{status:parseInt(row.status) ? 0 : 1}).then(res=>{
    if (res.success) {
      getData()
    }
  })
}

const formatDepartmentVal = (row) =>{
  return row ? treeToArray(department.value).find(r=> r.id == row)?.label : ''
}

const formatExamVal = (row) => {
  return row ? assessment.value.find(r=> r.id == row)?.label : ''
}

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

// 获取评分细则表格
const getXTable = (pe) =>{
  XTable.value =pe
}

onMounted(() => {
  getData()
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
      assessment.value = treeToArray(res.data).filter(r=> r.label == "王英水库枢纽工程管理站处" || r.label == "阳武干渠管理处");
    }
  })
})

const getData = () => {
  getMesTemp({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
    const {tableData} =  XTable.value.getTableData(); // 评分
    const examAddrName = assessment.value.find(r=> r.id == form.value.examAddrId)?.label || '';
    const name = treeToArray(department.value).find(r => r.id == form.value.templateUnitId)?.label || '';
    if (type == 'add') {
      addMesTemp({
        ...form.value,
        examAddrName: examAddrName,
        templateUnitName:name,
        templateDetail:tableData
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
      updateMesTemp(form.value.id, {
        ...form.value,
        examAddrName: examAddrName ,
        templateUnitName:name,
        templateDetail:tableData
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
    delMesTemp(row.id).then(res => {
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
  proxy.download("/business/standard/examTemplate/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`考评模版管理_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.pro-crud .el-form--inline .el-form-item){
  margin-right: 20px!important;
}
</style>