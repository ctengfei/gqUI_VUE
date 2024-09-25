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
        class="custom-curd"
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
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增
        </el-button>
      </template>
      <template #table-dangerType="{row}">
        <span>{{ formatterVal(row, 'danger_category', 'dangerType') }}</span>
      </template>
      <template #table-status="{row}">
        <span>{{ formatterVal(row, 'reporting_status', 'status') }}</span>
      </template>
      <template #table-projectId="{ size, row, column, $index }">
        {{ formatValName(row.projectId) }}
      </template>
      <template #table-responsibleUnit="{row}">
        <span>{{ formatVal(row.responsibleUnit) }}</span>
      </template>
      <template #table-severity="{row}">
        <span>{{ formatterVal(row, 'severity_select', 'severity') }}</span>
      </template>
      <template #form-dangerousPhotos>
        <AlUpload v-model:fileList="dangerousPhotos"
                  accept=".png,.jpg,.jpeg"/>
      </template>
      <template #form-dangerousReport>
        <AlUpload v-model:fileList="dangerousReport"
                  accept=".pdf,.xlsx,.xls,.doc,.docx,.txt"/>
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        >
          <template #form-dangerousPhotos>
            <AlUpload v-model:fileList="dangerousPhotos"
                      :disabled="true"
                      accept=".png,.jpg,.jpeg"
            />
          </template>
          <template #form-dangerousReport>
            <AlUpload v-model:fileList="dangerousReport"
                      :disabled="true"
                      accept=".pdf,.xlsx,.xls,.doc,.docx,.txt"
            />
          </template>
        </pro-form>
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
import {deptTreeSelect} from "@/api/system/user";
import {getToken} from "@/utils/auth";
import {downloadFile, removeFile} from "@/api/tool/file";
import {getProjectList} from "@/api/informationManager/projectManagement";
import {getEmeList} from "@/api/secureManager/emergencyManager/emePlanManagement";
import {
  addRepDanger,
  delRepDanger,
  getRepDanger,
  getTeams,
  updateRepDanger
} from "@/api/secureManager/drought/reportRiskManagement";

const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
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
    icon: "Plus",
  },
  editProps: {
    link: true,
    type: 'primary',
    icon: 'Edit'
  },
  detailProps: {
    link: true,
    type: 'primary',
    icon: 'View'
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
  detailText: '查看'
});
const detailMenu = defineCrudMenuColumns({
  submit: false,
  reset: true,
  resetText: '关闭'
});
const form = ref({});
const serachForm = ref({});
const crudRef = ref();
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let emeList = ref([]);
let dangerousReport = ref([]);
let dangerousPhotos = ref([]);
let projectList = ref([]);
let fileList = ref([]);
let teamList = ref([]);
let department = ref([]);
let personsId = ref([]); // 根据Id查人员列表
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(() => [
  {
    label: '出险时间',
    prop: 'dangerTime',
    component: 'el-date-picker',
    props: {
      clearable: true,
      type: 'datetimerange',
      'start-placeholder': "开始时间",
      'end-placeholder': '结束时间',
      'value-format': "YYYY-MM-DD HH:mm:ss"
    },
    search: true,
  },
  {
    label: '所属工程',
    prop: 'projectId',
    component: 'pro-select',
    props: {
      clearable: true,
      style: {width: '100%'},
      data: projectList.value,
      placeholder: '请选择所属工程',
    },
    search: true,
  },
  {
    label: '险情所在部位',
    prop: 'positionId',
  },
  {
    label: '险情类别',
    prop: 'dangerType',
    component: 'pro-select',
    props: {
      clearable: true,
      style: {width: '100%'},
      data: dictStore.getDict('danger_category'),
      placeholder: '请选择险情类别',
    },
    search: true,
  },
  {
    label: '严重程度',
    prop: 'severity',
  },
  {
    label: '责任单位',
    prop: 'responsibleUnit',
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      clearable: true,
      style: {width: '100%'},
      data: dictStore.getDict('reporting_status'),
      placeholder: '请选择状态',
    },
    search: true,
  },
  {
    label: '备注',
    prop: 'remark',
  }
]));
const formColumns = defineFormColumns(computed(() => [
  {
    label: '出险时间',
    prop: 'dangerTime',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择出险时间'}],
    props: {
      clearable: true,
      type: 'datetime',
      style: {width: '100%'},
      placeholder: '请选择出险时间',
      'value-format': "YYYY-MM-DD HH:mm:ss"
    },
    md: 12
  },
  {
    label: '所属工程',
    prop: 'projectId',
    component: 'pro-select',
    props: {
      clearable: true,
      style: {width: '100%'},
      data: projectList.value,
      placeholder: '请选择所属工程',
    },
    md: 12
  },
  {
    label: '险情所在部位',
    prop: 'positionId',
    component: 'el-input',
    props: {
      placeholder: '请输入险情所在部位',
    },
    md: 12
  },
  {
    label: '位置',
    prop: 'location',
    component: 'el-input',
    props: {
      placeholder: '请输入位置',
    },
    md: 12
  },
  {
    label: '经度',
    prop: 'longitude',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',

    },
    md: 12
  },
  {
    label: '纬度',
    prop: 'latitude',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    md: 12
  },
  {
    label: '险情类别',
    prop: 'dangerType',
    component: 'pro-select',
    props: {
      clearable: true,
      data: dictStore.getDict('danger_category'),
      style: {width: '100%'},
      placeholder: '请选择险情类别',
    },
    md: 12
  },
  {
    label: '上报时间',
    prop: 'reportTime',
    component: 'el-date-picker',
    props: {
      clearable: true,
      type: 'datetime',
      style: {width: '100%'},
      'value-format': "YYYY-MM-DD HH:mm:ss",
      placeholder: '请选择上报时间',
    },
    md: 12
  },
  {
    label: '开始桩号',
    prop: 'startStationNum',
    component: 'el-input',
    props: {
      placeholder: '请输入开始桩号',
    },
    md: 12
  },
  {
    label: '结束桩号',
    prop: 'endStationNum',
    component: 'el-input',
    props: {
      placeholder: '请输入结束桩号',
    },
    md: 12
  },
  {
    label: '渠道、水库水位(m)',
    prop: 'waterLevel',
    component: 'el-input',
    props: {
      placeholder: '请输入水位',
    },
    md: 12
  },
  {
    label: '报险人',
    prop: 'reportBy',
    component: 'el-input',
    props: {
      placeholder: '请输入报险人',
    },
    md: 12
  },
  {
    label: '责任单位',
    prop: 'responsibleUnit',
    component: 'el-tree-select',
    props: {
      data: department.value,
      style: {width: '100%'},
      clearable: true,
      checkStrictly: true,
      'default-expand-all': true,
      placeholder: '请输入责任单位',
    },
    md: 12
  },
  {
    label: '责任人',
    prop: 'responsiblePerson',
    component: 'el-input',
    props: {
      placeholder: '请输入责任人',
    },
    md: 12
  },
  {
    label: '严重程度',
    prop: 'severity',
    component: 'pro-select',
    props: {
      clearable: true,
      data: dictStore.getDict('severity_select'),
      style: {width: '100%'},
      placeholder: '请选择严重程度',
    },
    md: 12
  },
  {
    label: '抢险队伍',
    prop: 'teamNames',
    component: 'pro-select',
    props: {
      clearable: true,
      style: {width: '100%'},
      data: teamList.value,
      multiple: true,
      placeholder: '请选择抢险队伍',
    },
    md: 12
  },
  {
    label: '抢险救灾人数',
    prop: 'teamNum',
    component: 'el-input',
    props: {
      placeholder: '请输入抢险救灾人数',
    },
    md: 12
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      clearable: true,
      style: {width: '100%'},
      data: dictStore.getDict('reporting_status'),
      placeholder: '请选择状态',
    },
    md: 12
  },
  {
    label: '险情现状',
    prop: 'dangerousSituation',
    component: 'el-input',
    props: {
      clearable: true,
      placeholder: '请输入险情现状',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md: 24
  },
  {
    label: '发展趋势',
    prop: 'developmentTrend',
    component: 'el-input',
    props: {
      placeholder: '请输入发展趋势',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md: 24
  },
  {
    label: '出险原因',
    prop: 'accidentCause',
    component: 'el-input',
    props: {
      placeholder: '请输入出险原因',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md: 24
  },
  {
    label: '处理建议',
    prop: 'handlingSuggestions',
    component: 'el-input',
    props: {
      placeholder: '请输入处理建议',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md: 24
  },
  {
    label: '遗留问题',
    prop: 'remainingProblems',
    component: 'el-input',
    props: {
      placeholder: '请输入遗留问题',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md: 24
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      placeholder: '请输入备注',
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md: 24
  },
  {
    label: '险情照片',
    prop: 'dangerousPhotos',
    md: 24
  },
  {
    label: '险情报告文件',
    prop: 'dangerousReport',
    md: 24
  }
]));
const detailColumns = defineFormColumns(computed(() => [
  {
    label: '出险时间',
    prop: 'dangerTime',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择出险时间'}],
    props: {
      clearable: true,
      disabled: true,
      type: 'datetime',
      style: {width: '100%'},
      placeholder: '请选择出险时间',
      'value-format': "YYYY-MM-DD HH:mm:ss"
    },
    md: 12
  },
  {
    label: '所属工程',
    prop: 'projectId',
    component: 'pro-select',
    props: {
      disabled: true,
      style: {width: '100%'},
      data: projectList.value,
      placeholder: '请选择所属工程',
    },
    md: 12
  },
  {
    label: '险情所在部位',
    prop: 'positionId',
    component: 'el-input',
    props: {
      disabled: true,
      placeholder: '请输入险情所在部位',
    },
    md: 12
  },
  {
    label: '位置',
    prop: 'location',
    component: 'el-input',
    props: {
      disabled: true,
      placeholder: '请输入位置',
    },
    md: 12
  },
  {
    label: '经度',
    prop: 'longitude',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
      disabled: true,
    },
    md: 12
  },
  {
    label: '纬度',
    prop: 'latitude',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
      disabled: true,
    },
    md: 12
  },
  {
    label: '险情类别',
    prop: 'dangerType',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('danger_category'),
      style: {width: '100%'},
      placeholder: '请选择险情类别',
      disabled: true,
    },
    md: 12
  },
  {
    label: '上报时间',
    prop: 'reportTime',
    component: 'el-date-picker',
    props: {
      clearable: true,
      type: 'datetime',
      style: {width: '100%'},
      'value-format': "YYYY-MM-DD HH:mm:ss",
      placeholder: '请选择上报时间',
      disabled: true,
    },
    md: 12
  },
  {
    label: '开始桩号',
    prop: 'startStationNum',
    component: 'el-input',
    props: {
      placeholder: '请输入开始桩号',
      disabled: true,
    },
    md: 12
  },
  {
    label: '结束桩号',
    prop: 'endStationNum',
    component: 'el-input',
    props: {
      placeholder: '请输入结束桩号',
      disabled: true,
    },
    md: 12
  },
  {
    label: '渠道、水库水位(m)',
    prop: 'waterLevel',
    component: 'el-input',
    props: {
      placeholder: '请输入水位',
      disabled: true,
    },
    md: 12
  },
  {
    label: '报险人',
    prop: 'reportBy',
    component: 'el-input',
    props: {
      placeholder: '请输入报险人',
      disabled: true,
    },
    md: 12
  },
  {
    label: '责任单位',
    prop: 'responsibleUnit',
    component: 'el-tree-select',
    props: {
      data: department.value,
      checkStrictly: true,
      clearable: true,
      style: {width: '100%'},
      'default-expand-all': true,
      placeholder: '请输入责任单位',
      disabled: true,
    },
    md: 12
  },
  {
    label: '责任人',
    prop: 'responsiblePerson',
    component: 'el-input',
    props: {
      placeholder: '请输入责任人',
      disabled: true,
    },
    md: 12
  },
  {
    label: '严重程度',
    prop: 'severity',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('severity_select'),
      style: {width: '100%'},
      placeholder: '请选择严重程度',
      disabled: true,
    },
    md: 12
  },
  {
    label: '抢险队伍',
    prop: 'teamNames',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      data: teamList.value,
      multiple: true,
      placeholder: '请选择抢险队伍',
      disabled: true,
    },
    md: 12
  },
  {
    label: '抢险救灾人数',
    prop: 'teamNum',
    component: 'el-input',
    props: {
      placeholder: '请输入抢险救灾人数',
      disabled: true,
    },
    md: 12
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      data: dictStore.getDict('reporting_status'),
      placeholder: '请选择状态',
      disabled: true,
    },
    md: 12
  },
  {
    label: '险情现状',
    prop: 'dangerousSituation',
    component: 'el-input',
    props: {
      placeholder: '请输入险情现状',
      autosize: {minRows: 2},
      type: 'textarea',
      disabled: true,
    },
    md: 24
  },
  {
    label: '发展趋势',
    prop: 'developmentTrend',
    component: 'el-input',
    props: {
      placeholder: '请输入发展趋势',
      autosize: {minRows: 2},
      type: 'textarea',
      disabled: true,
    },
    md: 24
  },
  {
    label: '出险原因',
    prop: 'accidentCause',
    component: 'el-input',
    props: {
      placeholder: '请输入出险原因',
      autosize: {minRows: 2},
      type: 'textarea',
      disabled: true,
    },
    md: 24
  },
  {
    label: '处理建议',
    prop: 'handlingSuggestions',
    component: 'el-input',
    props: {
      placeholder: '请输入处理建议',
      autosize: {minRows: 2},
      type: 'textarea',
      disabled: true,
    },
    md: 24
  },
  {
    label: '遗留问题',
    prop: 'remainingProblems',
    component: 'el-input',
    props: {
      placeholder: '请输入遗留问题',
      autosize: {minRows: 2},
      type: 'textarea',
      disabled: true,
    },
    md: 24
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      placeholder: '请输入备注',
      autosize: {minRows: 2},
      type: 'textarea',
      disabled: true,
    },
    md: 24
  },
  {
    label: '险情照片',
    prop: 'dangerousPhotos',
    md: 24
  },
  {
    label: '险情报告文件',
    prop: 'dangerousReport',
    md: 24
  }
]))
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    dangerousReport.value = row.dangerousReport;
    dangerousPhotos.value = row.dangerousPhotos;
    form.value = {
      ...row,
      teamNames: JSON.parse(row.teamNames)
    };
  } else {
    dangerousReport.value = [];
    dangerousPhotos.value = [];
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

const formatVal = (row) => {
  return row ? treeToArray(department.value).find(r => r.id == row)?.label : ''
}

const formatValName = (row) => {
  return row ? projectList.value.find(r => r.value == row)?.label : ''
}

onMounted(() => {
  getData()
  // 获取部门列表
  deptTreeSelect().then(res => {
    if (res.code) {
      department.value = loopTree(res.data);
    }
  })
  // 获取工程列表
  getProjectList().then(res => {
    if (res.success) {
      projectList.value = res.data.map(r => ({label: r.engName, value: r.id}));
    }
  })
  // 获取应预案列表
  getEmeList().then(res => {
    if (res.success) {
      emeList.value = res.data.map(r => ({label: r.docName, value: r.id}));
    }
  })
  //获取抢险队伍列表
  getTeams().then(res => {
    if (res.success) {
      teamList.value = res.data.map(r => ({label: r.teamName, value: r.id}));
    }
  })
})

const getData = () => {
  getRepDanger({
    ...serachForm.value,
    startTime: serachForm.value.dangerTime ? serachForm.value.dangerTime[0] : '',
    endTime: serachForm.value.dangerTime ? serachForm.value.dangerTime[1] : '',
    dangerTime: null,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
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
    if (type == 'add') {
      addRepDanger({
        ...form.value,
        teamNames: JSON.stringify(form.value.teamNames),
        dangerousReport: JSON.stringify(dangerousReport.value),
        dangerousPhotos: JSON.stringify(dangerousPhotos.value),
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
      updateRepDanger(form.value.id, {
        ...form.value,
        teamNames: JSON.stringify(form.value.teamNames),
        dangerousReport: JSON.stringify(dangerousReport.value),
        dangerousPhotos: JSON.stringify(dangerousPhotos.value),
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
  getData();
}

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    delRepDanger(row.id).then(res => {
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

}
</script>

<style scoped lang="scss">
:deep(.el-dialog__body) {
  height: 690px;
  overflow-y: auto;
  padding-bottom: 0;
}

:deep(.pro-form:not(.el-form--inline) .pro-form-menu) {
  position: sticky;
  bottom: 0;
  height: 55px;
  display: flex;
  background: #fff;
  border-top: 1px solid #dcdfe6;
  background: #fff !important;
  z-index: 10;

  .el-form-item__content {
    justify-content: end;
    margin-right: 40px;
  }
}
</style>