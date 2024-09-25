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
      <template #table-grade="{ size, row, column, $index }">
        {{ formatterVal(row, 'hazard_level', 'grade') }}
      </template>
      <template #table-filingStatus="{ size, row, column, $index }">
        {{ formatterVal(row, 'filing_status', 'filingStatus') }}
      </template>
      <template #table-controlStatus="{ size, row, column, $index }">
        {{ formatterVal(row, 'control_state', 'controlStatus') }}
      </template>
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
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
import {getProjectList} from "@/api/informationManager/projectManagement";
import {addHazard, delHazard, updateHazard,getHazard } from "@/api/secureManager/safeDelevop/hazardManagement";
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
const columns = defineFormColumns(computed(()=>[
  {
    label: '危险源名称',
    prop: 'sourceName',
    component: 'el-input',
    props:{
      placeholder:'请输入危险源名称',
    },
    search:true
  },
  {
    label: '危险源级别',
    prop: 'grade',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('hazard_level'),
      placeholder:'请选择危险源级别',
    },
    search:true
  },
  {
    label: '采集时间',
    prop: 'collectionTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type: 'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
      style: {width: '100%'}
    },
    search:true
  },
  {
    label: '备案状态',
    prop: 'filingStatus',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('filing_status'),
      placeholder:'请输入备案状态',
    },
    search:true
  },
  {
    label: '管控状态',
    prop: 'controlStatus',
  },
  {
    label: '管控责任人',
    prop: 'personLiable',
    component: 'el-input',
    props:{
      placeholder:'请输入管控责任人',
    },
    search:true
  },
  {
    label:'备注',
    prop: 'remark',
  },
]))
const formColumns = defineCrudColumns(computed(()=>[
  {
    label: '危险源名称',
    prop: 'sourceName',
    component: 'el-input',
    props:{
      placeholder:'请输入危险源名称',
    },
    rules:[{required: true, message: '请输入危险源名称'}],
    form: true,
    md:12
  },
  {
    label: '危险源级别',
    prop: 'grade',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('hazard_level'),
      placeholder:'请选择危险源级别',
    },
    rules:[{required: true, message: '请选择危险源级别'}],
    form: true,
    md:12
  },
  {
    label: '备案状态',
    prop: 'filingStatus',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('filing_status'),
      placeholder:'请选择备案状态',
    },
    rules:[{required: true, message: '请选择备案状态'}],
    form: true,
    md:12
  },
  {
    label: '管控状态',
    prop: 'controlStatus',
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:dictStore.getDict('control_state'),
      placeholder:'请选择管控状态',
    },
    rules:[{required: true, message: '请选择管控状态'}],
    form: true,
    md:12
  },
  {
    label: '所属单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择所属单位'}],
    props:{
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
    label: '采集时间',
    prop: 'collectionTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'datetime',
      style: {width: '100%'},
      placeholder:'请选择采集时间',
      'value-format':"YYYY-MM-DD HH:mm:ss"
    },
    rules:[{required: true, message: '请选择采集时间'}],
    md:12
  },
  {
    label: '是否已立牌公告',
    prop: 'isBillboardAnnoun',
    component: 'pro-select',
    props: {
      clearable:true,
      data:dictStore.getDict('sys_yes_no'),
      style:{width:'100%'},
      placeholder: '请选择是否已立牌公告',
    },
    rules:[{required: true, message: '请选择是否已立牌公告'}],
    md:12
  },
  {
    label: '管控责任人',
    prop: 'personLiable',
    component: 'el-input',
    props:{
      placeholder:'请输入管控责任人',
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
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入备注',
    },
    md: 24,
  },
  {
    label: '附件',
    prop: 'attach',
    md:24,
  },
]));
const detailColumns = defineCrudColumns(computed(()=>[
  {
    label: '危险源名称',
    prop: 'sourceName',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入危险源名称',
    },
    rules:[{required: true, message: '请输入危险源名称'}],
    form: true,
    md:12
  },
  {
    label: '危险源级别',
    prop: 'grade',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('hazard_level'),
      placeholder:'请选择危险源级别',
    },
    rules:[{required: true, message: '请选择危险源级别'}],
    form: true,
    md:12
  },
  {
    label: '备案状态',
    prop: 'filingStatus',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('filing_status'),
      placeholder:'请选择备案状态',
    },
    rules:[{required: true, message: '请选择备案状态'}],
    form: true,
    md:12
  },
  {
    label: '管控状态',
    prop: 'controlStatus',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('control_state'),
      placeholder:'请选择管控状态',
    },
    rules:[{required: true, message: '请选择管控状态'}],
    form: true,
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
      checkStrictly: true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择所属单位',
    },
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
    label: '采集时间',
    prop: 'collectionTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'datetime',
      style: {width: '100%'},
      placeholder:'请选择采集时间',
      'value-format':"YYYY-MM-DD HH:mm:ss"
    },
    rules:[{required: true, message: '请选择采集时间'}],
    md:12
  },
  {
    label: '是否已立牌公告',
    prop: 'isBillboardAnnoun',
    component: 'pro-select',
    props: {
      disabled:true,
      data:dictStore.getDict('sys_yes_no'),
      style:{width:'100%'},
      placeholder: '请选择是否已立牌公告',
    },
    rules:[{required: true, message: '请选择是否已立牌公告'}],
    md:12
  },
  {
    label: '管控责任人',
    prop: 'personLiable',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入管控责任人',
    },
    md:12
  },
  {
    label: '责任人电话',
    prop: 'personPhone',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入责任人电话',
    },
    md:12
  },
  {
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入备注',
    },
    md: 24,
  },
  {
    label: '附件',
    prop: 'attach',
    md:24,
  },
]));
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
  getHazard({
    ...serachForm.value,
    startTime: serachForm.value.collectionTime ? serachForm.value.collectionTime[0] : '',
    endTime: serachForm.value.collectionTime ? serachForm.value.collectionTime[1] : '',
    collectionTime:null,
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
      addHazard({
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
      updateHazard(form.value.id,{
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
    delHazard(row.id).then(res => {
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
  proxy.download("business/standard/dangerousSource/page/export", {
    ...serachForm.value,
    startTime: serachForm.value.collectionTime ? serachForm.value.collectionTime[0] : '',
    endTime: serachForm.value.collectionTime ? serachForm.value.collectionTime[1] : '',
    collectionTime:null,
    pageNum:currentPage.value,pageSize:pageSize.value
  },`危险管理源_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>