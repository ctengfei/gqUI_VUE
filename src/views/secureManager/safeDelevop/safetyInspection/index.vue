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
      <template #table-checkType="{ size, row, column, $index }">
        {{ formatterVal(row, 'safe_check_type', 'checkType') }}
      </template>
      <template #table-checkedDeptId="{ size, row, column, $index }">
        {{ formatVal(row.checkedDeptId) }}
      </template>
      <template #table-checkDeptId="{ size, row, column, $index }">
        {{ formatVal(row.checkDeptId) }}
      </template>
      <template #form-attach>
        <AlUpload v-model:fileList="fileList"/>
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
                      :disabled="true"
            />
          </template>
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
import dayjs from "dayjs";
import {deptTreeSelect, listUser} from "@/api/system/user";
import {getToken} from "@/utils/auth";
import {downloadFile, removeFile} from "@/api/tool/file";
import {addInsper, delInsper, updateInsper,getInsper } from "@/api/secureManager/safeDelevop/safetyInspection";
import {getProjectList} from "@/api/informationManager/projectManagement";
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
let department = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '检查日期',
    prop: 'checkDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'daterange',
      style: {width: '100%'},
      placeholder:'请选择检查日期',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':"YYYY-MM-DD"
    },
    search: true,
  },
  {
    label: '安全检查类型',
    prop: 'checkType',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('safe_check_type'),
      placeholder:'请选择安全检查类型',
    },
    search: true,
  },
  {
    label: '标题名称',
    prop: 'title',
    component: 'el-input',
    props:{
      placeholder:'请输入标题名称',
    },
    search: true,
  },

  {
    label: '被检查单位',
    prop: 'checkedDeptId',
  },
  {
    label: '检查单位',
    prop: 'checkDeptId',
  },
  {
    label: '所在工程名称',
    prop: 'projectName',
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
    label: '安全检查类型',
    prop: 'checkType',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('safe_check_type'),
      placeholder:'请选择安全检查类型',
    },
    md:12
  },
  {
    label: '检查日期',
    prop: 'checkDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择检查日期',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '被检查单位',
    prop: 'checkedDeptId',
    component: 'el-tree-select',
    props:{
      placeholder: '请选被检查单位',
      data:department.value,
      checkStrictly: true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '检查单位',
    prop: 'checkDeptId',
    component: 'el-tree-select',
    props:{
      placeholder: '请选检查单位',
      data:department.value,
      clearable:true,
      checkStrictly: true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '检查人员',
    prop: 'checkPerson',
    component: 'el-input',
    props:{
      placeholder:'请输入检查人员',
    },
    md:12
  },
  {
    label: '所在工程名称',
    prop: 'projectId',
    component: 'pro-select',
    props:{
      clearable:true,
      data:projectList.value,
      style:{width:'100%'},
      placeholder:'请输入所在工程名称',
    },
    md:12
  },
  {
    label:'主要检查内容',
    prop: 'checkContent',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入主要检查内容',
    },
    md: 24,
  },
  {
    label:'发现的主要问题',
    prop: 'mainProblems',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入发现的主要问题',
    },
    md: 24,
  },
  {
    label:'处理意见与建议',
    prop: 'handleOpinions',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入处理意见与建议',
    },
    md: 24,
  },
  {
    label:'问题整改情况',
    prop: 'rectificationProblems',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入处理意见与建议',
    },
    md: 24,
  },
  {
    label: '管理单位责任人',
    prop: 'personLiable',
    component: 'el-input',
    props:{
      placeholder:'请输入管理单位责任人',
    },
    md:12
  },
  {
    label: '技术负责人',
    prop: 'technicalPrincipal',
    component: 'el-input',
    props:{
      placeholder:'请输入技术负责人',
    },
    md:12
  },
  {
    label: '行政责任人',
    prop: 'responsiblePerson',
    component: 'el-input',
    props:{
      placeholder:'请输入行政责任人',
    },
    md:12
  },
  {
    label: '安全监督责任人',
    prop: 'safetySupervision',
    component: 'el-input',
    props:{
      placeholder:'请输入安全监督责任人',
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
    label: '安全检查类型',
    prop: 'checkType',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('safe_check_type'),
      placeholder:'请选择安全检查类型',
    },
    md:12
  },
  {
    label: '检查日期',
    prop: 'checkDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择检查日期',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '被检查单位',
    prop: 'checkedDeptId',
    component: 'el-tree-select',
    props:{
      disabled:true,
      placeholder: '请选被检查单位',
      data:department.value,
      clearable:true,
      checkStrictly: true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '检查单位',
    prop: 'checkDeptId',
    component: 'el-tree-select',
    props:{
      disabled:true,
      placeholder: '请选检查单位',
      data:department.value,
      clearable:true,
      checkStrictly: true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '检查人员',
    prop: 'checkPerson',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入检查人员',
    },
    md:12
  },
  {
    label: '所在工程名称',
    prop: 'projectId',
    component: 'pro-select',
    props:{
      disabled:true,
      data:projectList.value,
      style:{width:'100%'},
      placeholder:'请输入所在工程名称',
    },
    md:12
  },
  {
    label:'主要检查内容',
    prop: 'checkContent',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入主要检查内容',
    },
    md: 24,
  },
  {
    label:'发现的主要问题',
    prop: 'mainProblems',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入发现的主要问题',
    },
    md: 24,
  },
  {
    label:'处理意见与建议',
    prop: 'handleOpinions',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入处理意见与建议',
    },
    md: 24,
  },
  {
    label:'问题整改情况',
    prop: 'rectificationProblems',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入处理意见与建议',
    },
    md: 24,
  },
  {
    label: '管理单位责任人',
    prop: 'personLiable',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入管理单位责任人',
    },
    md:12
  },
  {
    label: '技术负责人',
    prop: 'technicalPrincipal',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入技术负责人',
    },
    md:12
  },
  {
    label: '行政责任人',
    prop: 'responsiblePerson',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入行政责任人',
    },
    md:12
  },
  {
    label: '安全监督责任人',
    prop: 'safetySupervision',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入安全监督责任人',
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
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.attach
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

const formatVal = (row) => {
  return row ? treeToArray(department.value).find(r=> r.id == row)?.label : ''
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
  getInsper({
    ...serachForm.value,
    startTime: serachForm.value.checkDate ? serachForm.value.checkDate[0] : '',
    endTime: serachForm.value.checkDate ? serachForm.value.checkDate[1] : '',
    checkDate:null,
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
    const project = projectList.value.find(r=> r.value == form.value.projectId) || {};
    if (type == 'add') {
      addInsper({
        ...form.value,
        attach:JSON.stringify(fileList.value),
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
      updateInsper(form.value.id,{
        ...form.value,
        projectName:project.label || '',
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
    delInsper(row.id).then(res => {
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
  proxy.download("/business/standard/safetyCheck/page/export", {
    ...serachForm.value,
    startTime: serachForm.value.checkDate ? serachForm.value.checkDate[0] : '',
    endTime: serachForm.value.checkDate ? serachForm.value.checkDate[1] : '',
    checkDate:null,
    pageNum:currentPage.value,pageSize:pageSize.value
  },`安全检查_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>