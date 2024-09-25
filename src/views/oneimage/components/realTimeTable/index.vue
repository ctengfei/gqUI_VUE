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
      layout="->,sizes,prev, pager, next, jumper"
      background
      border
      size="small"
      small
      height="150"
      :page-sizes="[10,20,30,40,50]"
      :total="total"
      @load="load"
      column="2"
      width="40%"
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
    <template #search-tm>
      <el-date-picker v-model="serachForm.tm"  clearable valueFormat="YYYY-MM-DD 00:00:00" type="daterange" />
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
import {ref, reactive, onMounted, defineProps, computed, watch, onUnmounted} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {getRes} from "@/api/informationManager/timeData/reservoirTimeData";
import {getRaine} from "@/api/informationManager/timeData/rainfallTimeData";
import {getWas} from "@/api/informationManager/timeData/gateStationTimeData";
import {getQuality} from "@/api/informationManager/timeData/waterQualityTimeData";
import {getChannel} from "@/api/informationManager/timeData/channelTimeData";
import {getWatercourse} from "@/api/informationManager/timeData/watercourseTimeData";
const props = defineProps(['currentRealTime'])
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed:'right',
  addText: '新增',
  detail:false,
  reset:false,
  del:false,
  edit:false,
  searchReset:false,
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
const serachForm = ref({tm:[dayjs().subtract(1, 'day').format('YYYY-MM-DD',),dayjs().format('YYYY-MM-DD')]});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>clos.value));
let clos = ref([]);
const formColumns = defineFormColumns([]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
    form.value = row || {};
  } else {
    form.value = {};
  }
  done();
});

watch(()=>props.currentRealTime,(c)=>{
  serachForm.value.tm = [dayjs().subtract(1, 'day').format('YYYY-MM-DD',),dayjs().format('YYYY-MM-DD')];
  if(c.type == 'RR'){
    clos.value = [
      {
        label: '库上水位(m)',
        prop: 'rz',
        form: true,
        search: false,
      },
      {
        label: '蓄水量(亿m³)',
        prop: 'w',
        form: true,
        search: false,
      },
      {
        label: '数据时间',
        prop: 'tm',
        search: true,
        form: true,
      },
    ];
  }else if(c.type == 'PPS'){
    clos.value = [
      {
        label: '时段降水量(mm)',
        prop: 'drp',
        search: false,
        form: true,
      },
      {
        label: '日降水量(mm)',
        prop: 'dyp',
        search: false,
        form: true,
      },
      {
        label: '数据时间',
        prop: 'tm',
        search: true,
        form: true,
      },
    ];
  }else if(c.type == 'DD'){
    clos.value = [
      {
        label: '闸上水位(m)',
        prop: 'upz',
        form: true,
        search: false,
      },
      {
        label: '总过闸流量(m³/s)',
        prop: 'tgtq',
        search: false,
        form: true,
      },
      {
        label: '数据时间',
        prop: 'tm',
        search: true,
        form: true,
      },
    ];
  }else if(c.type == 'WQ'){
    clos.value = [
      {
        label: '水温(℃)',
        prop: 'wt',
        search: false,
        form: true,
      },
      {
        label: 'PH值',
        prop: 'ph',
        search: false,
        form: true,
      },
      {
        label: '总磷(mg/L)',
        prop: 'tp',
        search: false,
        form: true,
      },
      {
        label: '溶解氧(mg/L)',
        prop: 'dox',
        search: false,
        form: true,
      },
      {
        label: '氨氮(mg/L)',
        prop: 'nh3n',
        search: false,
        form: true,
      },
      {
        label: '电导率(μS/cm)',
        prop: 'cond',
        search: false,
        form: true,
      },
      {
        label: '浊度(NTU)',
        prop: 'turb',
        search: false,
        form: true,
      },
      {
        label: '叶绿素(μg/L)',
        prop: 'chla',
        search: false,
        form: true,
      },
     
      {
        label: '数据时间',
        prop: 'tm',
        search: true,
        form: true,
      },
    ];
  }else if(c.type == 'ZQ' || c.type == 'ZZ'){
    clos.value = [
      {
        label: '水位(m)',
        prop: 'z',
        search: false,
        form: true,
      },
      {
        label: '流量(m³/s)',
        prop: 'q',
        search: false,
        form: true,
      },
      {
        label: '数据时间',
        prop: 'tm',
        search: true,
        form: true,
      },
    ];
  }
  getData();
})

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
});

onMounted(() => {

})

const getData = () => {
  if(props.currentRealTime.type == 'RR'){
    getRes({
      stcd:props.currentRealTime.stcd,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
      endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
      tm:null,
    }).then(res => {
      if (res.success) {
        data.value = res.data.data;
        total.value = res.data.total;
      }
    });
  }else if(props.currentRealTime.type == 'PPS'){
    getRaine({
      stcd:props.currentRealTime.stcd,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
      endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
      tm:null,
    }).then(res => {
      if (res.success) {
        data.value = res.data.data;
        total.value = res.data.total;
      }
    });
  }else if(props.currentRealTime.type == 'DD'){
    getWas({
      stcd:props.currentRealTime.stcd,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
      endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
      tm:null,
    }).then(res => {
      if (res.success) {
        data.value = res.data.data;
        total.value = res.data.total;
      }
    });
  }else if(props.currentRealTime.type == 'WQ'){
    getQuality({
      stcd:props.currentRealTime.stcd,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
      endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
      tm:null,
    }).then(res => {
      if (res.success) {
        data.value = res.data.data;
        total.value = res.data.total;
      }
    });
  }else if(props.currentRealTime.type == 'ZQ' || props.currentRealTime.type == 'ZZ'){
    getWatercourse({
      stcd:props.currentRealTime.stcd,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      startTime:serachForm.value.tm ? serachForm.value.tm[0] : '',
      endTime:serachForm.value.tm ? serachForm.value.tm[1] : '',
      tm:null,
    }).then(res => {
      if (res.success) {
        data.value = res.data.data;
        total.value = res.data.total;
      }
    });
  }

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
:deep(.pro-crud-menu+.pro-table){
  margin-top: 0;
}
</style>