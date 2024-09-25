<template>
  <div class="app-container">
    <pro-crud
      ref="crudRef"
      v-model="form"
      v-model:search="serachForm"
      :columns="columns"
      :add-columns="addColumns"
      :edit-columns="editColumns"
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
      column="2"
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
      </template>
      <template #crud-edit="{}">
        <pro-form
          label-width="155px"
          v-model="form"
          @reset="crudRef.closeDialog()"
          :menu="detailMenu"
          :columns="detailColumns"
        >
        </pro-form>
      </template>
      <template #crud-detail="{}">
        <pro-form
          label-width="155px"
          v-model="form"
          @reset="crudRef.closeDialog()"
          :menu="detailMenu"
          :columns="detailColumns"
        >
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
  defineCrudBeforeOpen,
  defineCrudBeforeClose,
} from "element-pro-components";
import { ref, reactive, onMounted, computed } from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getChannelPageList,
  addAttChanTopology,
  updateAttChanTopology,
  delAttChanTopology,
} from "@/api/scheSchemeData";
const menu = defineCrudMenuColumns({
  label: "操作",
  add: false,
  del: true,
  detail: true,
  fixed: "right",
  addText: "新增",
  reset: false,
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
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const columns = defineCrudColumns(
  computed(() => [
    {
      label: "上级渠道编码",
      prop: "spChanCode",
      component: "el-input",
      props: {
        clearable: true,
        placeholder: "请输入上级渠道编码",
      },
      search: true,
    },
    {
      label: "上级渠道名称",
      prop: "spChanName",
      component: "el-input",
      props: {
        clearable: true,
        placeholder: "请输入上级渠道名称",
      },
      search: true,
    },
    {
      label: "渠道/分水口编码",
      prop: "chanCode",
      component: "el-input",
      props: {
        clearable: true,
        placeholder: "请输入渠道/分水口名称",
      },
      search: true,
    },
    {
      label: "渠道/分水口名称",
      prop: "chanName",
      component: "el-input",
      props: {
        clearable: true,
        placeholder: "请输入渠道/分水口名称",
      },
      search: true,
    },
  ])
);
const addColumns = defineFormColumns(
  computed(() => [
    {
      label: "上级渠道编码",
      prop: "spChanCode",
      component: "el-input",
      rules: [{ required: true, message: "请输入上级渠道编码" }],
      props: {
        clearable: true,
        placeholder: "请输入上级渠道编码",
      },
    },
    {
      label: "上级渠道名称",
      prop: "spChanName",
      component: "el-input",
      rules: [{ required: true, message: "请输入上级渠道名称" }],
      props: {
        clearable: true,
        placeholder: "请输入上级渠道名称",
      },
    },
    {
      label: "渠道/分水口编码",
      prop: "chanCode",
      component: "el-input",
      rules: [{ required: true, message: "请输入渠道/分水口名称" }],
      props: {
        clearable: true,
        placeholder: "请输入渠道/分水口名称",
      },
    },
    {
      label: "渠道/分水口名称",
      prop: "chanName",
      component: "el-input",
      rules: [{ required: true, message: "请输入渠道/分水口名称" }],
      props: {
        clearable: true,
        placeholder: "请输入渠道/分水口名称",
      },
    },
  ])
);
const editColumns = defineFormColumns(
  computed(() => [
    {
      label: "上级渠道编码",
      prop: "spChanCode",
      component: "el-input",
      rules: [{ required: true, message: "请输入上级渠道编码" }],
      props: {
        disabled: true,
        placeholder: "请输入上级渠道编码",
      },
    },
    {
      label: "上级渠道名称",
      prop: "spChanName",
      component: "el-input",
      rules: [{ required: true, message: "请输入上级渠道名称" }],
      props: {
        disabled: true,
        placeholder: "请输入上级渠道名称",
      },
    },
    {
      label: "渠道/分水口编码",
      prop: "chanCode",
      component: "el-input",
      rules: [{ required: true, message: "请输入渠道/分水口名称" }],
      props: {
        disabled: true,
        placeholder: "请输入渠道/分水口名称",
      },
    },
    {
      label: "渠道/分水口名称",
      prop: "chanName",
      component: "el-input",
      rules: [{ required: true, message: "请输入渠道/分水口名称" }],
      props: {
        clearable: true,
        placeholder: "请输入渠道/分水口名称",
      },
    },
  ])
);
const detailColumns = defineFormColumns(
  computed(() => [
    {
      label: "上级渠道编码",
      prop: "spChanCode",
      component: "el-input",
      props: {
        disabled: true,
      },
    },
    {
      label: "上级渠道名称",
      prop: "spChanName",
      component: "el-input",
      props: {
        disabled: true,
      },
    },
    {
      label: "渠道/分水口编码",
      prop: "chanCode",
      component: "el-input",
      props: {
        disabled: true,
      },
    },
    {
      label: "渠道/分水口名称",
      prop: "chanName",
      component: "el-input",
      props: {
        disabled: true,
      },
    },
  ])
);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === "edit" || type === "detail") {
    form.value = { ...row };
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
});

const getData = () => {
  getChannelPageList({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
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
    if (type === "add") {
      addAttChanTopology(form.value).then((res) => {
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
      const { chanCode } = form.value;
      updateAttChanTopology(chanCode, form.value).then((res) => {
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
    const { chanCode } = row;
    delAttChanTopology(chanCode).then((res) => {
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
</script>

<style scoped lang="scss"></style>
