<template>
  <vxe-table border show-overflow height="350" keep-source ref="xTable" :column-config="{ resizable: false }"
             :edit-config="{ trigger: 'manual', mode: 'row',showIcon:false }" :data="tableData">
    <vxe-column field="useType" title="用水类型" align="center">
      <template #default="{ row }">
        <span>{{ formatterVal(row, 'USE_TYPE', 'useType') }}</span>
      </template>
    </vxe-column>
    <vxe-column field="rate" title="保证率" align="center" :edit-render="{}">
      <template #edit="{ row }">
        <vxe-input v-model="row.rate" type="number" min="0" step="0.1" max="1"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column title="操作" align="center" width="160">
      <template #default="{ row,rowIndex }">
        <template v-if="isActiveStatus(row)">
          <vxe-button @click="saveRowEvent(row,rowIndex)" status="primary">保存</vxe-button>
          <vxe-button @click="cancelRowEvent(row)">取消</vxe-button>
        </template>
        <template v-else>
          <vxe-button @click="editRowEvent(row)" status="primary" type="text" icon="vxe-icon-edit">编辑</vxe-button>
        </template>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<script setup>
import {formatterVal} from '@/utils';
import {defineProps, onMounted, ref, watch,} from "vue";
import {getParmAllocationList,putParmAllocation} from '@/api/interestScheme'
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage} from "element-plus";

const props = defineProps(['currentRow']);
const dictStore = useDictionaryStore();
const xTable = ref();
let tableData = ref([]);

const getData = () => {
  getParmAllocationList({
    allocCode: props.currentRow.allocCode
  }).then(res => {
    if (res.success) {
      tableData.value = res.data;
    }
  })
}

watch(() => props.currentRow.allocCode, (allocCode) => {
  getData();
}, {immediate: true})

const isActiveStatus = (row) => {
  const $table = xTable.value
  if ($table) {
    return $table.isEditByRow(row)
  }
}
const editRowEvent = (row) => {
  const $table = xTable.value
  if ($table) {
    $table.setEditRow(row)
  }
}
const saveRowEvent = (row, index) => {
  const $table = xTable.value
  if ($table) {
    $table.clearEdit().then(() => {
      const {_X_ROW_KEY, ...rest} = row;
      putParmAllocation(rest).then(res=>{
        if(res.success){
          ElMessage({
            message: '修改成功',
            type: 'success',
          });
          getData();
        }
      })
    })
  }
}
const cancelRowEvent = (row) => {
  const $table = xTable.value
  if ($table) {
    $table.clearEdit().then(() => {
      // 还原行数据
      $table.revertData(row)
    })
  }
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

:deep(.el-dialog) {
  margin-top: 20vh !important;
}
</style>
