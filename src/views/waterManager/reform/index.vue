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
      </template>
      <template #table-publishUnit="{ size, row, column, $index }">
        {{ formatVal(row.publishUnit) }}
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
import {addReform, delReform, getReform, updateReform} from "@/api/waterManager/reform";
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del:true,
  detail:true,
  fixed:'right',
  addText: '新增',
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
    label: '标题',
    prop: 'title',
    component: 'el-input',
    props:{
      placeholder:'请输入标题',
    },
    search: true,
  },
  {
    label: '提交单位',
    prop: 'deptName',
  },
  {
    label: '发布日期',
    prop: 'issueDate',
  },
  {
    label: '发布单位',
    prop: 'publishUnit',
  },
  {
    label: '备注',
    prop: 'remark',
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
    label: '标题',
    prop: 'title',
    component: 'el-input',
    rules: [{required: true, message: '请输入标题'}],
    props:{
      placeholder:'请输入标题',
    },
    md:12
  },
  {
    label: '提交单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择提交单位'}],
    props:{
      data:department.value,
      checkStrictly: true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择提交单位',
    },
    md:12
  },
  {
    label: '发布日期',
    prop: 'issueDate',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择发布日期'}],
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
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择发布单位'}],
    props:{
      data:department.value,
      checkStrictly: true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择发布单位',
    },
    md:12
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      placeholder:'请输入备注',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md:24
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
      placeholder:'请输入文件名称',
    },
    md:12
  },
  {
    label: '标题',
    prop: 'title',
    component: 'el-input',
    rules: [{required: true, message: '请输入标题'}],
    props:{
      placeholder:'请输入标题',
    },
    md:12
  },
  {
    label: '提交单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择提交单位'}],
    props:{
      data:department.value,
      checkStrictly: true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择提交单位',
    },
    md:12
  },
  {
    label: '发布日期',
    prop: 'issueDate',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择发布日期'}],
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
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择发布单位'}],
    props:{
      data:department.value,
      checkStrictly: true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择发布单位',
    },
    md:12
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      placeholder:'请输入备注',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md:24
  },
  {
    label: '附件',
    prop: 'filePath',
  }
].map(r=>({...r,props:{...r.props,disabled:true}}))));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.filePath
    form.value = {...row};
  } else {
    fileList.value =[]
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

const formatVal = (row) =>{
  return row ? treeToArray(department.value).find(r=> r.id == row)?.label : ''
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
  getReform({
    ...serachForm.value,
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
    const name = treeToArray(department.value).find(r=>r.id == form.value.deptId)?.label;
    if (type == 'add') {
      addReform({
        ...form.value,
        filePath:JSON.stringify(fileList.value),
        deptName:name
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
      updateReform(form.value.id,{
        ...form.value,
        deptName:name,
        filePath: JSON.stringify(fileList.value)
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
    delReform(row.id).then(res => {
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
    pageNum:currentPage.value,pageSize:pageSize.value
  },`规章制度_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>