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
      <template #table-insiType="{ size, row, column, $index }">
        {{ formatterVal(row, 'INSI_TYPE', 'insiType') }}
      </template>
      <template #table-engStat="{ size, row, column, $index }">
        {{ formatterVal(row, 'ENG_STAT', 'engStat') }}
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
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
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import { formatterVal } from '@/utils';
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {addIntake, delIntake, exportIntakeExcel, getIntake, updateIntake} from "@/api/informationManager/basicData/intakeBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {addSiphon, delSiphon, getSiphon, updateSiphon} from "@/api/informationManager/basicData/siphonBasicData";
import {getCanList} from "@/api/informationManager/basicData/canalBasicData";
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
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
let channelList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '倒虹吸代码',
    prop: 'insiCode',
    component: 'el-input',
    props:{
      placeholder:'请输入倒虹吸代码',
    },
    form: true,
    search: true,
  },
  {
    label: '倒虹吸名称',
    prop: 'insiName',
    component: 'el-input',
    props:{
      placeholder:'请输入倒虹吸名称',
    },
    form: true,
    search: true,
  },
  {
    label: '经度',
    prop: 'startLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'startLat',
    search: false,
    form: true,
  },
  {
    label: '所在位置',
    prop: 'insiLoc',
    search: false,
    form: true,
    hide:true
  },
  {
    label: '类型',
    prop: 'insiType',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('INSI_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '过水能力(m/s)',
    prop: 'insiWatProp',
    search: false,
    form: true,
  },
  {
    label:'孔数',
    prop: 'orifNum',
    search: false,
    form: true,
  },
  // {
  //   label:'管道内径',
  //   prop: 'scalType',
  //   search: false,
  //   form: true,
  // },
  // {
  //   label:'管道净高',
  //   prop: 'pipeNetHeig',
  //   search: false,
  //   form: true,
  // },
  // {
  //   label:'管道净宽',
  //   prop: 'pipeNetWid',
  //   search: false,
  //   form: true,
  // },
  {
    label:'归属管理部门',
    prop: 'admDep',
    search: false,
    form: true,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    search: false,
    form: true,
  },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '倒虹吸代码',
    prop: 'insiCode',
    component: 'el-input',
    props:{
      disabled:!!(form.value?.insiCode),
      placeholder:'请输入倒虹吸代码',
    },
    rules:[{ required: true, message: '请输入倒虹吸代码' }],
    md: 12,
  },
  {
    label: '倒虹吸名称',
    prop: 'insiName',
    component: 'el-input',
    props:{
      placeholder:'请输入倒虹吸名称',
    },
    rules:[{ required: true, message: '请输入倒虹吸名称' }],
    md: 12,
  },
  {
    label: '起点经度',
    prop: 'startLong',
    component: 'el-input',
    props:{
      placeholder:'请输入起点经度',
    },
    md: 12,
  },
  {
    label: '起点纬度',
    prop: 'startLat',
    component: 'el-input',
    props:{
      placeholder:'请输入起点纬度',
    },
    md: 12,
  },
  {
    label: '终点经度',
    prop: 'endLong',
    component: 'el-input',
    props:{
      placeholder:'请输入终点经度',
    },
    md: 12,
  },
  {
    label: '终点纬度',
    prop: 'endLat',
    component: 'el-input',
    props:{
      placeholder:'请输入终点纬度',
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'insiLoc',
    component: 'el-input',
    props:{
      placeholder:'请输入所在位置',
    },
    md: 12,
  },
  {
    label: '所属渠道',
    prop: 'chanCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属渠道' }],
    props: {
      style:{width:'100%'},
      data: channelList.value,
      placeholder: '请选择所属渠道',
      clearable:true
    },
    md: 12,
  },
  {
    label: '倒虹吸类型',
    prop: 'insiType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择倒虹吸类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('INSI_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择倒虹吸类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '倒虹吸过水能力',
    prop: 'insiWatProp',
    component: 'el-input',
    props:{
      placeholder:'请输入倒虹吸过水能力',
    },
    md: 12,
  },
  {
    label:'基础结构型式',
    prop: 'baseStrPatt',
    component: 'el-input',
    props:{
      placeholder:'请输入基础结构型式',
    },
    md: 12,
  },
  {
    label:'孔数',
    prop: 'orifNum',
    component: 'el-input',
    props:{
      placeholder:'请输入孔数',
    },
    md: 12,
  },
  {
    label:'管道内径',
    prop: 'scalType',
    component: 'el-input',
    props:{
      placeholder:'请输入管道内径',
    },
    md: 12,
  },
  {
    label:'管道净高',
    prop: 'pipeNetHeig',
    component: 'el-input',
    props:{
      placeholder:'请输入管道净高',
    },
    md: 12,
  },
  {
    label:'管道净宽',
    prop: 'pipeNetWid',
    component: 'el-input',
    props:{
      placeholder:'请输入管道净宽',
    },
    md: 12,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'归属管理部门',
    prop: 'admDep',
    component: 'el-input',
    props:{
      placeholder:'请输入归属管理部门',
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder: "请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      placeholder: "请输入建成时间",
    },
    md: 12,
  },
  {
    label:'起始桩号',
    prop: 'startBnch',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
    },
    md: 12,
  },
  {
    label:'结束桩号',
    prop: 'endBnch',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
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
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '倒虹吸代码',
    prop: 'insiCode',
    component: 'el-input',
    props:{
      placeholder:'请输入倒虹吸代码',
    },
    rules:[{ required: true, message: '请输入倒虹吸代码' }],
    md: 12,
  },
  {
    label: '倒虹吸名称',
    prop: 'insiName',
    component: 'el-input',
    props:{
      placeholder:'请输入倒虹吸名称',
    },
    rules:[{ required: true, message: '请输入倒虹吸名称' }],
    md: 12,
  },
  {
    label: '起点经度',
    prop: 'startLong',
    component: 'el-input',
    props:{
      placeholder:'请输入起点经度',
    },
    md: 12,
  },
  {
    label: '起点纬度',
    prop: 'startLat',
    component: 'el-input',
    props:{
      placeholder:'请输入起点纬度',
    },
    md: 12,
  },
  {
    label: '终点经度',
    prop: 'endLong',
    component: 'el-input',
    props:{
      placeholder:'请输入终点经度',
    },
    md: 12,
  },
  {
    label: '终点纬度',
    prop: 'endLat',
    component: 'el-input',
    props:{
      placeholder:'请输入终点纬度',
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'insiLoc',
    component: 'el-input',
    props:{
      placeholder:'请输入所在位置',
    },
    md: 12,
  },
  {
    label: '所属渠道',
    prop: 'chanCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属渠道' }],
    props: {
      style:{width:'100%'},
      data: channelList.value,
      placeholder: '请选择所属渠道',
      clearable:true
    },
    md: 12,
  },
  {
    label: '倒虹吸类型',
    prop: 'insiType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择倒虹吸类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('INSI_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择倒虹吸类型',
      clearable:true
    },
    md: 12,
  },
  {
    label: '倒虹吸过水能力',
    prop: 'insiWatProp',
    component: 'el-input',
    props:{
      placeholder:'请输入倒虹吸过水能力',
    },
    md: 12,
  },
  {
    label:'基础结构型式',
    prop: 'baseStrPatt',
    component: 'el-input',
    props:{
      placeholder:'请输入基础结构型式',
    },
    md: 12,
  },
  {
    label:'孔数',
    prop: 'orifNum',
    component: 'el-input',
    props:{
      placeholder:'请输入孔数',
    },
    md: 12,
  },
  {
    label:'管道内径',
    prop: 'scalType',
    component: 'el-input',
    props:{
      placeholder:'请输入管道内径',
    },
    md: 12,
  },
  {
    label:'管道净高',
    prop: 'pipeNetHeig',
    component: 'el-input',
    props:{
      placeholder:'请输入管道净高',
    },
    md: 12,
  },
  {
    label:'管道净宽',
    prop: 'pipeNetWid',
    component: 'el-input',
    props:{
      placeholder:'请输入管道净宽',
    },
    md: 12,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'归属管理部门',
    prop: 'admDep',
    component: 'el-input',
    props:{
      placeholder:'请输入归属管理部门',
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder: "请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'compDate',
    component: 'el-input',
    props: {
      placeholder: "请输入建成时间",
    },
    md: 12,
  },
  {
    label:'起始桩号',
    prop: 'startBnch',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
    },
    md: 12,
  },
  {
    label:'结束桩号',
    prop: 'endBnch',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
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
].map(r=>({...r,props:{...r.props,disabled:true}}))));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  } else {
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
});

onMounted(() => {
  getData();
  getCanList().then(res=>{
    if(res.success){
      channelList.value = res.data.map(r=>({label:r.chanName,value:r.chanCode}));
    }
  })
})

const getData = () => {
  getSiphon({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  });
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
  if (isValid) {
    if (type == 'add'){
      addSiphon({...form.value}).then(res => {
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    }else{
      updateSiphon(form.value.insiCode, form.value).then(res => {
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
  done();
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
  }).then(() => {
    delSiphon(row.insiCode).then(res => {
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
  proxy.download("/business/base/insiBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`倒虹吸基础数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>