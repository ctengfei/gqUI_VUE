<template>
    <div class="info-line-chart" ref="xsChart"></div>
</template>
    
<script setup>
import { ref, onMounted ,watch} from "vue";
import * as echarts from "echarts";

const xsChart = ref();
let props = defineProps(['lineData'])
watch(()=>props.xData,(val)=>{
    init()
})
const init=()=>{
    const lines = echarts.init(xsChart.value);
    //灌溉流量图
    lines.setOption({
        title: {
            text: '总干渠',
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
            left: '5%',
            right: '9%',
            bottom: '4%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: '桩号',
            data: props.lineData.xData
        },
        yAxis: [{
            name: '高度(m)',
            type: 'value',
        }],
        series: [
            {
                name: '水位',
                type: 'line',
                // stack: 'Total',
                data: props.lineData.yData1
            },
            {
                name: '底高',
                type: 'line',
                // stack: 'Total',
                lineStyle: {
                    color: '#5470C6',
                    width: 1,
                    type: 'dashed'
                },
                data: props.lineData.yData2
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
    height: 200px;
    margin-top: 10px;
}
</style>
  