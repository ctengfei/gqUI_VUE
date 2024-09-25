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
        width="30%"
        :expand="true"
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="100px"
        direction="vertical"
        @search="searchSubmit"
        :row-class-name="getRowClass"
        @search-reset="searchReset"
        row-key="id"
        :expand-row-keys="expandKeys"
        @submit="submit"
        @delete="deleteRow"
        @expand-change="expandChange"
    >
      <template #expand="{ row,column }">
        <div style="margin-left: 20px">
          <subTable v-if="row.mapType == 1" ref="sub" :currentRow="currentRow"/>
          <soilTable v-if="row.mapType == 2" ref="soil" :currentRow="currentRow" />
        </div>
      </template>
      <template #table-mapType="{ size, row, column, $index }">
        {{ formatterVal(row, 'remote_map_type', 'mapType') }}
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
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增
        </el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
        <el-button type="success" plain icon="Upload" @click="downloadTemp">下载模版</el-button>
      </template>
      <template #menu="{ size,row }">
        <el-button :size="size" type="success" link @click="handleRowAdd(row)"
                   v-if="row.mapType == 1 || row.mapType == 2">
          <el-icon>
            <Plus/>
          </el-icon>
          新增
        </el-button>
        <el-button :size="size" type="success" v-if="row.mapType == 1" link @click="uploadTemplate(row)">
          <el-icon>
            <Upload/>
          </el-icon>
          导入模版
        </el-button>
      </template>
    </pro-crud>
    <el-dialog
        v-model="dialogVisible1"
        title="新增"
        width="40%"
    >
      <el-form :model="cusForm" class="demo-form-inline" label-width="110px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="区域名称">
              <el-input style="width: 100%" v-model="cusForm.areaName" placeholder="请输入区域名称" clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="农作物种类">
              <el-input v-model="cusForm.crop" placeholder="请输入农作物种类" clearable/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="种植面积(k㎡)">
              <el-input v-model="cusForm.plantArea" placeholder="请输入种植面积(k㎡)" clearable/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确定</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </span>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogVisible2"
               title="导入模版"
               destroy-on-close
               width="40%">
      <el-upload
          drag
          :headers="headers"
          multiple
          limit="10"
          accept=".xlsx, .xls"
          :action="uploadFileUrl"
          :on-success="handleSuccess"
      >
        <el-icon class="el-icon--upload">
          <upload-filled/>
        </el-icon>
        <div class="el-upload__text">
          单击或拖动文件到此区域进行上传
        </div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleImportTempClose">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogVisible3" title="新增" width="40%">
      <pro-form
          v-model="resForm"
          :columns="resColumns"
          label-width="100px"
          :menu="menus"
          @submit="resSubmit"
          @reset="resReset"
      />
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
import {formatterVal} from '@/utils';
import subTable from './component/subTable';
import soilTable from './component/soilTable';
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import {Plus, Upload} from '@element-plus/icons-vue';
import dayjs from "dayjs";
import {
  addRemoteSenseMapPrimage,
  addSens,
  addSubSens,
  delSens,
  getSens,
  getSubSensList,
  updateSens
} from "@/api/informationManager/basicData/sensingMonitoring";
import {getToken} from "@/utils/auth";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: false,
  reset: false,
  width: '300',
  addProps: {
    type: 'primary',
    plain: true,
    icon: "Plus",
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
    icon: "Refresh",
  },
  searchProps: {
    type: 'primary',
    icon: "Search",
  },
  delText: '删除',
  editText: '修改',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
});
const menus = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: false,
  reset: true,
  width: '300',
  addProps: {
    type: 'primary',
    plain: true,
    icon: "Plus",
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
    icon: "Refresh",
  },
  searchProps: {
    type: 'primary',
    icon: "Search",
  },
  delText: '删除',
  editText: '修改',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '关闭',
});
const form = ref({});
const resForm = ref({});
const crudRef = ref();
const soil = ref();
const sub = ref();
const serachForm = ref({});
const cusForm = ref({areaId: '', areaName: '', crop: '', plantArea: '', remark: ''});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let expandKeys = ref([]);
let currentRow = ref({id: null});
let selectRow = ref(null);
const headers = ref({Authorization: "Bearer " + getToken()});
let uploadFileUrl = ref(); // 上传文件服务器地址
let dialogVisible1 = ref(false);
let dialogVisible2 = ref(false);
let dialogVisible3 = ref(false);
let options1 = ref([
  {label: '高', value: '1'},
  {label: '较高', value: '2'},
  {label: '中等', value: '3'},
  {label: '较低', value: '4'},
  {label: '低', value: '5'},
])
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([

  {
    label: '地图名称',
    prop: 'mapName',
    component: 'el-input',
    props: {
      placeholder: '请输入地图名称',
    },
    form: true,
    search: true,
  },
  {
    label: '类型',
    prop: 'mapType',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('remote_map_type'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择类型',
      clearable: true,
    },
    search: true,
    form: true,
  },
  {
    label: '地址',
    prop: 'mapUrl',
    search: false,
    form: true,
  },
  {
    label: '排序',
    prop: 'sort',
  },
]);
const formColumns = defineFormColumns([
  {
    label: '地图名称',
    prop: 'mapName',
    component: 'el-input',
    props: {
      placeholder: '请输入地图名称',
    },
    rules: [{required: true, message: '请输入地图名称'}],
    md: 24,
  },
  {
    label: '类型',
    prop: 'mapType',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('remote_map_type'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择类型',
      clearable: true,
      style: {
        width: '100%',
      }
    },
    rules: [{required: true, message: '请选择类型'}],
    md: 24,
  },
  {
    label: '地图地址',
    prop: 'mapUrl',
    component: 'el-input',
    props: {
      placeholder: '请输入地图地址',
    },
    rules: [{required: true, message: '请输入地图地址'}],
    md: 24,
  },
  {
    label: '排序',
    prop: 'sort',
    component: 'el-input-number',
    props: {
      placeholder: '请输入排序',
      style: {
        width: '70%',
      }
    },
    rules: [{required: true, message: '请输入排序'}],
    md: 24,
  },
]);
const resColumns = defineFormColumns(computed(() => [
  {
    label: '含水量等级',
    prop: 'primage',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      data: options1.value,
      config: {value: 'value', label: 'label'},
      placeholder: '请选择含水量等级',
      clearable: true
    },
    md: 12,
  },
  {
    label: '面积(km²)',
    prop: 'area',
    component: 'el-input-number',
    props: {
      style: {width: '100%'},
      placeholder: '请输入面积',
    },
    md: 12,
  },
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
    form.value = row || {};
  } else {
    form.value = {sort: 1};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
});

const getRowClass = ({row}) => {
  if (row.mapType == 1 || row.mapType == 2) {
    return 'row-expand-show'
  } else {
    return 'row-expand-hide'
  }
}

onMounted(() => {
  getData();
})

const getData = () => {
  getSens({...serachForm.value, pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
    if (type == 'add') {
      addSens({...form.value}).then(res => {
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
      updateSens(form.value.id, form.value).then(res => {
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
    delSens(row.id).then(res => {
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

const resSubmit = defineCrudSubmit((done, type, isValid, invalidFields) => {
  addRemoteSenseMapPrimage({...resForm.value, mapId: currentRow.value.id}).then(res => {
    if (res.success) {
      ElMessage({
        message: '添加成功',
        type: 'success',
      });
      soil.value.getData();
      dialogVisible3.value = false;
      resForm.value = {};
    }
  })
  done()
})

const resReset = () => {
  resForm.value = {};
  dialogVisible3.value = false;
}

const handleRowAdd = (row) => {
  currentRow.value = row;
  if (row.mapType == 1) {
    dialogVisible1.value = true;
  } else {
    dialogVisible3.value = true;
  }
}

const handleSubmit = () => {
  addSubSens({...cusForm.value, mapId: currentRow.value.id}).then(res => {
    if (res.success) {
      sub.value.getData();
      ElMessage({
        message: '添加成功',
        type: 'success',
      });
      dialogVisible1.value = false;
      cusForm.value = {};
    }
  })
}

const handleClose = () => {
  dialogVisible1.value = false;
  cusForm.value = {};
}

const handleImportTempClose = () => {
  dialogVisible2.value = false;
  sub.value.getData();
}

// 展开事件
const expandChange = (row, rows) => {
  const isExpend = rows.some(r => r.id === row.id) // 判断当前行展开状态
  currentRow.value = row;
  if (isExpend) {
    expandKeys.value.push(row.id);
  } else {
    expandKeys.value = expandKeys.value.filter(r => r != row.id)
    return
  }
}

// 导入模版
const uploadTemplate = (row) => {
  dialogVisible2.value = true;
  uploadFileUrl.value = `${import.meta.env.VITE_APP_BASE_API}/business/drought/remoteSenseMapPlantArea/importData?mapId=${row.id}`;
  currentRow.value = row;
}

const handleSuccess = (res) => {
  if (res.code == 200) {
    ElMessage({
      message: '上传成功',
      type: 'success',
    });
  } else {
    ElMessage({
      message: res.msg,
      type: 'error',
      duration: 7000,
      showClose: true
    });
  }
}

const downloadTemp = () => {
  proxy.download("/business/drought/remoteSenseMapPlantArea/importTemplate", {
    ...serachForm.value, pageNum: currentPage.value, pageSize: pageSize.value
  }, `模版.xlsx`);
}

const exportData = () => {
  proxy.download("/business/drought/remoteSense/page/export", {
    ...serachForm.value, pageNum: currentPage.value, pageSize: pageSize.value
  }, `遥感监测基础数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

</script>

<style scoped lang="scss">
:deep(.pro-form:not(.el-form--inline) .pro-form-menu) {
  display: flex;

  .el-form-item__content {
    justify-content: end;
    margin-right: 40px;
  }
}

:deep(.row-expand-show .el-table__expand-icon) {
  display: inline-block;
}

:deep(.row-expand-hide .el-table__expand-icon) {
  display: none;
}

:deep(.el-table__expanded-cell) {
  padding-top: 0 !important;
}
</style>