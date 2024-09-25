<template>
    <div class="info-line-chart" ref="xsChart"></div>
</template>
    
<script setup>
import { ref, onMounted ,watch} from "vue";
import * as echarts from "echarts";

const xsChart = ref();
let props = defineProps(['lineData'])
watch(()=>props.lineData,(val)=>{
    if(val){
        init()
    }
    
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
            data: ['水位']
        },
        grid: {
            left: '8%',
            right: '10%',
            bottom: '6%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: props.lineData.xLine,
            data: props.lineData.xData
        },
        yAxis: [{
            name: '水位(m)',
            type: 'value',
        }],
        series: [
            {
                name: '水位',
                type: 'line',
                // stack: 'Total',
                data: props.lineData.yData
            }
        ],
        animationDuration: 0,
        animationEasing: 'cubicInOut'
    }, true);
}
onMounted(() => {
    init();
    window.addEventListener("resize", () => {
        init();
    })
})

</script>
    
<style lang="scss" scoped>
.info-line-chart {
    width: 90%;
    height: 300px;
    margin-top: 10px;
}
</style>
  