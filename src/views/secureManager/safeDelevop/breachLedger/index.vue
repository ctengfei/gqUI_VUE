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
      <template #table-deptId="{ size, row, column, $index }">
        {{ formatVal(row.deptId) }}
      </template>
      <template #table-type="{ size, row, column, $index }">
        {{ formatterVal(row, 'dangers_type', 'type') }}
      </template>
      <template #table-status="{ size, row, column, $index }">
        {{ formatterVal(row, 'dangers_status', 'status') }}
      </template>
      <template #table-dangerLevel="{ size, row, column, $index }">
        {{ formatterVal(row, 'dangers_level', 'dangerLevel') }}
      </template>
      <template #form-attach>
        <AlUpload v-model:fileList="fileList"
        />
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
import {addBreach, delBreach, getBreach, updateBreach} from "@/api/secureManager/safeDelevop/breachLedger";
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
let department = ref([]);
let fileList = ref([]);
let projectList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '隐患名称',
    prop: 'dangerName',
    component: 'el-input',
    props:{
      placeholder:'请输入隐患名称',
    },
    search: true,
  },
  {
    label: '隐患级别',
    prop: 'dangerLevel',
  },
  {
    label: '隐患类型',
    prop: 'type',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      clearable:true,
      data:dictStore.getDict('dangers_type'),
      placeholder:'请输入选择类型',
    },
    search: true,
  },
  {
    label: '隐患状态',
    prop: 'status',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('dangers_status'),
      placeholder:'请输入隐患状态',
    },
    search: true,
  },
  {
    label: '所属单位',
    prop: 'deptId',
    component: 'el-tree-select',
    props:{
      data:department.value,
      clearable:true,
      checkStrictly: true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择所属单位',
    },
    search: true,
  },
  {
    label: '整改责任人',
    prop: 'person',
    component: 'el-input',
    props:{
      placeholder:'请输入整改责任人',
    },
  },
  {
    label: '采集时间',
    prop: 'collectionTime',
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '隐患名称',
    prop: 'dangerName',
    component: 'el-input',
    props:{
      placeholder:'请输入隐患名称',
    },
    md:12,
    rules: [{required: true, message: '请输入隐患名称'}],
  },
  {
    label: '隐患类型',
    prop: 'type',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('dangers_type'),
      placeholder:'请输入隐患类型',
    },
    md:12
  },
  {
    label: '隐患级别',
    prop: 'dangerLevel',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('dangers_level'),
      placeholder:'请输入隐患级别',
    },
    md:12
  },
  {
    label: '隐患状态',
    prop: 'status',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('dangers_status'),
      placeholder:'请输入隐患状态',
    },
    md:12
  },
  {
    label: '所属单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择所属单位'}],
    props:{
      data:department.value,
      checkStrictly: true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择所属单位',
    },
    md:12
  },
  {
    label: '采集时间',
    prop: 'collectionTime',
    component: 'el-date-picker',
    props:{
      type: 'datetime',
      placeholder:'请选择采集时间',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
      style: {width: '100%'},
      clearable:true,
    },
    rules: [{required: true, message: '请选择采集时间'}],
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
    label: '隐患描述',
    prop: 'dangerDesc',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入隐患描述',
    },
    md: 24,
    rules: [{required: true, message: '请输入隐患描述'}],
  },
  {
    label: '整改责任人',
    prop: 'person',
    component: 'el-input',
    props:{
      placeholder:'请输入整改责任人',
    },
    md:12
  },
  {
    label: '责任人电话',
    prop: 'personPhone',
    component: 'el-input',
    rules: [{pattern:/^1[3-9]\d{9}$/,message:'请输入正确电话',trigger:'change'}],
    props:{
      placeholder:'请输入责任人电话',
    },
    md:12
  },
  {
    label: '整改到期时间',
    prop: 'expirationDate',
    component: 'el-date-picker',
    props:{
      type: 'datetime',
      placeholder:'请选择整改到期时间',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
      style: {width: '100%'},
      clearable:true,
    },
    md:12
  },
  {
    label: '排查时间',
    prop: 'pcTime',
    component: 'el-date-picker',
    props:{
      type: 'datetime',
      placeholder:'请选择排查时间',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
      style: {width: '100%'},
      clearable:true,
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
    label: '隐患名称',
    prop: 'dangerName',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入隐患名称',
    },
    md:12,
    rules: [{required: true, message: '请输入隐患名称'}],
  },
  {
    label: '隐患类型',
    prop: 'type',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('dangers_type'),
      placeholder:'请输入隐患类型',
    },
    md:12
  },
  {
    label: '隐患级别',
    prop: 'dangerLevel',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('dangers_level'),
      placeholder:'请输入隐患级别',
    },
    md:12
  },
  {
    label: '隐患状态',
    prop: 'status',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('dangers_status'),
      placeholder:'请输入隐患状态',
    },
    md:12
  },
  {
    label: '所属单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择所属单位'}],
    props:{
      disabled:true,
      data:department.value,
      clearable:true,
      checkStrictly: true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择所属单位',
    },
    md:12
  },
  {
    label: '采集时间',
    prop: 'collectionTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type: 'datetime',
      placeholder:'请选择采集时间',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
      style: {width: '100%'}
    },
    rules: [{required: true, message: '请选择采集时间'}],
    md:12
  },
  {
    label: '所属工程',
    prop: 'projectId',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:projectList.value,
      placeholder:'请选择所属工程',
    },
    md:12
  },
  {
    label: '隐患描述',
    prop: 'dangerDesc',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入隐患描述',
    },
    md: 24,
    rules: [{required: true, message: '请输入隐患描述'}],
  },
  {
    label: '整改责任人',
    prop: 'person',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入整改责任人',
    },
    md:12
  },
  {
    label: '责任人电话',
    prop: 'personPhone',
    component: 'el-input',
    rules: [{pattern:/^1[3-9]\d{9}$/,message:'请输入正确电话',trigger:'change'}],
    props:{
      disabled:true,
      placeholder:'请输入责任人电话',
    },
    md:12
  },
  {
    label: '整改到期时间',
    prop: 'expirationDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type: 'datetime',
      placeholder:'请选择整改到期时间',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
      style: {width: '100%'}
    },
    md:12
  },
  {
    label: '排查时间',
    prop: 'pcTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type: 'datetime',
      placeholder:'请选择排查时间',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
      style: {width: '100%'}
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

const handleStart = (file) => {
  const ext = file.name.split('.')[1]
  if((ext == 'pdf')){
    window.open(`${import.meta.env.VITE_FILE_URL}${file.url}`)
  } else if(ext == 'png' || ext == 'jpg' || ext == 'jpeg'){
    proxy.$v3ImgPreviewFn(`${import.meta.env.VITE_FILE_URL}${file.url}`);
  } else{
    downloadFile(file.id).then(res=>{
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', file.name)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }
}

const handleUploadRemove = (rawFile) =>{
  const id = rawFile.id || rawFile.response.data.id;
  fileList.value = fileList.value.filter(r=>r.id!=id);
  removeFile(rawFile.id || rawFile.response.data.id)
}

const handleUploadSuccess = (res) =>{
  if (res.success) {
    const img = res.data;
    fileList.value = fileList.value.concat([
      {
        url:img.storagePath,
        id: img.id,
        name: img.name
      }
    ]);
  }
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
  getBreach({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      addBreach({
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
      updateBreach(form.value.id,{
        ...form.value,
        attach: fileList.value.length ? JSON.stringify(fileList.value) : null,
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
    delBreach(row.id).then(res => {
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
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`安全检查_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>