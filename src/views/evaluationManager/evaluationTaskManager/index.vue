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
        :expand="true"
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="155px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        row-key="id"
        :expand-row-keys="expandKeys"
        @expand-change="expandChange"
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
      <template #form-examBatch>
        <a-config-provider :locale="locale">
          <DatePicker  v-model:value="form.examBatch"
                       :disabled="picker_type ? false : true"
                       :locale="locale"
                       ref="custDatePicker"
                       :allowClear="false"
                       dropdownClassName="aDropClass"
                       style="width: 100%"
                       :format="customFormat"
                      @change="dateChange"
                       :valueFormat="value_format"
                       :picker="picker_type"
                       placeholder="请选择考核批次"
          >
            <template #renderExtraFooter="mode" v-if="form.examFreq == 4">
              <el-button :type="s_year == '上半年' ? 'primary' : ''" size="small" @click="s_year = '上半年'" >上半年</el-button>
              <el-button :type="s_year == '下半年' ? 'primary' : ''" size="small" @click="s_year = '下半年'">下半年</el-button>
            </template>
          </DatePicker>
        </a-config-provider>
      </template>
      <template #table-examObjType="{row}">
        {{ formatterVal(row,'examObjType','examObjType') }}
      </template>
      <template #table-taskStatus="{row}">
        {{ formatterVal(row,'task_status','taskStatus') }}
      </template>
      <template #table-examFreq="{row}">
        {{ formatterVal(row,'frequency_assessment','examFreq') }}
      </template>
      <template #table-period="{row}">
        {{ `${row.examStartTime} - ${row.examEndTime}` }}
      </template>
      <template #expand="{ row,column }" >
        <div style="margin-left: 20px">
          <scoringTable :data="row.examObjInfoList" @getData="getData" />
        </div>
      </template>
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
      </template>
      <template #form>
        <taskTable :form_type="form_type" v-model:formVal="form" @getXTable="getXTable" @getUsers="getUsers" />
      </template>
      <template #form-examPlan>
        <AlUpload v-model:fileList="planFile"/>
      </template>
      <template #form-examNotice>
        <AlUpload v-model:fileList="noticeFile"/>
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        >
          <template #form-examPlan>
            <AlUpload v-model:fileList="planFile"
                      :disabled="true"
            />
          </template>
          <template #form-examNotice>
            <AlUpload v-model:fileList="noticeFile"
                      :disabled="true"
            />
          </template>
          <taskTable :form_type="form_type" :formVal="form" @getXTable="getXTable" @getUsers="getUsers" />
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
  defineComponentProps,
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import scoringTable from './components/scoringTable';
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
import { DatePicker } from 'ant-design-vue';
import {formatterVal, loopTree, treeToArray} from '@/utils';
import {ref, reactive, onMounted, computed, markRaw, watch} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import taskTable from './components/taskTable';
import dayjs from "dayjs";
import 'dayjs/locale/zh-cn';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import {getUserList} from "@/api/waterManager/instManagement";
import useUserStore from "@/store/modules/user";
import {deptTreeSelect} from "@/api/system/user";
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import {addTask, getTask} from "@/api/evaluationManager/evaluationTaskManager";
import {getToken} from "@/utils/auth";
import {downloadFile, removeFile} from "@/api/tool/file";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  del:false,
  edit:false,
  detail: true,
  reset: false,
  width: '250',
  addProps: {
    type: 'primary',
    plain: true,
    icon: 'Plus'
  },
  editProps: {
    link: true,
    type: 'primary',
    icon: 'Edit'
  },
  detailProps:{
    link:true,
    type: 'primary',
    icon:'View'
  },
  delProps: {
    link: true,
    type: 'danger',
    icon: 'Delete'
  },
  searchResetProps:{
    icon:"Refresh",
  },
  searchProps:{
    type: 'primary',
    icon:"Search",
  },
  delText: '删除',
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
let expandKeys = ref([]);
let activeName = ref('1');
let userList = ref([]);
let assessment = ref([]);
let picker_type=ref(true);
let value_format=ref('');
let form_type = ref(''); // 编辑 新增 查看
let XTable = ref({});
let planFile = ref([]);
let noticeFile = ref([]);
let users = ref([]);
let custDatePicker = ref();
let s_year = ref('上半年');
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const userStore = useUserStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '考核任务名称',
    prop: 'taskName',
    component: 'el-input',
    props:{
      placeholder:'请输入考核任务名称',
    },
    search: true,
  },
  {
    label: '考核对象类型',
    prop: 'examObjType',
  },
  {
    label: '考核频次',
    prop: 'examFreq',
  },
  {
    label: '考核周期',
    prop: 'period',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type:'daterange',
      style: {width: '100%'},
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
      placeholder: '请选择考核周期',
    },
    search: true,
  },
  {
    label: '考核任务状态',
    prop: 'taskStatus',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('task_status'),
      config: {value: 'value', label: 'label'},
      clearable:true,
      placeholder:'请选择考核任务状态',
    },
    search: true,
  },
  {
    label: '创建日期',
    prop: 'createTime',
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '考核对象类型',
    prop: 'examObjType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核对象类型' }],
    props: {
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('examObjType'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核对象类型',
      clearable:true
    },
    md:12,
  },
  {
    label: '考核频次',
    prop: 'examFreq',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核频次' }],
    props: {
      style:{width:'100%'},
      onChange:e=>{
        if(e == 1){ // 年度
          picker_type.value = 'year'
          value_format.value = 'YYYY'
          form.value = {
            ...form.value,
            taskName:`管理局${dayjs().format('YYYY')}年度考核`,
            examBatch:dayjs().format('YYYY')
          }
        }else if(e == 2){ // 季度
          picker_type.value = 'quarter'
          value_format.value = 'YYYY-QQ'
          const season=dayjs().quarter();
          const year = dayjs().format('YYYY');
          form.value = {
            ...form.value,
            taskName:`管理局第${season}季度考核`,
            examBatch:`${year}-Q${season}`
          }
        }else if(e == 3){ // 月度
          picker_type.value = 'month'
          value_format.value = 'YYYY-MM'
          form.value = {
            ...form.value,
            taskName:`管理局${dayjs().format('YYYY-MM')}月考核`,
            examBatch:dayjs().format('YYYY-MM')
          }
        }else if(e == 4){ // 半年
          picker_type.value = 'year'
          value_format.value = 'YYYY'
          form.value = {
            ...form.value,
            taskName:`管理局${dayjs().format(`YYYY ${s_year.value}`)}考核`,
            examBatch:`${dayjs().format('YYYY')} ${s_year.value}`
          }
        }else if(e == 5){ // 半月
          picker_type.value = null
          form.value = {
            ...form.value,
            taskName:undefined,
            examBatch:null
          }
        }
      },
      data: dictStore.getDict('frequency_assessment'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核频次',
      clearable:true
    },
    md:12,
  },
  {
    label: '考核批次',
    prop: 'examBatch',
    md: 12,
  },
  {
    label: '考核对象',
    prop: 'examObjId',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: assessment.value,
      config: {value: 'id', label: 'label'},
      placeholder: '请选择考核对象',
      clearable:true
    },
    rules:[{ required: true, message: '请选择考核对象' }],
    md:12,
  },
  {
    label: '考核任务名称',
    prop: 'taskName',
    component: 'el-input',
    props: {
      placeholder: '请输入考核任务名称',
    },
    rules:[{ required: true, message: '请输入考核任务名称' }],
    md: 12,
  },
  {
    label: '考核周期',
    prop: 'period',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type:'daterange',
      style: {width: '100%'},
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
      placeholder: '请选择考核周期',
    },
    rules:[{ required: true, message: '请选择考核周期' }],
    md: 12,
  },
  {
    label: '现场考核时间',
    prop: 'now',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type:'daterange',
      style: {width: '100%'},
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
      placeholder: '请选择现场考核时间',
    },
    md: 24,
  },
  {
    label: '创建人',
    prop: 'createBy',
    component: 'el-input',
    props: {
      disabled:true,
      clearable:true,
      style: {width: '100%'},
    },
    md: 12,
  },
  {
    label: '创建时间',
    prop: 'createTime',
    component: 'el-date-picker',
    props: {
      disabled:true,
      clearable:true,
      type:'datetime',
      style: {width: '100%'},
      'value-format':'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择创建时间',
    },
    md: 12,
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  },
  {
    label: '考核方案',
    prop: 'examPlan',
    md: 24,
  },
  {
    label: '考核通知',
    prop: 'examNotice',
    md: 24,
  },
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '考核对象类型',
    prop: 'examObjType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核对象类型' }],
    props: {
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('examObjType'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核对象类型',
      clearable:true
    },
    md:12,
  },
  {
    label: '考核频次',
    prop: 'examFreq',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核频次' }],
    props: {
      style:{width:'100%'},
      onChange:e=>{
        if(e == 1){ // 年度
          picker_type.value = 'year'
          value_format.value = 'YYYY'
          form.value = {
            ...form.value,
            taskName:`管理局${dayjs().format('YYYY')}年度考核`,
            examBatch:dayjs().format('YYYY')
          }
        }else if(e == 2){ // 季度
          picker_type.value = 'quarter'
          value_format.value = 'YYYY-QQ'
          const season=dayjs().quarter();
          const year = dayjs().format('YYYY');
          form.value = {
            ...form.value,
            taskName:`管理局第${season}季度考核`,
            examBatch:`${year}-Q${season}`
          }
        }else if(e == 3){ // 月度
          picker_type.value = 'month'
          value_format.value = 'YYYY-MM'
          form.value = {
            ...form.value,
            taskName:`管理局${dayjs().format('YYYY-MM')}月考核`,
            examBatch:dayjs().format('YYYY-MM')
          }
        }else if(e == 4){ // 半年
          picker_type.value = 'month'
          value_format.value = 'YYYY-MM'
          form.value = {
            ...form.value,
            taskName:`管理局${dayjs().format('YYYY-MM')}月度考核`,
            examBatch:dayjs().format('YYYY-MM')
          }
        }else if(e == 5){ // 半月
          picker_type.value = null
          form.value = {
            ...form.value,
            taskName:undefined,
            examBatch:null
          }
        }
      },
      data: dictStore.getDict('frequency_assessment'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核频次',
      clearable:true
    },
    md:12,
  },
  {
    label: '考核批次',
    prop: 'examBatch',
    component: 'el-input',
    md: 12,
  },
  {
    label: '考核对象',
    prop: 'examObjId',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: assessment.value,
      config: {value: 'id', label: 'label'},
      placeholder: '请选择考核对象',
      clearable:true
    },
    rules:[{ required: true, message: '请选择考核对象' }],
    md:12,
  },
  {
    label: '考核任务名称',
    prop: 'taskName',
    component: 'el-input',
    props: {
      placeholder: '请输入考核任务名称',
    },
    rules:[{ required: true, message: '请输入考核任务名称' }],
    md: 12,
  },
  {
    label: '考核周期',
    prop: 'period',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type:'daterange',
      style: {width: '100%'},
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
      placeholder: '请选择考核周期',
    },
    rules:[{ required: true, message: '请选择考核周期' }],
    md: 12,
  },
  {
    label: '现场考核时间',
    prop: 'now',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type:'daterange',
      style: {width: '100%'},
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
      placeholder: '请选择现场考核时间',
    },
    md: 24,
  },
  {
    label: '创建人',
    prop: 'createBy',
    component: 'el-input',
    props: {
      disabled:true,
      clearable:true,
      style: {width: '100%'},
    },
    md: 12,
  },
  {
    label: '创建时间',
    prop: 'createTime',
    component: 'el-date-picker',
    props: {
      disabled:true,
      clearable:true,
      type:'datetime',
      style: {width: '100%'},
      'value-format':'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择创建时间',
    },
    md: 12,
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  },
  {
    label: '考核方案',
    prop: 'examPlan',
    md: 24,
  },
  {
    label: '考核通知',
    prop: 'examNotice',
    md: 24,
  },
].map(r=>({...r,props:{...r.props,disabled:true}}))));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  const realName = userStore.realName;
  const createTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  form_type.value = type;
  if (type === 'edit' || type === 'detail') {
    planFile.value = row.examPlan
    noticeFile.value = row.examNotice
    form.value = {
      ...row,
      createBy:realName,
      createTime:createTime,
      now:[row.sceneStartTime,row.sceneEndTime],
      period:[row.examStartTime,row.examEndTime],
      examObjType:'1',
    }
  } else if(type === 'add'){
    picker_type.value = 'year';
    value_format.value = 'YYYY';
    planFile.value = [];
    noticeFile.value = [];
    form.value = {
      createBy:realName,
      createTime:createTime,
      examObjType:'1',
      examFreq:'1',
      examPlan:[],
      examNotice:[],
      examBatch:dayjs().format('YYYY'),
      taskName:`管理局${dayjs().format('YYYY')}年度考核`
    };
  }
  done();
});
const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

const customFormat = value => {
  if(form.value.examFreq == '1'){ // 年度
    return value.format('YYYY')
  }else if(form.value.examFreq == '2'){ // 季度
    const str = value.format(`YYYY-QQ`);
    const season = str.split('-')[1].replace(/\d/,'Q');
    const year = value.format(`YYYY`);
    return `${year}-${season}`;
  }else if(form.value.examFreq == '3'){ // 月度
    return value.format('YYYY-MM')
  }else if(form.value.examFreq == '4'){ // 半年
    return `${value.format('YYYY')} ${s_year.value}`
  }else {
    return ''
  }
}

watch(s_year,(sy)=>{
  const year = form.value.examBatch.match(/\d+/)[0];
  form.value = {
    ...form.value,
    examBatch:`${form.value.examBatch} ${sy}`,
    taskName:`管理局${year} ${sy}考核`,
  }
  custDatePicker.value.blur()
})

// 获取成员
const getUsers = us=>{
  users.value = us;
}

const expandChange = (row,rows)=>{
  const isExpend = rows.some(r => r.id === row.id) // 判断当前行展开状态
  if (isExpend) { // 展开
    expandKeys.value.push(row.id);
  } else {
    expandKeys.value = expandKeys.value.filter(r=> r != row.id)
  }
}

// 获取表格
const getXTable = (table) =>{
  XTable.value =table; // 获取表格对象
}

function dateChange(date) {
  if(form.value.examFreq == '1'){
    form.value = {
      ...form.value,
      taskName:`管理局${date}年度考核`,
    };
  }else if(form.value.examFreq == '2'){
    let str = date.split('-')[1].replace(/\d/,'Q');
    form.value = {
      ...form.value,
      taskName:`管理局第${date.split('-')[1][1]}季度考核`,
      examBatch:`${date.split('-')[0]}-${str}`
    };
  }else if(form.value.examFreq == '3'){
    form.value = {
      ...form.value,
      taskName:`管理局${date}月考核`,
    };
  }else if(form.value.examFreq == '4'){
    form.value = {
      ...form.value,
      taskName:`管理局第${date}  ${s_year.value}考核`,
    };
  }
}

onMounted(() => {
  dayjs.extend(quarterOfYear)
  dayjs.locale('zh-cn');
  getData()
  getUserList().then(res=>{
    if(res.code == 200){
      userList.value = res.data.map(r=>({label:r.realName,value:r.userId}));
    }
  })
  deptTreeSelect().then(res=>{
    if(res.code == 200){
      assessment.value = treeToArray(res.data).filter(r=> r.label == "王英水库枢纽工程管理站处" || r.label == "阳武干渠管理处");
    }
  })
})

const getData = () => {
  getTask({
    ...serachForm.value,
    period:null,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    examStartTime:serachForm.value.period ? serachForm.value.period[0] : '',
    examEndTime:serachForm.value.period ? serachForm.value.period[1] : '',
  }).then(res => {
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
    const {tableData} =  XTable.value.getTableData(); // 评分
    if (type == 'add') {
      addTask({
        ...form.value,
        examPlan:JSON.stringify(planFile.value),
        examNotice:JSON.stringify(noticeFile.value),
        examObjName:tableData.length ? tableData[0].examAddrName : '',
        objInfo:tableData.map(r=>({
          examObjId:r.examAddrId,
          examObjName:r.examAddrName,
          templateId:r.id,
          memberName:users.value.map(r=> r.realName).join(','),
          memberId:users.value.map(r=> r.userId).join(','),
        })),
        sceneStartTime:form.value.now ? form.value.now[0] : '',
        sceneEndTime:form.value.now ? form.value.now[1] : '',
        examStartTime:form.value.period[0],
        examEndTime:form.value.period[1],
        now:null,
        period:null,
      }).then(res => {
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
      // updateDng(form.value.dpdsCode, form.value).then(res => {
      //   if (res.success) {
      //     ElMessage({
      //       message: '修改成功',
      //       type: 'success',
      //     });
      //     getData();
      //     close()
      //   }
      // })
    }
  }
  done()
});

// 分页选择
const load = () => {
  getData();
}

</script>

<style>
.aDropClass{
  z-index: 99999!important;
}
</style>
<style scoped lang="scss">
:deep(.el-dialog__body){
  height: 650px;
  overflow-y: auto;
  padding-bottom: 0;
}
:deep(.pro-form:not(.el-form--inline) .pro-form-menu){
  position: sticky;
  bottom: 0;
  height: 55px;
  display: flex;
  background: #fff;
  z-index: 10;
  border-top: 1px solid #dcdfe6;
  .el-form-item__content{
    justify-content: end;
    margin-right: 40px;
  }
}
</style>