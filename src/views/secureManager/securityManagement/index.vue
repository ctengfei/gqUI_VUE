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
        :page-sizes="[10,20,30,40,50]"
        :total="total"
        @load="load"
        column="2"
        draggable
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
      <template #table-checkType="{ size, row, column, $index }">
        {{ formatterVal(row, 'safe_check_type', 'checkType') }}
      </template>
      <template #table-deptId="{ size, row, column, $index }">
        {{ formatVal(row.deptId) }}
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
                      :disabled="true"/>
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
  defineDescriptionsColumns,
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
import {addInves, delInves, getInves, updateInves} from "@/api/secureManager/safeDelevop/dangerInves";
import {deleteSecurity, getDangerList, getSecurity, postSecurity, updateSecurity} from "@/api/secureManager/securityManagement";
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
let department = ref([]);
let dangerList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '标识牌编码',
    prop: 'signsNum',
    component: 'el-input',
    props: {
      placeholder: '请输入标识牌编码',
    },
    search: true,
  },
  {
    label: '标识牌名称',
    prop: 'signsName',
    component: 'el-input',
    props: {
      placeholder: '请输入标识牌名称',
    },
    search: true,
  },
  {
    label: '管理部门',
    prop: 'deptId',
    component: 'el-tree-select',
    props:{
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
      clearable:true,
      checkStrictly: true,
      placeholder:'请选择管理部门',
    },
    search: true,
  },
  {
    label: '安装日期',
    prop: 'installDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'daterange',
      'start-placeholder':"开始时间",
      'end-placeholder':'结束时间',
      'value-format':'YYYY-MM-DD',
    },
    search: true,
  },
  {
    label: '危险源',
    prop: 'sourceName',
  },
  {
    label: '负责人',
    prop: 'chargePerson',
  },
  {
    label: '安装位置',
    prop: 'location',
  },
  {
    label: '备注',
    prop: 'remark',
  }
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '标识牌编码',
    prop: 'signsNum',
    component: 'el-input',
    props: {
      placeholder: '请输入标识牌编码',
    },
    md:12,
    rules: [{required: true, message: '请输入标识牌编码'}],
  },
  {
    label: '标识牌名称',
    prop: 'signsName',
    component: 'el-input',
    props: {
      placeholder: '请输入标识牌名称',
    },
    md:12,
    rules: [{required: true, message: '请输入标识牌名称'}],
  },
  {
    label: '危险源名称',
    prop: 'sourceId',
    component: 'pro-select',
    props: {
      clearable:true,
      data:dangerList.value,
      style:{width:'100%'},
      placeholder:"请选择危险源",
    },
    md: 12,
    rules: [{required: true, message: '请选择危险源'}],
  },
  {
    label: '管理部门',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择管理部门'}],
    props:{
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
      clearable:true,
      checkStrictly: true,
      placeholder:'请选择管理部门',
    },
    md:12
  },
  {
    label: '经度',
    prop: 'longitude',
    component: 'el-input',
    props:{
      placeholder:'请输入经度',
    },
    md: 12
  },
  {
    label: '纬度',
    prop: 'latitude',
    component: 'el-input',
    props:{
      placeholder:'请输入纬度',
    },
    md: 12,
  },
  {
    label: '安装位置',
    prop: 'location',
    component: 'el-input',
    props:{
      placeholder:'请输入安装位置',
    },
    md: 12,
  },
  {
    label: '负责人',
    prop: 'chargePerson',
    component: 'el-input',
    props:{
      placeholder:'请输入负责人',
    },
    md: 12,
  },
  {
    label: '安装日期',
    prop: 'installDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      'value-format':'YYYY-MM-DD',
      style:{width:'100%'},
      placeholder:'请选择安装日期',
    },
    md: 12,
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
    md: 24,
  }
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '标识牌编码',
    prop: 'signsNum',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入标识牌编码',
    },
    md:12,
    rules: [{required: true, message: '请输入标识牌编码'}],
  },
  {
    label: '标识牌名称',
    prop: 'signsName',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入标识牌名称',
    },
    md:12,
    rules: [{required: true, message: '请输入标识牌名称'}],
  },
  {
    label: '危险源名称',
    prop: 'sourceId',
    component: 'pro-select',
    props: {
      disabled:true,
      clearable:true,
      data:dangerList.value,
      style:{width:'100%'},
      placeholder:"请选择危险源",
    },
    md: 12,
    rules: [{required: true, message: '请选择危险源'}],
  },
  {
    label: '管理部门',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择管理部门'}],
    props:{
      disabled:true,
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
      clearable:true,
      checkStrictly: true,
      placeholder:'请选择管理部门',
    },
    md:12
  },
  {
    label: '经度',
    prop: 'longitude',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入经度',
    },
    md: 12
  },
  {
    label: '纬度',
    prop: 'latitude',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入纬度',
    },
    md: 12,
  },
  {
    label: '安装位置',
    prop: 'location',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入安装位置',
    },
    md: 12,
  },
  {
    label: '负责人',
    prop: 'chargePerson',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入负责人',
    },
    md: 12,
  },
  {
    label: '安装日期',
    prop: 'installDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      'value-format':'YYYY-MM-DD',
      style:{width:'100%'},
      placeholder:'请选择安装日期',
    },
    md: 12,
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
    md: 24,
  }
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.attach;
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
// 取部门
const formatVal = (row) => {
  return row ? treeToArray(department.value).find(r=> r.id == row)?.label : ''
}

onMounted(() => {
  getData()
  // 获取部门
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
  //  获取危险管理源列表
  getDangerList().then(res=>{
    if (res.success) {
      dangerList.value = res.data.map(r=>({label:r.sourceName,value:r.id}));
    }
  })
})

const getData = () => {
  getSecurity({
    ...serachForm.value,
    startTime: serachForm.value.installDate ? serachForm.value.installDate[0] : '',
    endTime: serachForm.value.installDate ? serachForm.value.installDate[1] : '',
    installDate: null,
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
    if (type == 'add') {
      postSecurity({
        ...form.value,
        attach:JSON.stringify(fileList.value)
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
      updateSecurity(form.value.id,{
        ...form.value,
        attach:JSON.stringify(fileList.value)
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
    deleteSecurity(row.id).then(res => {
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
  proxy.download("/business/standard/safetySigns/page/export", {
    ...serachForm.value,
    startTime: serachForm.value.installDate ? serachForm.value.installDate[0] : '',
    endTime: serachForm.value.installDate ? serachForm.value.installDate[1] : '',
    installDate: null,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  },`安全标识牌管理_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

</script>

<style scoped lang="scss">

</style>