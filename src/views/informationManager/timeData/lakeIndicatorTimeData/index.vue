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
        :before-open="beforeOpen"
        :before-close="beforeClose"
        column="2"
        width="50%"
        align="center"
        label-width="220px"
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
      <template #table-rsvrtp="{ size, row, column, $index }">
        {{ formatterVal(row, 'RES_TYPE_SCAL', 'rsvrtp') }}
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
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import { formatterVal } from '@/utils';
import {ref, reactive, onMounted, computed} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {
  addLakeIndicator,
  deleteLakeIndicator,
  getLakeIndicator,
  getSkList,
  updateLakeIndicator
} from "@/api/informationManager/timeData/lakeIndicatorTimeData";
import useDictionaryStore from "@/store/modules/dictionary";
import {delDam} from "@/api/informationManager/basicData/damBasicData";
const dictStore = useDictionaryStore();
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del:true,
  edit:true,
  fixed:'right',
  addText: '新增',
  reset:false,
  detail:true,
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
const crudRef = ref();
const form = ref({});
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let skList = ref([]);
const { proxy } = getCurrentInstance();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '测站',
    prop: 'stcd',
    component: 'pro-select',
    props:{
      clearable:true,
      data:skList.value,
      placeholder:'请选择测站',
    },
    fixed:'left',
    form: true,
    search: true,
  },
  {
    label: '测站名称',
    prop: 'stName',
    component: 'el-input',
    props:{
      placeholder:'请输入测站名称',
    },
    fixed:'left',
    form: true,
    search: true,
  },
  {
    label: '水库类型',
    prop: 'rsvrtp',
    fixed:'left',
    search: false,
    form: true,
  },
  {
    label: '校核洪水位(m)',
    prop: 'ckflz',
    search: false,
    form: true,
  },
  {
    label: '设计洪水位(m)',
    prop: 'dsflz',
    search: false,
    form: true,
  },
  {
    label: '正常蓄水位(m)',
    prop: 'normz',
    search: false,
    form: true,
  },
  {
    label: '旱警水位(m)',
    prop: 'laz',
    component: 'el-input',
    search: false,
    form: true,
  },
  {
    label: '死水位(m)',
    prop: 'ddz',
    search: false,
    form: true,
  },
  {
    label: '兴利水位(m)',
    prop: 'actz',
    search: false,
    form: true,
    hide: true
  },
  {
    label: '总库容(亿m³)',
    prop: 'ttcp',
    search: false,
    form: true,
  },
  {
    label: '防洪库容(亿m³)',
    prop: 'fldcp',
    search: false,
    form: true,
  },
  {
    label: '兴利库容(亿m³)',
    prop: 'actcp',
    form: true,
    search: false,
  },
  {
    label: '死库容(亿m³)',
    prop: 'ddcp',
    search: false,
    form: true,
  },  
  {
    label: '坝顶高程(m)',
    prop: 'damel',
    search: false,
    form: true,
  },
  // {
  //   label: '数据时间',
  //   prop: 'modiTime',
  //   component: 'el-date-picker',
  //   fixed:'right',
  //   props: {
  //     type: 'datetimerange',
  //     'start-placeholder':"开始时间",
  //     'end-placeholder':'结束时间',
  //     'range-separator':'-',
  //     'value-format':"YYYY-MM-DD HH:mm:ss"
  //   },
  //   search: false,
  //   form: true,
  // },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '测站名称',
    prop: 'stcd',
    rules:[{ required: true, message: '请选择测站名称' }],
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:skList.value,
      placeholder:'请选择测站名称',
    },
    md:12
  },
  {
    label: '水库类型',
    prop: 'rsvrtp',
    fixed:'right',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data: dictStore.getDict('RES_TYPE_SCAL'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择水库类型',
      clearable:true
    },
    md:12
  },
  {
    label: '校核洪水位(m)',
    prop: 'ckflz',
    component: 'el-input',
    props:{
      placeholder:'请输入校核洪水位',
    },
    form: true,
    md:12,
  },
  {
    label: '设计洪水位(m)',
    prop: 'dsflz',
    component: 'el-input',
    props:{
      placeholder:'请输入设计洪水位',
    },
    form: true,
    md:12,
  },
  {
    label: '正常蓄水位(m)',
    prop: 'normz',
    component: 'el-input',
    props:{
      placeholder:'请输入正常蓄水位',
    },
    form: true,
    md:12,
  },
  {
    label: '旱警水位(m)',
    prop: 'laz',
    component: 'el-input',
    props:{
      placeholder:'请输入旱警水位',
    },
    form: true,
    md:12,
  },
  {
    label: '死水位(m)',
    prop: 'ddz',
    component: 'el-input',
    props:{
      placeholder:'请输入死水位',
    },
    form: true,
    md:12,
  },
  {
    label: '兴利水位(m)',
    prop: 'actz',
    component: 'el-input',
    props:{
      placeholder:'请输入兴利水位',
    },
    form: true,
    md:12,
  },
  {
    label: '总库容(亿m³)',
    prop: 'ttcp',
    fixed:'right',
    component: 'el-input',
    props:{
      placeholder:'请输入总库容',
    },
    form: true,
    md:12,
  },
  {
    label: '防洪库容(亿m³)',
    prop: 'fldcp',
    component: 'el-input',
    props:{
      placeholder:'请输入防洪库容',
    },
    form: true,
    md:12,
  },
  {
    label: '兴利库容(亿m³)',
    prop: 'actcp',
    component: 'el-input',
    props:{
      placeholder:'请输入兴利库容',
    },
    form: true,
    md:12,
  },
  {
    label: '死库容(亿m³)',
    prop: 'ddcp',
    component: 'el-input',
    props:{
      placeholder:'请输入死库容',
    },
    form: true,
    md:12,
  },  
  {
    label: '坝顶高程(m)',
    prop: 'damel',
    component: 'el-input',
    props:{
      placeholder:'请输入坝顶高程',
    },
    form: true,
    md:12,
  },
  {
    label: '历史最高库水位(m)',
    prop: 'hhrz',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最高库水位',
    },
    md:12
  },
  {
    label: '历史最高库水位(蓄水量)出现时间',
    prop: 'hhrztm',
    component: 'el-date-picker',
    props:{
      style:{width:'100%'},
      type:'date',
      placeholder:'请选择历史最高库水位(蓄水量)出现时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '历史最低库水位(m)',
    prop: 'hlrz',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最低库水位',
    },
    md:12
  },
  {
    label: '历史最低库水位出现时间',
    prop: 'hlrztm',
    component: 'el-date-picker',
    props:{
      style:{width:'100%'},
      type:'date',
      placeholder:'请选择历史最低库水位出现时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '历史最小日均入流(m³/s)',
    prop: 'hmxinq',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最小日均入流',
    },
    md:12
  },
  {
    label: '历史最大入流出现时间',
    prop: 'hmxinqtm',
    component: 'el-date-picker',
    props:{
      style:{width:'100%'},
      type:'date',
      placeholder:'请选择历史最大入流出现时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '历史最大出流(m³/s)',
    prop: 'hmxotq',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最大出流',
    },
    md:12
  },
  {
    label: '历史最大出流出现时间',
    prop: 'hmxotqtm',
    component: 'el-date-picker',
    props:{
      style:{width:'100%'},
      type:'date',
      placeholder:'请选择历史最大出流出现时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '历史最大蓄水量(亿m³)',
    prop: 'hmxw',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最大蓄水量',
    },
    md:12
  },
  {
    label: '历史最大入流时段长',
    prop: 'rstdr',
    fixed:'right',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最大入流时段长',
    },
    md:12
  },
  {
    label: '启动预报流量标准(m³/s)',
    prop: 'sfq',
    fixed:'right',
    component: 'el-input',
    props:{
      placeholder:'请输入启动预报流量标准',
    },
    md:12
  },
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '测站名称',
    prop: 'stcd',
    rules:[{ required: true, message: '请选择测站名称' }],
    component: 'pro-select',
    props:{
      clearable:true,
      style:{width:'100%'},
      data:skList.value,
      placeholder:'请选择测站名称',
    },
    md:12
  },
  {
    label: '水库类型',
    prop: 'rsvrtp',
    fixed:'right',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      data: dictStore.getDict('RES_TYPE_SCAL'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择水库类型',
      clearable:true
    },
    md:12
  },
  {
    label: '校核洪水位(m)',
    prop: 'ckflz',
    component: 'el-input',
    props:{
      placeholder:'请输入校核洪水位',
    },
    form: true,
    md:12,
  },
  {
    label: '设计洪水位(m)',
    prop: 'dsflz',
    component: 'el-input',
    props:{
      placeholder:'请输入设计洪水位',
    },
    form: true,
    md:12,
  },
  {
    label: '正常蓄水位(m)',
    prop: 'normz',
    component: 'el-input',
    props:{
      placeholder:'请输入正常蓄水位',
    },
    form: true,
    md:12,
  },
  {
    label: '旱警水位(m)',
    prop: 'laz',
    component: 'el-input',
    props:{
      placeholder:'请输入旱警水位',
    },
    form: true,
    md:12,
  },
  {
    label: '死水位(m)',
    prop: 'ddz',
    component: 'el-input',
    props:{
      placeholder:'请输入死水位',
    },
    form: true,
    md:12,
  },
  {
    label: '兴利水位(m)',
    prop: 'actz',
    component: 'el-input',
    props:{
      placeholder:'请输入兴利水位',
    },
    form: true,
    md:12,
  },
  {
    label: '总库容(亿m³)',
    prop: 'ttcp',
    fixed:'right',
    component: 'el-input',
    props:{
      placeholder:'请输入总库容',
    },
    form: true,
    md:12,
  },
  {
    label: '防洪库容(亿m³)',
    prop: 'fldcp',
    component: 'el-input',
    props:{
      placeholder:'请输入防洪库容',
    },
    form: true,
    md:12,
  },
  {
    label: '兴利库容(亿m³)',
    prop: 'actcp',
    component: 'el-input',
    props:{
      placeholder:'请输入兴利库容',
    },
    form: true,
    md:12,
  },
  {
    label: '死库容(亿m³)',
    prop: 'ddcp',
    component: 'el-input',
    props:{
      placeholder:'请输入死库容',
    },
    form: true,
    md:12,
  },  
  {
    label: '坝顶高程(m)',
    prop: 'damel',
    component: 'el-input',
    props:{
      placeholder:'请输入坝顶高程',
    },
    form: true,
    md:12,
  },
  {
    label: '历史最高库水位(m)',
    prop: 'hhrz',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最高库水位',
    },
    md:12
  },
  {
    label: '历史最高库水位(蓄水量)出现时间',
    prop: 'hhrztm',
    component: 'el-date-picker',
    props:{
      style:{width:'100%'},
      type:'date',
      placeholder:'请选择历史最高库水位(蓄水量)出现时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '历史最低库水位(m)',
    prop: 'hlrz',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最低库水位',
    },
    md:12
  },
  {
    label: '历史最低库水位出现时间',
    prop: 'hlrztm',
    component: 'el-date-picker',
    props:{
      style:{width:'100%'},
      type:'date',
      placeholder:'请选择历史最低库水位出现时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '历史最小日均入流(m³/s)',
    prop: 'hmxinq',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最小日均入流',
    },
    md:12
  },
  {
    label: '历史最大入流出现时间',
    prop: 'hmxinqtm',
    component: 'el-date-picker',
    props:{
      style:{width:'100%'},
      type:'date',
      placeholder:'请选择历史最大入流出现时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '历史最大出流(m³/s)',
    prop: 'hmxotq',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最大出流',
    },
    md:12
  },
  {
    label: '历史最大出流出现时间',
    prop: 'hmxotqtm',
    component: 'el-date-picker',
    props:{
      style:{width:'100%'},
      type:'date',
      placeholder:'请选择历史最大出流出现时间',
      'value-format':"YYYY-MM-DD"
    },
    md:12
  },
  {
    label: '历史最大蓄水量(亿m³)',
    prop: 'hmxw',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最大蓄水量',
    },
    md:12
  },
  {
    label: '历史最大入流时段长',
    prop: 'rstdr',
    fixed:'right',
    component: 'el-input',
    props:{
      placeholder:'请输入历史最大入流时段长',
    },
    md:12
  },
 
  {
    label: '启动预报流量标准(m³/s)',
    prop: 'sfq',
    fixed:'right',
    component: 'el-input',
    props:{
      placeholder:'请输入启动预报流量标准',
    },
    md:12
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
})


onMounted(() => {
  getData();
  getSkList({stType:'RR'}).then(res=>{
    if (res.success) {
      skList.value = res.data.map(r=>({label:r.stName,value:r.stCode}));
    }
  })
})

const getData = () => {
  getLakeIndicator({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    startTime:serachForm.value.modiTime ? serachForm.value.modiTime[0] : '',
    endTime:serachForm.value.modiTime ? serachForm.value.modiTime[1] : '',
    modiTime:null,
  }).then(res => {
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
      addLakeIndicator({...form.value}).then(res=>{
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
      updateLakeIndicator(form.value.stcd,{...form.value}).then(res=>{
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

const deleteRow = (row) =>{
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    deleteLakeIndicator(row.stcd).then(res => {
      if (res.success) {
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
}

const exportData = () => {
  proxy.download("/business/realData/rsvrfcchB/page/export", {
    ...serachForm.value,
    pageNum:currentPage.value,
    pageSize:pageSize.value,
    startTime:serachForm.value.modiTime ? serachForm.value.modiTime[0] : '',
    endTime:serachForm.value.modiTime ? serachForm.value.modiTime[1] : '',
    modiTime:null,
  },`库(湖)站防洪指标${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>