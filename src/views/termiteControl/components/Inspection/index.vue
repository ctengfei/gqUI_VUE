<template>
  <div class="container">
    <div class="topBox">
      <GroupLine title="危害情况" />
      <el-form
        ref="menuRef"
        :model="form"
        :disabled="props.type === 'detail'"
        label-width="160px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="hazardLevel">
              <template #label>
                <span>
                  危害等级初步判定
                  <el-tooltip placement="top">
                    <template #content>
                      I
                      级：主体范围地表迹象数＜10处，真菌指示物≤1处，分飞孔单处≤5个。<br />
                      II 级：主体范围地表迹象数≥10处 ，真菌指示物＞1
                      处，分飞孔单处 ＞5个，因性湿坡散浸。<br />
                      III 级：主体范围分飞孔多处，
                      疑似贯穿性危害，因性漏洞、跌窝 、脱坡等险情。"
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-select v-model="form.hazardLevel" clearable style="width: 100%">
                <el-option
                  v-for="item in HAZARD_LEVEL"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="hazardDegree" label="危害程度">
              <el-select v-model="form.hazardDegree" style="width: 100%">
                <el-option
                  v-for="item in HAZARD_DEGREE"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="bywater" label="是否临水">
              <el-select v-model="form.bywater" style="width: 100%">
                <el-option
                  v-for="item in IS_FACING_WATER"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="bottomBox">
      <GroupLine
        title="危害情况明细"
        :isHasBtn="props.type !== 'detail'"
        ref="child"
        @addTableData="addTableData"
      />
      <pro-table
        :data="form.hazardDetail"
        :columns="columns"
        row-key="id"
        :index="index"
      >
        <template #menu="{ size, row }" v-if="props.type !== 'detail'">
          <el-button :size="size" type="primary" @click="handleEdit(row)" link>
            编辑
          </el-button>
          <el-popconfirm title="确定删除吗" @confirm="handleDelete(row)">
            <template #reference>
              <el-button link :size="size" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </pro-table>
    </div>
  </div>
</template>

<script setup>
import {
  nextTick,
  onMounted,
  ref,
  toRef,
  reactive,
  computed,
  defineExpose,
} from "vue";
import GroupLine from "../groupLine";
import {
  defineTableColumns,
  defineTableMenuColumns,
  defineTableIndexColumns,
} from "element-pro-components";
import { getControlByIdApi } from "../../apis";
import { formatterVal } from "@/utils";

const { proxy } = getCurrentInstance();
const { HAZARD_LEVEL, HAZARD_DEGREE, IS_FACING_WATER } = proxy.useDict(
  "HAZARD_LEVEL",
  "IS_FACING_WATER",
  "HAZARD_DEGREE"
);
const props = defineProps(["type", "recordData"]);
const curRecordData = toRef(props, "recordData");

let form = ref(curRecordData || {});
const child = ref(null);
const columns = defineTableColumns([
  {
    label: "危害部位",
    prop: "hazardArea",
  },
  {
    label: "危害位置",
    prop: "hazardPos",
  },
  {
    label: "高程(m)",
    prop: "elevation",
  },
  {
    label: "迹象类型",
    prop: "signType",
    render: (row) => {
      return formatterVal(row, "sign_type", "signType");
    },
  },
  {
    label: "个数",
    prop: "num",
  },
  {
    label: "建议处理方法",
    prop: "processMethod",
    render: (row) => {
      return formatterVal(row, "process_method", "processMethod");
    },
  },
]);
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});

//挂载完成之后获取表格数据
onMounted(() => {});
// 删除按钮操作
const handleDelete = (row) => {
  const tableData = form.value.hazardDetail;
  form.value.hazardDetail = tableData.filter((item) => item.id !== row.id);
};
// 编辑按钮操作
const handleEdit = (row) => {
  child.value.editDialogVisible(true, row);
};
//新增/修改
const addTableData = (row) => {
  const tableData = form.value.hazardDetail || [];
  if (tableData && tableData.length > 0) {
    const filArr = tableData.filter((item) => item.id === row.id);
    if (filArr.length === 0) {
      form.value.hazardDetail.push(row);
    } else {
      form.value.hazardDetail.forEach((item) => {
        if (item.id === row.id) {
          item = row;
        }
      });
    }
  } else {
    form.value.hazardDetail = [row];
  }
};

defineExpose({
  form,
});
</script>

<style lang="scss">
@import "./index.scss";
</style>

