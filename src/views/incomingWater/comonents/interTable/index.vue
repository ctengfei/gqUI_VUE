<template>
    <vxe-table keep-source border show-overflow ref="xTable" :column-config="{ resizable: false }" :edit-config="{ trigger: 'manual', mode: 'row', showIcon: false }" :data="data">
        <vxe-column field="type" title="类别" align="center" width="150"></vxe-column>
        <vxe-column :edit-render="{}" :field="item.month" :title="item.monthValue" width="140" align="center" v-for="item in keys" :key="item">
            <template #edit="{ row }">
                <vxe-input v-model.number="row[item.month]" type="number" min="0"></vxe-input>
            </template>
        </vxe-column>
        <vxe-column field="total" title="合计" fixed="right" width="109" align="center"></vxe-column>
        <vxe-column title="操作" align="center" fixed="right" width="160">
            <template #default="{ row, rowIndex }">
                <template v-if="rowIndex == 1 || rowIndex == 3">
                    <template v-if="isActiveStatus(row)">
                        <vxe-button @click="saveRowEvent(row, rowIndex)" status="primary">保存</vxe-button>
                        <vxe-button @click="cancelRowEvent(row)">取消</vxe-button>
                    </template>
                    <template v-else>
                        <vxe-button @click="editRowEvent(row)" status="primary" type="text" icon="vxe-icon-edit">编辑</vxe-button>
                    </template>
                </template>
            </template>
        </vxe-column>
    </vxe-table>
</template>

<script setup>
import { defineProps, onMounted, ref, watch, defineExpose } from 'vue';
import { getIntervention, postInflow } from '@/api/incomingWater';
import dayjs from 'dayjs';
const props = defineProps(['currentPlan']);
const xTable = ref();
let data = ref([]);
let keys = ref([]);
onMounted(() => {
    getData();
});
defineExpose({
    refresh
});
function refresh() {
    getData();
}
//查询人工干预列表数据
function getData() {
    const currentPlan = props.currentPlan;
    getIntervention({
        allocCode: currentPlan.allocCode,
        unitCode: currentPlan.unitCode
    }).then(res => {
        if (res.success) {
            const { monthList, resultWaterList } = res.data || {};
            keys.value = monthList || [];
            data.value = resultWaterList.map(r => ({ ...r, type: `${r.type}` })) || [];
        }
    });
}

const isActiveStatus = row => {
    const $table = xTable.value;
    if ($table) {
        return $table.isEditByRow(row);
    }
};
const editRowEvent = row => {
    const $table = xTable.value;
    if ($table) {
        $table.setEditRow(row);
    }
};
const saveRowEvent = (row, index) => {
    const $table = xTable.value;
    if ($table) {
        $table.clearEdit().then(() => {
            const currentPlan = props.currentPlan;
            delete row.total;
            delete row.type;
            delete row._X_ROW_KEY;
            postInflow({
                allocCode: currentPlan.allocCode,
                unitCode: currentPlan.unitCode,
                waterType: index == 1 ? '1' : '2',
                monthOrDay: row
            }).then(res => {
                if (res.success) {
                    getData();
                }
            });
        });
    }
};
const cancelRowEvent = row => {
    const $table = xTable.value;
    if ($table) {
        $table.clearEdit().then(() => {
            // 还原行数据
            $table.revertData(row);
        });
    }
};
</script>

<style scoped></style>
