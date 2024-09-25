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
      <template #table-wounded="{row}">
        {{ countWounded(row) }}
      </template>
      <template #table-accidentType="{ size, row, column, $index }">
        {{ formatterVal(row, 'accident_category', 'accidentType') }}
      </template>
      <template #table-accidentGrade="{ size, row, column, $index }">
        {{ formatterVal(row, 'acciden_level', 'accidentGrade') }}
      </template>
      <template #table-accidentStatus="{ size, row, column, $index }">
        {{ formatterVal(row, 'accident_condition', 'accidentStatus') }}
      </template>
      <template #table-responsibleUnitId="{row}">
        {{ formatVal(row.responsibleUnitId) }}
      </template>
      <template #form-photos>
        <AlUpload v-model:fileList="attaPhotos"/>
      </template>
      <template #form-surveyData>
        <AlUpload v-model:fileList="attaSurveyData"/>
      </template>
      <template #form-processingData>
        <AlUpload v-model:fileList="attaProcessingData"/>
      </template>
      <template #form-wounded>
        <span style="margin-right: 5px">重伤</span><el-input-number min="0" v-model="form.seriousInjury" style="width: 100px;margin-right: 10px" />
        <span  style="margin-right: 5px">轻伤</span><el-input-number min="0" v-model="form.minorWound"  style="width: 100px" />
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        >
          <template #form-wounded>
            <span style="margin-right: 5px">重伤</span><el-input-number v-model="form.seriousInjury" disabled style="width: 100px;margin-right: 10px" />
            <span  style="margin-right: 5px">轻伤</span><el-input-number v-model="form.minorWound"  disabled style="width: 100px" />
          </template>
          <template #form-photos>
            <AlUpload v-model:fileList="attaPhotos"
                      :disabled="true"/>
          </template>
          <template #form-surveyData>
            <AlUpload v-model:fileList="attaSurveyData"
                      :disabled="true"/>
          </template>
          <template #form-processingData>
            <AlUpload v-model:fileList="attaProcessingData"
                      :disabled="true"/>
          </template>
          <template #form-a-label>
            <span class="head-title">基础信息</span>
          </template>
          <template #form-b-label>
            <span class="head-title">事故处理信息</span>
          </template>
        </pro-form>
      </template>
      <template #form-a-label>
        <span class="head-title">基础信息</span>
      </template>
      <template #form-b-label>
        <span class="head-title">事故处理信息</span>
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
import {addAccident, delAccident, getAccident, updateAccident} from '@/api/secureManager/safeDelevop/accidentHandling';
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
  resetText:'关闭',
});
const form = ref({seriousInjury:'',minorWound:'',photos:[],surveyData:[],processingData:[],endInvestigationDate:[]});
const serachForm = ref({});
const crudRef = ref();
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let attaPhotos = ref([]);
let attaSurveyData = ref([]);
let attaProcessingData = ref([]);
let projectList = ref([]);
let department = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '事故名称',
    prop: 'accidentName',
    component: 'el-input',
    props:{
      style:{width:'100%'},
      placeholder:'请输入事故名称',
    },
    search:true,
  },
  {
    label: '事故发生时间',
    prop: 'happenTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'daterange',
      style: {width: '100%'},
      placeholder:'请选择事故发生时间',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format':'YYYY-MM-DD',
    },
    search:true,
  },
  {
    label: '发生地点',
    prop: 'happenPlace',
  },
  {
    label: '所属工程名称',
    prop: 'projectName',
  },
  {
    label: '责任单位',
    prop: 'responsibleUnitId',
  },
  {
    label: '事故类别',
    prop: 'accidentType',
  },
  {
    label: '事故级别',
    prop: 'accidentGrade',
  },
  {
    label: '直接经济损失（万元）',
    prop: 'directEconomicLoss',
  },
  {
    label: '死亡人数',
    prop: 'deathToll',
  },
  {
    label: '受伤人数',
    prop: 'wounded',
  },
  {
    label: '事故结案时间',
    prop: 'closingTime',
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '基础信息',
    type: 'group',
    prop:'a',
    children:[
      {
        label: '事故名称',
        prop: 'accidentName',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入事故名称',
        },
        rules:[{required: true, message: '请输入事故名称'}],
        md:24
      },
      {
        label: '事故发生时间',
        prop: 'happenTime',
        component: 'el-date-picker',
        props:{
          clearable:true,
          type:'datetime',
          'value-format':'YYYY-MM-DD HH:mm',
          style:{width:'100%'},
          placeholder:'请选择事故发生时间',
        },
        rules:[{required: true, message: '请选择事故发生时间'}],
        md:12
      },
      {
        label: '发生地点',
        prop: 'happenPlace',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入发生地点',
        },
        md:12
      },
      {
        label: '经度',
        prop: 'longitude',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入经度',
        },
        md:12
      },
      {
        label: '纬度',
        prop: 'latitude',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入纬度',
        },
        md:12
      },
      {
        label: '所属工程名称',
        prop: 'projectId',
        component: 'pro-select',
        rules:[{required: true, message: '请选择所属工程名称'}],
        props:{
          clearable:true,
          data:projectList.value,
          style:{width:'100%'},
          placeholder:'请选择所属工程名称',
        },
        md:12
      },
      {
        label: '责任单位',
        prop: 'responsibleUnitId',
        component: 'el-tree-select',
        props:{
          placeholder: '请选择责任单位',
          checkStrictly: true,
          clearable:true,
          data:department.value,
          'default-expand-all':true,
          style: {width: '100%'},
        },
        md:12
      },
      {
        label: '事故类别',
        prop: 'accidentType',
        component: 'pro-select',
        props:{
          clearable:true,
          style:{width:'100%'},
          data:dictStore.getDict('accident_category'),
          placeholder:'请选择事故类别',
        },
        md:12
      },
      {
        label: '事故级别',
        prop: 'accidentGrade',
        component: 'pro-select',
        props:{
          clearable:true,
          style:{width:'100%'},
          data:dictStore.getDict('acciden_level'),
          placeholder:'请选择事故级别',
        },
        md:12
      },
      {
        label: '事故情况描述',
        prop: 'accidentDesc',
        component: 'el-input',
        props:{
          placeholder:'请输入事故情况描述',
          autosize:{minRows:2},
          type:'textarea',
        },
        rules:[{required: true, message: '请输入事故情况描述'}],
        md:24
      },
      {
        label: '直接经济损失(万元)',
        prop: 'directEconomicLoss',
        component: 'el-input-number',
        props:{
          precision:6,
          step:0.1,
          min:0,
          style:{width:'100%'},
          placeholder:'请输入直接经济损失',
        },
        md:12
      },
      {
        label: '间接经济损失(万元)',
        prop: 'indirectEconomicLosses',
        component: 'el-input-number',
        props:{
          precision:6,
          step:0.1,
          min:0,
          style:{width:'100%'},
          placeholder:'请输入间接经济损失',
        },
        md:12
      },
      {
        label: '死亡人数',
        prop: 'deathToll',
        component: 'el-input-number',
        props:{
          style:{width:'100%'},
          placeholder:'请输入死亡人数',
        },
        md:12
      },
      {
        label: '受伤人数(人)',
        prop: 'wounded',
        md:12
      },
      {
        label: '记录人',
        prop: 'recorder',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入记录人',
        },
        md:12
      },
      {
        label: '事故状态',
        prop: 'accidentStatus',
        component: 'pro-select',
        props:{
          clearable:true,
          style:{width:'100%'},
          data:dictStore.getDict('accident_condition'),
          placeholder:'请选择事故状态',
        },
        md:12
      },
      {
        label: '填报时间',
        prop: 'fillingDate',
        component: 'el-date-picker',
        props:{
          clearable:true,
          type:'date',
          'value-format':'YYYY-MM-DD',
          style:{width:'100%'},
          placeholder:'请选择填报时间',
        },
        md:12
      },
      {
        label: '填报单位',
        prop: 'deptId',
        component: 'el-tree-select',
        props:{
          data:department.value,
          'default-expand-all':true,
          checkStrictly: true,
          clearable:true,
          style: {width: '100%'},
          placeholder:'请选择填报单位',
          config:{value: 'id', label: 'label'},
        },
        md:12
      },
      {
        label: '部门负责人',
        prop: 'deptHead',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入部门负责人',
        },
        md:12
      },
      {
        label: '单位负责人',
        prop: 'unitLeader',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入单位负责人',
        },
        md:12
      },
      {
        label: '现场图片',
        prop: 'photos',
        md:24
      }
    ]
  },
  {
    label: '事故处理信息',
    type: 'group',
    prop:'b',
    children:[
      {
        label: '事故调查单位',
        prop: 'investigationUnit',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入事故调查单位',
        },
        md:12
      },
      {
        label: '事故调查时间',
        prop: 'endInvestigationDate',
        component: 'el-date-picker',
        props:{
          clearable:true,
          type:'daterange',
          'start-placeholder': '开始时间',
          'end-placeholder': '结束时间',
          style: {width: '100%'},
          placeholder:'请选择事故调查时间',
          'value-format':'YYYY-MM-DD',
        },
        md:12
      },
      {
        label: '事故主要原因',
        prop: 'mainCause',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入事故主要原因',
          autosize:{minRows:2},
          type:'textarea',
        },
        md:24
      },
      {
        label: '事故调查情况',
        prop: 'investigationSituation',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入事故调查情况',
          autosize:{minRows:2},
          type:'textarea',
        },
        md:24
      },
      {
        label: '事故调查资料',
        prop: 'surveyData',
        md:24
      },
      {
        label: '事故处理单位',
        prop: 'processingUnit',
        component: 'el-tree-select',
        props:{
          placeholder: '请选择事故处理单位',
          data:department.value,
          clearable:true,
          checkStrictly: true,
          'default-expand-all':true,
          style: {width: '100%'},
        },
        md:12
      },
      {
        label: '事故结案时间',
        prop: 'closingTime',
        component: 'el-date-picker',
        props:{
          clearable:true,
          type:'date',
          style: {width: '100%'},
          placeholder:'请选择事故结案时间',
          'value-format':"YYYY-MM-DD"
        },
        md:12
      },
      {
        label: '处理结果',
        prop: 'processingResults',
        component: 'el-input',
        props:{
          style:{width:'100%'},
          placeholder:'请输入处理结果',
          autosize:{minRows:2},
          type:'textarea',
        },
        md:24
      },
      {
        label: '事故处理资料',
        prop: 'processingData',
        md:24
      }
    ]
  }
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '基础信息',
    type: 'group',
    prop:'a',
    children:[
      {
        label: '事故名称',
        prop: 'accidentName',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入事故名称',
        },
        rules:[{required: true, message: '请输入事故名称'}],
        md:24
      },
      {
        label: '事故发生时间',
        prop: 'happenTime',
        component: 'el-date-picker',
        props:{
          clearable:true,
          disabled:true,
          type:'datetime',
          'value-format':'YYYY-MM-DD HH:mm',
          style:{width:'100%'},
          placeholder:'请选择事故发生时间',
        },
        rules:[{required: true, message: '请选择事故发生时间'}],
        md:12
      },
      {
        label: '发生地点',
        prop: 'happenPlace',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入发生地点',
        },
        md:12
      },
      {
        label: '经度',
        prop: 'longitude',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入经度',
        },
        md:12
      },
      {
        label: '纬度',
        prop: 'latitude',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入纬度',
        },
        md:12
      },
      {
        label: '所属工程名称',
        prop: 'projectId',
        component: 'pro-select',
        props:{
          disabled:true,
          data:projectList.value,
          style:{width:'100%'},
          placeholder:'请输入所属工程名称',
        },
        md:12
      },
      {
        label: '责任单位',
        prop: 'responsibleUnitId',
        component: 'el-tree-select',
        props:{
          disabled:true,
          clearable:true,
          checkStrictly: true,
          placeholder: '请选择责任单位',
          data:department.value,
          'default-expand-all':true,
          style: {width: '100%'},
        },
        md:12
      },
      {
        label: '事故类别',
        prop: 'accidentType',
        component: 'pro-select',
        props:{
          disabled:true,
          style:{width:'100%'},
          data:dictStore.getDict('accident_category'),
          placeholder:'请选择事故类别',
        },
        md:12
      },
      {
        label: '事故级别',
        prop: 'accidentGrade',
        component: 'pro-select',
        props:{
          disabled:true,
          style:{width:'100%'},
          data:dictStore.getDict('acciden_level'),
          placeholder:'请选择事故级别',
        },
        md:12
      },
      {
        label: '事故情况描述',
        prop: 'accidentDesc',
        component: 'el-input',
        props:{
          disabled:true,
          placeholder:'请输入事故情况描述',
          autosize:{minRows:2},
          type:'textarea',
        },
        rules:[{required: true, message: '请输入事故情况描述'}],
        md:24
      },
      {
        label: '直接经济损失(万元)',
        prop: 'directEconomicLoss',
        component: 'el-input-number',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入直接经济损失',
        },
        md:12
      },
      {
        label: '间接经济损失(万元)',
        prop: 'indirectEconomicLosses',
        component: 'el-input-number',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入间接经济损失',
        },
        md:12
      },
      {
        label: '死亡人数',
        prop: 'deathToll',
        component: 'el-input-number',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入死亡人数',
        },
        md:12
      },
      {
        label: '受伤人数(人)',
        prop: 'wounded',
        props: {
          disabled:true,
        },
        md:12
      },
      {
        label: '记录人',
        prop: 'recorder',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入记录人',
        },
        md:12
      },
      {
        label: '事故状态',
        prop: 'accidentStatus',
        component: 'pro-select',
        props:{
          disabled:true,
          style:{width:'100%'},
          data:dictStore.getDict('accident_condition'),
          placeholder:'请选择事故状态',
        },
        md:12
      },
      {
        label: '填报时间',
        prop: 'fillingDate',
        component: 'el-date-picker',
        props:{
          clearable:true,
          disabled:true,
          type:'date',
          'value-format':'YYYY-MM-DD',
          style:{width:'100%'},
          placeholder:'请选择填报时间',
        },
        md:12
      },
      {
        label: '填报单位',
        prop: 'deptId',
        component: 'el-tree-select',
        props:{
          disabled:true,
          clearable:true,
          checkStrictly: true,
          data:department.value,
          'default-expand-all':true,
          style: {width: '100%'},
          placeholder:'请选择填报单位',
          config:{value: 'id', label: 'label'},
        },
        md:12
      },
      {
        label: '部门负责人',
        prop: 'deptHead',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入部门负责人',
        },
        md:12
      },
      {
        label: '单位负责人',
        prop: 'unitLeader',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入单位负责人',
        },
        md:12
      },
      {
        label: '现场图片',
        prop: 'photos',
        md:24
      }
    ]
  },
  {
    label: '事故处理信息',
    type: 'group',
    prop:'b',
    children:[
      {
        label: '事故调查单位',
        prop: 'investigationUnit',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入事故调查单位',
        },
        md:12
      },
      {
        label: '事故调查时间',
        prop: 'endInvestigationDate',
        component: 'el-date-picker',
        props:{
          clearable:true,
          disabled:true,
          type:'daterange',
          style: {width: '100%'},
          'start-placeholder': '开始时间',
          'end-placeholder': '结束时间',
          placeholder:'请选择事故调查时间',
          'value-format':'YYYY-MM-DD',
        },
        md:12
      },
      {
        label: '事故主要原因',
        prop: 'mainCause',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入事故主要原因',
          autosize:{minRows:2},
          type:'textarea',
        },
        md:24
      },
      {
        label: '事故调查情况',
        prop: 'investigationSituation',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入事故调查情况',
          autosize:{minRows:2},
          type:'textarea',
        },
        md:24
      },
      {
        label: '事故调查资料',
        prop: 'surveyData',
        md:24
      },
      {
        label: '事故处理单位',
        prop: 'processingUnit',
        component: 'el-tree-select',
        props:{
          disabled:true,
          clearable:true,
          checkStrictly: true,
          placeholder: '请选择事故处理单位',
          data:department.value,
          'default-expand-all':true,
          style: {width: '100%'},
        },
        md:12
      },
      {
        label: '事故结案时间',
        prop: 'closingTime',
        component: 'el-date-picker',
        props:{
          clearable:true,
          disabled:true,
          type:'date',
          style: {width: '100%'},
          placeholder:'请选择事故结案时间',
          'value-format':"YYYY-MM-DD"
        },
        md:12
      },
      {
        label: '处理结果',
        prop: 'processingResults',
        component: 'el-input',
        props:{
          disabled:true,
          style:{width:'100%'},
          placeholder:'请输入处理结果',
          autosize:{minRows:2},
          type:'textarea',
        },
        md:24
      },
      {
        label: '事故处理资料',
        prop: 'processingData',
        md:24
      }
    ]
  }
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    attaPhotos.value = row.photos

    attaSurveyData.value = row.surveyData

    attaProcessingData.value = row.processingData

    form.value = {...row,endInvestigationDate:[row.startInvestigationDate,row.endInvestigationDate] };
  } else {
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

//统计受伤人数
const countWounded = (row)=>{
  return Number(row.seriousInjury) + Number(row.minorWound)
}

onMounted(() => {
  getData()
  // 查询部门
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
  // 查询工程
  getProjectList().then(res=>{
    if(res.success){
      projectList.value = res.data.map(r=>({label:r.engName,value:r.id}));
    }
  })
})

const getData = () => {
  getAccident({
    ...serachForm.value,
    startTime:serachForm.value.happenTime ? serachForm.value.happenTime[0] : '',
    endTime:serachForm.value.happenTime ? serachForm.value.happenTime[1] : '',
    happenTime:null,
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
      addAccident({
        ...form.value,
        startInvestigationDate:form.value.endInvestigationDate && form.value.endInvestigationDate.length ? form.value.endInvestigationDate[0]: '',
        endInvestigationDate:form.value.endInvestigationDate && form.value.endInvestigationDate.length ? form.value.endInvestigationDate[1]: '',
        photos:JSON.stringify(attaPhotos.value),
        surveyData:JSON.stringify(attaSurveyData.value),
        processingData:JSON.stringify(attaProcessingData.value),
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
      updateAccident(form.value.id,{
        ...form.value,
        startInvestigationDate:form.value.endInvestigationDate && form.value.endInvestigationDate.length ? form.value.endInvestigationDate[0]: '',
        endInvestigationDate:form.value.endInvestigationDate && form.value.endInvestigationDate.length ? form.value.endInvestigationDate[1]: '',
        photos:JSON.stringify(attaPhotos.value),
        surveyData:JSON.stringify(attaSurveyData.value),
        processingData:JSON.stringify(attaProcessingData.value),
        projectName:project.label || '',
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
    delAccident(row.id).then(res => {
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
  proxy.download("/business/standard/safetyAccident/page/export", {
    ...serachForm.value,
    startTime:serachForm.value.happenTime ? serachForm.value.happenTime[0] : '',
    endTime:serachForm.value.happenTime ? serachForm.value.happenTime[1] : '',
    happenTime:null,
    pageNum:currentPage.value,
    pageSize:pageSize.value
  },`安全生产事故_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.el-dialog__body){
  height: 650px;
  overflow-y: auto;
  padding-bottom: 0;
  padding-top: 0;
}
:deep(.pro-form:not(.el-form--inline) .pro-form-menu){
  position: sticky;
  bottom: 0;
  height: 55px;
  display: flex;
  background: #fff;
  border-top: 1px solid #dcdfe6;
  .el-form-item__content{
    justify-content: end;
    margin-right: 40px;
  }
}
:deep(.pro-group-form-title){
  font-size: 20px;
}
.head-title{
  display: block;
  width: 100%;
  border-bottom: 2px dotted;
}
.head-title:after{
  height: 15px!important;
}

</style>