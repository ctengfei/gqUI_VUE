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
          label-width="100px"
          v-model="form"
          width="50%"
          @reset="crudRef.closeDialog()"
          :menu="detailMenu"
          :columns="detailColumns"
        >
        </pro-form>
      </template>
      <template #crud-detail="{}">
        <pro-form
          label-width="100px"
          v-model="form"
          width="50%"
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
  getSectionList,
  addChannelSection,
  updateChannelSection,
  delChannelSection,
  getChanlist,
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
let chanList = ref([]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const columns = defineCrudColumns(
  computed(() => [
    {
      label: "渠道名称",
      prop: "chanName",
      component: "pro-select",
      props: {
        placeholder: "请输入渠道名称",
        data: chanList.value,
        config: {value: 'chanCode', label: 'chanName'},
      },
      search: true,
    },
    {
      label: "渠道断面",
      prop: "bnch",
      component: "el-input",
      props: {
        placeholder: "请输入渠道断面",
      },
      search: true,
    },
    {
      label: "糙率",
      prop: "roughness",
    },
  ])
);
const addColumns = defineFormColumns(
  computed(() => [
    {
      label: "渠道名称",
      prop: "chanName",
      component: "pro-select",
      props: {
        placeholder: "请输入渠道名称",
        data: chanList.value,
        config: {value: 'chanCode', label: 'chanName'},
        onChange: chanChange
      },
      rules: [{ required: true, message: "请输入渠道名称" }],
    },
    {
      label: "渠道断面",
      prop: "bnch",
      component: "el-input",
      rules: [{ required: true, message: "请输入渠道断面" }],
      props: {
        placeholder: "请输入渠道断面",
      },
    },
    {
      label: "糙率",
      prop: "roughness",
      component: "el-input-number",
      rules: [{ required: true, message: "请输入糙率" }],
      props: {
        min:0,
        max:1,
        step:0.001,
        placeholder: "请输入糙率",
      },
    },
  ])
);
const editColumns = defineFormColumns(
  computed(() => [
    {
      label: "渠道名称",
      prop: "chanName",
      component: "pro-select",
      props: {
        disabled: true,
        placeholder: "请输入渠道名称",
        data: chanList.value,
        config: {value: 'chanCode', label: 'chanName'},
        onChange: chanChange
      },
      rules: [{ required: true, message: "请输入渠道名称" }],
    },
    {
      label: "渠道断面",
      prop: "bnch",
      component: "el-input",
      rules: [{ required: true, message: "请输入渠道断面" }],
      props: {
        disabled: true,
        placeholder: "请输入渠道断面",
      },
    },
    {
      label: "糙率",
      prop: "roughness",
      component: "el-input-number",
      rules: [{ required: true, message: "请输入糙率" }],
      props: {
        min:0,
        max:1,
        step:0.001,
        placeholder: "请输入糙率",
      },
    },
  ])
);
const detailColumns = defineFormColumns(
  computed(() => [
    {
      label: "渠道名称",
      prop: "chanName",
      component: "pro-select",
      props: {
        disabled: true,
        placeholder: "请输入渠道名称",
        data: chanList.value,
        config: {value: 'chanCode', label: 'chanName'},
      },
    },
    {
      label: "渠道断面",
      prop: "bnch",
      component: "el-input",
      props: {
        disabled: true,
      },
    },
    {
      label: "糙率",
      prop: "roughness",
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
  getChanList();
  getData();
});
const getChanList =()=>{
  getChanlist().then((res)=>{
    if (res.success) {
      chanList.value = res.data;
    }
  })
};
const getData = () => {
  getSectionList({
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
//渠道事件
const chanChange = (val) =>{
 
  form.value.chanCode = val;
}
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
    const { roughness } = form.value;
    const params = {
      ...form.value,
      roughness: Number(roughness),
    };
    if (type === "add") {
      addChannelSection(params).then((res) => {
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
      updateChannelSection(params).then((res) => {
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
    const { chanCode, bnch } = row;
    delChannelSection({ chanCode, bnch }).then((res) => {
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
