<template>
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
      border
      column="2"
      width="40%"
      height="440"
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
    <template #table-deptId="{ size, row, column, $index }">
      {{ formatVal(row.deptId) }}
    </template>
    <template #table-employmentForm="{ size, row, column, $index }">
      {{ formatterVal(row, 'employment_form', 'employmentForm') }}
    </template>
  </pro-crud>
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
import { formatterVal } from '@/utils';
import {ref, reactive, onMounted, defineProps, watch} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {deptTreeSelect, listUser} from "@/api/system/user";
import {getUserInner} from "@/api/userManager";
import {loopTree, treeToArray} from "@/utils";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del:false,
  edit:false,
  fixed:'right',
  addText: '新增',
  detail:false,
  reset:false,
  width:'150',
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
});
const props = defineProps(['deptId']);
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let department = ref([]);
const { proxy } = getCurrentInstance();
const columns = defineCrudColumns([
  {
    label: '用户姓名',
    prop: 'realName',
    component: 'el-input',
    props:{
      placeholder:'请输入用户姓名',
    },
    form: true,
    search: true,
  },
  {
    label: '部门',
    prop: 'deptId',
    search: false,
    form: true,
  },
  {
    label: '手机号码',
    prop: 'phoneNumber',
    props:{
      placeholder:'请输入手机号码',
    },
    form: true,
  },
  {
    label: '工号',
    prop: 'jobNumber',
    form: true,
  },
  {
    label: '职务',
    prop: 'post',
    form: true,
    search: false,
  },
  {
    label: '用工形式',
    prop: 'employmentForm',
    form: true,
    search: false,
  },
]);
const formColumns = defineFormColumns([]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
    form.value = row || {};
  } else {
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  data.value = [];
  done()
})

const formatVal = (row) =>{
  return row ? treeToArray(department.value).find(r=> r.id == row)?.label : ''
}


onMounted(() => {
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
})

const getData = () => {
  getUserInner({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value,deptId:props.deptId}).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  })
}

watch(()=>props.deptId,(deptId)=>{
  getData()
},{immediate:true})



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

    } else {

    }
  }
  done()
});

// 分页选择
const load = () => {
  getData();
}


</script>

<style scoped lang="scss">

</style>