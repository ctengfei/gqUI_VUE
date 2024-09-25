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
        legend: {
            data: ['过闸流量', '警戒水位', '闸前水位', '闸后水位']
        },
        grid: {
            left: '8%',
            right: '15%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            show: false,
            type: 'category',
            name: '时序(h)',
            boundaryGap: false,
            data: [12, 24, 36, 48, 60, 72, 84, 96]
        },
        yAxis: {
            name: '过闸流量(m³/s)',
            type: 'value'
        },
        series: [
            {
                name: '过闸流量',
                type: 'line',
                smooth: true,
                data: [41.97, 351.97, 261.97, 371.97, 481.97, 591.97]
            },
            {
                name: '警戒水位',
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: 'red',
                    width: 1,
                    type: 'dashed'
                },
                data: []
            },
            {
                name: '闸前水位',
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#93C1FF',
                    width: 1,
                },
                data: []
            },
            {
                name: '闸后水位',
                type: 'line',
                smooth: true,
                lineStyle: {
                    color: '#72E4CF',
                    width: 1,
                },
                data: []
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
  