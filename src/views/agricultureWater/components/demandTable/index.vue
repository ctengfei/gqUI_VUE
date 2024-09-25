<template>
    <vxe-table border show-overflow ref="xTable" keep-source :span-method="mergeRowMethod" style="z-index: 1" height="400" :column-config="{ resizable: false }" :data="data">
        <vxe-column field="irrigation" title="片区" width="130" align="center"></vxe-column>
        <vxe-colgroup title="所需王英水库灌溉的净灌溉需水量(万m³)" align="center">
            <vxe-column :field="item" :title="item" align="center" v-for="item in keys" :key="item"></vxe-column>
        </vxe-colgroup>
        <vxe-column field="yearTotal" title="合计" width="80" align="center"></vxe-column>
    </vxe-table>
</template>

<script setup>
import { defineProps, onMounted, ref, watch, defineExpose } from 'vue';
import { getTrr, getAFA } from '@/api/agricultureWater';
const props = defineProps(['allocCode', 'type']);
const xTable = ref();
let data = ref([]);
let keys = ref([]);
watch(
    () => props.allocCode,
    a => {
        getData();
    },
    { immediate: true }
);
defineExpose({
    refresh
});
function refresh() {
    getData();
}
//查询预测灌溉需水列表数据
function getData() {
    const allocCode = props.allocCode;
    if (props.type == 0) {
        getTrr({ allocCode }).then(res => {
            if (res.success) {
                const { monthList, resultWaterList } = res.data || {};
                keys.value = monthList || [];
                data.value = resultWaterList || [];
            }
        });
    } else {
        getAFA({ allocCode }).then(res => {
            if (res.success) {
                const { monthList, resultWaterList } = res.data || {};
                keys.value = monthList || [];
                data.value = resultWaterList || [];
            }
        });
    }
}
const mergeRowMethod = ({ row, _rowIndex, column, visibleData }) => {
    const fields = ['irrigation'];
    const cellValue = row[column.field];
    if (cellValue && fields.includes(column.field)) {
        const prevRow = visibleData[_rowIndex - 1];
        let nextRow = visibleData[_rowIndex + 1];
        if (prevRow && prevRow[column.field] === cellValue) {
            return { rowspan: 0, colspan: 0 };
        } else {
            let countRowspan = 1;
            while (nextRow && nextRow[column.field] === cellValue) {
                nextRow = visibleData[++countRowspan + _rowIndex];
            }
            if (countRowspan > 1) {
                return { rowspan: countRowspan, colspan: 1 };
            }
        }
    }
};
</script>

<style scoped></style>
