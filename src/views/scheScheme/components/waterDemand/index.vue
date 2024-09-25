<template>
  <vxe-table border show-overflow height="350" ref="xTable" :column-config="{ resizable: false }"
    :edit-config="{ trigger: 'manual', mode: 'row', showIcon:false }" :data="tableData">
    <vxe-column field="allocCode" title="方案编码" align="center">
    </vxe-column>
    <vxe-column field="spChanCode" title="上级渠道编码" align="center">
    </vxe-column>
    <vxe-column field="spChanName" title="上级渠道名称" align="center">
    </vxe-column>
    <vxe-column field="chanCode" title="渠道编码" align="center">
    </vxe-column>
    <vxe-column field="chanName" title="渠道名称" align="center">
    </vxe-column>
    <vxe-column field="iwrMaoUser" title="毛灌溉需水量(m³)" align="center" :edit-render="{}">
      <template #edit="{ row }">
        <vxe-input type="number" v-model="row.iwrMaoUser"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column title="操作" align="center" fixed="right" width="150" >
      <template #default="{ row,rowIndex }" >
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
  <div class="footer">
    <el-button type="primary" size="default" @click="nextStep">下一步</el-button>
  </div>
</template>

<script setup>
import { getChannelList, getWaterDemandList, updateWaterDemand } from "@/api/scheSchemeData";
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps(['allocCode'])
const emits = defineEmits(['changeStep'])
const xTable = ref()
let tableData = ref([]);

onMounted(() => {
  getData()
})

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
const saveRowEvent = (row,index) => {
  const $table = xTable.value
  if ($table) {
    $table.clearEdit().then(() => {
     const data = xTable.value.getTableData().tableData;
      const params = data.map(item => {
        const { _X_ROW_KEY, ...rest } = item
        return rest
      })
      updateWaterDemand(props.allocCode, params).then(res => {
        if (res.success) {
          ElMessage({
            message: '操作成功',
            type: 'success',
          });
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


//获取列表数据
const getData = () => {
  const params = {
    pageNum: 1,
    pageSize: 9999,
    allocCode: props.allocCode
  }
  getWaterDemandList(params).then(res => {
    if (res.success) {
      const list = res.data
      if (list && list.length > 0) {
        tableData.value = list.map(item => ({ ...item, allocCode: props.allocCode }))
      } else {
        getChannelData()
      }
    }
  })
}
//获取渠道列表
const getChannelData = () => {
  getChannelList({ pageNum: 1, pageSize: 9999 }).then(res => {
    if (res.success) {
      const list = res.data
      if (list && list.length > 0) {
        tableData.value = list.map(item => ({ ...item, allocCode: props.allocCode, iwrMaoUser: 0 }))
      } else {
        tableData.value = []
      }
    }
  })
}
//更新需水量
const nextStep = () => {
  // const arr = tableData.value
  // const params = arr.map(item => {
  //   const { _X_ROW_KEY, ...rest } = item
  //   return rest
  // })
  // updateWaterDemand(props.allocCode, params).then(res => {
  //   if (res.success) {
  //     ElMessage({
  //       message: '操作成功',
  //       type: 'success',
  //     });
  //
  //   }
  // })
  emits('changeStep', 1)
}
</script>

<style scoped>
.footer {
  text-align: center;
  margin-top: 30px;
}
</style>