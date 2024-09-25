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
    
    //获取y轴范围
    let maxVal = 0;
    let minVal = 0;
    if(props.lineData.yData != null){
        maxVal = Math.max(...Object.values(props.lineData.yData));
        maxVal = Math.ceil(maxVal);
        minVal = Math.min(...Object.values(props.lineData.yData));
        minVal = Math.floor(minVal);
    }
    

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
            data: ['水位','流量']
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
            min: minVal, // 设置最小值
            max: maxVal, // 设置最大值
            } ,{
                  name: '流量(m³/s)',
                  type: 'value',
                  nameLocation: 'end',
                }
               ],
        series: [
            {
                name: '水位',
                type: 'line',
                // stack: 'Total',
                data: props.lineData.yData
            },{
                  name: '流量',
                  type: 'line',
                  yAxisIndex: 0,
                  showSymbol: false,
                  smooth: true,
                  tooltip: {
                    valueFormatter: function (value) {
                      return value + ' m³/s';
                    }
                  },
                  data: props.lineData.y1Data
                },
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
  