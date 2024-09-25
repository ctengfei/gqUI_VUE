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
      <template #table-businessType="{ size, row, column, $index }">
        {{ formatterVal(row, 'business_type', 'businessType') }}
      </template>
      <template #form-filePath>
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
          <template #form-filePath>
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
import { formatterVal,loopTree,treeToArray } from '@/utils';
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {deptTreeSelect} from "@/api/system/user";
import {deleteRegulations, getRegulationsList, postRegulations, updateRegulations} from '@/api/org/regulations'
import {downloadFile, removeFile} from "@/api/tool/file";
import {getToken} from "@/utils/auth";
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del:true,
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
const form = ref({filePath:''});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const ethnic = ref([{"id":"01","name":"汉族"},{"id":"02","name":"蒙古族"},{"id":"03","name":"回族"},
  {"id":"04","name":"藏族"},{"id":"05","name":"维吾尔族"},{"id":"06","name":"苗族"},
  {"id":"07","name":"彝族"},{"id":"08","name":"壮族"},{"id":"09","name":"布依族"},
  {"id":"10","name":"朝鲜族"},{"id":"11","name":"满族"},{"id":"12","name":"侗族"},
  {"id":"13","name":"瑶族"},{"id":"14","name":"白族"},{"id":"15","name":"土家族"},
  {"id":"16","name":"哈尼族"},{"id":"17","name":"哈萨克族"},{"id":"18","name":"傣族"},
  {"id":"19","name":"黎族"},{"id":"20","name":"傈僳族"},{"id":"21","name":"佤族"},
  {"id":"22","name":"畲族"},{"id":"23","name":"高山族"},{"id":"24","name":"拉祜族"},
  {"id":"25","name":"水族"},{"id":"26","name":"东乡族"},{"id":"27","name":"纳西族"},
  {"id":"28","name":"景颇族"},{"id":"29","name":"柯尔克孜族"},{"id":"30","name":"土族"},
  {"id":"31","name":"达斡尔族"},{"id":"32","name":"仫佬族"},{"id":"33","name":"羌族"},
  {"id":"34","name":"布朗族"},{"id":"35","name":"撒拉族"},{"id":"36","name":"毛难族"},
  {"id":"37","name":"仡佬族"},{"id":"38","name":"锡伯族"},{"id":"39","name":"阿昌族"},
  {"id":"40","name":"普米族"},{"id":"41","name":"塔吉克族"},{"id":"42","name":"怒族"},
  {"id":"43","name":"乌孜别克族"},{"id":"44","name":"俄罗斯族"},{"id":"45","name":"鄂温克族"},
  {"id":"46","name":"德昂族"},{"id":"47","name":"保安族"},{"id":"48","name":"裕固族"},
  {"id":"49","name":"京族"},{"id":"50","name":"塔塔尔族"},{"id":"51","name":"独龙族"},
  {"id":"52","name":"鄂伦春族"},{"id":"53","name":"赫哲族"},{"id":"54","name":"门巴族"},
]);
let fileList = ref([]);
let department = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '文件名称',
    prop: 'docName',
    component: 'el-input',
    props:{
      placeholder:'请输入文件名称',
    },
    search: true,
  },
  {
    label: '业务分类',
    prop: 'businessType',
    component: 'pro-select',
    props: {
      clearable:true,
      placeholder: '请选择业务分类',
      data:dictStore.getDict('business_type'),
      style: {width: '100%'},
    },
    search: true,
  },
  {
    label: '发布日期',
    prop: 'issueDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'daterange',
      style: {width: '100%'},
      placeholder:'请选择发布日期',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
    },
    search: true,
  },
  {
    label: '发布单位',
    prop: 'publishUnit',
  },
  {
    label: '填报单位',
    prop: 'deptName',
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '文件名称',
    prop: 'docName',
    component: 'el-input',
    rules: [{required: true, message: '请输入文件名称'}],
    props:{
      placeholder:'请输入文件名称',
    },
    md:12
  },
  {
    label: '文件类型',
    prop: 'docType',
    component: 'pro-select',
    rules: [{required: true, message: '请选择文件类型'}],
    props: {
      clearable:true,
      placeholder: '请选择文件类型',
      data:dictStore.getDict('doc_type'),
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '业务分类',
    prop: 'businessType',
    component: 'pro-select',
    rules: [{required: true, message: '请选择业务分类'}],
    props:{
      clearable:true,
      data:dictStore.getDict('business_type'),
      style: {width: '100%'},
      placeholder:'请选择业务分类',
    },
    md:12
  },
  {
    label: '填报单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择填报单位'}],
    props:{
      data:department.value,
      'default-expand-all':true,
      clearable:true,
      style: {width: '100%'},
      checkStrictly: true,
      placeholder:'请选择填报单位',
    },
    md:12
  },
  {
    label: '发布日期',
    prop: 'issueDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择发布日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {

    label: '发布单位',
    prop: 'publishUnit',
    component: 'el-input',
    props:{
      placeholder:'请输入发布单位',
    },
    md:12
  },
  {
    label: '附件',
    prop: 'filePath',
  }
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '文件名称',
    prop: 'docName',
    component: 'el-input',
    rules: [{required: true, message: '请输入文件名称'}],
    props:{
      disabled:true,
      placeholder:'请输入文件名称',
    },
    md:12
  },
  {
    label: '文件类型',
    prop: 'docType',
    component: 'pro-select',
    rules: [{required: true, message: '请选择文件类型'}],
    props: {
      clearable:true,
      disabled:true,
      placeholder: '请选择文件类型',
      data:dictStore.getDict('doc_type'),
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '业务分类',
    prop: 'businessType',
    component: 'pro-select',
    rules: [{required: true, message: '请选择业务分类'}],
    props:{
      clearable:true,
      disabled:true,
      data:dictStore.getDict('business_type'),
      style: {width: '100%'},
      placeholder:'请选择业务分类',
    },
    md:12
  },
  {
    label: '填报单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择填报单位'}],
    props:{
      disabled:true,
      data:department.value,
      'default-expand-all':true,
      checkStrictly: true,
      style: {width: '100%'},
      placeholder:'请选择填报单位',
    },
    md:12
  },
  {
    label: '发布日期',
    prop: 'issueDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择发布日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {

    label: '发布单位',
    prop: 'publishUnit',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入发布单位',
    },
    md:12
  },
  {
    label: '附件',
    prop: 'filePath',
  }
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.filePath
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

const handleUploadRemove = (rawFile) =>{
  const id = rawFile.id || rawFile.response.data.id;
  fileList.value = fileList.value.filter(r=>r.id!=id);
  removeFile(rawFile.id || rawFile.response.data.id)
}

onMounted(() => {
  getData()
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
})

const getData = () => {
  getRegulationsList({
    ...serachForm.value,
    startTime: serachForm.value.issueDate ? serachForm.value.issueDate[0] : '',
    endTime: serachForm.value.issueDate ? serachForm.value.issueDate[1] : '',
    issueDate: null,
    pageNum: currentPage.value,
    category:'1',
    pageSize: pageSize.value}).then(res => {
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
    if (type == 'add') {
      const name = treeToArray(department.value).find(r=>r.id == form.value.deptId);
      postRegulations({
        ...form.value,
        filePath:JSON.stringify(fileList.value),
        deptName:name.label,
        category:'1'
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
      updateRegulations(form.value.id,{
        ...form.value,
        filePath: JSON.stringify(fileList.value),
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
    deleteRegulations(row.id).then(res => {
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
  proxy.download("/business/standard/gzzdInfo/page/export", {
    ...serachForm.value,
    startTime: serachForm.value.issueDate ? serachForm.value.issueDate[0] : '',
    endTime: serachForm.value.issueDate ? serachForm.value.issueDate[1] : '',
    issueDate: null,
    category:'1',
    pageNum:currentPage.value,pageSize:pageSize.value
  },`精神文明_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

</script>

<style scoped lang="scss">

</style>