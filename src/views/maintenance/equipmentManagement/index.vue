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
        width="40%"
        :expand="true"
        row-key="id"
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="155px"
        :row-class-name="getRowClass"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        @delete="deleteRow"
    >
      <template #table-status="{ size, row, column, $index }">
        {{ formatterVal(row, 'device_status', 'status') }}
      </template>
      <template #table-deviceType="{ size, row, column, $index }">
        {{ formatterVal(row, 'device_type', 'deviceType') }}
      </template>
      <template #table-attachment="{ size, row, column, $index }">
        <el-link v-for="file in JSON.parse(row.attachment)" type="primary">
          {{ file.name }}
        </el-link>
      </template>
      <!--      <template #expand="{ row,column }">-->
      <!--        <div style="margin-left: 20px">-->
      <!--          <li v-for="file in JSON.parse(row.attachment)" style="margin-bottom: 5px">-->
      <!--            <el-text type="primary">{{ file.name }}</el-text>-->
      <!--            <span style="margin-left: 100px">-->
      <!--              <el-link :size="size" type="success"  style="margin-right: 30px" @click="hanldePreview(file.url)">-->
      <!--              预览-->
      <!--              </el-link>-->
      <!--              <el-link :size="size" type="success"  @click="hanldeDownload(file.id,file.name)">-->
      <!--                下载-->
      <!--              </el-link>-->
      <!--            </span>-->
      <!--          </li>-->
      <!--        </div>-->
      <!--      </template>-->
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #search-menu-right="{ size }">
        <el-button :size="size" style="margin-left: 30px" type="primary" plain icon="Plus"
                   @click="crudRef.openDialog('add')">新增
        </el-button>
      </template>
      <template #menu="{ size,row }">
        <el-button :size="size" type="success" icon="Picture" link @click="hanldeCode(row)">
          二维码
        </el-button>
      </template>
      <template #form-admDep>
        <el-tree-select
                style="width: 100%"
                clearable
                v-model="form.admDep"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                default-expand-all
                placeholder="请选择管理单位"
                check-strictly
              />
      </template>
      <template #form-deviceLong>
        <el-input-number
            style="width:100%"
            v-model.number="form.deviceLong"
            :min="0"
            :max="180"
            placeholder='请输入经度'
            controls-position="right"
        />
      </template>
      <template #form-deviceLat>
        <el-input-number
            style="width:100%"
            v-model.number="form.deviceLat"
            :min="0"
            :max="90"
            placeholder='请输入纬度'
            controls-position="right"
        />
      </template>
      <template #form-deviceImg>
        <AlUpload v-model:fileList="fileList"/>
      </template>
      <template #table-admDep="{row}">{{ formatVal(row.admDep) }}</template>
      <template #form-attachment>
        <AlUpload v-model:fileList="attachmentsList"/>
      </template>
      <template #table-deviceImg="{size, row}">
        <el-image
            v-if="row.deviceImg && row.deviceImg.length"
            v-for="img in JSON.parse(row.deviceImg)"
            :src="`${baseUrl}${img.url}`"
            :preview-teleported="true"
            :preview-src-list="[`${baseUrl}${img.url}`]"
            style="width: 50px; height: 50px"
            fit="cover"
        />
        <span v-else>无图片</span>
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        >
          <template #form-deviceImg>
            <AlUpload v-model:fileList="fileList" :disabled="true"/>
          </template>
          <template #form-attachment>
            <AlUpload v-model:fileList="attachmentsList" :disabled="true"/>
          </template>
          <template #form-deviceLong>
            <el-input-number
                style="width:100%"
                v-model.number="form.deviceLong"
                :min="0"
                disabled
                :max="180"
                placeholder='请输入经度'
                controls-position="right"
            />
          </template>
          <template #form-deviceLat>
            <el-input-number
                style="width:100%"
                v-model.number="form.deviceLat"
                disabled
                :min="0"
                :max="90"
                placeholder='请输入纬度'
                controls-position="right"
            />
          </template>
        </pro-form>
      </template>
    </pro-crud>
  </div>
  <el-dialog
      v-model="dialogVisible"
      title="二维码"
      width="18%"
      :modal="false"
  >
    <img style="display: inline-block;width: 300px; height: 300px" :src=URL alt="">
    <div style="text-align: center"><span>设备编码：{{ currentRow.deviceCode }}</span></div>
  </el-dialog>
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
  defineCrudBeforeClose,
} from 'element-pro-components';
import {Plus} from '@element-plus/icons-vue';
import {ElMessage, ElMessageBox} from 'element-plus'
import {ref, reactive, onMounted, onBeforeMount, nextTick, computed} from "vue";
import {getType} from "@/api/system/dict/type";
import {addGq, getGq, updateGq, delGq, delAllGq, exportExcel} from "@/api/informationManager/basicData/gqBasicData";
import {useDict} from "@/utils/dict";
import useDictionaryStore from "@/store/modules/dictionary";
import {exportFlExcel} from "@/api/informationManager/basicData/floodBasicData";
import {addEquipment, createCode, delEquipment, getEquipment, updateEquipment} from "@/api/equipmentManagement";
import dayjs from "dayjs";
import {blobToBase64, treeToArray} from "@/utils";
import {getToken} from "@/utils/auth";
import {deptTreeSelect} from "@/api/system/user";
import {downloadFile, removeFile} from "@/api/tool/file";
import {addDocument} from "@/api/waterManager/waterEcoManager";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: true,
  reset: false,
  width: '290',
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
  detailText:'查看'
});
const detailMenu = defineCrudMenuColumns({
  submit:false,
  reset:true,
  resetText:'关闭'
});
const form = ref({deviceImg: '', attachment: ''});
const crudRef = ref();
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let URL = ref('');
let fileList = ref([]);
let attachmentsList = ref([]);
let dialogVisible = ref(false);
let deptOptions = ref([]); //部门数据
let currentRow = ref({});
const dictStore = useDictionaryStore();
const {proxy} = getCurrentInstance();
const columns = defineCrudColumns([
  {
    label: '设备编码',
    prop: 'deviceCode',
    component: 'el-input',
    props: {
      placeholder: '请输入设备编码',
    },
    form: true,
    search: true,
  },
  {
    label: '设备名称',
    prop: 'deviceName',
    component: 'el-input',
    props: {
      placeholder: '请输入设备名称',
    },
    form: true,
    search: true,
  },
  {
    label: '生产厂家',
    prop: 'deviceFactory',
    search: false,
    form: true,
  },
  {
    label: '经度',
    prop: 'deviceLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'deviceLat',
    search: false,
    form: true,
  },
  {
    label: '设备位置',
    prop: 'deviceLoc',
    search: false,
    form: true,
  },
  {
    label: '设备型号',
    prop: 'deviceModel',
    search: false,
    form: true,
  },
  {
    label: '设备参数',
    prop: 'deviceParameter',
    search: false,
    form: true,
  },
  {
    label: '生产日期',
    prop: 'deviceDate',
    search: false,
    form: true,
    width: '99'
  },
  {
    label: '厂家电话',
    prop: 'devicePhone',
    search: false,
    form: true,
  },
  {
    label: '设备类型',
    prop: 'deviceType',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('device_type'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择设备类型',
      clearable: true
    },
    search: true,
    form: true,
  },
  {
    label: '设备图片',
    prop: 'deviceImg',
    search: false,
    form: true,
  },
  {
    label: '安装时间',
    prop: 'installDate',
    search: false,
    form: true,
  },
  {
    label: '设备状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('device_status'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择设备状态',
      clearable: true
    },
    search: true,
    form: true,
  },
  {
    label: '管理单位',
    prop: 'admDep',
    form: true,
    fixed: 'right'
  },
]);
const formColumns = defineFormColumns(computed(() => [
  {
    label: '设备编码',
    prop: 'deviceCode',
    component: 'el-input',
    rules: [{required: true, message: '请输入设备编码'}],
    props: {
      placeholder: '请输入设备编码',
    },
    md: 12,
  },
  {
    label: '设备名称',
    prop: 'deviceName',
    component: 'el-input',
    rules: [{required: true, message: '请输入设备名称'}],
    props: {
      placeholder: '请输入设备名称',
    },
    md: 12,
  },
  {
    label: '生产厂家',
    prop: 'deviceFactory',
    component: 'el-input',
    props: {
      placeholder: '请输入生产厂家',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'deviceLong',
    md: 12,
  },
  {
    label: '纬度',
    prop: 'deviceLat',
    md: 12,
  },
  {
    label: '设备位置',
    prop: 'deviceLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入设备位置',
    },
    md: 12,
  },
  {
    label: '设备型号',
    prop: 'deviceModel',
    rules: [{required: true, message: '请输入设备型号'}],
    component: 'el-input',
    props: {
      placeholder: '请输入设备型号',
    },
    md: 12,
  },
  {
    label: '设备参数',
    prop: 'deviceParameter',
    component: 'el-input',
    props: {
      placeholder: '请输入设备参数',
    },
    md: 12,
  },
  {
    label: '生产日期',
    prop: 'deviceDate',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'date',
      placeholder: "生产日期",
      'value-format': "YYYY-MM-DD"
    },
    md: 12,
  },
  {
    label: '厂家电话',
    prop: 'devicePhone',
    component: 'el-input',
    props: {
      placeholder: '请输入厂家电话',
    },
    md: 12,
  },
  {
    label: '设备类型',
    prop: 'deviceType',
    rules: [{required: true, message: '请选择设备类型'}],
    component: 'pro-select',
    props: {
      data: dictStore.getDict('device_type'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择设备类型',
      clearable: true
    },
    md: 12,
  },
  {
    label: '安装时间',
    prop: 'installDate',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'date',
      placeholder: "安装时间",
      'value-format': "YYYY-MM-DD"
    },
    md: 12,
  },
  {
    label: '设备状态',
    prop: 'status',
    component: 'pro-select',
    rules: [{required: true, message: '请输入设备状态'}],
    props: {
      data: dictStore.getDict('device_status'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择设备状态',
      clearable: true
    },
    md: 12,
  },
  {
    label: '管理单位',
    prop: 'admDep',
    component: 'el-tree-select',
    props: {
      data: deptOptions.value,
      'default-expand-all': true,
      checkStrictly: true,
      clearable:true,
      style: {width: '100%'},
      placeholder: '请选择管理单位',
    },
    md: 12
  },
  {
    label: '设备图片',
    prop: 'deviceImg',
    md: 24,
  },
  {
    label: '设备附件',
    prop: 'attachment',
    md: 24,
  }
]));
const detailColumns = defineFormColumns(computed(() => [
  {
    label: '设备编码',
    prop: 'deviceCode',
    component: 'el-input',
    rules: [{required: true, message: '请输入设备编码'}],
    props: {
      placeholder: '请输入设备编码',
    },
    md: 12,
  },
  {
    label: '设备名称',
    prop: 'deviceName',
    component: 'el-input',
    rules: [{required: true, message: '请输入设备名称'}],
    props: {
      placeholder: '请输入设备名称',
    },
    md: 12,
  },
  {
    label: '生产厂家',
    prop: 'deviceFactory',
    component: 'el-input',
    props: {
      placeholder: '请输入生产厂家',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'deviceLong',
    md: 12,
  },
  {
    label: '纬度',
    prop: 'deviceLat',
    md: 12,
  },
  {
    label: '设备位置',
    prop: 'deviceLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入设备位置',
    },
    md: 12,
  },
  {
    label: '设备型号',
    prop: 'deviceModel',
    rules: [{required: true, message: '请输入设备型号'}],
    component: 'el-input',
    props: {
      placeholder: '请输入设备型号',
    },
    md: 12,
  },
  {
    label: '设备参数',
    prop: 'deviceParameter',
    component: 'el-input',
    props: {
      placeholder: '请输入设备参数',
    },
    md: 12,
  },
  {
    label: '生产日期',
    prop: 'deviceDate',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'date',
      placeholder: "生产日期",
      'value-format': "YYYY-MM-DD"
    },
    md: 12,
  },
  {
    label: '厂家电话',
    prop: 'devicePhone',
    component: 'el-input',
    props: {
      placeholder: '请输入厂家电话',
    },
    md: 12,
  },
  {
    label: '设备类型',
    prop: 'deviceType',
    rules: [{required: true, message: '请选择设备类型'}],
    component: 'pro-select',
    props: {
      data: dictStore.getDict('device_type'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择设备类型',
      clearable: true
    },
    md: 12,
  },
  {
    label: '安装时间',
    prop: 'installDate',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'date',
      placeholder: "安装时间",
      'value-format': "YYYY-MM-DD"
    },
    md: 12,
  },
  {
    label: '设备状态',
    prop: 'status',
    component: 'pro-select',
    rules: [{required: true, message: '请输入设备状态'}],
    props: {
      data: dictStore.getDict('device_status'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择设备状态',
      clearable: true
    },
    md: 12,
  },
  {
    label: '管理单位',
    prop: 'admDep',
    component: 'el-tree-select',
    props: {
      data: deptOptions.value,
      'default-expand-all': true,
      checkStrictly: true,
      clearable:true,
      style: {width: '100%'},
      placeholder: '请选择管理单位',
    },
    md: 12
  },
  {
    label: '设备图片',
    prop: 'deviceImg',
    md: 24,
  },
  {
    label: '设备附件',
    prop: 'attachment',
    md: 24,
  }
].map(r=>({...r,props:{...r.props,disabled:true}}))));
const baseUrl = import.meta.env.VITE_FILE_URL;
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.deviceImg
    attachmentsList.value = row.attachment
    form.value = {...row} || {};
  } else {
    attachmentsList.value = [];
    fileList.value = [];
    form.value = {};
  }
  done();
});
const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

const formatVal = (row) => {
  return row ? treeToArray(deptOptions.value).find(r => r.id == row)?.label : ''
}

const getRowClass = ({row}) => {
  if (row.attachment) {
    return 'row-expand-show'
  } else {
    return 'row-expand-hide'
  }
}

function formatterVal(row, DIC, key) {
  const types = dictStore.getDict(DIC);
  const type = types.find(r => r.value == row[key]);
  return type ? type.label : '-';
}

onMounted(() => {
  getDeptTree();
  getData()
})

const getData = () => {
  getEquipment({...serachForm.value, pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
    if (type == 'add') {
      addEquipment({
        ...form.value,
        deviceImg: JSON.stringify(fileList.value),
        attachment: JSON.stringify(attachmentsList.value)
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
      updateEquipment(form.value.id, {
        ...form.value,
        deviceImg: JSON.stringify(fileList.value),
        attachment: JSON.stringify(attachmentsList.value)
      }).then(res => {
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
  getData()
}

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    delEquipment(row.id).then(res => {
      if (res.success) {
        getData();
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
};

const exportData = () => {
  proxy.download("/business/attBase/deviceBase/page/export", {
    ...serachForm.value, pageNum: currentPage.value, pageSize: pageSize.value
  }, `设备管理数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

const hanldeCode = (row) => {
  currentRow.value = row;
  createCode(row.id).then(res => {
    let blob = new Blob([res], {type: "image/png"});
    dialogVisible.value = true;
    blobToBase64(blob).then(res => {
      URL.value = res
    })
  })
}

//查询部门下拉树结构
const getDeptTree = () => {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data;
  });
};
</script>

<style scoped lang="scss">
li {
  list-style-type: none;
}

li:last-child {
  margin-bottom: 0 !important;
}

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