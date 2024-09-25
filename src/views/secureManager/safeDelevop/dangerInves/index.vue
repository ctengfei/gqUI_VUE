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
import {downloadFile, removeFile} from "@/api/tool/file";
import {getToken} from "@/utils/auth";
import {addInves, delInves, getInves, updateInves} from "@/api/secureManager/safeDelevop/dangerInves";
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
const form = ref({attach:''});
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
    label: '检查类型',
    prop: 'checkType',
    component: 'pro-select',
    props: {
      clearable:true,
      placeholder: '请选择检查类型',
      data:dictStore.getDict('safe_check_type'),
      style: {width: '100%'},
    },
    search: true,
  },
  {
    label: '发现时间',
    prop: 'discoveryTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'datetimerange',
      style: {width: '100%'},
      placeholder:'请选择发现时间',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
    },
    search: true,
  },
  {
    label: '隐患描述',
    prop: 'dangerDesc',
  },
  {
    label: '位置描述',
    prop: 'location',
  },
  {
    label: '填报单位',
    prop: 'deptId',
  },
  {
    label: '上报人',
    prop: 'reportPerson',
  },
  {
    label: '备注',
    prop: 'remark',
  }
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '检查类型',
    prop: 'checkType',
    component: 'pro-select',
    props: {
      clearable:true,
      placeholder: '请选择检查类型',
      data:dictStore.getDict('safe_check_type'),
      style: {width: '100%'},
    },
    md:12,
    rules: [{required: true, message: '请选择检查类型'}],
  },
  {
    label: '发现时间',
    prop: 'discoveryTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'datetime',
      style: {width: '100%'},
      placeholder:'请选择发现时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
    },
    md:12,
    rules: [{required: true, message: '请选择发现时间'}],
  },
  {
    label: '上报人',
    prop: 'reportPerson',
    component: 'el-input',
    props: {
      placeholder:"请输入上报人",
    },
    md: 12,
    rules: [{required: true, message: '请输入上报人'}],
  },
  {
    label: '填报单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择填报单位'}],
    props:{
      data:department.value,
      checkStrictly: true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择填报单位',
    },
    md:12
  },
  {
    label: '隐患描述',
    prop: 'dangerDesc',
    component: 'el-input',
    rules: [{required: true, message: '请输入隐患描述'}],
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入隐患描述',
    },
    md: 24,
  },
  {
    label: '发生位置',
    prop: 'location',
    component: 'el-input',
    rules: [{required: true, message: '请输入发生位置'}],
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入发生位置',
    },
    md: 24,
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
    label: '检查类型',
    prop: 'checkType',
    component: 'pro-select',
    props: {
      disabled:true,
      placeholder: '请选择检查类型',
      data:dictStore.getDict('safe_check_type'),
      style: {width: '100%'},
    },
    md:12,
    rules: [{required: true, message: '请选择检查类型'}],
  },
  {
    label: '发现时间',
    prop: 'discoveryTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'datetime',
      style: {width: '100%'},
      placeholder:'请选择发现时间',
      'value-format':'YYYY-MM-DD HH:mm:ss',
    },
    md:12,
    rules: [{required: true, message: '请选择发现时间'}],
  },
  {
    label: '上报人',
    prop: 'reportPerson',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder:"请输入上报人",
    },
    md: 12,
    rules: [{required: true, message: '请输入上报人'}],
  },
  {
    label: '填报单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择填报单位'}],
    props:{
      disabled:true,
      clearable:true,
      checkStrictly: true,
      data:department.value,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择填报单位',
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
  },
  {
    label: '发生位置',
    prop: 'location',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入发生位置',
    },
    md: 24,
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
})

const getData = () => {
  getInves({
    ...serachForm.value,
    startTime: serachForm.value.discoveryTime ? serachForm.value.discoveryTime[0] : '',
    endTime: serachForm.value.discoveryTime ? serachForm.value.discoveryTime[1] : '',
    discoveryTime: null,
    pageNum: currentPage.value,
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
      addInves({
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
      updateInves(form.value.id,{
        ...form.value,
        attach: JSON.stringify(fileList.value),
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
    delInves(row.id).then(res => {
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
  proxy.download("/business/standard/safetyYhpc/page/export", {
    ...serachForm.value,
    startTime: serachForm.value.discoveryTime ? serachForm.value.discoveryTime[0] : '',
    endTime: serachForm.value.discoveryTime ? serachForm.value.discoveryTime[1] : '',
    discoveryTime: null,
    pageNum:currentPage.value,pageSize:pageSize.value
  },`安全隐患排查_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

</script>

<style scoped lang="scss">

</style>