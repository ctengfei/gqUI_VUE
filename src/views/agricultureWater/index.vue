<template>
    <template v-if="visible">
        <div style="padding: 20px 20px; height: 100%; display: flex; flex-direction: column; overflow: auto">
            <div class="detail-content">
                <div class="lf">
                    <subTable @setVisible="setVisible" @getCurrentRow="getCurrentRow" />
                </div>
                <div class="rg">
                    <div class="card-container">
                        <li>
                            <span>
                                <i></i>
                                年灌溉平均供水量 (万m³)
                            </span>
                            <strong>{{ statistics.yearAvgSupply }}</strong>
                        </li>
                        <li>
                            <span>
                                <i></i>
                                本年灌溉已供水量 (万m³)
                            </span>
                            <strong>{{ statistics.nowYearSumSupply }}</strong>
                        </li>
                        <li>
                            <span>
                                <i></i>
                                本月灌溉已供水量 (万m³)
                            </span>
                            <strong>{{ statistics.nowMonthSumSupply }}</strong>
                        </li>
                    </div>
                    <span class="head-title">历史年灌溉用水量</span>
                    <div id="GgChart" ref="GgChart" style="flex: 1; text-align: center"></div>
                </div>
            </div>
        </div>
    </template>
    <template v-else>
        <div class="app-container">
            <div class="head">
                <div class="lf">
                    <span class="head-title" style="font-size: 18px">方案制定</span>
                    <li>
                        <span>方案名称：</span>
                        <el-input v-model="currentRow.allocName" clearable="true" placeholder="请输入方案名称" />
                    </li>
                    <li>
                        <span style="margin-left: 15px">预报时段：</span>
                        <el-input v-model="year" disabled />
                    </li>
                    <li>
                        <el-button type="primary" @click="handleCount">计算</el-button>
                        <el-button type="primary" :disabled="CalculationMethod!=0" @click="handlOptimizing">优化计算</el-button>
                        <el-button type="primary" :disabled="CalculationMethod!=0" @click="handlParams">参数设置</el-button>
                    </li>
                    <!-- <li>
                        <el-radio-group v-model="CalculationMethod">
                            <el-radio-button  label="0" size="large">定额法</el-radio-button>
                            <el-radio-button  label="1" size="large">相似年法</el-radio-button>
                        </el-radio-group>
                    </li> -->
                </div>
                <div class="rg">
                    <el-button type="primary" link :icon="ArrowLeftBold" @click="visible = !visible">返回</el-button>
                </div>
            </div>
            <div>
                <el-radio-group v-model="CalculationMethod">
                    <el-radio-button label="0">定额法</el-radio-button>
                    <el-radio-button label="1">相似年法</el-radio-button>
                </el-radio-group>
            </div>
            <!-- <div style="margin-top: 10px" v-if="CalculationMethod == 0">
                <el-button type="primary" @click="handlOptimizing">优化计算</el-button>
                <el-button type="primary" @click="handlParams">参数设置</el-button>
            </div> -->
            <div class="parameters" v-if="CalculationMethod == 0">
                <div class="settings-top">
                    <div class="head-title">灌水定额配置</div>
                    <el-tabs v-model="activeName">
                        <el-tab-pane v-for="tab in tabs" :label="tab.label" :name="tab.value" :key="tab.value"></el-tab-pane>
                    </el-tabs>
                    <allocation :unitCode="activeName" :allocCode="currentRow.allocCode" :refreshGq="refreshGq" />
                </div>
                <div class="settings-bottom">
                    <div class="rate-alas">
                        <div class="head-title">王英水用水比例分析-参考蓄保水量</div>
                        <el-tabs v-model="activeTab">
                            <el-tab-pane v-for="tab in tabs" :label="tab.label" :name="tab.value" :key="tab.value"></el-tab-pane>
                        </el-tabs>
                        <div class="tab-content">
                            <rateTable :data="tableData1" :activeTab="activeTab" :allocCode="currentRow.allocCode" :refresh="refresh" @setRefresh="setRefresh" />
                            <div class="rt">
                                <li>
                                    <div class="title">灌区内部可供水量</div>
                                    <div class="txt">
                                        <span>{{ total.irrigationSupplyValue || 0 }}</span>
                                        万m³
                                    </div>
                                </li>
                                <li>
                                    <div class="title">王英水库需供水量</div>
                                    <div class="txt">
                                        <span>{{ total.wangyingSupplyValue || 0 }}</span>
                                        万m³
                                    </div>
                                </li>
                                <li>
                                    <div class="title">王英水库使用比例</div>
                                    <div class="txt">
                                        <span>{{ total.wangyingWaterRatio || 0 }}</span>
                                    </div>
                                </li>
                                <li>
                                    <div class="title">王英水库使用比例</div>
                                    <div class="txt">
                                        <span>{{ total.irrigationSupplyValueTotal || 0 }}</span>
                                        万m³
                                    </div>
                                </li>
                                <li>
                                    <div class="title">王英水库需供总水量</div>
                                    <div class="txt">
                                        <span>{{ total.wangyingSupplyValueTotal || 0 }}</span>
                                        万m³
                                    </div>
                                </li>
                                <li>
                                    <div class="title">王英水库使用总比例</div>
                                    <div class="txt">
                                        <span>{{ total.wangyingWaterRatioTotal || 0 }}</span>
                                    </div>
                                </li>
                            </div>
                        </div>
                    </div>
                    <!-- <div class="head-title" style="margin: 10px 0">净灌溉需水量</div> -->
                    <el-tabs v-model="activeNameTable" class="demo-tabs">
                        <el-tab-pane label="净灌溉需水量" name="first">
                            <demandTable ref="demandTableRefJing" :allocCode="currentRow.allocCode" :type="CalculationMethod" />
                        </el-tab-pane>
                        <el-tab-pane label="预测毛灌溉需水量" name="second">
                            <demandTable ref="demandTableRefMao" :allocCode="currentRow.allocCode" :type="1" />
                        </el-tab-pane>
                    </el-tabs>
                    <!-- <div class="head-title" style="margin: 10px 0"></div>
                    
                    <div class="head-title" style="margin: 10px 0"></div> -->
                </div>
            </div>
            <div class="parameters" v-if="CalculationMethod == 1">
                <div style="display: flex; flex: 1">
                    <div style="flex: 1">
                        <div class="head-title" style="margin: 10px 0">相似年选取</div>
                        <!-- <el-button type="primary">相似年选取</el-button> -->
                        <yearTable style="margin-top: 5px" :planForm="planForm" :allocCode="currentRow.allocCode" :visible="visible1" ref="yearTableRef" @handleActive="handleActive" />
                    </div>
                    <div style="display: flex; flex-direction: column; flex: 1; margin-left: 10px">
                        <el-tabs v-model="activeNameYear" @tab-change="tabClick">
                            <el-tab-pane v-for="tab in tabs" :label="tab.label" :name="tab.value" :key="tab.value"></el-tab-pane>
                        </el-tabs>
                        <el-table :data="dataYear" height="340">
                            <el-table-column prop="timeInterval" label="时段" width="200" align="center"></el-table-column>
                            <el-table-column prop="totalW" label="实际灌溉水量(万m³)" align="center"></el-table-column>
                        </el-table>
                    </div>
                </div>
                <div>
                    <div class="head-title" style="margin: 10px 0">预测毛灌溉需水量</div>
                    <demandTable ref="demandTableRefMao" :allocCode="currentRow.allocCode" :type="CalculationMethod" />
                </div>
            </div>
        </div>
    </template>
    <el-dialog v-model="dialogVisible1" title="参数设置" draggable width="80%">
        <paramsSetting />
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible1 = false">关闭</el-button>
                <el-button type="primary" @click="dialogVisible1 = false">确定</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ArrowLeftBold } from '@element-plus/icons-vue';
import subTable from './components/subTable';
import allocation from './components/allocation';
import rateTable from './components/rateTable';
import demandTable from './components/demandTable';
import paramsSetting from './components/paramsSetting';
import yearTable from './components/yearTable';
import { onMounted, ref, watch } from 'vue';
import { ElLoading } from 'element-plus';
import { getArg, getCapacityList, getChart, getRwWater, getArgWaterBtn, parmArgList, getsimilarYearsArgByUnicoeAndAllocde } from '@/api/agricultureWater';
import * as echarts from 'echarts';
let CalculationMethod = ref(0);
let statistics = ref({});
let tabs = ref([]);
let visible = ref(true);
let dialogVisible1 = ref(false);
let activeName = ref('');
let activeNameTable = ref('first');
let activeNameYear = ref('');
let activeTab = ref('');
let GgChart = ref(null);
let currentRow = ref(null);
let refresh = ref([]);
let refreshGq = ref(false);
let total = ref({});
let tableData1 = ref([]);
let dataYear = ref([]);
let year = ref('');
let demandTableRefJing = ref();
let yearTableRef = ref();
let downloadLoadingInstance = null;
let planForm = ref({
    methodGivenFrequency: '', // 是否给定来水频率（1是，0否）
    methodGivenRainfall: '', // 是否给定面雨量（1是，0否）
    givenForecastFrequency: '', //  预报期来水频率（小数）
    givenForecastRainfall: '', // 预报期预报雨量（mm）
    methodFcstRainfallTypical: '', // 典型年法 （1:是，0:否）
    methodFcstRunoffRpratio: '' // 径流系数 （1是，0否）
});
let currentPlan = ref({ unitCode: '', allocName: '', allocCode: '' });
let visible1 = ref(true);
const formVal = ref({
    coeRestorageSma: 0,
    coeRestorageXxsk: 0,
    coeRestorageZxsk: 0,
    coeWaterUseChannel: 0,
    coeWaterUseFiled: 0,
    coeWaterUseSma: 0,
    coeWaterUseXxsk: 0,
    coeWaterUseZxsk: 0,
    unitCode: '',
    unitName: ''
});
onMounted(() => {
    getArg({ type: 'arg' }).then(res => {
        if (res.success) {
            tabs.value = res.data.map(r => ({ label: r.unitName, value: r.unitCode }));
            activeName.value = tabs.value.length ? tabs.value[0].value : '';
            activeNameYear.value = tabs.value.length ? tabs.value[0].value : '';
            activeTab.value = tabs.value.length ? tabs.value[0].value : '';
        }
    });
    visible1.value = !visible.value;
});

watch([activeTab, currentRow, refresh], ([t, c, r]) => {
    if (c) {
        getCapacityData(c.allocCode, t);
    }
});

// watch([activeNameYear], (t, c, r) => {

//     console.log(activeNameYear.value, 'tabCode');
// });

watch([currentRow], () => {
    YearIrrigation(currentRow.value.allocCode, activeNameYear.value);
});

const tabClick = () => {
    YearIrrigation(currentRow.value.allocCode, activeNameYear.value);
};
//实际灌溉水量
const YearIrrigation = (allocCode, activeNameYear) => {
    getsimilarYearsArgByUnicoeAndAllocde({ allocCode, uniCode: activeNameYear }).then(res => {
        if (res.success) {
            dataYear.value = res.data;
        }
    });
};

const setRefresh = r => {
    refresh.value = r;
};
const handleActive = val => {
    activeNum.value = val;
};
watch(
    visible,
    v => {
        if (v) {
            getRwWater({ type: 'arg' }).then(res => {
                if (res.success) {
                    statistics.value = res.data;
                }
            });
            getChart({ type: 'arg' }).then(res => {
                if (res.success) {
                    const result = res.data;
                    const chart1 = echarts.init(GgChart.value);
                    const x = result.map(r => r.XNAME);
                    const data = result.map(r => r.YVALUE);
                    const series = [];
                    series.push({
                        name: '用水量',
                        type: 'bar',
                        barMaxWidth: '20',
                        tooltip: {
                            valueFormatter: function (value) {
                                return value + ' 万m³';
                            }
                        },
                        data: data
                    });
                    chart1.setOption({
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross'
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '3%',
                            bottom: '1%',
                            top: '10%',
                            containLabel: true
                        },
                        legend: {},
                        xAxis: [
                            {
                                type: 'category',
                                data: x,
                                axisPointer: {
                                    type: 'shadow'
                                }
                            }
                        ],
                        yAxis: {
                            name: '万m³',
                            type: 'value'
                        },
                        series: series
                    });
                }
            });
        }
    },
    { immediate: true }
);

const getCurrentRow = row => {
    currentRow.value = row;
    year.value = `${row.forecastSdate} ~ ${row.forecastEdate}`;
};

const setVisible = vis => {
    visible.value = vis;
};
//查询王英水用水比例分析-参考蓄保水量
const getCapacityData = (allocCode, unitCode) => {
    getCapacityList({
        allocCode,
        unitCode
    }).then(res => {
        if (res.success) {
            const result = res.data;
            total.value = result;
            tableData1.value = result.quotaChartList;
        }
    });
};

//计算
const handleCount = () => {
    downloadLoadingInstance = ElLoading.service({ text: '数据计算中，请稍候', background: 'rgba(0, 0, 0, 0.7)' });
    let caseCodeValue = currentRow.value.allocCode;
    let source =Number(CalculationMethod.value);
    /* if (CalculationMethod.value == 0) {
        caseCodeValue = currentRow.value.allocCode;
    } else {
        caseCodeValue = 1;
    } */
    getArgWaterBtn({ caseCode: caseCodeValue, methodFcWreqGuanqu: source + 1, type: '1' })
        .then(res => {
            if (res.success) {
                downloadLoadingInstance.close();
                // 更新灌水定额配置
                refreshGq.value = !refreshGq.value;
                //更新王英水用水比例分析-参考蓄保水量
                getCapacityData(currentRow.value.allocCode, activeTab.value);
                //更新预测灌溉需水列表
                demandTableRefJing.value.refresh();
            }
        })
        .catch(e => {
            downloadLoadingInstance.close();
        });
};

//优化计算
const handlOptimizing = () => {
    downloadLoadingInstance = ElLoading.service({ text: '数据计算中，请稍候', background: 'rgba(0, 0, 0, 0.7)' });
    getArgWaterBtn({ caseCode: currentRow.value.allocCode, type: '2' })
        .then(res => {
            if (res.success) {
                downloadLoadingInstance.close();
                // 更新灌水定额配置
                refreshGq.value = !refreshGq.value;
                //更新王英水用水比例分析-参考蓄保水量
                getCapacityData(currentRow.value.allocCode, activeTab.value);
                //更新预测灌溉需水列表
                demandTableRefJing.value.refresh();
            }
        })
        .catch(e => {
            downloadLoadingInstance.close();
        });
};

//参数设置
const handlParams = () => {
    dialogVisible1.value = true;
};
</script>

<style scoped lang="scss">
li {
    list-style-type: none;
}
.head-title {
    position: relative;
    padding-left: 15px;
    font-size: 15px;
    font-weight: 600;

    &:after {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 10px;
        background: #1791ff;
    }
}

.detail-content {
    display: flex;
    flex: 1;

    .lf {
        padding: 20px;
        flex: 1;
        background: #fff;
        border-radius: 6px;
        margin-right: 10px;
    }

    .rg {
        display: flex;
        flex-direction: column;
        padding: 20px;
        flex: 1;
        background: #fff;
        border-radius: 6px;
        .card-container {
            display: flex;
            margin-bottom: 10px;

            li {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 90px;
                flex: 1;
                margin: 0 5px;
                border-radius: 6px;
                padding: 15px;
                background-image: url('@/assets/images/wave.png');
                background-position: -100% 125%;
                background-repeat: no-repeat;
                background-size: 108%;
                color: #fff;

                span {
                    i {
                        position: relative;
                        display: inline-block;
                        vertical-align: text-top;
                        width: 24px;
                        height: 24px;
                        border-radius: 50px;
                        margin-right: 10px;

                        &:after {
                            content: '';
                            position: absolute;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                            background: url('@/assets/images/shui002.png') no-repeat center center;
                            background-size: contain;
                            display: block;
                            height: 15px;
                            width: 15px;
                        }
                    }
                }

                strong {
                    font-size: 25px;
                }

                &:nth-child(1) span i {
                    background: #2c9bfd;
                }

                &:nth-child(2) span i {
                    background: #57c777;
                }

                &:nth-child(3) span i {
                    background: #fc7f00;
                }

                &:nth-child(4) span i {
                    background: #ab82ff;
                }

                &:nth-child(1) {
                    background-color: #4ca2f1;
                }

                &:nth-child(2) {
                    background-color: #75bcf7;
                }

                &:nth-child(3) {
                    background-color: #bd9dff;
                }

                &:nth-child(4) {
                    background-color: #4acbb9;
                }

                &:first-child {
                    margin-left: 0;
                }

                &:last-child {
                    margin-right: 0;
                }
            }
        }
    }
}

.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    .lf {
        display: flex;
        li {
            display: flex;
            align-items: center;
            margin-left: 15px;
            span {
                white-space: nowrap;
            }
        }
    }
    .rg {
    }
}
.parameters {
    margin-top: 10px;
    .settings-top {
        display: flex;
        flex-direction: column;
        height: 500px;
    }
    .settings-bottom {
        margin-top: 10px;
        .rate-alas {
            display: flex;
            flex-direction: column;
            .tab-content {
                display: flex;
                .rt {
                    display: flex;
                    flex-wrap: wrap;
                    flex: 0.2;
                    padding-left: 20px;
                    li {
                        flex: 1;
                        .title {
                            font-size: 14px;
                            white-space: nowrap;
                        }
                        .txt {
                            span {
                                font-size: 17px;
                                font-weight: bold;
                                color: #2f76b3;
                                margin: 0 8px;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
