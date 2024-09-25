<template>
    <div class="info-line-chart" ref="xsChart"></div>
</template>
    
<script setup>
import { ref, onMounted ,watch} from "vue";
import * as echarts from "echarts";

const xsChart = ref();
let props = defineProps(['title', 'xData', 'yData1', 'yData2'])
watch(()=>props.xData,(val)=>{
    init()
})
const init=()=>{
    const lines = echarts.init(xsChart.value);
    //灌溉流量图
    lines.setOption({
        title: {
            text: props.title,
            textStyle: {
                color: '#1791FF',
                fontSize: 16
            },
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['水位', '底高']
        },
        grid: {
            left: '8%',
            right: '15%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: '桩号',
            boundaryGap: false,
            data: props.xData
        },
        yAxis: {
            name: '高度(m)',
            type: 'value'
        },
        series: [
            {
                name: '水位',
                type: 'line',
                stack: 'Total',
                data: props.yData1
            },
            {
                name: '底高',
                type: 'line',
                stack: 'Total',
                lineStyle: {
                    color: '#5470C6',
                    width: 1,
                    type: 'dashed'
                },
                data: props.yData2
            },
        ],
        animationDuration: 0,
        animationEasing: 'cubicInOut'
    }, true);
}
onMounted(() => {
    init()
})
</script>
    
<style lang="scss" scoped>
.info-line-chart {
    width: 100%;
    height: 160px;
    margin-top: 16px;
}
</style>
  