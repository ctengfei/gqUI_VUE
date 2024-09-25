<template>
    <div style="display: flex; flex-direction: column; height: 100%">
        <div class="card">
            <li>
                <i class="icon1"></i>
                <div class="info">
                    <h3>总灌溉面积</h3>
                    <strong>
                        {{ total.totIrrArea }}
                        <span>km²</span>
                    </strong>
                </div>
            </li>
            <li>
                <i class="icon2"></i>
                <div class="info">
                    <h3>有效灌溉面积</h3>
                    <strong>
                        {{ total.effIrrArea }}
                        <span>km²</span>
                    </strong>
                </div>
            </li>
        </div>
        <div class="chart-box">
            <li>
                <h3>种植面积统计</h3>
                <div ref="GQchart1" id="GQchart1"></div>
            </li>
            <li>
                <h3 style="display: flex; align-items: baseline">
                    <span style="margin-right: 5px">多年灌溉实际用水量统计</span>
                    <a-range-picker :allowClear="false" :getPopupContainer="node => node.parentNode" v-model:value="year" picker="year" valueFormat="YYYY" :placeholder="['开始年份', '结束年份']" />
                </h3>
                <div ref="GQchart2" id="GQchart2"></div>
            </li>
            <li>
                <h3>本年灌溉用水量统计</h3>
                <div ref="GQchart3" id="GQchart3"></div>
            </li>
        </div>
    </div>
</template>

<script setup>
import { onMounted, nextTick, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { getGqList } from '@/api/informationManager/basicData/gqBasicData';
import { getPlant } from '@/api/remoteMonitoring';
import { getMonthStatistics, getYearStatistics } from '@/api/waterManager/actualWaterManager';
import dayjs from 'dayjs';
const GQchart1 = ref();
const GQchart2 = ref();
const GQchart3 = ref();
const barWidth = 20;
const year = ref([dayjs().subtract(5, 'year').format('YYYY'), dayjs().format('YYYY')]);
let total = ref({});
nextTick(() => {
    getGqList({ irrCode: '7170030' }).then(res => {
        if (res.success) {
            total.value = res.data.length ? res.data[0] : {};
        }
    });
    getYearWaterConsumption();
    // 种植面积
    getPlant({ mapId: '1692466825790787586' }).then(res => {
        if (res.success) {
            const chart1 = echarts.init(GQchart1.value);
            const mergedData1 = {};
            const mergedData2 = {};
            let series = [];
            let xAxis = [];
            let legend = [];
            res.data.forEach(r => (r.plantArea = parseFloat(r.plantArea).toFixed(2)));
            res.data.forEach(r => {
                mergedData1[r.areaName] = mergedData1[r.areaName] || [];
                mergedData1[r.areaName].push(r);
                mergedData2[r.crop] = mergedData2[r.crop] || [];
                mergedData2[r.crop].push(r.plantArea);
            });
            xAxis = Object.keys(mergedData1);
            for (const key2 in mergedData2) {
                legend.push(key2);
                series.push({
                    name: key2,
                    data: mergedData2[key2],
                    type: 'bar',
                    barGap: '50%',
                    barWidth: barWidth,
                    tooltip: {
                        valueFormatter: function (value) {
                            return value + ' km²';
                        }
                    },
                    stack: 'total'
                });
            }
            chart1.setOption(
                {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '5%',
                        top: '12%',
                        containLabel: true
                    },
                    legend: {},
                    xAxis: {
                        type: 'category',
                        data: xAxis
                    },
                    yAxis: {
                        type: 'value',
                        name: 'km²',
                        nameTextStyle: {
                            nameLocation: 'start'
                        }
                    },
                    series: series
                },
                true
            );
        }
    });

    getMonthStatistics({
        year: dayjs().format('YYYY')
    }).then(res => {
        if (res.success) {
            const chart3 = echarts.init(GQchart3.value);
            const xAxis = res.data.map(r => `${r.month.split('-')[1].replace(/^0/, '')}月`);
            const data = res.data.map(r => r.irrigateEq || 0);
            chart3.setOption(
                {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {},
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '5%',
                        top: '7%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: xAxis
                    },
                    yAxis: {
                        name: '万m³',
                        type: 'value'
                    },
                    series: [
                        {
                            name: '灌溉水量',
                            data: data,
                            type: 'bar',
                            barWidth: barWidth,
                            tooltip: {
                                valueFormatter: function (value) {
                                    return value + ' 万m³';
                                }
                            },
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(87, 199, 119, 1)' },
                                    { offset: 1, color: 'rgba(87, 199, 119, 0.20)' }
                                ])
                            }
                        }
                    ]
                },
                true
            );
        }
    });
});

const getYearWaterConsumption = () => {
    // 灌溉水量
    getYearStatistics({
        startYear: year.value[0],
        endYear: year.value[1]
    }).then(res => {
        if (res.success) {
            const xAis = res.data.map(r => r.year);
            const data = res.data.map(r => r.irrigateEq);
            const chart2 = echarts.init(GQchart2.value);
            chart2.setOption(
                {
                    xAxis: {
                        type: 'category',
                        data: xAis,
                        boundaryGap: false
                    },
                    legend: {},
                    grid: {
                        left: '2%',
                        right: '3%',
                        bottom: '5%',
                        top: '9%',
                        containLabel: true
                    },
                    yAxis: {
                        name: '万m³',
                        type: 'value'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    series: [
                        {
                            data: data,
                            type: 'line',
                            name: '灌溉水量',
                            showSymbol: false,
                            smooth: true,
                            areaStyle: {
                                opacity: 0.8,
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {
                                        offset: 0,
                                        color: 'rgba(252, 127, 0, .2)'
                                    },
                                    {
                                        offset: 1,
                                        color: 'rgba(53, 194, 254, .1)'
                                    }
                                ])
                            },
                            tooltip: {
                                valueFormatter: function (value) {
                                    return value + ' 万m³';
                                }
                            },
                            lineStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(252, 127, 0, .5)' },
                                    { offset: 1, color: 'rgba(53, 194, 254, .5)' }
                                ])
                            }
                        }
                    ]
                },
                true
            );
        }
    });
};

watch(year, (year, oldyear) => {
    getYearWaterConsumption();
});
</script>

<style scoped lang="scss">
li {
    list-style-type: none;
}
.card {
    display: flex;
    height: 108px;
    margin-top: 10px;
    margin-bottom: 30px;
    .icon1 {
        display: inline-block;
        width: 40px;
        height: 40px;
        background: url('../../../../../../assets/images/icon2.png') no-repeat center center;
        background-size: cover;
        margin-left: 30px;
        margin-top: 20px;
    }
    .icon2 {
        display: inline-block;
        width: 40px;
        height: 40px;
        background: url('../../../../../../assets/images/icon1.png') no-repeat center center;
        background-size: cover;
        margin-left: 30px;
        margin-top: 20px;
    }
    .info {
        display: inline-block;
        vertical-align: middle;
        margin-left: 15px;
        h3 {
            font-size: 16px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: bold;
            color: #333333;
            margin: 0;
            text-align: left;
        }
        strong {
            font-size: 30px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #1791ff;
            span {
                font-size: 14px;
                color: #999;
            }
        }
    }
    li {
        flex: 1;
        height: 108px;
        background: #f4f8fb;
        border-radius: 4px;
        text-align: center;
    }
    li:nth-child(1) {
        margin-right: 30px;
    }
}
.chart-box {
    display: flex;
    height: 100%;
    flex: 1;
    li {
        display: flex;
        flex-direction: column;
        flex: 1;
        border-radius: 4px;
        margin-right: 15px;
        h3 {
            position: relative;
            font-size: 14px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: bold;
            color: #666666;
            padding-left: 30px;
            background: #f4f8fb;
            margin-bottom: 2px;
            height: 40px;
            line-height: 40px;
            &:after {
                content: '';
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                width: 2px;
                height: 10px;
                background: #1791ff;
            }
        }
        #GQchart1,
        #GQchart2,
        #GQchart3 {
            flex: 1;
            background: #f4f8fb;
        }
        .tis {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            background: #f4f8fb;
            .legend {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                margin: 0 12px;
                .co-head {
                    display: flex;
                    align-items: center;
                    i {
                        display: inline-block;
                        width: 10px;
                        height: 10px;
                        margin-right: 5px;
                        margin-top: 3px;
                    }

                    span {
                        white-space: nowrap;
                        color: #999999;
                        font-size: 14px;
                    }
                }
                strong {
                    font-weight: bold;
                    color: #666666;
                    font-size: 18px;
                    margin-top: 8px;
                    span {
                        color: #999;
                        font-size: 12px;
                    }
                }
            }
            .legend:nth-child(1) .co-head i {
                box-shadow: 0px 0px 4px 1px rgba(44, 155, 253, 0.5);
                border: 2px solid rgba(44, 155, 253, 1);
                border-radius: 50px;
            }
            .legend:nth-child(2) .co-head i {
                box-shadow: 0px 0px 4px 1px rgba(123, 104, 238, 0.5);
                border: 2px solid rgba(123, 104, 238, 1);
                border-radius: 50px;
            }
            .legend:nth-child(3) .co-head i {
                box-shadow: 0px 0px 4px 1px rgba(87, 199, 119, 0.5);
                border: 2px solid rgba(87, 199, 119, 1);
                border-radius: 50px;
            }
            .legend:nth-child(4) .co-head i {
                box-shadow: 0px 0px 4px 1px rgba(252, 127, 0, 0.5);
                border: 2px solid rgba(252, 127, 0, 1);
                border-radius: 50px;
            }
            .legend:nth-child(5) .co-head i {
                box-shadow: 0px 0px 4px 1px rgba(255, 147, 147, 0.5);
                border: 2px solid rgba(255, 147, 147, 1);
                border-radius: 50px;
            }
        }
    }
    li:last-child {
        margin-right: 0;
    }
}
</style>
