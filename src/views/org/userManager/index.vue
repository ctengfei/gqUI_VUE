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
        draggable
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
        <el-button type="success" plain icon="Upload" @click="dialogVisible = true">导入</el-button>
      </template>
      <template #table-deptId="{ size, row, column, $index }">
        {{ formatVal(row.deptId) }}
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        />
      </template>
    </pro-crud>
  </div>
  <el-dialog
      v-model="dialogVisible"
      title="导入"
      width="50%"
  >
    <div style="display: flex;justify-content: space-between;align-items: center">
      <span>仅支持表格文件上传，请按照模板示例数据填写:</span>
      <el-button type="primary" icon="Plus" @click="downloadTemp">获取模版</el-button>
    </div>
    <el-upload
        drag
        :headers="headers"
        multiple
        limit="1"
        style="margin-top: 20px"
        accept=".xlsx"
        :action="uploadFileUrl"
        :on-success="handleSuccess"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        单击或拖动文件到此区域进行上传
      </div>
    </el-upload>
    <template #footer>
      <span class="dialog-footer">
        <el-button  type="primary" @click="dialogVisible = false">确定</el-button>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
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
import {ref, reactive, onMounted, computed, watch} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {deptTreeSelect} from "@/api/system/user";
import {addUserInner, delUserInner, getTemp, getUserInner, updateUserInner} from "@/api/userManager";
import {getToken} from "@/utils/auth";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del:false,
  edit:true,
  detail:true,
  addText: '新增',
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
    icon:'edit'
  },
  delProps:{
    link:true,
    type: 'danger',
    icon:'Delete'
  },
  detailProps:{
    link:true,
    type: 'primary',
    icon:'View'
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
let department = ref([]);
let dialogVisible = ref(false);
const headers = ref({ Authorization: "Bearer " + getToken() });
const uploadFileUrl = ref(`${import.meta.env.VITE_APP_BASE_API}/business/standard/personnel/importData`); // 上传文件服务器地址
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
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
    component: 'el-tree-select',
    props: {
      placeholder: '请选择部门',
      data:department.value,
      clearable:true,
      'check-strictly':true,
      style: {width: '100%'},
      'default-expand-all':true,
    },
    search: true,
    form: true,
  },
  {
    label: '手机号码',
    prop: 'phoneNumber',
    component: 'el-input',
    props:{
      placeholder:'请输入手机号码',
    },
    form: true,
    search: false,
  },
  {
    label: '性别',
    prop: 'sex',
    hide:true,
    search: false,
  },
  {
    label: '工号',
    prop: 'jobNumber',
    form: true,
    search: false,
  },
  {
    label: '职务',
    prop: 'post',
    hide:true,
    search: false,
  },
  {
    label: '政治面貌',
    prop: 'politicalStatus',
    hide:true,
    search: false,
  },
  {
    label: '出生日期',
    prop: 'birthday',
    hide:true,
    search: false,
  },
  {
    label: '民族',
    prop: 'nation',
    hide:true,
    search: false,
  },
  {
    label: '年龄',
    prop: 'age',
    hide:true,
    search: false,
  },
  {
    label: '职称等级',
    prop: 'rank',
    hide:true,
    search: false,
  },
  {
    label: '学历',
    prop: 'education',
    hide:true,
    search: false,
  },
  {
    label: '参加工作时间',
    prop: 'workingDate',
    hide:true,
    search: false,
  },
  {
    label: '参加工作年限',
    prop: 'workingYear',
    hide:true,
    search: false,
  },
  {
    label: '人员状态',
    prop: 'status',
    hide:true,
    search: false,
  },
  {
    label: '进本单位时间',
    prop: 'companyDate',
    hide:true,
    search: false,
  },
  {
    label: '离开本单位时间',
    prop: 'leaveCompanyDate',
    hide:true,
    search: false,
  },
  {
    label: '本单位工作年限',
    prop: 'companyYear',
    hide:true,
    search: false,
  },
  {
    label: '用工形式',
    prop: 'employmentForm',
    hide:true,
    form: true,
  },
  {
    label: '人员职责范围',
    prop: 'responsibilities',
    hide:true,
    search: false,
  },
  {
    label: '岗位职责',
    prop: 'responsibility',
    hide:true,
    search: false,
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '用户姓名',
    prop: 'realName',
    component: 'el-input',
    rules: [{required: true, message: '请输入用户姓名'}],
    props:{
      placeholder:'请输入用户姓名',
    },
    md:12
  },
  {
    label: '部门',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择部门'}],
    props: {
      placeholder: '请选择部门',
      data:department.value,
      'check-strictly':true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '手机号码',
    prop: 'phoneNumber',
    component: 'el-input',
    // rules: [{required: true, message: '请输入手机号码'},{pattern:/^1[3-9]\d{9}$/,message:'请输入正确手机号码',trigger:'change'}],
    props:{
      placeholder:'请输入手机号码',
    },
    md:12
  },
  {
    label: '性别',
    prop: 'sex',
    component: 'pro-radio',
    props:{
      data:[
        { value: '0', label: '男' },
        { value: '1', label: '女' },
      ],
    },
    md:12
  },
  {
    label: '负责人',
    prop: 'isDutyPerson',
    component: 'pro-radio',
    props:{
      data:[
        { value: '0', label: '是' },
        { value: '1', label: '否' },
      ],
    },
    md:12
  },
  {
    label: '工号',
    prop: 'jobNumber',
    component: 'el-input',
    props:{
      placeholder:'请输入工号',
    },
    md:12
  },
  {
    label: '职务',
    prop: 'post',
    component: 'el-input',
    props:{
      placeholder:'请输入职务',
    },
    md:12
  },
  {
    label: '政治面貌',
    prop: 'politicalStatus',
    component: 'pro-select',
    props: {
      clearable:true,
      placeholder: '请选择政治面貌',
      data:dictStore.getDict('political_status'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '出生日期',
    prop: 'birthday',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择出生日期',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '民族',
    prop: 'nation',
    component: 'pro-select',
    props: {
      clearable:true,
      placeholder: '请选择民族',
      data: ethnic.value,
      style: {width: '100%'},
      config:{value: 'id', label: 'name'}
    },
    md:12
  },
  {
    label: '年龄',
    prop: 'age',
    component: 'el-input-number',
    props:{
      placeholder:'请输入年龄',
      style:{width:'100%'},
      min:1
    },
    md:12
  },
  {
    label: '职称等级',
    prop: 'rank',
    component: 'pro-select',
    props: {
      clearable:true,
      placeholder: '请选择职称等级',
      data: dictStore.getDict('professional'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '学历',
    prop: 'education',
    component: 'pro-select',
    props: {
      clearable:true,
      placeholder: '请选择学历',
      data: dictStore.getDict('educational_background'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '参加工作时间',
    prop: 'workingDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择参加工作时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '参加工作年限',
    prop: 'workingYear',
    component: 'el-input-number',
    props:{
      min:1,
      style:{width:'100%'},
      placeholder:'请输入参加工作年限',
    },
    md:12
  },
  {
    label: '人员状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      clearable:true,
      placeholder: '请选择人员状态',
      data: dictStore.getDict('USER_STATUS'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '进本单位时间',
    prop: 'companyDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择进本单位时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '离开本单位时间',
    prop: 'leaveCompanyDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择离开本单位时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '本单位工作年限',
    prop: 'companyYear',
    component: 'el-input-number',
    props:{
      min:1,
      style:{width:'100%'},
      placeholder:'请输入本单位工作年限',
    },
    md:12
  },
  {
    label: '用工形式',
    prop: 'employmentForm',
    component: 'pro-select',
    props: {
      clearable:true,
      placeholder: '请选择用工形式',
      data: dictStore.getDict('employment_form'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '人员职责范围',
    prop: 'responsibilities',
    component: 'el-input',
    props:{
      placeholder:'请输入人员职责范围',
    },
    md:24
  },
  {
    label: '岗位职责',
    prop: 'responsibility',
    component: 'el-input',
    props:{
      placeholder:'请输入岗位职责',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md:24
  },
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '用户姓名',
    prop: 'realName',
    component: 'el-input',
    rules: [{required: true, message: '请输入用户姓名'}],
    props:{
      disabled:true,
      placeholder:'请输入用户姓名',
    },
    md:12
  },
  {
    label: '部门',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择部门'}],
    props: {
      disabled:true,
      placeholder: '请选择部门',
      data:department.value,
      clearable:true,
      'check-strictly':true,
      'default-expand-all':true,
      style: {width: '100%'},
    },
    md:12
  },
  {
    label: '手机号码',
    prop: 'phoneNumber',
    component: 'el-input',
    rules: [{required: true, message: '请输入手机号码'},{len: 11,message:'请输入11位手机号'}],
    props:{
      disabled:true,
      placeholder:'请输入手机号码',
    },
    md:12
  },
  {
    label: '性别',
    prop: 'sex',
    component: 'pro-radio',
    props:{
      disabled:true,
      data:[
        { value: '0', label: '男' },
        { value: '1', label: '女' },
      ],
    },
    md:12
  },
  {
    label: '负责人',
    prop: 'isDutyPerson',
    component: 'pro-radio',
    props:{
      disabled:true,
      data:[
        { value: '0', label: '是' },
        { value: '1', label: '否' },
      ],
    },
    md:12
  },
  {
    label: '工号',
    prop: 'jobNumber',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入工号',
    },
    md:12
  },
  {
    label: '职务',
    prop: 'post',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入职务',
    },
    md:12
  },
  {
    label: '政治面貌',
    prop: 'politicalStatus',
    component: 'pro-select',
    props: {
      clearable:true,
      disabled:true,
      placeholder: '请选择政治面貌',
      data:dictStore.getDict('political_status'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '出生日期',
    prop: 'birthday',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择出生日期',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '民族',
    prop: 'nation',
    component: 'pro-select',
    props: {
      clearable:true,
      disabled:true,
      placeholder: '请选择民族',
      data: ethnic.value,
      style: {width: '100%'},
      config:{value: 'id', label: 'name'}
    },
    md:12
  },
  {
    label: '年龄',
    prop: 'age',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入年龄',
    },
    md:12
  },
  {
    label: '职称等级',
    prop: 'rank',
    component: 'pro-select',
    props: {
      disabled:true,
      clearable:true,
      placeholder: '请选择职称等级',
      data: dictStore.getDict('professional'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '学历',
    prop: 'education',
    component: 'pro-select',
    props: {
      disabled:true,
      placeholder: '请选择学历',
      data: dictStore.getDict('educational_background'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '参加工作时间',
    prop: 'workingDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择参加工作时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '参加工作年限',
    prop: 'workingYear',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入参加工作年限',
    },
    md:12
  },
  {
    label: '人员状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      disabled:true,
      placeholder: '请选择人员状态',
      data: dictStore.getDict('USER_STATUS'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '进本单位时间',
    prop: 'companyDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择进本单位时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '离开本单位时间',
    prop: 'leaveCompanyDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      disabled:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择离开本单位时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '本单位工作年限',
    prop: 'companyYear',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入本单位工作年限',
    },
    md:12
  },
  {
    label: '用工形式',
    prop: 'employmentForm',
    component: 'pro-select',
    props: {
      disabled:true,
      placeholder: '请选择用工形式',
      data: dictStore.getDict('employment_form'),
      style: {width: '100%'},
      config:{value: 'value', label: 'label'}
    },
    md:12
  },
  {
    label: '人员职责范围',
    prop: 'responsibilities',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入人员职责范围',
    },
    md:24
  },
  {
    label: '岗位职责',
    prop: 'responsibility',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入岗位职责',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md:24
  },
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  }
  else {
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

const downloadTemp = () => {
  proxy.download("business/standard/personnel/importTemplate",{},`人员模版.xlsx`);
}

watch(dialogVisible,(dia)=>{
  if(!dia){
    getData();
  }
})

onMounted(() => {
  getData()
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
})

const getData = () => {
  getUserInner({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
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
      addUserInner({...form.value}).then(res=>{
        if(res.success){
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    } else {
      updateUserInner(form.value.id,{...form.value}).then(res=>{
        if (res.success) {
          ElMessage({
            message: '修改成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
      close()
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
    delUserInner(row.id).then(res => {
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
  proxy.download("/business/standard/personnel/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`人员管理统计_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}


</script>

<style scoped lang="scss">

</style>