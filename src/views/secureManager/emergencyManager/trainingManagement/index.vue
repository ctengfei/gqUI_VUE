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
      <template #form-drillProcessAttach>
        <AlUpload v-model:fileList="drillProcessAttach"
                  accept=".png,.jpg,.jpeg"
        />
      </template>
      <template #form-evaluationAttach>
        <AlUpload v-model:fileList="evaluationAttach"
                  accept=".pdf,.xlsx,.xls,.doc,.docx,.txt"
        />
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
        >
          <template #form-drillProcessAttach>
            <AlUpload v-model:fileList="drillProcessAttach"
                      :disabled="true"
                      accept=".png,.jpg,.jpeg"
            />
          </template>
          <template #form-evaluationAttach>
            <AlUpload v-model:fileList="evaluationAttach"
                      :disabled="true"
                      accept=".pdf,.xlsx,.xls,.doc,.docx,.txt"
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
import useUserStore from "@/store/modules/user";
import {getEmeList} from "@/api/secureManager/emergencyManager/emePlanManagement";
import {addTraining, delTraining, getTraining, updateTraining} from "@/api/secureManager/emergencyManager/trainingManagement";
const userStore = useUserStore();
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
let emeList = ref([]);
let drillProcessAttach = ref([]);
let evaluationAttach = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '演练日期',
    prop: 'drillDate',
    component: 'el-date-picker',
    props:{
      type: 'daterange',
      placeholder:'请选择演练日期',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
      style: {width: '100%'}
    },
    search:true
  },
  {
    label: '组织单位',
    prop: 'deptId',
    component: 'el-tree-select',
    props:{
      data:department.value,
      'default-expand-all':true,
      clearable:true,
      'check-strictly':true,
      style: {width: '100%'},
      placeholder:'请选择组织单位',
    },
    search:true
  },
  {
    label: '演练项目',
    prop: 'drillItems',
  },
  {
    label: '演练地点',
    prop: 'drillLocation',
  },
  {
    label: '评估结果',
    prop: 'evaluationResults',
  },
  {
    label:'备注',
    prop: 'remark',
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '登记日期',
    prop: 'registerDate',
    component: 'el-input',
    props:{
      disabled:true,
    },
    rules: [{required: true, message: '请选择登记日期'}],
    md:12
  },
  {
    label:'记录人',
    prop: 'registerPerson',
    component: 'el-input',
    props:{
      disabled:true,
    },
    rules: [{required: true, message: '请选择记录人'}],
    md:12
  },
  {
    label: '组织单位',
    prop: 'deptId',
    component: 'el-tree-select',
    props:{
      data:department.value,
      'default-expand-all':true,
      'check-strictly':true,
      clearable:true,
      style: {width: '100%'},
      placeholder:'请选择组织单位',
    },
    rules: [{required: true, message: '请选择组织单位'}],
    md:12
  },
  {
    label: '应急预案',
    prop: 'planId',
    component: 'pro-select',
    props:{
      clearable:true,
      data: emeList.value,
      placeholder:'请选择应急预案',
      style: {width: '100%'}
    },
    rules: [{required: true, message: '请选择应急预案'}],
    md:12
  },
  {
    label:'演练项目',
    prop: 'drillItems',
    component: 'el-input',
    props:{
      placeholder:'请输入演练项目',
    },
    rules: [{required: true, message: '请输入演练项目'}],
    md: 12,
  },
  {
    label: '演练日期',
    prop: 'drillDate',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择演练日期'}],
    props:{
      type: 'date',
      placeholder:'请选择演练日期',
      'value-format':'YYYY-MM-DD',
      style: {width: '100%'}
    },
    md:12
  },
  {
    label:'演练地点',
    prop: 'drillLocation',
    component: 'el-input',
    props:{
      placeholder:'请输入演练地点',
    },
    md: 12,
  },
  {
    label:'演练类型',
    prop: 'drillType',
    component: 'pro-select',
    rules: [{required: true, message: '请输入演练地点'}],
    props:{
      clearable:true,
      data:dictStore.getDict('drill_type'),
      style:{width:'100%'},
      placeholder:'请输入演练类型',
    },
    md: 12,
  },
  {
    label:'参与人数',
    prop: 'personNum',
    component: 'el-input',
    props:{
      placeholder:'请输入参与人数',
    },
    md: 12,
  },
  {
    label:'参与单位',
    prop: 'participateUnits',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入参与单位',
    },
    md: 24,
  },
  {
    label:'演练方案',
    prop: 'exercisePlan',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入演练方案',
    },
    md: 24,
  },
  {
    label:'评估结果',
    prop: 'evaluationResults',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入评估结果',
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
    label:'演练过程',
    prop: 'drillProcessAttach',
    md: 24,
  },
  {
    label:'评估附件',
    prop: 'evaluationAttach',
    md: 24,
  },
]))
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '登记日期',
    prop: 'registerDate',
    component: 'el-input',
    props:{
      disabled:true,
    },
    rules: [{required: true, message: '请选择登记日期'}],
    md:12
  },
  {
    label:'记录人',
    prop: 'registerPerson',
    component: 'el-input',
    props:{
      disabled:true,
    },
    rules: [{required: true, message: '请选择记录人'}],
    md:12
  },
  {
    label: '组织单位',
    prop: 'deptId',
    component: 'el-tree-select',
    props:{
      disabled:true,
      data:department.value,
      'default-expand-all':true,
      'check-strictly':true,
      clearable:true,
      style: {width: '100%'},
      placeholder:'请选择组织单位',
    },
    rules: [{required: true, message: '请选择组织单位'}],
    md:12
  },
  {
    label: '应急预案',
    prop: 'planId',
    component: 'pro-select',
    props:{
      disabled:true,
      clearable:true,
      data: emeList.value,
      placeholder:'请选择应急预案',
      style: {width: '100%'}
    },
    rules: [{required: true, message: '请选择应急预案'}],
    md:12
  },
  {
    label:'演练项目',
    prop: 'drillItems',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入演练项目',
    },
    rules: [{required: true, message: '请输入演练项目'}],
    md: 12,
  },
  {
    label: '演练日期',
    prop: 'drillDate',
    component: 'el-date-picker',
    props:{
      disabled:true,
      type: 'date',
      placeholder:'请选择演练日期',
      'value-format':'YYYY-MM-DD',
      style: {width: '100%'}
    },
    md:12
  },
  {
    label:'演练地点',
    prop: 'drillLocation',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入演练地点',
    },
    rules: [{required: true, message: '请输入演练地点'}],
    md: 12,
  },
  {
    label:'演练类型',
    prop: 'drillType',
    component: 'pro-select',
    props:{
      disabled:true,
      clearable:true,
      data:dictStore.getDict('drill_type'),
      style:{width:'100%'},
      placeholder:'请输入演练类型',
    },
    md: 12,
  },
  {
    label:'参与人数',
    prop: 'personNum',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入参与人数',
    },
    md: 12,
  },
  {
    label:'参与单位',
    prop: 'participateUnits',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入参与单位',
    },
    md: 24,
  },
  {
    label:'演练方案',
    prop: 'exercisePlan',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入演练方案',
    },
    md: 24,
  },
  {
    label:'评估结果',
    prop: 'evaluationResults',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入评估结果',
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
    label:'演练过程',
    prop: 'drillProcessAttach',
    md: 24,
  },
  {
    label:'评估附件',
    prop: 'evaluationAttach',
    md: 24,
  },
]))
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    // 演练过程附件
    drillProcessAttach.value = row.drillProcessAttach
    // 演练过程附件
    evaluationAttach.value = row.evaluationAttach
    form.value = {...row};
  } else {
    drillProcessAttach.value = [];
    evaluationAttach.value = [];
    form.value = {registerDate:dayjs().format('YYYY-MM-DD HH:mm:ss'),registerPerson:userStore.realName};
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
  // 部门列表
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
  // 获取应急预案列表
  getEmeList().then(res=>{
    if(res.success){
      emeList.value = res.data.map(r=>({label:r.docName,value:r.id}));
    }
  })
})

const getData = () => {
  getTraining({
    ...serachForm.value,
    startTime:serachForm.value.drillDate ? serachForm.value.drillDate[0] : '',
    endTime:serachForm.value.drillDate ? serachForm.value.drillDate[1] : '',
    drillDate:null,
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
    let planName = emeList.value.find(r=> r.value == form.value.planId).label || {}
    if (type == 'add') {
      addTraining({
        ...form.value,
        drillProcessAttach:JSON.stringify(drillProcessAttach.value),
        evaluationAttach:JSON.stringify(evaluationAttach.value),
        planName:planName
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
      updateTraining(form.value.id,{
        ...form.value,
        drillProcessAttach:JSON.stringify(drillProcessAttach.value),
        evaluationAttach:JSON.stringify(evaluationAttach.value),
        planName:planName
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
    delTraining(row.id).then(res => {
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
  proxy.download("/business/standard/emergencyDrill/page/export", {
    ...serachForm.value,
    startTime:serachForm.value.drillDate ? serachForm.value.drillDate[0] : '',
    endTime:serachForm.value.drillDate ? serachForm.value.drillDate[1] : '',
    drillDate:null,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  },`应急宣传培训管理_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

</script>

<style scoped lang="scss">

</style>