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
        label-width="160px"
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
      <template #table-tunnelGrade="{ size, row, column, $index }">
        {{ formatterVal(row, 'ENG_GRAD', 'tunnelGrade') }}
      </template>
      <template #table-tunnelType="{ size, row, column, $index }">
        {{ formatterVal(row, 'PIPE_SEC_TYPE', 'tunnelType') }}
      </template>
      <template #table-irrCode="{ size, row, column, $index }">
        {{ formatVal(row.irrCode) }}
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="160px"
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
import {getGqList} from "@/api/informationManager/basicData/gqBasicData";
import {addTunnel, delTunnel, getTunnel, updateTunnel} from "@/api/informationManager/basicData/tunnelBasicData";
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
let gqList = ref([]);
let channelList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '隧洞编码',
    prop: 'tunnelCode',
    component: 'el-input',
    props:{
      placeholder:'请输入隧洞编码',
    },
    form: true,
    search: true,
  },
  {
    label: '隧洞名称',
    prop: 'tunnelName',
    component: 'el-input',
    props:{
      placeholder:'请输入隧洞名称',
    },
    form: true,
    search: true,
  },
  {
    label: '经度',
    prop: 'longitude',
    search: false,
    form: true,
    hide:true
  },
  {
    label: '纬度',
    prop: 'latitude',
    search: false,
    form: true,
    hide:true
  },
  {
    label: '转弯弯曲半径(m)',
    prop: 'bendingRadius',
    search: false,
    form: true,
    hide:true
  },
  {
    label: '隧洞类型',
    prop: 'tunnelType',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('PIPE_SEC_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择隧洞类型',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'设计流量(m³/s)',
    prop: 'designFlux',
    search: false,
    form: true,
  },
  {
    label:'所在渠道终止桩号(m)',
    prop: 'endCoordinate',
    search: false,
    form: true,
  },
  {
    label:'进口高程(m)',
    prop: 'entranceAltitude',
    search: false,
    form: true,
  },
  {
    label:'所属灌区',
    prop: 'irrCode',
    component: 'pro-select',
    props:{
      data:gqList.value,
      config:{value: 'value', label: 'label'},
      placeholder:'请选择所属灌区',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'出口高程(m)',
    prop: 'outletAltitude',
    search: false,
    form: true,
  },
  {
    label:'所在渠道起始桩号(m)',
    prop: 'startCoordinate',
    search: false,
    form: true,
  },
  {
    label:'洞泾(m)',
    prop: 'tunnelDiameter',
    search: false,
    form: true,
  },
  {
    label:'工程等级',
    prop: 'tunnelGrade',
    search: false,
    form: true,
  },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '隧洞编码',
    prop: 'tunnelCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入隧洞编码' }],
    props:{
      placeholder:'请输入隧洞编码',
    },
    md: 12,
  },
  {
    label: '隧洞名称',
    prop: 'tunnelName',
    component: 'el-input',
    rules: [{required: true, message: '请输入隧洞名称'}],
    props: {
      placeholder: '请输入隧洞名称',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'longitude',
    component: 'el-input',
    props:{
      placeholder:'请输入经度',
    },
    md: 12,
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
    label: '转弯弯曲半径(m)',
    prop: 'bendingRadius',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入转弯弯曲半径',
    },
    md: 12,
  },
  {
    label: '长度(m)',
    prop: 'length',
    component: 'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder:'请输入长度',
    },
    md: 12,
  },
  {
    label: '结构形式',
    prop: 'style',
    component: 'el-input',
    props:{
      placeholder:'请输入结构形式',
    },
    md: 12,
  },
  {
    label: '隧洞类型',
    prop: 'tunnelType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择隧洞类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('PIPE_SEC_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择隧洞类型',
      clearable:true
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
    label:'设计流量(m³/s)',
    prop: 'designFlux',
    component: 'el-input',
    props:{
      placeholder:'请输入设计流量',
    },
    md: 12,
  },
  {
    label:'所在渠道起始桩号(m)',
    prop: 'startCoordinate',
    rules:[{ required: true, message: '请输入所在渠道起始桩号' }],
    component: 'el-input',
    props:{
      placeholder:'请输入所在渠道起始桩号',
    },
    md: 12,
  },
  {
    label:'所在渠道终止桩号(m)',
    prop: 'endCoordinate',
    rules:[{ required: true, message: '请输入所在渠道终止桩号' }],
    component: 'el-input',
    props:{
      placeholder:'请输入所在渠道终止桩号',
    },
    md: 12,
  },
  {
    label:'进口高程(m)',
    prop: 'entranceAltitude',
    component: 'el-input',
    props:{
      placeholder:'请输入进口高程',
    },
    md: 12,
  },
  {
    label:'所属灌区',
    prop: 'irrCode',
    component: 'pro-select',
    props:{
      style:{
        width:'100%'
      },
      data:gqList.value,
      config:{value: 'value', label: 'label'},
      placeholder:'请选择所属灌区',
      clearable:true
    },
    md: 12,
  },
  {
    label:'出口高程(m)',
    prop: 'outletAltitude',
    component: 'el-input',
    props:{
      placeholder:'请输入出口高程',
    },
    md: 12,
  },
  {
    label:'洞泾(m)',
    prop: 'tunnelDiameter',
    component: 'el-input',
    props:{
      placeholder:'请输入所洞泾',
    },
    md: 12,
  },
  {
    label:'工程等级',
    prop: 'tunnelGrade',
    component: 'pro-select',
    props: {
      style:{
        width:'100%'
      },
      data: dictStore.getDict('ENG_GRAD'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程等级',
      clearable:true
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
    label: '隧洞编码',
    prop: 'tunnelCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入隧洞编码' }],
    props:{
      placeholder:'请输入隧洞编码',
    },
    md: 12,
  },
  {
    label: '隧洞名称',
    prop: 'tunnelName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入隧洞名称' }],
    props:{
      placeholder:'请输入隧洞名称',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'longitude',
    component: 'el-input',
    props:{
      placeholder:'请输入经度',
    },
    md: 12,
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
    label: '转弯弯曲半径(m)',
    prop: 'bendingRadius',
    component: 'el-input',
    props:{
      placeholder:'请输入转弯弯曲半径',
    },
    md: 12,
  },
  {
    label: '隧洞类型',
    prop: 'tunnelType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择隧洞类型' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('PIPE_SEC_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择隧洞类型',
      clearable:true
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
    label:'设计流量(m³/s)',
    prop: 'designFlux',
    component: 'el-input',
    props:{
      placeholder:'请输入设计流量',
    },
    md: 12,
  },
  {
    label:'所在渠道终止桩号(m)',
    prop: 'endCoordinate',
    rules:[{ required: true, message: '请输入所在渠道终止桩号' }],
    component: 'el-input',
    props:{
      placeholder:'请输入所在渠道终止桩号',
    },
    md: 12,
  },
  {
    label:'进口高程(m)',
    prop: 'entranceAltitude',
    component: 'el-input',
    props:{
      placeholder:'请输入进口高程',
    },
    md: 12,
  },
  {
    label:'所属灌区',
    prop: 'irrCode',
    component: 'pro-select',
    props:{
      style:{
        width:'100%'
      },
      data:gqList.value,
      config:{value: 'value', label: 'label'},
      placeholder:'请选择所属灌区',
      clearable:true
    },
    md: 12,
  },
  {
    label:'出口高程(m)',
    prop: 'outletAltitude',
    component: 'el-input',
    props:{
      placeholder:'请输入出口高程',
    },
    md: 12,
  },
  {
    label:'所在渠道起始桩号(m)',
    prop: 'startCoordinate',
    rules:[{ required: true, message: '请输入所在渠道起始桩号' }],
    component: 'el-input',
    props:{
      placeholder:'请输入所在渠道起始桩号',
    },
    md: 12,
  },
  {
    label:'洞泾(m)',
    prop: 'tunnelDiameter',
    component: 'el-input',
    props:{
      placeholder:'请输入所洞泾',
    },
    md: 12,
  },
  {
    label:'工程等级',
    prop: 'tunnelGrade',
    component: 'pro-select',
    props: {
      style:{
        width:'100%'
      },
      data: dictStore.getDict('ENG_GRAD'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程等级',
      clearable:true
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

const formatVal = (row) =>{
  return row ? gqList.value.find(r=> r.value == row)?.label : ''
}

onMounted(() => {
  getData();
  getGqList().then(res=>{
    if(res.success){
      gqList.value = res.data.map((r)=>({label:r.irrName,value:r.irrCode}));
    }
  });
  getCanList().then(res=>{
    if(res.success){
      channelList.value = res.data.map(r=>({label:r.chanName,value:r.chanCode}));
    }
  })
})

const getData = () => {
  getTunnel({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      addTunnel({...form.value}).then(res => {
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
      updateTunnel(form.value.tunnelCode, form.value).then(res => {
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
    delTunnel(row.tunnelCode).then(res => {
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
  proxy.download("/business/attBase/tunnelBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`隧洞基础数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>