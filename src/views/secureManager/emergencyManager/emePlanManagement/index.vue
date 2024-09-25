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
      </template>
      <template #table-docType="{ size, row, column, $index }">
        {{ formatterVal(row, 'document_type', 'docType') }}
      </template>
      <template #table-preparedBy="{ size, row, column, $index }">
        {{ formatVal(row.preparedBy) }}
      </template>
      <template #table-approvedBy="{ size, row, column, $index }">
        {{ formatVal(row.approvedBy) }}
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
import {getProjectList} from "@/api/informationManager/projectManagement";
import {addEme, delEme, getEme, updateEme} from "@/api/secureManager/emergencyManager/emePlanManagement";
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
const form = ref({});
const serachForm = ref({});
const crudRef = ref();
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let fileList = ref([]);
let department = ref([]);
let projectList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '编制日期',
    prop: 'compileDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      style:{width:'100%'},
      placeholder:'请选择编制日期',
      type:'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
    },
    search:true,
  },
  {
    label: '文档编号',
    prop: 'docNum',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      placeholder:'请输入文档编号',
    },
    search:true,
  },
  {
    label: '文档名称',
    prop: 'docName',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      placeholder:'请输入文档名称',
    },
    search:true,
  },
  {
    label: '文档类型',
    prop: 'docType',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('document_type'),
      placeholder:'请选择文档类型',
    },
    search:true,
  },
  {
    label: '工程名称',
    prop: 'projectName',
  },
  {
    label: '编制单位',
    prop: 'preparedBy',
    component: 'el-tree-select',
    props:{
      placeholder: '请选择编制单位',
      checkStrictly: true,
      clearable:true,
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    search:true,
  },
  {
    label: '批复单位',
    prop: 'approvedBy',
  },
  {
    label: '批复日期',
    prop: 'approvedDate',
  },
  {
    label:'备注',
    prop: 'remark',
  }
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '文档编号',
    prop: 'docNum',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      disabled:true,
      placeholder:'自动生成',
    },
    md:12
  },
  {
    label: '文档名称',
    prop: 'docName',
    component: 'el-input',
    rules:[{required: true, message: '请输入文档名称'}],
    props:{
      style:{width:'100%'},
      placeholder:'请输入文档名称',
    },
    md:12
  },
  {
    label: '文档类型',
    prop: 'docType',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('document_type'),
      placeholder:'请选择文档类型',
    },
    rules:[{required: true, message: '请选择文档类型'}],
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
    rules:[{required: true, message: '请选择所属工程'}],
    md:12
  },
  {
    label: '批复单位',
    prop: 'approvedBy',
    component: 'el-tree-select',
    rules:[{required: true, message: '请选择批复单位'}],
    props:{
      placeholder: '请选择批复单位',
      checkStrictly: true,
      data:department.value,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '批复日期',
    prop: 'approvedDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'datet',
      style: {width: '100%'},
      placeholder:'请选择事批复日期',
      'value-format':"YYYY-MM-DD"
    },
    rules:[{required: true, message: '请选择事批复日期'}],
    md:12
  },
  {
    label: '编制日期',
    prop: 'compileDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      style:{width:'100%'},
      placeholder:'请选择编制日期',
      type:'datet',
      'value-format':"YYYY-MM-DD"
    },
    rules:[{required: true, message: '请选择编制日期'}],
    md:12
  },
  {
    label: '编制单位',
    prop: 'preparedBy',
    component: 'el-tree-select',
    rules:[{required: true, message: '请选择编制单位'}],
    props:{
      placeholder: '请选择编制单位',
      checkStrictly: true,
      clearable:true,
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
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
    label: '文档编号',
    prop: 'docNum',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      disabled:true,
      placeholder:'自动生成',
    },
    md:12
  },
  {
    label: '文档名称',
    prop: 'docName',
    component: 'el-input',
    rules:[{required: true, message: '请输入文档名称'}],
    props:{
      disabled:true,
      style:{width:'100%'},
      placeholder:'请输入文档名称',
    },
    md:12
  },
  {
    label: '文档类型',
    prop: 'docType',
    component: 'pro-select',
    props:{
      clearable:true,
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('document_type'),
      placeholder:'请选择文档类型',
    },
    rules:[{required: true, message: '请选择文档类型'}],
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
    rules:[{required: true, message: '请选择所属工程'}],
    md:12
  },
  {
    label: '批复单位',
    prop: 'approvedBy',
    component: 'el-tree-select',
    rules:[{required: true, message: '请选择批复单位'}],
    props:{
      disabled:true,
      placeholder: '请选择批复单位',
      checkStrictly: true,
      clearable:true,
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '批复日期',
    prop: 'approvedDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'datet',
      style: {width: '100%'},
      placeholder:'请选择事批复日期',
      'value-format':"YYYY-MM-DD"
    },
    rules:[{required: true, message: '请选择事批复日期'}],
    md:12
  },
  {
    label: '编制日期',
    prop: 'compileDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      style:{width:'100%'},
      placeholder:'请选择编制日期',
      type:'datet',
      'value-format':"YYYY-MM-DD"
    },
    rules:[{required: true, message: '请选择编制日期'}],
    md:12
  },
  {
    label: '编制单位',
    prop: 'preparedBy',
    component: 'el-tree-select',
    rules:[{required: true, message: '请选择编制单位'}],
    props:{
      disabled:true,
      placeholder: '请选择编制单位',
      checkStrictly: true,
      clearable:true,
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
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
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value =  row.attach
    form.value = {...row};
  } else {
    fileList.value = [];
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
  });
  getProjectList().then(res=>{
    if(res.success){
      projectList.value = res.data.map(r=>({label:r.engName,value:r.id}));
    }
  })
})

const getData = () => {
  getEme({
    ...serachForm.value,
    startTime: serachForm.value.compileDate ? serachForm.value.compileDate[0] : '',
    endTime: serachForm.value.compileDate ? serachForm.value.compileDate[1] : '',
    compileDate:null,
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
      addEme({
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
      updateEme(form.value.id,{
        ...form.value,
        attach: JSON.stringify(fileList.value),
        projectName:project.label || ''
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
    delEme(row.id).then(res => {
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

</script>

<style scoped lang="scss">

</style>