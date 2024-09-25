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
        class="custom-curd"
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
      <template #table-daterange="{row}">
        <span>{{ `${row.expiryStartDate}-${row.expiryEndDate}` }}</span>
      </template>
      <template #table-deptId="{row}">
        <span>{{ formatVal(row.deptId) }}</span>
      </template>
      <template #table-projectId="{ size, row, column, $index }">
        {{ formatValName(row.projectId) }}
      </template>
      <template #form-attach>
        <AlUpload v-model:fileList="fileList"/>
      </template>
      <template #form>
        <labourTable :department="department" :form_type="form_type" :personsId="personsId" @getXTable="getXTable" />
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
          <labourTable :department="department" :form_type="form_type" :personsId="personsId" @getXTable="getXTable" />
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
import labourTable from './components/labourTable'
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {deptTreeSelect} from "@/api/system/user";
import {getToken} from "@/utils/auth";
import {downloadFile, removeFile} from "@/api/tool/file";
import {getProjectList} from "@/api/informationManager/projectManagement";
import {getEmeList,} from "@/api/secureManager/emergencyManager/emePlanManagement";
import {addTeam, delTeam, getTeam, updateTeam} from "@/api/secureManager/drought/emergencyManagement";
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
const form = ref({name14:'',name15:''});
const serachForm = ref({});
const crudRef = ref();
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let emeList = ref([]);
let projectList = ref([]);
let fileList = ref([]);
let XTable = ref([]);
let department = ref([]);
let form_type=ref('');
let personsId = ref([]); // 根据Id查人员列表
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label:'应急预案名称',
    prop:'planName'
  },
  {
    label: '所属工程',
    prop: 'projectId',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:projectList.value,
      placeholder:'请选择所属工程',
    },
    search:true,
  },
  {
    label:'队伍名称',
    prop:'teamName',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      data:projectList.value,
      placeholder:'请输入队伍名称',
    },
    search:true,
  },
  {
    label:'登记日期',
    prop:'registerDate'
  },
  {
    label: '填报单位',
    prop: 'deptId',
    component: 'el-tree-select',
    props:{
      placeholder: '请选择填报单位',
      checkStrictly: true,
      clearable:true,
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    search:true,
  },
  {
    label: '有效期限',
    prop: 'daterange',
    component: 'el-date-picker',
    props:{
      clearable:true,
      style:{width:'100%'},
      placeholder:'请选择有效期限',
      type:'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
    },
    search:true,
  },
  {
    label: '备注',
    prop: 'remark',
  }
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '队伍名称',
    prop: 'teamName',
    component: 'el-input',
    rules:[{required: true, message: '请输入队伍名称'}],
    props:{
      placeholder:'请输入队伍名称',
    },
    md:12
  },
  {
    label: '所属工程',
    prop: 'projectId',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:projectList.value,
      placeholder:'请选择所属工程',
    },
    md:12
  },
  {
    label: '填报单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules:[{required: true, message: '请选择填报单位'}],
    props:{
      placeholder: '请选择填报单位',
      checkStrictly: true,
      clearable:true,
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '登记日期',
    prop: 'registerDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择事登记日期',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '有效期限',
    prop: 'daterange',
    component: 'el-date-picker',
    props:{
      clearable:true,
      style:{width:'100%'},
      placeholder:'请选择有效期限',
      type:'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '应急预案名称',
    prop: 'planId',
    component: 'pro-select',
    props:{
      clearable:true,
      data:emeList.value,
      style:{width:'100%'},
      placeholder:'请输入应急预案名称',
    },
    md:12
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      placeholder:'请输入备注',
      autosize:{minRows:2},
      type:'textarea',
    },
    md:24
  },
  {
    label: '附件上传',
    prop: 'attach',
    md:24
  }
]))
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '队伍名称',
    prop: 'teamName',
    component: 'el-input',
    rules:[{required: true, message: '请输入队伍名称'}],
    props:{
      disabled:true,
      placeholder:'请输入队伍名称',
    },
    md:12
  },
  {
    label: '所属工程',
    prop: 'projectId',
    component: 'pro-select',
    props:{
      clearable:true,
      disabled:true,
      style:{width:'100%'},
      data:projectList.value,
      placeholder:'请选择所属工程',
    },
    md:12
  },
  {
    label: '填报单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules:[{required: true, message: '请选择填报单位'}],
    props:{
      disabled:true,
      placeholder: '请选择填报单位',
      checkStrictly: true,
      clearable:true,
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '登记日期',
    prop: 'registerDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择事登记日期',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '有效期限',
    prop: 'daterange',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      style:{width:'100%'},
      placeholder:'请选择有效期限',
      type:'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '应急预案名称',
    prop: 'planId',
    component: 'pro-select',
    props:{
      clearable:true,
      disabled:true,
      data:emeList.value,
      style:{width:'100%'},
      placeholder:'请输入应急预案名称',
    },
    md:12
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入备注',
      autosize:{minRows:2},
      type:'textarea',
    },
    md:24
  },
  {
    label: '附件上传',
    prop: 'attach',
    md:24
  }
]))
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  form_type.value = type;
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.attach
    personsId.value = row.id;
    form.value = {...row,daterange:[row.expiryStartDate,row.expiryEndDate] };
  } else {
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
  // 获取部门列表
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
  // 获取工程列表
  getProjectList().then(res=>{
    if(res.success){
      projectList.value = res.data.map(r=>({label:r.engName,value:r.id}));
    }
  })
  // 获取应预案列表
  getEmeList().then(res=>{
    if(res.success){
      emeList.value = res.data.map(r=>({label:r.docName,value:r.id}));
    }
  })
})

const getData = () => {
  getTeam({
    ...serachForm.value,
    startTime:serachForm.value.daterange ? serachForm.value.daterange[0] : '',
    endTime:serachForm.value.daterange ? serachForm.value.daterange[1] : '',
    daterange:null,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
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
    const planName = emeList.value.find(r=> r.value == form.value.planId) || {};
    if (type == 'add') {
      addTeam({
        ...form.value,
        attach:JSON.stringify(fileList.value),
        teamDetailList:tableData,
        expiryStartDate:form.value.daterange ? form.value.daterange[0] : '',
        expiryEndDate:form.value.daterange ? form.value.daterange[1] : '',
        projectName:project.label || '',
        daterange:null,
        planName:planName.label || ''
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
      updateTeam(form.value.id,{
        ...form.value,
        attach: JSON.stringify(fileList.value),
        teamDetailList:tableData,
        expiryStartDate:form.value.daterange ? form.value.daterange[0] : '',
        expiryEndDate:form.value.daterange ? form.value.daterange[1] : '',
        projectName:project.label || '',
        daterange:null,
        planName:planName.label || ''
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
    delTeam(row.id).then(res => {
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
  proxy.download("/business/standard/rescueTeam/page/export", {
    ...serachForm.value,
    startTime:serachForm.value.daterange ? serachForm.value.daterange[0] : '',
    endTime:serachForm.value.daterange ? serachForm.value.daterange[1] : '',
    daterange:null,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  },`抢险队伍管理_${dayjs().format('YYYY-MM-DD')}.xlsx`);
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