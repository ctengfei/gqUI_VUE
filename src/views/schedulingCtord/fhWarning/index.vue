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
        column="2"
        width="45%"
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
      <template #menu="{ size,row }">
        <el-button
            :size="size"
            type="success"
            link
            @click="handleClick(row)"
            icon="search"
        >
          详情
        </el-button>
      </template>
      <template #table-model="{ size, row, column, $index }">
        {{ formatterVal(row, 'FORECAST_MODEL', 'model') }}
      </template>
      <template #table-gatestatus="{ size, row, column, $index }">
        {{ formatterVal(row, 'GATE_STATUS', 'gatestatus') }}
      </template>
    </pro-crud>
    <el-dialog
        v-model="dialogVisible"
        title="结果数据"
        width="50%"
        class="f-dialog"
    >
      <subTable :currentRow="currentRow" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
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
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import  subTable from './compontents/subTable';
import {deleteFoc, getFlood} from "@/api/schedulingCtord/fhWarning";
let dialogVisible = ref(false);
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
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
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
let currentRow = ref({});
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '预报模型',
    prop: 'model',
    form: true,
    search: false,
  },
  {
    label: '输水隧洞状态',
    prop: 'gatestatus',
    form: true,
    search: false,
  },
  {
    label: '开始时间',
    prop: 'rainstarttime',
    search: false,
    form: true,
  },
  {
    label: '预报开始时间',
    prop: 'forecasttime',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'datetimerange',
      'start-placeholder':"开始时间",
      'end-placeholder':'结束时间',
      'range-separator':'-',
      'value-format':"YYYY-MM-DD HH:mm"
    },
    search: true,
    form: true,
  },
  {
    label: '预热期长度(天)',
    prop: 'warmup',
    search: false,
    form: true,
  },
  {
    label:'预见期(小时)',
    prop: 'forcastperiod',
    search: false,
    form: true,
  },
  {
    label:'未来降雨量(mm)',
    prop: 'drp',
    search: false,
    form: true,
  },

  {
    label:'保存时间',
    prop: 'createTime',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns();
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
  done()
});

const handleClick = (row) =>{
  currentRow.value = row;
  dialogVisible.value = true;
}

onMounted(() => {
  getData();

})

const getData = () => {
  getFlood({
    startTime:serachForm.value.forecasttime?serachForm.value.forecasttime[0]:'',
    endTime:serachForm.value.forecasttime?serachForm.value.forecasttime[1]:'',
    pageNum:currentPage.value,
    pageSize:pageSize.value
  }).then(res=>{
    if (res.success) {
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
  if (isValid) {
    if (type == 'add'){

    }else{

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
    deleteFoc(row.id).then(res=>{
      if (res.success) {
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    })
  })
};


</script>

<style scoped lang="scss">

</style>