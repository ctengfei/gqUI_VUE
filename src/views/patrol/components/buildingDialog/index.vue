<template>
  <el-dialog
    v-model="props.dialogVisible"
    title="列表"
    width="58%"
    draggable
    destroy-on-close
    :before-close="handleClose"
  >
    <div class="container">
      <pro-crud
        ref="crudRef"
        v-model="form"
        v-model:search="searchForm"
        :columns="columns"
        :index="index"
        :gutter="20"
        :menu="menu"
        :data="tableData"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        layout="->,total,sizes,prev, pager, next, jumper"
        background
        :page-sizes="[10, 20, 30, 40, 50]"
        :total="pagination.total"
        @load="load"
        column="2"
        width="52%"
        :fit="true"
        selection
        :before-close="beforeClose"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        @selection-change="selectionFuc"
      >
        <template #form-menu-right="{ size }">
          <el-button :size="size" @click="crudRef.closeDialog()">
            关闭
          </el-button>
        </template>
        <template #search-menu-right="{}">
          <span style="margin-left: 30px">
            <el-button
              type="primary"
              plain
              icon="Plus"
              v-if="searchForm.partType === '99'"
              @click="handleAdd"
              >新增</el-button
            >
          </span>
        </template>
        <template #menu="{ size, row }" v-if="searchForm.partType === '99'">
          <el-button
            icon="Edit"
            link
            :size="size"
            @click="handleEdit(row)"
            type="primary"
            >编辑</el-button
          >
          <el-popconfirm title="确定删除吗" @confirm="handleDelete(row)">
            <template #reference>
              <el-button icon="Delete" link :size="size" type="danger"
                >删除</el-button
              >
            </template>
          </el-popconfirm>
        </template>
      </pro-crud>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleConfirm">确认</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
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
import { getSli } from "@/api/informationManager/basicData/sluiceBasicData";
import { getAqu } from "@/api/informationManager/basicData/aqueductBasicData";
import { getTunnel } from "@/api/informationManager/basicData/tunnelBasicData";
import { getCan } from "@/api/informationManager/basicData/canalBasicData";
import { getCle } from "@/api/informationManager/basicData/culvertBasicData";
import { getDam } from "@/api/informationManager/basicData/damBasicData";
import { departmentMenu, departmentStatus } from "../../constant";
import { getCode, getName } from "../../utils";
import { ElMessage } from "element-plus";

let props = defineProps(["dialogVisible"]);
const emit = defineEmits(["closeDialog", "confirmDialog"]);

//表格实例
const crudRef = ref();
//表单搜索数据
const searchForm = ref({ partType: "1" });
//表单数据
const form = ref({ partType: "99" });
//表格数据
let tableData = ref([]);
//选择的数据
let selectionData = ref([]);
//分页数据
let pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});
let curApi = ref(getSli);
//序号
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});
//表格配置数据
const columns = defineCrudColumns(
  computed(() => [
    {
      label: "编码",
      prop: "engId",
      component: "el-input",
      add: true,
      edit: true,
      props: {
        placeholder: "请输入编码",
      },
      rules: [{ required: true, message: "请输入编码" }],
    },
    {
      label: "名称",
      prop: "engName",
      component: "el-input",
      add: true,
      edit: true,
      props: {
        placeholder: "请输入名称",
      },
      rules: [{ required: true, message: "请输入名称" }],
    },
    {
      label: "类型",
      prop: "partType",
      component: "pro-select",
      props: {
        data: departmentStatus,
        style: { width: "100%" },
      },
      render: (row) => {
        return departmentStatus.find((item) => item.value === row.partType)
          .label;
      },
      search: true,
    },
  ])
);
//操作按钮配置
let menu = defineCrudMenuColumns(departmentMenu);

//挂载完成之后获取表格数据
onMounted(() => {
  getData();
});
//监听下拉框
watch(
  () => searchForm.value.partType,
  (val) => {
    switch (val) {
      case "1":
        curApi.value = getSli;
        break;
      case "2":
        curApi.value = getAqu;
        break;
      case "3":
        curApi.value = getDam;
        break;
      case "4":
        curApi.value = getTunnel;
        break;
      case "5":
        curApi.value = getCan;
        break;
      case "6":
        curApi.value = getCle;
        break;
      case "99":
        tableData.value = [];
        pagination.total = 0;
        break;
      default:
        curApi.value = getSli;
        break;
    }
  }
);
// 分页选择
const load = () => {
  getData();
};
//编辑
const handleEdit = (row) => {
  form.value = row || {};
  crudRef.value.openDialog("edit");
};
//新增
const handleAdd = (row) => {
  form.value = {};
  crudRef.value.openDialog("add");
};
//弹窗关闭之前
const beforeClose = defineCrudBeforeClose((done) => {
  done();
});
//搜索
const searchSubmit = defineCrudSearch((done) => {
  getData();
  done();
});
//重置
const searchReset = () => {
  pagination.pageNum = 1;
  getData();
};
//关闭
const handleClose = () => {
  emit("closeDialog");
};
//删除
const handleDelete = (row) => {
  tableData.value = tableData.value.filter((item) => item.uuid !== row.uuid);
};
//确认
const handleConfirm = () => {
  if (selectionData.value.length > 0) {
    emit("confirmDialog", selectionData.value);
  } else {
    ElMessage({
      message: "请选择数据",
      type: "warning",
    });
  }
};
//勾选
const selectionFuc = (data) => {
  selectionData.value = [...data];
};
const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == "add") {
      tableData.value.push({ ...form.value, partType: "99", uuid: Date.now() });
      close();
    } else {
      const arr = tableData.value;
      const num = arr.findIndex((item) => item.uuid === form.value.uuid);
      tableData.value.splice(num, 1, { ...form.value });
      close();
    }
  }
});
const getData = () => {
  const { pageNum, pageSize } = pagination;
  const params = {
    pageNum,
    pageSize,
  };
  curApi.value(params).then((res) => {
    if (res.success) {
      const result = res?.data?.data || [];
      tableData.value = result.map((item) => {
        return {
          engId: getCode(item),
          engName: getName(item),
          partType: searchForm.value.partType,
        };
      });
      pagination.total = res.data.total;
    }
  });
};
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  