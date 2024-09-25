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
        width="55%"
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
      <template #table-status="{ size, row, column, $index }">
        {{ formatterVal(row, 'person_status', 'status') }}
      </template>
      <template #table-deptId="{ size, row, column, $index }">
        {{ formatVal(row.deptId) }}
      </template>
      <template #table-projectId="{ size, row, column, $index }">
        {{ formatValName(row.projectId) }}
      </template>
      <template #table-Date="{ size, row, column, $index }">
        {{ `${row.dutyStartDate} - ${row.dutyEndDate}` }}
      </template>
      <template #form-attach>
        <AlUpload v-model:fileList="fileList"/>
      </template>
      <template #form>
        <personTable :department="department" :form_type="form_type" :personsId="personsId" @getXTable="getXTable"  />
      </template>

      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        >
          <template #form-attach>
            <AlUpload v-model:fileList="fileList"
                      :disabled="true"/>
          </template>
          <personTable :department="department" :form_type="form_type" :personsId="personsId" @getXTable="getXTable"  />
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
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import personTable from './components/personTable';
import dayjs from "dayjs";
import {deptTreeSelect, listUser} from "@/api/system/user";
import {getToken} from "@/utils/auth";
import {downloadFile, removeFile} from "@/api/tool/file";
import {addInsper, delInsper, updateInsper,getInsper } from "@/api/secureManager/safeDelevop/safetyInspection";
import {getProjectList} from "@/api/informationManager/projectManagement";
import {addPerson, delPerson, getDutPerson, getPerson, updatePerson} from "@/api/secureManager/drought/personsFlood";
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed:'right',
  addText: '新增',
  detail:true,
  reset:false,
  width:'250',
  addProps: {
    type: 'primary',
    plain: true,
    icon:"Plus",
  },
  editProps:{
    link:true,
    type: 'primary',
    icon:'Edit'
  },
  detailProps:{
    link:true,
    type: 'primary',
    icon:'View'
  },
  delProps:{
    link:true,
    type: 'danger',
    icon:'Delete'
  },
  searchResetProps:{
    icon:"Refresh",
  },
  searchProps:{
    type: 'primary',
    icon:"Search",
  },
  delText:'删除',
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
const form = ref({attach:''});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let fileList = ref([]);
let projectList = ref([]);
let form_type = ref(''); // 编辑 新增 查看
let XTable = ref([]);
let department = ref([]);
let personsId = ref([]); // 根据Id查责任人列表
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
{
    label: '标题名称',
    prop: 'title',
  },
  {
    label: '工程名称',
    prop: 'projectId',
    component: 'pro-select',
    props:{
      clearable:true,
      data:projectList.value,
      style:{width:'100%'},
      placeholder:'请选择工程',
    },
    search: true,
  },
  {
    label: '建筑物名称',
    prop: 'buildingName',
    component: 'el-input',
    props:{
      placeholder:'请输入建筑物名称',
    },
    search: true,
  },
  {
    label: '管理单位',
    prop: 'deptId',
    component: 'el-tree-select',
    props:{
      placeholder: '请选择管理单位',
      data:department.value,
      clearable:true,
      checkStrictly: true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    search: true,
  },
  {
    label: '责任期限',
    prop: 'Date',
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    props:{
      clearable:true,
      placeholder:'请选择状态',
      data:dictStore.getDict('person_status'),
      style:{width:'100%'}
    },
    search: true,
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '标题名称',
    prop: 'title',
    component: 'el-input',
    props:{
      placeholder:'请输入标题名称',
    },
    rules: [{required: true, message: '请输入标题名称'}],
    md:12
  },
  {
    label: '所属建筑物',
    prop: 'buildingId',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:[],
      clearable:true,
      placeholder:'请选择所属建筑物',
    },
    md:12
  },
  {
    label: '管理单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择被管理单位'}],
    props:{
      placeholder: '请选择被管理单位',
      data:department.value,
      checkStrictly: true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '值班电话',
    prop: 'dutyPhone',
    component: 'el-input',
    props:{
      placeholder:'请输入值班电话',
    },
    md:12
  },
  {
    label: '责任期限开始时间',
    prop: 'dutyStartDate',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择责任期限开始时间'}],
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择责任期限开始时间',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '责任期限结束时间',
    prop: 'dutyEndDate',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择责任期限结束时间'}],
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择责任期限结束时间',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '所在工程',
    prop: 'projectId',
    component: 'pro-select',
    rules: [{required: true, message: '请选择所在工程'}],
    props:{
      clearable:true,
      data:projectList.value,
      style:{width:'100%'},
      placeholder:'请选择所在工程',
    },
    md:12
  },
  {
    label:'工程规模',
    prop: 'projectScale',
    component: 'pro-select',
    props:{
      clearable:true,
      data:dictStore.getDict('PROJ_SCAL'),
      style:{width:'100%'},
      placeholder:'请选择工程规模',
    },
    md:12
  },
  {
    label:'登记日期',
    prop: 'registerDate',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择登记日期'}],
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择登记日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    rules: [{required: true, message: '请选择状态'}],
    props:{
      clearable:true,
      placeholder:'请选择状态',
      data:dictStore.getDict('person_status'),
      style:{width:'100%'},
    },
    md:12
  },
  {
    label: '附件',
    prop: 'attach',
    md: 24,
  }
]))
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '标题名称',
    prop: 'title',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入标题名称',
    },
    rules: [{required: true, message: '请输入标题名称'}],
    md:12
  },
  {
    label: '所属建筑物',
    prop: 'buildingId',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data:[],
      disabled:true,
      placeholder:'请选择所属建筑物',
    },
    md:12
  },
  {
    label: '管理单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选被管理单位'}],
    props:{
      disabled:true,
      placeholder: '请选被管理单位',
      data:department.value,
      clearable:true,
      checkStrictly: true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '值班电话',
    prop: 'dutyPhone',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入值班电话',
    },
    md:12
  },
  {
    label: '责任期限开始时间',
    prop: 'dutyStartDate',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择责任期限开始时间'}],
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择责任期限开始时间',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '责任期限结束时间',
    prop: 'dutyEndDate',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择责任期限结束时间'}],
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择责任期限结束时间',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '所在工程名称',
    prop: 'projectId',
    component: 'pro-select',
    rules: [{required: true, message: '请输入所在工程名称'}],
    props:{
      disabled:true,
      data:projectList.value,
      style:{width:'100%'},
      placeholder:'请输入所在工程名称',
    },
    md:12
  },
  {
    label:'工程规模',
    prop: 'projectScale',
    component: 'pro-select',
    props:{
      disabled:true,
      data:dictStore.getDict('PROJ_SCAL'),
      style:{width:'100%'},
      placeholder:'请选择工程规模',
    },
    md:12
  },
  {
    label:'登记日期',
    prop: 'registerDate',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择登记日期'}],
    props:{
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择登记日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    rules: [{required: true, message: '请选择状态'}],
    props:{
      disabled:true,
      placeholder:'请选择状态',
      data:dictStore.getDict('person_status'),
      style:{width:'100%'},
    },
    md:12
  },
  {
    label: '附件',
    prop: 'attach',
    md: 24,
  }
]))
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  form_type.value = type;
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.attach
    personsId.value = row.id;
    form.value = {...row};
  } else {
    fileList.value = []
    form.value = {};
  }
  done();
});
const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

// 获取人员表格
const getXTable = (pe) =>{
  XTable.value =pe
}

const formatVal = (row) => {
  return row ? treeToArray(department.value).find(r=> r.id == row)?.label : ''
}

const formatValName = (row) => {
  return row ? projectList.value.find(r=> r.value == row)?.label : ''
}

onMounted(() => {
  getData()
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
  getProjectList().then(res=>{
    if(res.success){
      projectList.value = res.data.map(r=>({label:r.engName,value:r.id}));
    }
  })
})

const getData = () => {
  getPerson({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  }).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.total;
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
    const {tableData} =  XTable.value.getTableData(); // 人员全量数据
    const project = projectList.value.find(r=> r.value == form.value.projectId) || {};
    if (type == 'add') {
      addPerson({
        ...form.value,
        attach:JSON.stringify(fileList.value),
        personDetailList:tableData,
        projectName:project.label || ''
      }).then(res=>{
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
      updatePerson(form.value.id,{
        ...form.value,
        projectName:project.label || '',
        personDetailList:tableData,
        attach: JSON.stringify(fileList.value)
      }).then(res=>{
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
    delPerson(row.id).then(res => {
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
  proxy.download("/business/standard/dutyPerson/page/export", {
    ...serachForm.value,
    pageNum:currentPage.value,pageSize:pageSize.value
  },`防汛责任人_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.el-dialog__body){
  height: 690px;
  overflow-y: auto;
  padding-bottom: 0;
}
:deep(.pro-form:not(.el-form--inline) .pro-form-menu){
  position: sticky;
  bottom: 0;
  height: 55px;
  display: flex;
  background: #fff;
  border-top: 1px solid #dcdfe6;
  background: #fff!important;
  z-index: 10;
  .el-form-item__content{
    justify-content: end;
    margin-right: 40px;
  }
}
</style>