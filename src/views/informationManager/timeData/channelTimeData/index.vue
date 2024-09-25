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
      :page-sizes="[10, 20, 30, 40, 50]"
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
        <el-button :size="size" @click="crudRef.closeDialog()">
          关闭
        </el-button>
      </template>
      <template #search-menu-right="{ size }">
        <el-button
          style="margin-left: 30px"
          type="primary"
          plain
          icon="Plus"
          @click="crudRef.openDialog('add')"
          >新增</el-button
        >
        <el-button type="success" plain icon="Download" @click="exportData"
          >导出</el-button
        >
      </template>
      <template #table-fstp="{ size, row, column, $index }">
        {{ formatterVal(row, "flood_category", "fstp") }}
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
  defineCrudBeforeClose,
} from "element-pro-components";
import { formatterVal } from "@/utils";
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import useDictionaryStore from "@/store/modules/dictionary";
import {
  addLimit,
  getLimit,
  updateLimit,
} from "@/api/informationManager/timeData/floodLimitTimeData";
import {
  addChannel,
  deleteChannel,
  getChannel,
  updateChannel,
} from "@/api/informationManager/timeData/channelTimeData";
import {
  deleteLakeIndicator,
  getSkList,
} from "@/api/informationManager/timeData/lakeIndicatorTimeData";
const dictStore = useDictionaryStore();
const menu = defineCrudMenuColumns({
  label: "操作",
  add: false,
  del: true,
  edit: true,
  fixed: "right",
  addText: "新增",
  reset: false,
  detail: true,
  width: "250",
  addProps: {
    type: "primary",
    plain: true,
    icon: "Plus",
  },
  editProps: {
    link: true,
    type: "primary",
    icon: "Edit",
  },
  detailProps: {
    link: true,
    type: "primary",
    icon: "View",
  },
  delProps: {
    link: true,
    type: "danger",
    icon: "Delete",
  },
  searchResetProps: {
    icon: "Refresh",
  },
  searchProps: {
    type: "primary",
    icon: "Search",
  },
  delText: "删除",
  editText: "修改",
  searchText: "搜索",
  searchResetText: "重置",
  submitText: "确定",
  resetText: "取消",
  detailText: "查看",
});
const detailMenu = defineCrudMenuColumns({
  submit: false,
  reset: true,
  resetText: "关闭",
});
const crudRef = ref();
const form = ref({});
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
let skList = ref([]);
const { proxy } = getCurrentInstance();
const columns = defineCrudColumns(
  computed(() => [
    {
      label: "测站",
      prop: "stcd",
      component: "pro-select",
      props: {
        clearable: true,
        data: skList.value,
        placeholder: "请选择测站",
      },
      form: true,
      search: true,
    },
    {
      label: "测站名称",
      prop: "stName",
      component: "el-input",
      props: {
        placeholder: "请输入测站名称",
      },
      form: true,
      search: true,
    },
    {
      label: "警戒水位(m)",
      prop: "wrz",
      search: false,
      form: true,
    },
    {
      label: "保证水位(m)",
      prop: "grz",
      search: false,
      form: true,
    },
    {
      label: "高水位告警值(m)",
      prop: "taz",
      search: false,
      form: true,
    },
    {
      label: "低水位告警值(m)",
      prop: "laz",
      search: false,
      form: true,
    },
    {
      label: "警戒流量(m³/s)",
      prop: "wrq",
      search: false,
      form: true,
    },
    {
      label: "保证流量(m³/s)",
      prop: "grq",
      search: false,
      form: true,
    },
    {
      label: "大流量告警值(m³/s)",
      prop: "taq",
      search: false,
      form: true,
    },
    {
      label: "小流量告警值(m³/s)",
      prop: "laq",
      search: false,
      form: true,
    },
    {
      label: "左堤高程(m)",
      prop: "ldkel",
      search: false,
      form: true,
    },
    {
      label: "右堤高程(m)",
      prop: "rdkel",
      search: false,
      form: true,
    },
    {
      label: "数据时间",
      prop: "modiTime",
      component: "el-date-picker",
      fixed: "right",
      props: {
        clearable: true,
        type: "datetimerange",
        "start-placeholder": "开始时间",
        "end-placeholder": "结束时间",
        "range-separator": "-",
        "value-format": "YYYY-MM-DD HH:mm:ss",
      },
      search: true,
      form: true,
    },
  ])
);
const formColumns = defineFormColumns(
  computed(() => [
    {
      label: "测站",
      prop: "stcd",
      rules: [{ required: true, message: "请选择测站" }],
      component: "pro-select",
      props: {
        clearable: true,
        style: { width: "100%" },
        data: skList.value,
        placeholder: "请选择测站",
      },
      md: 12,
    },
    {
      label: "左堤高程(m)",
      prop: "ldkel",
      component: "el-input",
      props: {
        placeholder: "请输入左堤高程",
      },
      md: 12,
    },
    {
      label: "右堤高程(m)",
      prop: "rdkel",
      component: "el-input",
      props: {
        placeholder: "请输入右堤高程",
      },
      md: 12,
    },
    {
      label: "警戒水位(m)",
      prop: "wrz",
      component: "el-input",
      props: {
        placeholder: "请输入警戒水位",
      },
      md: 12,
    },
    {
      label: "保证水位(m)",
      prop: "grz",
      component: "el-input",
      props: {
        placeholder: "请输入保证水位",
      },
      md: 12,
    },
    {
      label: "高水位告警值(m)",
      prop: "taz",
      component: "el-input",
      props: {
        placeholder: "请输入高水位告警值",
      },
      md: 12,
    },
    {
      label: "低水位告警值(m)",
      prop: "laz",
      component: "el-input",
      props: {
        placeholder: "请输入低水位告警值",
      },
      md: 12,
    },
    {
      label: "警戒流量(m³/s)",
      prop: "wrq",
      component: "el-input",
      props: {
        placeholder: "请输入警戒流量",
      },
      md: 12,
    },
    {
      label: "大流量告警值(m³/s)",
      prop: "taq",
      component: "el-input",
      props: {
        placeholder: "请输入大流量告警值",
      },
      md: 12,
    },
    {
      label: "小流量告警值(m³/s)",
      prop: "laq",
      component: "el-input",
      props: {
        placeholder: "请输入小流量告警值",
      },
      md: 12,
    },
    {
      label: "平滩流量(m³/s)",
      prop: "flpq",
      component: "el-input",
      props: {
        placeholder: "请输入平滩流量",
      },
      md: 12,
    },
    {
      label: "保证流量(m³/s)",
      prop: "grq",
      component: "el-input",
      props: {
        placeholder: "请输入保证流量",
      },
      md: 12,
    },
    {
      label: "历史最低水位(m)",
      prop: "hlz",
      component: "el-input",
      props: {
        placeholder: "请输入历史最低水位",
      },
      md: 12,
    },
    {
      label: "历史最低水位出现时间",
      prop: "hlztm",
      component: "el-date-picker",
      props: {
        clearable: true,
        style: { width: "100%" },
        type: "date",
        "value-format": "YYYY-MM-DD",
        placeholder: "请选择历史最低水位出现时间",
      },
      md: 12,
    },
    {
      label: "历史最小流量(m³/s)",
      prop: "hmnq",
      component: "el-input",
      props: {
        placeholder: "请输入历史最小流量",
      },
      md: 12,
    },
    {
      label: "历史最小流量出现时间",
      prop: "hmnqtm",
      component: "el-date-picker",
      props: {
        clearable: true,
        style: { width: "100%" },
        type: "date",
        "value-format": "YYYY-MM-DD",
        placeholder: "请选择历史最小流量出现时间",
      },
      md: 12,
    },
    {
      label: "历史最大断面平均流速(m/s)",
      prop: "hmxavv",
      component: "el-input",
      props: {
        placeholder: "请输入历史最大断面平均流速",
      },
      md: 12,
    },
    {
      label: "历史最大断面平均流速出现时间",
      prop: "hmxavvtm",
      component: "el-date-picker",
      props: {
        clearable: true,
        style: { width: "100%" },
        type: "date",
        "value-format": "YYYY-MM-DD",
        placeholder: "请选择历史最大断面平均流速出现时间",
      },
      md: 12,
    },
    {
      label: "历史最大含沙量(kg/m³)",
      prop: "hmxs",
      component: "el-input",
      props: {
        placeholder: "请输入历史最大含沙量",
      },
      md: 12,
    },
    {
      label: "历史最大含沙量出现时间",
      prop: "hmxstm",
      component: "el-date-picker",
      props: {
        clearable: true,
        style: { width: "100%" },
        type: "date",
        "value-format": "YYYY-MM-DD",
        placeholder: "请选择历史最大断面平均流速出现时间",
      },
      md: 12,
    },
    {
      label: "调查最高水位(m)",
      prop: "ivhz",
      component: "el-input",
      props: {
        placeholder: "请输入调查最高水位",
      },
      md: 12,
    },
    {
      label: "调查最高水位出现时间",
      prop: "ivhztm",
      component: "el-date-picker",
      props: {
        clearable: true,
        style: { width: "100%" },
        type: "date",
        "value-format": "YYYY-MM-DD",
        placeholder: "请选择调查最高水位出现时间",
      },
      md: 12,
    },
    {
      label: "调查最大流量",
      prop: "ivmxq",
      component: "el-input",
      props: {
        placeholder: "请输入调查最大流量",
      },
      md: 12,
    },
    {
      label: "调查最大流量出现时间",
      prop: "ivmxqtm",
      component: "el-date-picker",
      props: {
        clearable: true,
        style: { width: "100%" },
        type: "date",
        "value-format": "YYYY-MM-DD",
        placeholder: "请选择调查最大流量出现时间",
      },
      md: 12,
    },
    {
      label: "实测最高水位(m)",
      prop: "obhtz",
      component: "el-input",
      props: {
        placeholder: "请输入实测最高水位",
      },
      md: 12,
    },
    {
      label: "实测最高水位出现时间",
      prop: "obhtztm",
      component: "el-date-picker",
      props: {
        clearable: true,
        style: { width: "100%" },
        type: "date",
        "value-format": "YYYY-MM-DD",
        placeholder: "请选择实测最高水位出现时间",
      },
      md: 12,
    },
    {
      label: "实测最大流量(m³/s)",
      prop: "obmxq",
      component: "el-input",
      props: {
        placeholder: "请输入实测最大流量",
      },
      md: 12,
    },
    {
      label: "实测最大流量出现时间",
      prop: "obmxqtm",
      component: "el-date-picker",
      props: {
        clearable: true,
        style: { width: "100%" },
        type: "date",
        "value-format": "YYYY-MM-DD",
        placeholder: "请选择实测最大流量出现时间",
      },
      md: 12,
    },
    {
      label: "启动预报流量标准(m³/s)",
      prop: "sfq",
      component: "el-input",
      props: {
        placeholder: "请输入启动预报流量标准",
      },
      md: 12,
    },
    {
      label: "启动预报水位标准(m)",
      prop: "sfz",
      component: "el-input",
      props: {
        placeholder: "请输入启动预报水位标准",
      },
      md: 12,
    },
  ])
);
const detailColumns = defineFormColumns(
  computed(() =>
    [
      {
        label: "测站",
        prop: "stcd",
        rules: [{ required: true, message: "请选择测站" }],
        component: "pro-select",
        props: {
          clearable: true,
          style: { width: "100%" },
          data: skList.value,
          placeholder: "请选择测站",
        },
        md: 12,
      },
      {
        label: "左堤高程(m)",
        prop: "ldkel",
        component: "el-input",
        props: {
          placeholder: "请输入左堤高程",
        },
        md: 12,
      },
      {
        label: "右堤高程(m)",
        prop: "rdkel",
        component: "el-input",
        props: {
          placeholder: "请输入右堤高程",
        },
        md: 12,
      },
      {
        label: "警戒水位(m)",
        prop: "wrz",
        component: "el-input",
        props: {
          placeholder: "请输入警戒水位",
        },
        md: 12,
      },
      {
        label: "保证水位(m)",
        prop: "grz",
        component: "el-input",
        props: {
          placeholder: "请输入保证水位",
        },
        md: 12,
      },
      {
        label: "高水位告警值(m)",
        prop: "taz",
        component: "el-input",
        props: {
          placeholder: "请输入高水位告警值",
        },
        md: 12,
      },
      {
        label: "低水位告警值(m)",
        prop: "laz",
        component: "el-input",
        props: {
          placeholder: "请输入低水位告警值",
        },
        md: 12,
      },
      {
        label: "警戒流量(m³/s)",
        prop: "wrq",
        component: "el-input",
        props: {
          placeholder: "请输入警戒流量",
        },
        md: 12,
      },
      {
        label: "大流量告警值(m³/s)",
        prop: "taq",
        component: "el-input",
        props: {
          placeholder: "请输入大流量告警值",
        },
        md: 12,
      },
      {
        label: "小流量告警值(m³/s)",
        prop: "laq",
        component: "el-input",
        props: {
          placeholder: "请输入小流量告警值",
        },
        md: 12,
      },
      {
        label: "保证流量(m³/s)",
        prop: "grq",
        component: "el-input",
        props: {
          placeholder: "请输入保证流量",
        },
        md: 12,
      },
      {
        label: "平滩流量(m³/s)",
        prop: "flpq",
        component: "el-input",
        props: {
          placeholder: "请输入平滩流量",
        },
        md: 12,
      },
      {
        label: "历史最低水位(m)",
        prop: "hlz",
        component: "el-input",
        props: {
          placeholder: "请输入历史最低水位",
        },
        md: 12,
      },
      {
        label: "历史最低水位出现时间",
        prop: "hlztm",
        component: "el-date-picker",
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "date",
          "value-format": "YYYY-MM-DD",
          placeholder: "请选择历史最低水位出现时间",
        },
        md: 12,
      },
      {
        label: "历史最小流量(m³/s)",
        prop: "hmnq",
        component: "el-input",
        props: {
          placeholder: "请输入历史最小流量",
        },
        md: 12,
      },
      {
        label: "历史最小流量出现时间",
        prop: "hmnqtm",
        component: "el-date-picker",
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "date",
          "value-format": "YYYY-MM-DD",
          placeholder: "请选择历史最小流量出现时间",
        },
        md: 12,
      },
      {
        label: "历史最大断面平均流速(m/s)",
        prop: "hmxavv",
        component: "el-input",
        props: {
          placeholder: "请输入历史最大断面平均流速",
        },
        md: 12,
      },
      {
        label: "历史最大断面平均流速出现时间",
        prop: "hmxavvtm",
        component: "el-date-picker",
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "date",
          "value-format": "YYYY-MM-DD",
          placeholder: "请选择历史最大断面平均流速出现时间",
        },
        md: 12,
      },
      {
        label: "历史最大含沙量(kg/m³)",
        prop: "hmxs",
        component: "el-input",
        props: {
          placeholder: "请输入历史最大含沙量",
        },
        md: 12,
      },
      {
        label: "历史最大含沙量出现时间",
        prop: "hmxstm",
        component: "el-date-picker",
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "date",
          "value-format": "YYYY-MM-DD",
          placeholder: "请选择历史最大断面平均流速出现时间",
        },
        md: 12,
      },
      {
        label: "调查最高水位(m)",
        prop: "ivhz",
        component: "el-input",
        props: {
          placeholder: "请输入调查最高水位",
        },
        md: 12,
      },
      {
        label: "调查最高水位出现时间",
        prop: "ivhztm",
        component: "el-date-picker",
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "date",
          "value-format": "YYYY-MM-DD",
          placeholder: "请选择调查最高水位出现时间",
        },
        md: 12,
      },
      {
        label: "调查最大流量",
        prop: "ivmxq",
        component: "el-input",
        props: {
          placeholder: "请输入调查最大流量",
        },
        md: 12,
      },
      {
        label: "调查最大流量出现时间",
        prop: "ivmxqtm",
        component: "el-date-picker",
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "date",
          "value-format": "YYYY-MM-DD",
          placeholder: "请选择调查最大流量出现时间",
        },
        md: 12,
      },
      {
        label: "实测最高水位(m)",
        prop: "obhtz",
        component: "el-input",
        props: {
          placeholder: "请输入实测最高水位",
        },
        md: 12,
      },
      {
        label: "实测最高水位出现时间",
        prop: "obhtztm",
        component: "el-date-picker",
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "date",
          "value-format": "YYYY-MM-DD",
          placeholder: "请选择实测最高水位出现时间",
        },
        md: 12,
      },
      {
        label: "实测最大流量(m³/s)",
        prop: "obmxq",
        component: "el-input",
        props: {
          placeholder: "请输入实测最大流量",
        },
        md: 12,
      },
      {
        label: "实测最大流量出现时间",
        prop: "obmxqtm",
        component: "el-date-picker",
        props: {
          style: { width: "100%" },
          type: "date",
          "value-format": "YYYY-MM-DD",
          placeholder: "请选择实测最大流量出现时间",
        },
        md: 12,
      },
      {
        label: "启动预报流量标准(m³/s)",
        prop: "sfq",
        component: "el-input",
        props: {
          placeholder: "请输入启动预报流量标准",
        },
        md: 12,
      },
      {
        label: "启动预报水位标准(m)",
        prop: "sfz",
        component: "el-input",
        props: {
          placeholder: "请输入启动预报水位标准",
        },
        md: 12,
      },
    ].map((r) => ({ ...r, props: { ...r.props, disabled: true } }))
  )
);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === "edit" || type === "detail") {
    form.value = row || {};
  } else {
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done();
});

onMounted(() => {
  getData();
  getSkList({ stType: "ZQ" }).then((res) => {
    if (res.success) {
      skList.value = res.data.map((r) => ({
        label: r.stName,
        value: r.stCode,
      }));
    }
  });
});

const getData = () => {
  getChannel({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    startTime: serachForm.value.modiTime ? serachForm.value.modiTime[0] : "",
    endTime: serachForm.value.modiTime ? serachForm.value.modiTime[1] : "",
    modiTime: null,
  }).then((res) => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  });
};

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  getData();
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
};

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == "add") {
      addChannel({ ...form.value }).then((res) => {
        if (res.success) {
          ElMessage({
            message: "添加成功",
            type: "success",
          });
          getData();
          close();
        }
      });
    } else {
      updateChannel(form.value.stcd, { ...form.value }).then((res) => {
        if (res.success) {
          ElMessage({
            message: "修改成功",
            type: "success",
          });
          getData();
          close();
        }
      });
    }
  }
  done();
});

// 分页选择
const load = () => {
  getData();
};

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteChannel(row.stcd).then((res) => {
      if (res.success) {
        getData();
        ElMessage({
          message: "删除成功",
          type: "success",
        });
      }
    });
  });
};

const exportData = () => {
  proxy.download(
    "/business/realData/rvfcchB/page/export",
    {
      ...serachForm.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      startTime: serachForm.value.modiTime ? serachForm.value.modiTime[0] : "",
      endTime: serachForm.value.modiTime ? serachForm.value.modiTime[1] : "",
      modiTime: null,
    },
    `河道(渠道)站防洪指标${dayjs().format("YYYY-MM-DD")}.xlsx`
  );
};
</script>

<style scoped lang="scss">
:deep(.el-dialog__body) {
  height: 650px;
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
  .el-form-item__content {
    justify-content: end;
    margin-right: 40px;
  }
}
</style>