<template>
    <div class="info-line-chart" ref="xsChart"></div>
</template>
    
<script setup>
import { ref, onMounted } from "vue";
import * as echarts from "echarts";

const xsChart = ref();

onMounted(() => {
    const lines = echarts.init(xsChart.value);
    //灌溉流量图
    lines.setOption({
        title: {
            text: '',
            textStyle: {
                color: '#1791FF',
                fontSize: 16
            },
        },
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '8%',
            right: '15%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: '时序(h)',
            boundaryGap: false,
            data: [12, 24, 36, 48, 60, 72, 84, 96]
        },
        yAxis: {
            name: '水位(m)',
            type: 'value'
        },
        series: [
            {
                name: '警戒水位',
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: 'red',
                    width: 1,
                    type: 'dashed'
                },
                data: [30, 30, 30, 30, 30, 30]
            },
            {
                name: '闸前水位',
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#93C1FF',
                    width: 1,
                },
                data: [5, 6, 9, 12, 15, 18]
            },
            {
                name: '闸后水位',
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#72E4CF',
                    width: 1,
                },
                data: [6, 8, 12, 16, 20, 24]
            },
        ]
    }, true);
})
</script>
    
<style lang="scss" scoped>
.info-line-chart {
    width: 1200px;
    height: 300px;
}
</style>
  