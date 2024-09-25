<template>
    <!--裂缝位移数据监测-->
    <div class="app-container">
        <div style="display: inline-flex">
            <span style="line-height: 32px">监测时间:</span>
            <el-date-picker style="margin-left: 20px" v-model="value1" type="daterange" range-separator="-" value-format="YYYY-MM-DD" start-placeholder="开始时间" end-placeholder="结束时间" size="default" />
            <el-button style="margin-left: 20px" type="primary" :icon="Search" @click="getData">搜索</el-button>
            <el-button :icon="Refresh" @click="refresh()">重置</el-button>
            <el-button style="margin-left: 30px" type="success" plain icon="Download" @click="exportData">导出</el-button>
        </div>
        <div style="display: flex; margin-top: 20px">
            <div style="flex: 1" id="CrackDisplacementDataMonitoringEcharts" ref="CrackDisplacementDataMonitoringEcharts"></div>
            <div class="table">
                <el-table :data="TableData" height="700" v-loading="TableLoading"  element-loading-text="数据加载中">
                    <el-table-column prop="index" label="序号" width="50"></el-table-column>
                    <el-table-column prop="monitortime" label="监测时间"></el-table-column>
                    <el-table-column prop="name" label="设备名称"></el-table-column>
                    <el-table-column prop="value" label="裂缝张开度（mm）"></el-table-column>
                    <el-table-column prop="storagetime" label="入库时间"></el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getGateOpenClose } from '@/api/informationManager/timeData/gateOpenCloseTimeData';
import dayjs from 'dayjs';
import { getSkList } from '@/api/informationManager/timeData/lakeIndicatorTimeData';
import { gettblJcLfwy } from '@/api/informationManager/timeData/CrackDisplacementDataMonitoringTimeData';
import * as echarts from 'echarts';
let TableData = ref([]);
const value1 = ref('');
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
let TableLoading = ref(false)
const CrackDisplacementDataMonitoringEcharts = ref(null);
const { proxy } = getCurrentInstance();

onMounted(() => {
    value1.value=[dayjs(new Date()- 72*60*60*1000).format('YYYY-MM-DD 00:00:00'),dayjs(new Date()).format('YYYY-MM-DD 23:59:59')];
    getData();
    // getSkList({stType:'RR'}).then(res=>{
    //   if (res.success) {
    //     skList.value = res.data.map(r=>({label:r.stName,value:r.stCode}));
    //   }
    // })
});
const refresh = () => {
    value1.value=[dayjs(new Date()- 72*60*60*1000).format('YYYY-MM-DD 00:00:00'),dayjs(new Date()).format('YYYY-MM-DD 23:59:59')];
    getData();
};
const getData = () => {
    TableLoading.value = true;
    const chart1 = echarts.init(CrackDisplacementDataMonitoringEcharts.value);
    gettblJcLfwy({
        starttime: value1.value ? value1.value[0] : '',
        endtime: value1.value ? value1.value[1] : '',
        pageNum: currentPage.value,
        pageSize: pageSize.value
    }).then(res => {
        TableLoading.value = false;
        if (res.success) {
            res.data.map((item,index)=>{
                item.index = index+1;
            });
            chart1.setOption({
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: res.data.map(r => r.monitortime)
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {},
                yAxis: {
                    type: 'value',
                    name: '裂缝张开度(mm)',
                    nameTextStyle: {
                        color: '#aaa',
                        nameLocation: 'start'
                    }
                },
                series: [
                    {
                        data: res.data.map(r => r.value),
                        type: 'line',
                        name: '裂缝张开度(mm)',
                        showSymbol: false,
                        smooth: true,
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgba(51, 196, 255, 0.30)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(23, 145, 255, 0)'
                                }
                            ])
                        },
                        lineStyle: {
                            color: 'rgba(23, 145, 255, 1)'
                        }
                    }
                ]
            },true);
            TableData.value = res.data;
            // total.value = res.data.total;
        }
    });
};

const searchReset = () => {
    currentPage.value = 1;
    getData();
};

// 分页选择
const load = () => {
    getData();
};

const exportData = () => {
    proxy.download(
        '/business/huangtangMonitor/tblJcLfwy/page/export',
        {
            ...serachForm.value,
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            startTime: serachForm.value.tm ? serachForm.value.tm[0] : '',
            endTime: serachForm.value.tm ? serachForm.value.tm[1] : '',
            tm: null
        },
        `裂缝位移数据监测_${dayjs().format('YYYY-MM-DD')}.xlsx`
    );
};
</script>

<style scoped lang="scss">
.table {
    width: 900px;
}
</style>
