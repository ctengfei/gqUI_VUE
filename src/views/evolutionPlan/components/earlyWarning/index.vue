<template>
    <div class="map-container">
        <div class="map-box" id="Bmap"></div>
        <div class="tips" @click="show" style="display: none">
            <i></i>
            <span>水闸列表</span>
        </div>
        <div class="point-list" :style="{ left: lef + '%', display: 'none' }">
            <div class="head">
                <h4>水闸列表</h4>
                <el-button type="primary" plain @click="hide" circle style="width: 25px; height: 25px; border: 0; align-self: center">
                    <ArrowLeftBold style="width: 1em; height: 1em" />
                </el-button>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px">
                <span style="margin-right: 10px; white-space: nowrap; width: 112px">选择方案</span>
                <el-select-v2 v-model="curAllocCode" :options="options" @change="changeSelect" filterable style="width: 100%" placeholder="选择方案"></el-select-v2>
            </div>
            <div class="time-text">
                模拟总时长
                <span>{{ duration }}</span>
                小时
            </div>
            <div class="info-list">
                <div class="info-box" v-for="item in sluiceList" :key="item.title" @click="dialogVisible = true">
                    <h3 v-if="item.rvskName">{{ item.rvskName }}</h3>
                    <p v-if="item.rvskName">
                        <span>{{ item.tmZ }}</span>
                        达到最大水位,低于警戒水位
                        <span>{{ item.z }}m</span>
                    </p>
                    <p v-if="item.rvskName">
                        <span>{{ item.tmQ }}</span>
                        达到最大最大流量
                        <span>{{ item.q }}m³/s</span>
                    </p>
                </div>
            </div>
        </div>
        <!-- <div class="site-box" ref="popupTime">
      <div class="box">
        <h3>{{ siteObj.rvskName }}流量</h3>
        <p>{{ siteObj.q }} m³/s</p>
        <el-progress
          :percentage="flowRate"
          color="#6ABAFF"
          :format="() => ''"
          :stroke-width="8"
        />
      </div>
      <div class="box">
        <div class="vertical">
          <el-progress
            style="top: -48px"
            :percentage="percentage"
            color="#6ABAFF"
            :format="() => ''"
            :stroke-width="8"
          />
        </div>
        <div class="waterLevel">
          <h3>{{ siteObj.rvskName }}水位</h3>
          <p>{{ siteObj.z }} m</p>
        </div>
      </div>
    </div> -->
        <div class="play-box">
            <el-row>
                <el-col :span="2">
                    <VideoPause style="width: 3em; height: 3em; cursor: pointer; margin: 10px; color: #409efc" v-if="curNum === 1" @click="changePause" />
                    <VideoPlay style="width: 3em; height: 3em; cursor: pointer; margin: 10px; color: #409efc" v-if="curNum === 2" @click="changePlay" />
                </el-col>
                <el-col :span="22">
                    <el-progress :percentage="percentage" color="#6ABAFF" :format="format" :stroke-width="8" />
                </el-col>
            </el-row>
        </div>
        <div class="r-tips" @click="hanldeShow">
            <i></i>
            <span>渠道纵剖面</span>
        </div>
        <div class="plant-list" :style="{ right: rig + '%' }">
            <div class="head">
                <h4>渠道纵剖面</h4>
                <el-button type="primary" plain @click="hidden" circle style="width: 25px; height: 25px; border: 0; align-self: center">
                    <ArrowRightBold style="width: 1em; height: 1em" />
                </el-button>
            </div>
            <div class="chart-box">
                <lineChart :title="chartTitle" :xData="xDataArr" :yData1="yDataArr1" :yData2="yDataArr2" />
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between">
                <h4>断面预报预警信息统计表</h4>
                <el-button type="primary" @click="alarmWarn">预报预警参数设置</el-button>
            </div>

            <div style="height: 300px">
                <pro-crud ref="crudRef" :columns="columns" :gutter="20" height="300" :data="tableData" :column="2" width="45%" align="center" label-width="110px" direction="vertical">
                    <template #table-wraRepNm="{ size, row }">
                        {{ row.wraRepNm ? row.wraRepNm : row.bnch }}
                    </template>
                </pro-crud>
            </div>
        </div>
        <el-dialog v-model="brchChartVisible" :title="brchChartTitle" class="runoff-dialog" width="60%">
            <div class="brchChart" ref="brchChart"></div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="brchChartVisible = false">关闭</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="60%" draggable :before-close="() => (dialogVisible = false)">
            <alarmSettingCom />
        </el-dialog>
    </div>
</template>

<script setup>
import Test1 from './test1.json';
import Test2 from './test2.json';
import { getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, watch, computed } from 'vue';
import Map from 'ol/Map';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import View from 'ol/View';
import { Feature, Overlay } from 'ol';
import { TileSuperMapRest } from '@supermap/iclient-ol';
import { Point } from 'ol/geom';
import { Fill, Stroke, Style, Text, Icon } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, XYZ } from 'ol/source';
import CircleStyle from 'ol/style/Circle';
import { getChannelProfile, preAlarmList, getResultBnchHydroTimes, getBranNewZist } from '@/api/evolutionPlanData';
import { getScenariosList, getSection, getWaterResults, getWaterList } from '@/api/scheSchemeData';
const { proxy } = getCurrentInstance();
import lineChart from './components/lineChart';
import alarmSettingCom from './components/alarmSettingCom';
import { VideoPause, VideoPlay } from '@element-plus/icons-vue';
import GeoJSON from 'ol/format/GeoJSON';
import dayjs from 'dayjs';
import { MAP_URL, TDT_URL } from '@/global';
import { imitateList, imitateListTwo, imitateListThree } from './contents.js';
import { sessionStorage } from '@/utils';
import { defineCrudColumns, defineCrudMenuColumns, defineCrudSubmit, defineCrudSearch, defineFormColumns, defineCrudBeforeOpen, defineCrudBeforeClose } from 'element-pro-components';
import * as echarts from 'echarts';
const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
const props = defineProps(['curCaseName', 'curCaseCode']);
let lef = ref(2);
let rig = ref(2);
let map = ref(null);
let vector = ref();
let curNum = ref(2);
let curAllocCode = ref('');
let percentage = ref(0);
let flowRate = ref(0);
let options = ref([]);
let sluiceList = ref([]);
let chartList = ref([]);
let siteObj = ref({}); //中间水位流量数据
const waterListData = ref([]);
let curSub = ref(0);
let duration = ref(24);
let firstObj = ref({});
let overlayTime = ref(null);
let dialogVisible = ref(false);
let brchChartVisible = ref(false);
let brchChartTitle = ref('');
let brchChart = ref();
let dialogTitle = ref('预警参数设置');
const popupTime = ref();
// 创建点位数组
const peoples =
    ref();
    //   [
    //   {
    //     name: "渠首杨林进水闸",
    //     long: [114.700467, 29.872894],
    //   },
    //   {
    //     name: "一支渠分水闸32#",
    //     long: [114.597895, 29.90715],
    //   },
    //   {
    //     name: "斗门62号闻",
    //     long: [114.482675, 29.899738],
    //   },
    //   {
    //     name: "一千渠分水闸",
    //     long: [114.424107, 29.963163],
    //   },
    //   {
    //     name: "二干渠分水闻",
    //     long: [114.387764, 29.987594],
    //   },
    //   {
    //     name: "三干渠分水闸",
    //     long: [114.377211, 30.054851],
    //   },
    //   {
    //     name: "熊皮泄洪闸",
    //     long: [114.512078, 30.058538],
    //   },
    //   {
    //     name: "群力支渠分水闻",
    //     long: [114.36306, 29.977487],
    //   },
    //   {
    //     name: "肖家支渠分水闸",
    //     long: [114.386962, 30.075109],
    //   },
    // ]
const columns = defineCrudColumns(
    computed(() => [
        {
            label: '渠道名称',
            prop: 'chanName'
        },
        {
            label: '断面名称/桩号',
            prop: 'wraRepNm'
        },
        {
            label: '最高水位',
            prop: 'highestWater'
        },
        {
            label: '出现时间',
            prop: 'highestTime'
        },
        {
            label: '警戒水位',
            prop: 'alarmWater'
        },
        {
            label: '超预警时段',
            prop: 'isBeyondAlarm'
        }
    ])
);
const tableData = ref([]);

const chartTitle = ref('');
const xDataArr = ref([]);
const yDataArr1 = ref([]);
const yDataArr2 = ref([]);

const minTime = ref('');
const maxTime = ref('');
const addNum = ref(0);
//const baseNum = ref(0);

onBeforeMount(() => {
    getTimeDiffer();
    // getPreAlarmList();
});
//获取方案列表
const getData = val => {
    getChannelProfile({ chanCode: 'CT42120001', caseCode: props.curCaseCode, tm: val }).then(res => {
        if (res.success) {
            let temp = res.data;
            let xData = [];
            let yData1 = [];
            let yData2 = [];
            temp.forEach(item => {
                xData.push(item.distance);
                yData1.push(item.z);
                yData2.push(item.elevMin);
            });
            chartTitle.value = '阳武干渠';
            xDataArr.value = xData;
            yDataArr1.value = yData1;
            yDataArr2.value = yData2;
        }
    });
};

// 获取时间差
const getTimeDiffer = () => {
    getResultBnchHydroTimes(props.curCaseCode).then(res => {
        if (res.success) {
            minTime.value = res.data.minTime;
            maxTime.value = res.data.maxTime;
            let maxTimes = dayjs(maxTime.value); //距离最大时间
            let curTime = dayjs(minTime.value); //当前时间
            // let curTime = dayjs().format('YYYY-MM-DD HH:mm:ss')//当前时间
            duration.value = dayjs(maxTimes).diff(curTime, 'hour');
            addNum.value = Math.ceil(100 / duration.value);
            //console.log(duration.value)
            //baseNum.value = Math.floor(duration.value/100);
            getData(minTime.value);
        }
    });
};
// 获取断面预报预警信息统计
const getPreAlarmList = () => {
    preAlarmList({ caseCode: props.curCaseCode }).then(res => {
        if (res.success) {
            tableData.value = res.data;
            let lonLat = res.data.map(item => {
                return {
                    ...item,
                    name: item.wraRepNm ? item.wraRepNm : item.bnch,
                    long: [item.lon, item.lat]
                };
            });
            peoples.value = lonLat;
            // createPoint();
            // map.value && map.value.on('click', (event) => {
            //   map.value.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
            //     let properties = feature.getProperties();
            //     console.log(properties,"properties")
            //   })
            // })
            peoples.value.forEach(item => {
                const feature = new Feature({
                    geometry: new Point(item.long),
                    name: item.name
                });
                feature.setStyle(
                    new Style({
                        image: new Icon({
                            src: useFile('shuizha'),
                            scale: 1,
                            size: [20, 20],
                            anchor: [0.5, 0.2]
                        }),
                        text: new Text({
                            text: item.name,
                            textAlign: 'center',
                            textBaseline: 'middle',
                            font: '14px font-size',
                            fill: new Fill({
                                color: '#fff'
                            }),
                            backgroundFill: new Fill({
                                color: '#1a8dff'
                            }),
                            backgroundStroke: new Stroke({
                                color: '#1a8dff',
                                lineCap: 'round',
                                lineJoin: 'round',
                                width: 10
                            }),
                            padding: [6, 4, 4, 4],
                            offsetY: '-21'
                        })
                    })
                );
                feature.setProperties({ ...item });
                vector.value.addFeature(feature);
            });
        }
    });
};
//获取渠道纵剖面
const getSectionData = allocCode => {
    const params = {
        pageNum: 1,
        pageSize: 9999,
        allocCode
    };
    getSection(params).then(res => {
        if (res.success) {
            const list = res.data;
            let newData = [];
            if (list && list.length > 0) {
                list.forEach(item => {
                    const { rvskName, bnchStatisticsVOList } = item;
                    const xData = bnchStatisticsVOList.map(item => item.bnch);
                    const yData1 = bnchStatisticsVOList.map(item => item.z);
                    newData.push({ title: rvskName, xData, yData1, yData2: [] });
                });
                chartList.value = newData;
            } else {
                chartList.value = [];
            }
        }
    });
};
//查询最大水位和最大流量
const getResultsData = allocCode => {
    const params = {
        pageNum: 1,
        pageSize: 9999,
        allocCode
    };
    getWaterResults(params).then(res => {
        if (res.success) {
            // sluiceList.value = res.data;
            //模拟数据
            // sluiceList.value = Test1.data;
            let maxTime = dayjs('2023-09-20 20:00:00'); //距离最大时间
            let curTime = dayjs('2023-09-16 20:00:00'); //当前时间
            // let curTime = dayjs().format('YYYY-MM-DD HH:mm:ss')//当前时间
            duration.value = dayjs(maxTime).diff(curTime, 'hour');
        }
    });
};
//查询最大水位和最大流量
const getWaterListData = allocCode => {
    const params = {
        pageNum: 1,
        pageSize: 9999,
        allocCode
    };
    getWaterList(params).then(res => {
        if (res.success) {
            waterListData.value = res.data;
            // siteObj.value = waterListData.value[0]
            //模拟数据
            siteObj.value = Test2.data[0];
            firstObj.value = Test2.data[0];
        }
    });
};
// 预警参数设置
const alarmWarn = () => {
    dialogVisible.value = true;
};
const format = () => `${duration.value}h`;
const changePause = () => {
    clearInterval(window._time);
    curNum.value = 2;
};
watch([percentage], val => {
    let temps = dayjs(minTime.value).add(percentage.value, 'hours');
    let curTimes = temps.format('YYYY-MM-DD HH:mm:ss');
    getData(curTimes);
});

const changePlay = () => {
    window._time = setInterval(() => {
        percentage.value = percentage.value + addNum.value;
        // siteObj.value = waterListData.value[curSub.value]
        // if (curSub.value + 1 === waterListData.value.length) {
        //   curSub.value = 0
        // } else {
        //   curSub.value = curSub.value + 1
        // }
        //模拟数据
        if (percentage.value >= 100) {
            changePause();
            percentage.value = 0;
        }
    }, 5000);
    curNum.value = 1;
};
const changeSelect = val => {
    getSectionData(val);
};
onMounted(() => {
    vector.value = new VectorSource();
    const TiandiMap_img = new TileLayer({
        name: '天地图影像图层',
        source: new XYZ({
            url: `${TDT_URL}DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
            wrapX: true
        }),
        properties: { name: '天地图影像图层', id: 'v01', type: 'img' },
        visible: true
    });
    const main = new TileLayer({
        source: new TileSuperMapRest({
            url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyingmain?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
            wrapX: true
        }),
        zIndex: 23
    });
    const trunk = new TileLayer({
        source: new TileSuperMapRest({
            url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyingtrunk?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
            wrapX: true
        }),
        zIndex: 23
    });
    const vectorLayer = new VectorLayer({
        source: vector.value,
        properties: { title: `base-vector`, id: 'v01' },
        style: new Style({
            fill: new Fill({
                color: 'rgba(249, 231, 159 , 0.2)'
            }),
            stroke: new Stroke({
                color: 'rgba(2231, 76, 60 , 0.5)',
                width: 2
            }),
            image: new CircleStyle({
                radius: 7,
                fill: new Fill({
                    color: 'rgba(2231, 76, 60 , 0.5)'
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2
                })
            })
        }),
        zIndex: 25,
        declutter: true,
        visible: true
    });
    map.value = new Map({
        layers: [TiandiMap_img, main, trunk, vectorLayer],
        target: 'Bmap',
        controls: defaultControls({
            zoom: false
        }).extend([
            new ScaleLine({
                units: 'metric'
            })
        ]),
        view: new View({
            center: [114.54912787724153, 29.956171640780035],
            projection: 'EPSG:4326',
            zoom: 11
        })
    });
    getPreAlarmList();
    // clearLayer();

    // addMovingLine();
    // createOverlay([114.477211, 29.984851]);
    map.value &&
        map.value.on('click', event => {
            map.value.forEachFeatureAtPixel(
                event.pixel,
                (feature, layer) => {
                    let properties = feature.getProperties();
                    brchChartTitle.value = properties.name + '水位信息';
                    brchChartVisible.value = true;
                    // console.log(properties,"properties")
                    getBranNewZist({ chanCode: 'CT42120001', caseCode: props.curCaseCode, wraRepCd: properties.wraRepCd, brachCode: properties.bnch }).then(res => {
                        if (res.success) {
                            const char = echarts.init(brchChart.value);
                            const result = res.data.reverse();
                            const xAxis = result.map(r => r.tm);
                            const sw = result.map(r => r.z);
                            const ll = result.map(r => r.q);
                            char.setOption(
                                {
                                    tooltip: {
                                        trigger: 'axis',
                                        axisPointer: {
                                            type: 'cross'
                                        }
                                    },
                                    grid: {
                                        left: '7%',
                                        right: '5%',
                                        bottom: '5%',
                                        top: '18%',
                                        containLabel: true
                                    },
                                    legend: {},
                                    xAxis: [
                                        {
                                            type: 'category',
                                            data: xAxis,
                                            boundaryGap: false,
                                            axisPointer: {
                                                type: 'shadow'
                                            }
                                        }
                                    ],
                                    yAxis: [
                                        {
                                            name: '流量(m³/s)',
                                            type: 'value'
                                        },
                                        {
                                            name: '水位(m)',
                                            type: 'value',
                                            nameLocation: 'end'
                                        }
                                    ],
                                    series: [
                                        {
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
                                            data: ll
                                        },
                                        {
                                            name: '水位',
                                            type: 'line',
                                            yAxisIndex: 1,
                                            showSymbol: false,
                                            smooth: true,
                                            tooltip: {
                                                valueFormatter: function (value) {
                                                    return value + ' m';
                                                }
                                            },
                                            data: sw
                                        }
                                    ]
                                },
                                true
                            );
                        }
                    });
                },
                { hitTolerance: 50 }
            );
        });
});
/**
 * 创建弹框
 * @param coord
 */
function createOverlay(coord) {
    overlayTime.value = new Overlay({
        element: popupTime.value,
        id: 'TimeDialog',
        position: coord,
        positioning: 'center-center',
        offset: [0, 0],
        autoPan: {
            animation: {
                duration: 250
            }
        }
    });
    overlayTime.value.setProperties({ category: 'time' });
    map.addOverlay(overlayTime.value);
}
function clearLayer() {
    const layers = map.getLayers().getArray();
    layers.find(r => {
        if (r.getProperties().id) {
            if (r.getProperties().id === 'YAOGAN' || r.getProperties().id === 'ZHONGZ') {
                map.removeLayer(r);
            }
        }
    });
}
const createPoint = () => {
    peoples.value.forEach(item => {
        const feature = new Feature({
            geometry: new Point(item.long),
            name: item.name
        });
        feature.setStyle(
            new Style({
                image: new Icon({
                    src: useFile('shuizha'),
                    scale: 1,
                    size: [20, 20],
                    anchor: [0.5, 0.2]
                }),
                text: new Text({
                    text: item.name,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    font: '14px font-size',
                    fill: new Fill({
                        color: '#fff'
                    }),
                    backgroundFill: new Fill({
                        color: '#0821c3'
                    }),
                    backgroundStroke: new Stroke({
                        color: 'rgba(255,255,255,.5)',
                        lineCap: 'round',
                        lineJoin: 'round',
                        width: 1
                    }),
                    padding: [6, 30, 4, 30],
                    offsetY: '-21'
                })
            })
        );
        console.log(item, "feature.setProperties({...r, types: 'pre'});");
        feature.setProperties({ ...item });
        vector.value.addFeature(feature);
    });
};

const addMovingLine = () => {
    const geojsonObject = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [114.386962, 30.075109],
                        [114.377211, 30.054851],
                        [114.387764, 29.987594],
                        [114.424107, 29.963163],
                        [114.482675, 29.899738],
                        [114.597895, 29.90715],
                        [114.700467, 29.872894]
                    ],
                    type: 'LineString'
                }
            },
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [114.512078, 30.058538],
                        [114.424107, 29.963163]
                    ],
                    type: 'LineString'
                }
            },
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [114.36306, 29.977487],
                        [114.387764, 29.987594]
                    ],
                    type: 'LineString'
                }
            }
        ]
    };

    const source = new VectorSource({
        features: new GeoJSON().readFeatures(geojsonObject)
    });

    let style = [
        //实线
        new Style({
            stroke: new Stroke({
                color: 'rgba(30,144,255, 1)',
                width: 3,
                lineDash: [0]
            }),
            text: new Text({
                // text: '流动效果',
                fill: new Fill({
                    color: '#000'
                }),
                font: '18px Arial',
                offsetY: 20,
                placement: 'line'
            })
        }),
        //虚线
        new Style({
            stroke: new Stroke({
                color: [255, 250, 250, 1],
                width: 3,
                lineDash: [20, 27], //一组线段和间距交互的数组，可以控制虚线的长度
                lineDashOffset: 0
            })
        })
    ];

    const vectorlayer = new VectorLayer({
        source,
        style
    });
    map.addLayer(vectorlayer);

    //定时赋值
    window._stroke = setInterval(() => {
        let lineDashOffset = vectorlayer.getStyle()[1].getStroke().getLineDashOffset();
        vectorlayer.setStyle([
            vectorlayer.getStyle()[0],
            //虚线
            new Style({
                stroke: new Stroke({
                    color: [204, 204, 255, 1],
                    width: 3,
                    lineDash: [10, 25],
                    lineDashOffset: lineDashOffset == 100 ? 0 : lineDashOffset + 2
                })
            })
        ]);
    }, 50);
};
onBeforeUnmount(() => {
    // map.setTarget(null);
    map = null;
    clearInterval(window._time);
    clearInterval(window._stroke);
});
function useFile(name) {
    return new URL(`../../../../assets/imgs/${name}.png`, import.meta.url).href;
}
function show() {
    lef.value = 2;
}

function hide() {
    lef.value = -100;
}

function hanldeShow() {
    rig.value = 2;
}

function hidden() {
    rig.value = -100;
}
</script>

<style scoped lang="scss">
.map-container {
    position: relative;
    width: 83vw;

    .tips {
        position: absolute;
        left: 3%;
        top: 5%;
        background: #fff;
        width: 50px;
        padding: 8px;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        i {
            display: block;
            width: 40px;
            height: 40px;
            background: url('@/assets/images/dn.png') no-repeat center center;
            background-size: cover;
            margin-bottom: 5px;
        }

        span {
            width: 3px;
            font-size: 16px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 600;
            color: #1791ff;
            margin-right: 15px;
        }
    }

    .r-tips {
        position: absolute;
        right: 2%;
        top: 5%;
        background: #fff;
        width: 50px;
        padding: 8px;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        i {
            display: block;
            width: 40px;
            height: 40px;
            background: url('@/assets/images/dn.png') no-repeat center center;
            background-size: cover;
            margin-bottom: 5px;
        }

        span {
            width: 3px;
            font-size: 16px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 600;
            color: #1791ff;
            margin-right: 15px;
        }
    }

    .point-list {
        position: absolute;
        left: 2%;
        top: 5%;
        display: flex;
        flex-direction: column;
        background: #fff;
        border-radius: 10px;
        background: #fff;
        transition: left 0.8s;
        height: 90%;
        min-height: 750px;
        width: 370px;
        padding: 15px;

        .head {
            display: flex;
            height: 30px;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            margin-bottom: 10px;
            border-bottom: 1px solid #f1f1f1;
            h4 {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 0;
            }
        }
        .time-text {
            font-size: 14px;
            color: #1791ff;
            font-weight: 600;
            margin-bottom: 12px;
        }

        .info-list {
            height: 85%;
            padding-right: 5px;
            overflow: auto;

            .info-box {
                border: 1px solid var(--el-border-color);
                border-radius: 10px;
                margin-bottom: 12px;

                h3 {
                    padding: 12px;
                    border-bottom: 1px solid #eaeaea;
                }

                p {
                    margin: 6px 6px 6px 12px;
                }

                span {
                    color: #1791ff;
                }
            }

            .info-box:hover {
                cursor: pointer;
                background-color: #eaeaea;
            }
        }
    }

    .site-box {
        display: flex;
        .vertical {
            width: 64%;
            transform: rotate(-90deg);
        }

        .box {
            width: 200px;
            margin-right: 20px;
            padding: 15px;
            height: 80px;
            border-radius: 10px;
            background-color: #fff;
            flex: 1;

            h3 {
                font-size: 14px;
                font-weight: 600;
            }

            p {
                margin-bottom: 2px;
                color: #1791ff;
            }

            .waterLevel {
                margin-left: 20px;
            }
        }
    }

    .play-box {
        position: absolute;
        left: 3%;
        bottom: 6%;
        width: 48%;
        height: 60px;
        line-height: 60px;
        background-color: #27475c;

        :deep .el-progress {
            margin-top: 20px;
        }

        :deep .el-progress__text {
            color: #fff;
        }
    }

    .plant-list {
        position: absolute;
        right: 2%;
        top: 5%;
        display: flex;
        flex-direction: column;
        background: #fff;
        border-radius: 10px;
        background: #fff;
        transition: right 0.8s;
        height: 90%;
        width: 700px;
        padding: 15px;

        .head {
            display: flex;
            height: 30px;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            margin-bottom: 10px;
            border-bottom: 1px solid #f1f1f1;
        }
        h4 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 0;
        }
        .chart-box {
            width: 100%;
            height: 300px;
            padding-right: 5px;
            overflow: auto;
        }
    }
}

.map-box {
    height: calc(100vh - 215px);
    width: 82vw;
}
.brchChart {
    height: 500px;
    width: 100%;
}
</style>
