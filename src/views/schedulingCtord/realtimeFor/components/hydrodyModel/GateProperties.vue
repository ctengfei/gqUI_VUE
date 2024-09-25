<template>
  <div>
    <pro-crud
      ref="crudRef"
      v-model="form"
      :columns="columns"
      :gutter="20"
      :menu="menu"
      :data="tableData"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      layout="->,total,sizes,prev, pager, next, jumper"
      background
      :page-sizes="[10, 20, 30, 40, 50]"
      :total="total"
      @load="load"
      :column="2"
      width="45%"
      align="center"
      :before-open="beforeOpen"
      :before-close="beforeClose"
      label-width="150px"
      direction="vertical"
      @submit="submit"
    >
      <template #form-menu-right="{ size }">
        <el-button :size="size" @click="crudRef.closeDialog()">
          关闭
        </el-button>
      </template>
    </pro-crud>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, onBeforeUnmount } from "vue";
import {
  getSluiceList,
  updateSluiceList,
} from "@/api/schedulingCtord/realtimeFor";
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineCrudBeforeOpen,
  defineCrudBeforeClose,
} from "element-pro-components";
import { ElMessage, ElMessageBox } from "element-plus";

const form = ref();
const crudRef = ref();
let tableData = ref([
  {
    caseName: 1,
    intervalRouting: 1,
    intervalOutput: 1,
    spinupHours: 1,
  },
]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);

const columns = defineCrudColumns(
  computed(() => [
    {
      label: "闸门编号",
      prop: "sluiceCode",
      // 'label-width': "auto",
      component: "el-input",
      props: {
        disabled: true,
        placeholder: "请输入闸门编号",
      },
      form: true,
      md: 12,
    },
    {
      label: "闸门名称",
      prop: "sluiceName",
      // 'label-width': "auto",
      component: "el-input",
      props: {
        placeholder: "请输入闸门名称",
      },
      form: true,
      md: 12,
    },
    {
      label: "拓扑参数-上游",
      prop: "topo1",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "拓扑参数-下游",
      prop: "topo2",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "结构参数-闸孔数",
      prop: "struc1",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "结构参数-单孔净宽",
      prop: "struc2",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "上游底板高程",
      prop: "elevationBotUp",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "堰顶高程",
      prop: "elevationTopUp",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "下游底板高程",
      prop: "elevationBotDown",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "墩厚",
      prop: "thickness",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "边墩与河渠边线距离",
      prop: "distance",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "最大水位",
      prop: "zmax",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "最小水位",
      prop: "zmin",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "水位差",
      prop: "zdiff",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "最大流量",
      prop: "qmax",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "最小流量",
      prop: "qmin",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "经度",
      prop: "lon",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "纬度",
      prop: "lat",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "默认开度",
      prop: "status",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "默认边界值",
      prop: "bound",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
    {
      label: "统一闸门编码",
      prop: "wraRepCd",
      // 'label-width': "auto",
      component: "el-input",
      props: { disabled: true },
      form: true,
      md: 12,
    },
    {
      label: "统一闸门名称",
      prop: "wraRepNm",
      // 'label-width': "auto",
      component: "el-input",
      props: {},
      form: true,
      md: 12,
    },
  ])
);

const menu = defineCrudMenuColumns({
  label: "操作",
  add: false,
  fixed: "right",
  detail: false,
  reset: false,
  del: false,
  edit: true,
  width: "100",
  editProps: {
    link: true,
    type: "primary",
    icon: "Edit",
  },
  editText: "编辑",
  submitText: "确定",
  resetText: "取消",
});

onMounted(() => {
  getData();
});

const load = () => {
  getData();
};

const getData = () => {
  getSluiceList({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }).then((res) => {
    tableData.value = res.data.data;
  });
};

const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === "edit") {
    form.value = row || {};
    done();
  } else {
    form.value = {};
    done();
  }
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done();
});

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == "edit") {
      updateSluiceList({ ...form.value }).then((res) => {
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
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  margin-top: 17vh !important;
}

:deep(.el-dialog__body) {
  padding-top: 15px !important;
}
</style>