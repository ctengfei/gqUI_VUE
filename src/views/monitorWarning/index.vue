<template>
<div style="padding: 20px 20px; display: flex; flex-direction: column; overflow: auto; padding-bottom: 0">
  <div class="card-container">
    <div class="card-b">
      <li>
        <img src="@/assets/imgs/GaugingStation.png" />
        <span>水位站点监测个数</span>
        <h1>
          {{ pagination.total }}
          <span style="font-size: 20px">个</span>
        </h1>
      </li>
      <li>
        <img src="@/assets/imgs/EarlyWarning.png" />
        <span>超预警水位断面个数</span>
        <h1>
          {{ warnTotal }}
          <span style="font-size: 20px">个</span>
        </h1>
      </li>
    </div>
  </div>
</div>
<div class="app-container">
  <div class="tables">
    <div class="head-title">预警查看</div>
    <pro-crud ref="crudRef" v-model:search="searchForm" :columns="columns" :index="index" :menu="menu" :data="tableData"
      v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
      layout="->,total,sizes,prev, pager, next, jumper" @load="load" align="center" background
      :page-sizes="[10, 20, 30, 40, 50]" :total="pagination.total" label-width="100px" :column="1" :width="400"
      @search="searchSubmit" @search-reset="searchReset">
      <template #search-menu-right="{ size }">
        <!-- <el-button :size="size" @click="crudRef.closeDialog()">
            关闭
          </el-button> -->
        <el-button type="primary" plain icon="Setting" :size="size" @click="dialogVisible = true">参数设置</el-button>
      </template>
    </pro-crud>
  </div>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" class="runoff-dialog" width="60%">
    <!-- <div class="head-title">预警参数设置</div> -->
    <pro-crud ref="crudRef" v-model="form" :form-columns="formColumns" v-model:search="searchAlarmForm"
      :columns="alarmColumns" :index="index" :menu="alarmMenu" :data="tableAlarmData"
      v-model:current-page="alarmPagination.pageNum" v-model:page-size="alarmPagination.pageSize"
      layout="->,total,sizes,prev, pager, next, jumper" @load="loads" align="center" background
      :page-sizes="[10, 20, 30, 40, 50]" :total="alarmPagination.total" label-width="120px" :column="2" :gutter="20"
      :before-open="beforeOpen" :before-close="beforeClose" @search="alarmSubmit" @search-reset="alarmReset"
      @delete="deleteRow" @submit="submit">
      <template #search-menu-right="{ size }">
        <el-button :size="size" type="primary" icon="Plus" plain @click="crudRef.openDialog('add')"
          style="margin-left: 30px">新增</el-button>
      </template>
      <template #form-menu-right="{ size }">
        <el-button :size="size" @click="crudRef.closeDialog()">关闭</el-button>
      </template>
    </pro-crud>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</div>
</template>

<script setup>
import { nextTick, onMounted, ref, reactive, computed } from 'vue';
import { defineCrudColumns, defineCrudMenuColumns, defineCrudSubmit, defineCrudSearch, defineFormColumns, defineTableIndexColumns, defineCrudBeforeOpen, defineCrudBeforeClose } from 'element-pro-components';
import { getPatrolPlanApi, getPatrolProblem } from '../patrol/apis';
import { formatterVal } from '@/utils';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAlarmList, deleteAlarm, updateAlarm, addAlarm, getMonitorList } from './waringApi';
//表格实例
const crudRef = ref();
//表单搜索数据
const searchForm = ref({});
const searchAlarmForm = ref({});
//表格数据
let tableData = ref([]);
let tableAlarmData = ref([]);
//分页数据
let pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
let alarmPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
let title = ref('');
let nodeId = ref('');
let addSelect = ref(false);
let form = ref({});
let monitorList = ref([]);
let dialogTitle = ref('预警参数设置');
let dialogVisible = ref(false);
let warnTotal = ref();

//表格配置数据
const columns = defineCrudColumns([
  {
    label: '测站名称',
    prop: 'stnm',
    component: 'el-input',
    props: {
      placeholder: '请输入测站名称',
      clearable: true
    },
    search: true,
    detail: true
  },
  {
    label: '时间',
    prop: 'tm',
    detail: true
  },
  {
    label: '水深(m)',
    prop: 'waterDepth',
    detail: true
  },
  {
    label: '水位(m)',
    prop: 'currentWaterLevel',
    detail: true
  },
  {
    label: '预警水深值(m)',
    prop: 'alarmWaterDepth',
    detail: true
  },
  {
    label: '超预警水深',
    prop: 'difference',
    detail: true
  }
]);
//  预警参数  参数设置弹窗内功能配置
const alarmColumns = defineCrudColumns([
  {
    label: '测站名称',
    prop: 'stnm',
    component: 'el-input',
    width: '200px',
    props: {
      placeholder: '请输入测站名称'
    },
    search: true,
    form: true
  },
  {
    label: '渠底高程(m)',
    prop: 'elev'
  },
  {
    label: '渠道深度(m)',
    prop: 'depth'
  },
  {
    label: '预警百分比',
    prop: 'ratio'
  }
]);
// 测站操作
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: false,
  reset: false,
  del: false,
  edit: false,
  width: '200',
  searchResetProps: {
    icon: 'Refresh'
  },
  searchProps: {
    type: 'primary',
    icon: 'Search'
  },
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消'
});
//新增按钮内弹窗配置
const formColumns = defineFormColumns(
  computed(() => [
    {
      label: '测站名称',
      prop: 'stcd',
      component: 'pro-select',
      props: {
        clearable: true,
        disabled: addSelect.value,
        style: { width: '100%' },
        placeholder: '请输入测站名称',
        data: monitorList.value,
        config: { value: 'stCode', label: 'stName' }
      },
      rules: [{ required: true, message: '请输入测站名称' }],
      md: 12
    },
    {
      label: '渠底高程(m)',
      prop: 'elev',
      component: 'el-input-number',
      props: {
        min: 0,
        step: 0.01,
        placeholder: '请输入渠底高程'
      },
      rules: [{ required: true, message: '请输入渠底高程' }],
      md: 12
    },
    {
      label: '渠道深度(m)',
      prop: 'depth',
      component: 'el-input-number',
      props: {
        min: 0,
        step: 0.01,
        placeholder: '请输入渠道深度'
      },
      rules: [{ required: true, message: '请输入渠道深度' }],
      md: 12
    },
    {
      label: '预警百分比',
      prop: 'ratio',
      component: 'el-input-number',
      props: {
        min: 0,
        max: 1,
        step: 0.1,
        placeholder: '请输入预警百分比'
      },
      rules: [{ required: true, message: '请输入预警百分比' }],
      md: 12
    }
  ])
);
//告警操作按钮配置
const alarmMenu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: false,
  reset: false,
  del: true,
  width: '200',
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
  delProps: {
    link: true,
    type: 'danger',
    icon: 'Delete'
  },
  searchResetProps: {
    icon: 'Refresh'
  },
  searchProps: {
    type: 'primary',
    icon: 'Search'
  },
  delText: '删除',
  editText: '编辑',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消'
});
//序号
const index = defineTableIndexColumns({
  label: '序号',
  width: 50
});

//挂载完成之后获取表格数据
onMounted(() => {
  getMonitorList().then(res => {
    monitorList.value = res.data;
  });
  getDataList();
  getAlarmDataList();
  getAlarmList({
    pageNum: 1,
    pageSize: 500
  }).then(res => {
    if (res.success) {
      let temp = res.data.data.filter(item => item.difference !== 0);
      warnTotal.value = temp.length;
    }
  });
});
//获取表格数据

const getDataList = () => {
  getAlarmList({
    ...searchForm.value,
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize
  }).then(res => {
    tableData.value = res.data.data;
    pagination.total = res.data.total;
  });
};
const getAlarmDataList = () => {
  getAlarmList({
    ...searchForm.value,
    pageNum: alarmPagination.pageNum,
    pageSize: alarmPagination.pageSize
  }).then(res => {
    tableAlarmData.value = res.data.data;
    alarmPagination.total = res.data.total;
  });
};
// 分页选择
const load = () => {
  getDataList();
};
const loads = () => {
  getAlarmDataList();
};
//搜索
const searchSubmit = defineCrudSearch(done => {
  getDataList();
  done();
});
// 预警参数
const alarmSubmit = defineCrudSearch(done => {
  getAlarmDataList();
  done();
});
// 预警重置
const alarmReset = () => {
  alarmPagination.pageNum = 1;
  getAlarmDataList();
};
//弹窗开启之前
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
    addSelect.value = true;
    form.value = { ...row };
  } else {
    addSelect.value = false;
    form.value = {};
  }
  done();
});
const beforeClose = defineCrudBeforeClose(done => {
  form.value = {};
  done();
});
//重置
const searchReset = () => {
  pagination.pageNum = 1;
  getDataList();
};
const setNode = row => {
  nodeId.value = row.id;
};
//   预警参数删除
const deleteRow = row => {
  ElMessageBox.confirm(`是否确认删除数据项？`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteAlarm(row.stcd).then(res => {
      if (res.success) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        });
        getAlarmDataList();
        getDataList();
      }
    });
  });
};
// 新增或编辑
const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == 'add') {
      addAlarm({ ...form.value }).then(res => {
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success'
          });
          getAlarmDataList();
          getDataList();
          close();
        }
      });
    } else {
      updateAlarm(form.value.stcd, { ...form.value }).then(res => {
        if (res.success) {
          ElMessage({
            message: '修改成功',
            type: 'success'
          });
          getAlarmDataList();
          getDataList();
          close();
        }
      });
    }
  }
  done();
});
</script>

<style lang="scss" scoped>
.alarm {
  display: flex;

  .head-title {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .tables {
    margin: 0 10px;

    &:first-child {
      width: 60vw;
    }

    &:last-child {
      width: 40vw;
    }
  }
}

.app-container {
  min-height: calc(100% - 160px);
  margin-top: 0 !important;
}

:deep(.el-input-number) {
  width: 100%;
}

.card-container {
  margin-bottom: 10px;

  .card-b {
    display: flex;
    width: 100%;
    margin-top: 10px;

    li {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 100px;
      padding: 10px 20px;
      flex: 1;
      // background: #fff;
      background-image: url('@/assets/imgs/BGImg.png');
      &:first-child {
        margin-right: 10px;
      }

      span {
        color: rgb(0, 0, 0);
        font-size: 20px;
        margin-top: 30px;
        font-weight: bold;
      }

      h1 {
        margin-bottom: 0;
        margin-left: 10px;
        margin-top: 11px;
        font-size: 40px;
        font-weight: bold;
      }
    }
  }
}
</style>
