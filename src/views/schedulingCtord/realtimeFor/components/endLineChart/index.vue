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
            text: '面雨量',
            textStyle: {
                color: '#1791FF',
                fontSize: 16
            },
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['雨量']
        },
        grid: {
            top: '6%',
            left: '8%',
            right: '10%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: '时间',
            data: props.lineData.xData,
            position: 'top',
            axisLabel: {
                rotate: -30,
                formatter(value, index) {
                    let years = value.split(' ')[0].split('-');
                    let hours = value.split(' ')[1].split(':')[0]
                    return `${years[1]}-${years[2]} ${hours}`;
                }
            },
            axisLine: {
                onZero: false
            }
        },
        yAxis: [{
                  name: '面雨量(mm)',
                  type: 'value',
                  inverse: true,
                  position: 'bottom',
                  min: minVal, // 设置最小值
                    max: maxVal, // 设置最大值
                //   nameLocation: 'end',
                }
               ],
        series: [
            {
                  name: '雨量',
                  type: 'bar',
                  yAxisIndex: 0,
                  showSymbol: false,
                  smooth: true,
                  tooltip: {
                    valueFormatter: function (value) {
                      return value + ' mm';
                    }
                  },
                  data: props.lineData.yData
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
    height: 100%;
    margin-top: 10px;
}
</style>
  