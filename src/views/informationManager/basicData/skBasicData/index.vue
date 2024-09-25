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
      class="dialog-class"
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
      label-width="220px"
      direction="vertical"
      @search="searchSubmit"
      @search-reset="searchReset"
      @submit="submit"
      @delete="deleteRow"
  >
    <template #table-resType="{ size, row, column, $index }">
      {{ formatterVal(row,'RES_TYPE','resType') }}
    </template>
    <template #table-engGrad="{ size, row, column, $index }">
      {{ formatterVal(row,'ENG_GRAD','engGrad') }}
    </template>
    <template #table-engScal="{ size, row, column, $index }">
      {{ formatterVal(row,'PROJ_SCAL','engScal') }}
    </template>
    <template #table-engStat="{ size, row, column, $index }">
      {{ formatterVal(row,'ENG_STAT','engStat') }}
    </template>
    <template #table-runCond="{ size, row, column, $index }">
      {{ formatterVal(row,'run_status','runCond') }}
    </template>
    <template #table-gcSt="{ size, row, column, $index }">
      {{ formatterVal(row,'ELEV_SYS','gcSt') }}
    </template>
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
    <template #crud-detail="{ props, columns, size }">
      <pro-form
          label-width="220px"
          v-model="form"
          @reset="crudRef.closeDialog()"
          :menu="detailMenu"
          :columns="detailColumns"
      ></pro-form>
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
  defineCrudBeforeOpen,
} from 'element-pro-components';
import { formatterVal } from '@/utils';
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {addSk, delSk, exportSkExcel, getSk, updateSk} from "@/api/informationManager/basicData/skBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
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
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '水库代码',
    prop: 'resCode',
    component: 'el-input',
    props:{
      placeholder:'请输入水库代码',
    },
    form: true,
    search: true,
  },
  {
    label: '水库名称',
    prop: 'resName',
    component: 'el-input',
    props:{
      placeholder:'请输入水库名称',
    },
    form: true,
    search: true,
  },
  {
    label: '左下角经度',
    prop: 'lowLeftLong',
    search: false,
    form: true,
    hide:true,
  },
  {
    label: '左下角纬度',
    prop: 'lowLeftLat',
    search: false,
    form: true,
    hide:true,
  },
  {
    label: '右上角经度',
    prop: 'eupRightLong',
    search: false,
    form: true,
    hide:true,
  },
  {
    label: '右上角纬度',
    prop: 'upRightLat',
    search: false,
    form: true,
    hide:true,
  },
  {
    label: '水库所在位置',
    prop: 'resLoc',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'水库类型',
    prop: 'resType',
    search: true,
    form: true,
    component: 'pro-select',
    props:{
      data: dictStore.getDict('RES_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择水库类型',
      clearable:true
    },
  },
  {
    label:'工程等别',
    prop: 'engGrad',
    search: true,
    form: true,
    component: 'pro-select',
    props:{
      data: dictStore.getDict('ENG_GRAD'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程等别',
      clearable:true
    },
  },
  {
    label:'工程规模',
    prop: 'engScal',
    component: 'pro-select',
    props:{
      data: dictStore.getDict('PROJ_SCAL'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程规模',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'承雨面积(km)',
    prop: 'watShedArea',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'实际灌溉面积(万亩)',
    prop: 'relIrrArea',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'坝址多年平均径流量',
    prop: 'daadMulAverRuof',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'设计洪水位(m)',
    prop: 'desFz',
    search: false,
    form: true,
  },
  {
    label:'总库容',
    prop: 'totCap',
    search: false,
    form: true,
  },
  {
    label:'调洪库容',
    prop: 'storFlCap',
    search: false,
    form: true,
  },
  {
    label:'防洪库容',
    prop: 'flcoCap',
    search: false,
    form: true,
  },
  {
    label:'防洪高水位(m)',
    prop: 'uppLevFlco',
    search: false,
    form: true,
  },
  {
    label:'正常蓄水位(m)',
    prop: 'normWatLev',
    search: false,
    form: true,
  },
  {
    label:'正常蓄水位相应水面面积(km²)',
    prop: 'normPoolStagArea',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'正常蓄水位相应库容(km²)',
    prop: 'normPoolStagCap',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'校核洪水位(m)',
    prop: 'cfZ',
    search: false,
    form: true,
  },
  {
    label:'兴利库容(km²)',
    prop: 'benResCap',
    search: false,
    form: true,
  },
  {
    label:'防洪限制水位(m)',
    prop: 'flLowLimLev',
    search: false,
    form: true,
  },
  {
    label:'防洪限制水位库容(km²)',
    prop: 'flLowLimLevCap',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'死水位(m)',
    prop: 'deadLev',
    search: false,
    form: true,
  },
  {
    label:'死库容(m)',
    prop: 'deadCap',
    search: false,
    form: true,
  },
  {
    label:'水库调节方式',
    prop: 'resRegTp',
    search: false,
    form: true,
  },
  {
    label:'最小下泄流量(m³/s)',
    prop: 'minDisc',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'发电引水口至尾水口河道长度(m)',
    prop: 'stEndLen',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'水库枢纽建筑物组成',
    prop: 'rhcc',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'运行状况',
    prop: 'runCond',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('run_status'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择运行状况',
      clearable:true
    },
    search: true,
    form: true,
    fixed:'right'
  },
  {
    label:'归属管理部门',
    prop: 'admDep',
    form: true,
  },
  {
    label:'集水面积(km²)',
    prop: 'catArea',
    search: false,
    form: true,
  },
  {
    label:'供水范围',
    prop: 'wsReg',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'行政区划编码',
    prop: 'areaId',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'坝址控制流域面积(km²)',
    prop: 'daadArea',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'主坝尺寸坝高(m)',
    prop: 'daadHigh',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'最大泄洪流量(m³/s)',
    prop: 'maxDisc',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'高程系统',
    prop: 'gcSt',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'坝顶高程(m)',
    prop: 'daadGc',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'设计洪水标准［重现期］（年）',
    prop: 'desY',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'校核洪水标准［重现期］（年）',
    prop: 'cfY',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'设计年供水量',
    prop: 'desWsY',
    search: false,
    form: true,
    hide:true,
  },
  {
    label:'设计灌溉面积（万亩）',
    prop: 'desIrrArea',
    search: false,
    form: true,
    hide:true,
    fixed:'right'
  },
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '水库代码',
    prop: 'resCode',
    rules:[{ required: true, message: '请输入水库代码' }],
    component: 'el-input',
    props:{
      disabled:!!(form.value?.resCode),
      placeholder:'请输入水库代码',
    },
    md: 12,
  },
  {
    label: '水库名称',
    prop: 'resName',
    rules:[{ required: true, message: '请输入水库名称' }],
    component: 'el-input',
    props:{
      placeholder:'请输入水库名称',
    },
    md: 12,
  },
  {
    label: '左下角经度',
    prop: 'lowLeftLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入左下角经度' }],
    props:{
      placeholder:'请输入左下角经度',
    },
    md: 12,
  },
  {
    label: '左下角纬度',
    prop: 'lowLeftLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入左下角纬度' }],
    props:{
      placeholder:'请输入左下角纬度',
    },
    md: 12,
  },
  {
    label: '右上角经度',
    prop: 'eupRightLong',
    component: 'el-input',
    props:{
      placeholder:'请输入右上角经度',
    },
    md: 12,
  },
  {
    label: '右上角纬度',
    prop: 'upRightLat',
    component: 'el-input',
    props:{
      placeholder:'请输入右上角纬度',
    },
    md: 12,
  },
  {
    label: '水库所在位置',
    prop: 'resLoc',
    component: 'el-input',
    props:{
      placeholder:'请输入水库所在位置',
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      placeholder:"请输入建成时间",
    },
    md: 12,
  },
  {
    label:'水库类型',
    prop: 'resType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择水库类型' }],
    props:{
      data:dictStore.getDict('RES_TYPE'), // run_status.value
      placeholder:'请选择水库类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'工程等别',
    prop: 'engGrad',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择工程等别' }],
    props:{
      data: dictStore.getDict('ENG_GRAD'),
      placeholder:'请选择工程等别',
      clearable:true
    },
    md: 12,
  },
  {
    label:'工程规模',
    prop: 'engScal',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择工程规模' }],
    props:{
      data: dictStore.getDict('PROJ_SCAL'),
      placeholder:'请选择工程规模',
      clearable:true
    },
    md: 12,
  },
  {
    label:'承雨面积(km)',
    prop: 'watShedArea',
    component: 'el-input',
    props:{
      placeholder:'请输入承雨面积',
    },
    md: 12,
  },
  {
    label:'坝址多年平均径流量',
    prop: 'daadMulAverRuof',
    component: 'el-input',
    props:{
      placeholder:'请输入坝址多年平均径流量',
    },
    md: 12,
  },
  {
    label:'集水面积(km²)',
    prop: 'catArea',
    component: 'el-input',
    props:{
      placeholder:'请输入集水面积',
    },
    md: 12,
  },
  {
    label:'实际灌溉面积(万亩)',
    prop: 'relIrrArea',
    component: 'el-input',
    props:{
      placeholder:'请输入实际灌溉面积',
    },
    md: 12,
  },
  {
    label:'设计洪水位(m)',
    prop: 'desFz',
    component: 'el-input',
    props:{
      placeholder:'请输入设计洪水位',
    },
    md: 12,
  },
  {
    label:'总库容',
    prop: 'totCap',
    component: 'el-input',
    props:{
      placeholder:'请输入总库容',
    },
    md: 12,
  },
  {
    label:'调洪库容',
    prop: 'storFlCap',
    component: 'el-input',
    props:{
      placeholder:'请输入调洪库容',
    },
    md: 12,
  },
  {
    label:'防洪库容',
    prop: 'flcoCap',
    component: 'el-input',
    props:{
      placeholder:'请输入防洪库容',
    },
    md: 12,
  },
  {
    label:'防洪高水位(m)',
    prop: 'uppLevFlco',
    component: 'el-input',
    props:{
      placeholder:'请输入防洪高水位',
    },
    md: 12,
  },
  {
    label:'正常蓄水位(m)',
    prop: 'normWatLev',
    component: 'el-input',
    props:{
      placeholder:'请输入正常蓄水位',
    },
    md: 12,
  },
  {
    label:'正常蓄水位相应水面面积(km²)',
    prop: 'normPoolStagArea',
    component: 'el-input',
    props:{
      placeholder:'请输入正常蓄水位相应水面面积',
    },
    md: 12,
  },
  {
    label:'正常蓄水位相应库容(km²)',
    prop: 'normPoolStagCap',
    component: 'el-input',
    props:{
      placeholder:'请输入正常蓄水位相应库容',
    },
    md: 12,
  },
  {
    label:'校核洪水位(m)',
    prop: 'cfZ',
    component: 'el-input',
    props:{
      placeholder:'请输入校核洪水位',
    },
    md: 12,
  },
  {
    label:'兴利库容(km²)',
    prop: 'benResCap',
    component: 'el-input',
    props:{
      placeholder:'请输入兴利库容',
    },
    md: 12,
  },
  {
    label:'防洪限制水位(m)',
    prop: 'flLowLimLev',
    component: 'el-input',
    props:{
      placeholder:'请输入防洪限制水位',
    },
    md: 12,
  },
  {
    label:'防洪限制水位库容(km²)',
    prop: 'flLowLimLevCap',
    component: 'el-input',
    props:{
      placeholder:'请输入防洪限制水位库容',
    },
    md: 12,
  },
  {
    label:'死水位(m)',
    prop: 'deadLev',
    component: 'el-input',
    props:{
      placeholder:'请输入死水位',
    },
    md: 12,
  },
  {
    label:'死库容(m)',
    prop: 'deadCap',
    component: 'el-input',
    props:{
      placeholder:'请输入死库容',
    },
    md: 12,
  },
  {
    label:'水库调节方式',
    prop: 'resRegTp',
    component: 'el-input',
    props:{
      placeholder:'请输入水库调节方式',
    },
    md: 12,
  },
  {
    label:'最小下泄流量(m³/s)',
    prop: 'minDisc',
    component: 'el-input',
    props:{
      placeholder:'请输入最小下泄流量',
    },
    md: 12,
  },
  {
    label:'发电引水口至尾水口河道长度(m)',
    prop: 'stEndLen',
    component: 'el-input',
    props:{
      placeholder:'请输入发电引水口至尾水口河道长度',
    },
    md: 12,
  },
  {
    label:'水库枢纽建筑物组成',
    prop: 'rhcc',
    component: 'el-input',
    props:{
      placeholder:'请输入水库枢纽建筑物组成',
    },
    md: 12,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'运行状况',
    prop: 'runCond',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('run_status'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择运行状况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'归属管理部门',
    prop: 'admDep',
    component: 'el-input',
    rules:[{ required: true, message: '请输入归属管理部门' }],
    props:{
      placeholder:'请输入归属管理部门',
    },
    md: 12,
  },
  {
    label:'供水范围',
    prop: 'wsReg',
    component: 'el-input',
    props:{
      placeholder:'请输入供水范围',
    },
    md: 12,
  },
  {
    label:'行政区划编码',
    prop: 'areaId',
    component: 'el-input',
    props:{
      placeholder:'请输入行政区划编码',
    },
    md: 12,
  },
  {
    label:'坝址控制流域面积(km²)',
    prop: 'daadArea',
    component: 'el-input',
    props:{
      placeholder:'请输入坝址控制流域面积',
    },
    md: 12,
  },
  {
    label:'主坝尺寸坝高(m)',
    prop: 'daadHigh',
    component: 'el-input',
    props:{
      placeholder:'请输入主坝尺寸坝高',
    },
    md: 12,
  },
  {
    label:'最大泄洪流量(m³/s)',
    prop: 'maxDisc',
    component: 'el-input',
    props:{
      placeholder:'请输入最大泄洪流量',
    },
    md: 12,
  },
  {
    label:'高程系统',
    prop: 'gcSt',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('ELEV_SYS'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请输入高程系统',
      clearable:true
    },
    md: 12,
  },
  {
    label:'坝顶高程(m)',
    prop: 'daadGc',
    component: 'el-input',
    props:{
      placeholder:'请输入坝顶高程',
    },
    md: 12,
  },
  {
    label:'设计洪水标准［重现期］（年）',
    prop: 'desY',
    component: 'el-input',
    props:{
      placeholder:'请输入设计洪水标准［重现期］（年）',
    },
    md: 12,
  },
  {
    label:'校核洪水标准［重现期］（年）',
    prop: 'cfY',
    component: 'el-input',
    props:{
      placeholder:'请输入校核洪水标准［重现期］（年）',
    },
    md: 12,
  },
  {
    label:'设计年供水量',
    prop: 'desWsY',
    component: 'el-input',
    props:{
      placeholder:'请输入设计年供水量',
    },
    md: 12,
  },
  {
    label:'设计灌溉面积（万亩）',
    prop: 'desIrrArea',
    component: 'el-input',
    props:{
      placeholder:'请输入设计灌溉面积',
    },
    md: 12,
  },
]));
const detailColumns = defineFormColumns([
  {
    label: '水库代码',
    prop: 'resCode',
    rules:[{ required: true, message: '请输入水库代码' }],
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入水库代码',
    },
    md: 12,
  },
  {
    label: '水库名称',
    prop: 'resName',
    rules:[{ required: true, message: '请输入水库名称' }],
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入水库名称',
    },
    md: 12,
  },
  {
    label: '左下角经度',
    prop: 'lowLeftLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入左下角经度' }],
    props:{
      disabled:true,
      placeholder:'请输入左下角经度',
    },
    md: 12,
  },
  {
    label: '左下角纬度',
    prop: 'lowLeftLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入左下角纬度' }],
    props:{
      disabled:true,
      placeholder:'请输入左下角纬度',
    },
    md: 12,
  },
  {
    label: '右上角经度',
    prop: 'eupRightLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入右上角经度' }],
    props:{
      disabled:true,
      placeholder:'请输入右上角经度',
    },
    md: 12,
  },
  {
    label: '右上角纬度',
    prop: 'upRightLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入右上角纬度' }],
    props:{
      disabled:true,
      placeholder:'请输入右上角纬度',
    },
    md: 12,
  },
  {
    label: '水库所在位置',
    prop: 'resLoc',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入水库所在位置',
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder:"请输入建成时间",
    },
    md: 12,
  },
  {
    label:'水库类型',
    prop: 'resType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择水库类型' }],
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('RES_TYPE'), // run_status.value
      placeholder:'请选择水库类型',
      clearable:true
    },
    md: 12,
  },
  {
    label:'工程等别',
    prop: 'engGrad',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择工程等别' }],
    props:{
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('ENG_GRAD'),
      placeholder:'请选择工程等别',
      clearable:true
    },
    md: 12,
  },
  {
    label:'工程规模',
    prop: 'engScal',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择工程规模' }],
    props:{
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('PROJ_SCAL'),
      placeholder:'请选择工程规模',
      clearable:true
    },
    md: 12,
  },
  {
    label:'承雨面积(km)',
    prop: 'watShedArea',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入承雨面积',
    },
    md: 12,
  },
  {
    label:'坝址多年平均径流量',
    prop: 'daadMulAverRuof',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入坝址多年平均径流量',
    },
    md: 12,
  },
  {
    label:'集水面积(km²)',
    prop: 'catArea',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入集水面积',
    },
    md: 12,
  },
  {
    label:'实际灌溉面积(万亩)',
    prop: 'relIrrArea',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入实际灌溉面积',
    },
    md: 12,
  },
  {
    label:'设计洪水位(m)',
    prop: 'desFz',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入设计洪水位',
    },
    md: 12,
  },
  {
    label:'总库容',
    prop: 'totCap',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入总库容',
    },
    md: 12,
  },
  {
    label:'调洪库容',
    prop: 'storFlCap',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入调洪库容',
    },
    md: 12,
  },
  {
    label:'防洪库容',
    prop: 'flcoCap',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入防洪库容',
    },
    md: 12,
  },
  {
    label:'防洪高水位(m)',
    prop: 'uppLevFlco',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入防洪高水位',
    },
    md: 12,
  },
  {
    label:'正常蓄水位(m)',
    prop: 'normWatLev',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入正常蓄水位',
    },
    md: 12,
  },
  {
    label:'正常蓄水位相应水面面积(km²)',
    prop: 'normPoolStagArea',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入正常蓄水位相应水面面积',
    },
    md: 12,
  },
  {
    label:'正常蓄水位相应库容(km²)',
    prop: 'normPoolStagCap',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入正常蓄水位相应库容',
    },
    md: 12,
  },
  {
    label:'校核洪水位(m)',
    prop: 'cfZ',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入校核洪水位',
    },
    md: 12,
  },
  {
    label:'兴利库容(km²)',
    prop: 'benResCap',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入兴利库容',
    },
    md: 12,
  },
  {
    label:'防洪限制水位(m)',
    prop: 'flLowLimLev',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入防洪限制水位',
    },
    md: 12,
  },
  {
    label:'防洪限制水位库容(km²)',
    prop: 'flLowLimLevCap',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入防洪限制水位库容',
    },
    md: 12,
  },
  {
    label:'死水位(m)',
    prop: 'deadLev',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入死水位',
    },
    md: 12,
  },
  {
    label:'死库容(m)',
    prop: 'deadCap',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入死库容',
    },
    md: 12,
  },
  {
    label:'水库调节方式',
    prop: 'resRegTp',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入水库调节方式',
    },
    md: 12,
  },
  {
    label:'最小下泄流量(m³/s)',
    prop: 'minDisc',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入最小下泄流量',
    },
    md: 12,
  },
  {
    label:'发电引水口至尾水口河道长度(m)',
    prop: 'stEndLen',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入发电引水口至尾水口河道长度',
    },
    md: 12,
  },
  {
    label:'水库枢纽建筑物组成',
    prop: 'rhcc',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入水库枢纽建筑物组成',
    },
    md: 12,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'运行状况',
    prop: 'runCond',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('run_status'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请选择运行状况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'归属管理部门',
    prop: 'admDep',
    component: 'el-input',
    rules:[{ required: true, message: '请输入归属管理部门' }],
    props:{
      disabled:true,
      placeholder:'请输入归属管理部门',
    },
    md: 12,
  },
  {
    label:'供水范围',
    prop: 'wsReg',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入供水范围',
    },
    md: 12,
  },
  {
    label:'行政区划编码',
    prop: 'areaId',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入行政区划编码',
    },
    md: 12,
  },
  {
    label:'坝址控制流域面积(km²)',
    prop: 'daadArea',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入坝址控制流域面积',
    },
    md: 12,
  },
  {
    label:'主坝尺寸坝高(m)',
    prop: 'daadHigh',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入主坝尺寸坝高',
    },
    md: 12,
  },
  {
    label:'最大泄洪流量(m³/s)',
    prop: 'maxDisc',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入最大泄洪流量',
    },
    md: 12,
  },
  {
    label:'高程系统',
    prop: 'gcSt',
    component: 'pro-select',
    props:{
      disabled:true,
      style:{width:'100%'},
      data:dictStore.getDict('ELEV_SYS'), // run_status.value
      config:{value: 'value', label: 'label'},
      placeholder:'请输入高程系统',
      clearable:true
    },
    md: 12,
  },
  {
    label:'坝顶高程(m)',
    prop: 'daadGc',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入坝顶高程',
    },
    md: 12,
  },
  {
    label:'设计洪水标准［重现期］（年）',
    prop: 'desY',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入设计洪水标准［重现期］（年）',
    },
    md: 12,
  },
  {
    label:'校核洪水标准［重现期］（年）',
    prop: 'cfY',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入校核洪水标准［重现期］（年）',
    },
    md: 12,
  },
  {
    label:'设计年供水量',
    prop: 'desWsY',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入设计年供水量',
    },
    md: 12,
  },
  {
    label:'设计灌溉面积（万亩）',
    prop: 'desIrrArea',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入设计灌溉面积',
    },
    md: 12,
  },
]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = {...row,resType:`${row.resType}`,engGrad:`${row.engGrad}`,engScal:`${row.engScal}`} || {};
  }else{
    form.value = {};
  }
  done();
});

onMounted(()=>{
  getData()
})

const getData = () => {
  getSk({...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value}).then(res=>{
    if(res.success){
      data.value = res.data.data;
      total.value = res.data.total;
    }
  })
}

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  getData();
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
}

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if(isValid){
    if(type == 'add'){
      addSk(form.value).then(res=>{
        if(res.success){
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    }else{
      updateSk(form.value.resCode,form.value).then(res=>{
        if(res.success){
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
  getData()
}


const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(()=>{
    delSk(row.resCode).then(res=>{
      if(res.success){
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
};

const exportData = () =>{
  proxy.download("business/base/resBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`水库基础数据_${new Date().getTime()}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.el-date-editor.el-input){
  width: 100%!important;
}
:deep(.el-select) {
  width: 100%!important;
}
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
  border-top: 1px solid #dcdfe6;
  .el-form-item__content{
    justify-content: end;
    margin-right: 40px;
  }
}
</style>