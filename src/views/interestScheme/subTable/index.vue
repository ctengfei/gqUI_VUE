<template>
  <vxe-table
      border
      show-overflow
      ref="xTable"
      :column-config="{resizable: false}"
      :data="props.tableData"
      style="margin-top: 15px;z-index: 1"
      :edit-config="{trigger: 'manual', mode: 'row'}">
    <vxe-column field="date" title="日期" align="center" width="120">
    </vxe-column>
    <vxe-column field="inflowWater" title="来水量(万m³)"  width="120" align="center">
    </vxe-column>
    <vxe-colgroup  title="水量平衡(万m³)" align="center">
      <vxe-colgroup  title="城乡(万m³)" align="center">
        <vxe-column field="urbanDemand" title="需水"  align="center">
        </vxe-column>
        <vxe-column field="urbanSupply" title="供水" align="center">
        </vxe-column>
        <vxe-column field="urbanShortage" title="缺水" align="center">
        </vxe-column>
      </vxe-colgroup>
      <vxe-colgroup  title="生态发电(万m³)" align="center">
        <vxe-column field="ecoDemand" title="需水"  align="center">
        </vxe-column>
        <vxe-column field="ecoSupply" title="供水" align="center">
        </vxe-column>
        <vxe-column field="ecoShortage" title="缺水" align="center">
        </vxe-column>
      </vxe-colgroup>
      <vxe-colgroup  title="灌溉(万m³)" align="center">
        <vxe-column field="irrigationDemand" title="需水"  align="center">
        </vxe-column>
        <vxe-column field="irrigationSupply" title="供水" align="center">
        </vxe-column>
        <vxe-column field="irrigationShortage" title="缺水" align="center">
        </vxe-column>
      </vxe-colgroup>
      <vxe-column field="reservoirWaterLoss" title="库水损失(万m³)" align="center">
      </vxe-column>
      <vxe-column field="electricityGenerationCapacity" title="发电水量(万m³)"  align="center">
      </vxe-column>
      <vxe-column field="abandonedWater" title="弃水(万m³)"  width="65" align="center">
      </vxe-column>
    </vxe-colgroup>
    <vxe-colgroup  title="水库水情" align="center">
      <vxe-column field="endMonthWaterStorage" title="月末蓄水量(万m³)" align="center">
      </vxe-column>
      <vxe-column field="endMonthWaterLevel" title="月末库水位(m)" align="center">
      </vxe-column>
      <vxe-column field="fillStorageRatio" title="蓄满率(%)" align="center">
      </vxe-column>
    </vxe-colgroup>
  </vxe-table>
</template>

<script setup>
import {computed, defineProps, ref} from "vue";
const props = defineProps(['tableData'])
let tableData = ref([{name1:'一月'}]);

</script>

<style scoped>

</style>