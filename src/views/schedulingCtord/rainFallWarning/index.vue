<template>
    <div class="rain-container">
        <div id="qs-map"></div>
        <div class="ol-popup" ref="popupTime" v-show="popup">
            <div class="head">
                <el-tabs v-model="activeName" style="width: 100%">
                    <el-tab-pane :label="currentRealTime.stName" name="1">
                        <div class="realTime box">
                            <el-row style="margin-bottom: 8px" justify="space-between">
                                <el-col :span="12">
                                    <span>测站名称：</span>
                                    <span>{{ currentRealTime.stName }}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>测站编码：</span>
                                    <span>{{ currentRealTime.stcd }}</span>
                                </el-col>
                            </el-row>
                            <el-row style="margin-bottom: 8px" justify="space-between">
                                <el-col :span="12">
                                    <span>日降水量(mm)：</span>
                                    <span>{{ currentRealTime.dyp }}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>时段降水量(mm)：</span>
                                    <span>{{ currentRealTime.drp }}</span>
                                </el-col>
                            </el-row>
                            <el-row style="margin-bottom: 8px" justify="flex-start">
                                <span>站点地址：</span>
                                <span>{{ currentRealTime.stLoc }}</span>
                            </el-row>
                            <el-row style="margin-bottom: 8px" justify="space-between">
                                <el-col :span="12">
                                    <span>时段长(h)：</span>
                                    <span>{{ currentRealTime.intv }}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>降水历时：</span>
                                    <span>{{ currentRealTime.pdr }}</span>
                                </el-col>
                            </el-row>
                            <el-row style="margin-bottom: 8px" justify="space-between">
                                <el-col :span="12">
                                    <span>经度(°)：</span>
                                    <span>{{ currentRealTime.stLong }}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>纬度(°)：</span>
                                    <span>{{ currentRealTime.stLat }}</span>
                                </el-col>
                            </el-row>
                            <el-row justify="space-between">
                                <el-col :span="12">
                                    <span>天气状况：</span>
                                    <span>{{ currentRealTime.wth }}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>数据时间：</span>
                                    <span>{{ currentRealTime.tm }}</span>
                                </el-col>
                            </el-row>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="近24小时雨量曲线图" name="2">
                        <div class="rainChart" ref="rainChart" />
                    </el-tab-pane>
                </el-tabs>
                <!-- <h4>{{ currentRealTime.stName }}</h4>a -->
                <el-button type="primary" plain @click="closeTime" circle style="width: 25px; height: 25px; border: 0; position: absolute; right: 10px; top: 7px">
                    <Close style="width: 1.3em; height: 1.3em" />
                </el-button>
            </div>
        </div>
        <div class="top">
            <div class="head-sub-title">近24小时雨量统计</div>
            <div class="tag-box">
                <div class="sub-tab" style="background: #eb2f52">
                    <span>暴雨以上/全部</span>
                    <strong>{{ getHeavyRain(rains) }}/{{ rains.total }} 个</strong>
                </div>
                <div class="sub-tab" style="background: #ddd">
                    <strong>{{ rains.noRain }} 个</strong>
                    <span>0 mm</span>
                </div>
                <div class="sub-tab" style="background: #4adb1b">
                    <strong>{{ rains.lightRain }} 个</strong>
                    <span>0 - 10 mm</span>
                </div>
                <div class="sub-tab" style="background: #ebeb00">
                    <strong>{{ rains.moderateRain }} 个</strong>
                    <span>10 - 25 mm</span>
                </div>
                <div class="sub-tab" style="background: #ff8100">
                    <strong>{{ rains.heavyRain }} 个</strong>
                    <span>25 - 50 mm</span>
                </div>
                <div class="sub-tab" style="background: #e55050">
                    <strong>{{ rains.torrentialRain }} 个</strong>
                    <span>50 - 100 mm</span>
                </div>
                <div class="sub-tab" style="background: #a907a9">
                    <strong>{{ rains.rainstorm }} 个</strong>
                    <span>100 - 250 mm</span>
                </div>
                <div class="sub-tab" style="background: #cc00ff">
                    <strong>{{ rains.bigTorrentialRain }} 个</strong>
                    <span>≥250 mm</span>
                </div>
            </div>
        </div>
        <div class="tips" @click="show">
            <i></i>
            <span>实时监测</span>
        </div>
        <div class="point-list" :style="{ left: left + '%' }">
            <div class="head">
                <h4>实时监测</h4>
                <el-button type="primary" plain @click="hide" circle style="width: 25px; height: 25px; border: 0; align-self: center">
                    <ArrowLeftBold style="width: 1em; height: 1em" />
                </el-button>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px">
                <span style="margin-right: 10px; white-space: nowrap; width: 112px">站点名称</span>
                <el-input clearable v-model="input" @change="debFunc" placeholder="请输入站点名称" style="width: 100%">
                    <template #append>
                        <el-button type="primary" style="background: #409eff">
                            <el-icon :size="16" style="color: #ffff">
                                <Search />
                            </el-icon>
                        </el-button>
                    </template>
                </el-input>
            </div>
            <div style="height: 90%">
                <el-table :data="tableData" height="100%" @row-click="rowSelect">
                    <el-table-column prop="stName" align="center" label="站点名称" />
                    <el-table-column prop="drp" align="center" label="时段降雨量(mm)" />
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { TileSuperMapRest } from '@supermap/iclient-ol';
import { Vector as VectorSource, XYZ } from 'ol/source';
import Map from 'ol/Map';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import View from 'ol/View';
import { getTimeRain } from '@/api/schedulingCtord/realRainfall';
import { Fill, Icon, Stroke, Style, Text, Circle } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { Feature, Overlay } from 'ol';
import { Point } from 'ol/geom';
import { ElMessage } from 'element-plus';
import { debounce, sessionStorage } from '@/utils';
import { MAP_URL, TDT_URL } from '@/global';
import { getEasc, getEascList, getRainLevel } from '@/api/schedulingCtord/ecasWaring';
import { getYlMonitor } from '@/api/oneimage';
import * as echarts from 'echarts';
import { getVectorContext } from 'ol/render';

const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
const { proxy } = getCurrentInstance();
const TiandiMap_img = new TileLayer({
    name: '天地图影像图层',
    source: new XYZ({
        url: `${TDT_URL}DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
        wrapX: true
    }),
    properties: { name: '天地图影像图层', id: 'v01', type: 'img' },
    visible: true
});
const TiandiMap_imgLabel = new TileLayer({
    name: '天地图影像注记',
    source: new XYZ({
        url: `${TDT_URL}DataServer?T=cia_w&tk=${MAP_TOKEN}&x={x}&y={y}&l={z}`,
        wrapX: true
    }),
    properties: { name: '天地图影像注记', id: 'v01', type: 'img' },
    visible: true
});
const pianQu = new TileLayer({
    source: new TileSuperMapRest({
        url: `/superMapUrl/iserver/services/map-ShanHongPianQuFanWei/rest/maps/basin_14_geo@%E5%B1%B1%E6%B4%AA%E7%89%87%E5%8C%BA%E8%8C%83%E5%9B%B4?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
        wrapX: true
    })
});
let map = ref(null);
const popupTime = ref();
let overlayTime = ref(null);
let input = ref('');
let left = ref(2);
let popup = ref(false);
let tableData = ref([]);
let currentRealTime = ref({});
const vector = new VectorSource();
let rains = ref({});
let activeName = ref('1');
const rainChart = ref();

const vectorLayer = new VectorLayer({
    source: vector,
    properties: { title: `base-vector`, id: 'v01' },
    style: new Style({
        fill: new Fill({
            color: 'rgba(249, 231, 159 , 0.2)'
        }),
        stroke: new Stroke({
            color: '#ffcc33',
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
const debFunc = debounce(onChange, 500, false); // 防抖

function getHeavyRain(rains) {
    return rains.rainstorm + rains.bigTorrentialRain + rains.torrentialRain;
}
onMounted(() => {
    map.value = new Map({
        layers: [vectorLayer, TiandiMap_img, TiandiMap_imgLabel, pianQu],
        target: 'qs-map',
        controls: defaultControls({
            zoom: false
        }).extend([
            new ScaleLine({
                units: 'metric'
            })
        ]),
        view: new View({
            center: [114.65208746275314, 29.884163408981514],
            projection: 'EPSG:4326',
            zoom: 14
        })
    });
    onChange('');
    getRainLevel().then(res => {
        if (res.success) {
            rains.value = res.data;
        }
    });
});

watchEffect(() => {
    map.value &&
        map.value.on('click', event => {
            map.value.forEachFeatureAtPixel(
                event.pixel,
                (feature, layer) => {
                    const { state, coord, type, stcd } = feature.getProperties();
                    if (state === 'time') {
                        // 实时监测站点
                        if (overlayTime.value) {
                            // 避免第一报错
                            const { category } = overlayTime.value.getProperties();
                            if (state === category) {
                                // 每次点击的都是实时监测站类型的弹框 删除前一个弹框
                                closeTime();
                            }
                        }
                        currentRealTime.value = feature.getProperties();
                        popup.value = true;
                        createOverlay(coord, feature);
                    }
                    return true; // 停止遍历其他要素
                },
                { hitTolerance: 5 }
            ); // hitTolerance 增加点击容错率
        });
});

// tab
const handleClick = val => {
    console.log(val, '111');
};

// 近24小时  折线图
const getHistoryData = val => {
    const { stcd } = val;
    getYlMonitor({ stcd }).then(res => {
        if (res.success) {
            const x = res.data.map(r => r.tm.split(' ')[1]);
            const data = res.data.reverse().map(r => r.drp);
            const chart1 = echarts.init(rainChart.value);
            chart1.setOption(
                {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    grid: {
                        left: '2%',
                        right: '5%',
                        bottom: '2%',
                        top: '15%',
                        containLabel: true
                    },
                    legend: {
                        data: ['降雨量']
                    },
                    xAxis: {
                        type: 'category',
                        data: x,
                        splitNumber: 24,
                        axisPointer: {
                            type: 'shadow'
                        },
                        axisLabel: {
                            interval: 2
                            // rotate: 30,//倾斜度 -90 至 90 默认为0
                        }
                    },
                    yAxis: [
                        {
                            name: '降雨量(mm)',
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '降雨量',
                            type: 'line',
                            tooltip: {
                                valueFormatter: function (value) {
                                    return value + ' mm';
                                }
                            },
                            data: data
                        }
                    ]
                },
                true
            );
        }
    });
};
function onChange(name) {
    getTimeRain({
        stType: 'PP',
        sourceType: '0',
        stName: name
    }).then(res => {
        if (res.success) {
            const points = res.data.pptnList;
            tableData.value = points;
            vector.getFeatures().forEach(r => {
                vector.removeFeature(r);
            });
            const features = points.map(r => {
                const feature = new Feature({
                    geometry: new Point([r.stLong, r.stLat]),
                    name: r.stName
                });
                feature.setStyle(
                    new Style({
                        image: new Icon({
                            src: useFile('yuliangzhan'),
                            scale: 1,
                            size: [20, 20],
                            anchor: [0.5, 0.5]
                        }),
                        text: new Text({
                            text: r.stName,
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
                            offsetY: '-30'
                        })
                    })
                );
                feature.setId(`er_${Math.random().toString(36).slice(-4)}`);
                feature.setProperties({
                    ...r,
                    stcd: r.stCode,
                    state: 'time',
                    coord: [r.stLong, r.stLat]
                });
                return feature;
            });
            vector.addFeatures(features);
            // features
            let radius = 0;
            vectorLayer.on('postrender', e => {
                if (radius >= 40) radius = 0;
                let opacity = 1 - radius / 20; //不透明度

                let pointStyle = new Style({
                    image: new Circle({
                        radius: radius,
                        stroke: new Stroke({
                            color: `rgba(255,0,0,${opacity})`,
                            width: (40 - radius) / 10 //设置宽度
                        }),
                        fill: new Fill({
                            color: 'rgba(2231, 76, 60 , 0.7)'
                        })
                    })
                });
                // 获取矢量要素上下文
                let vectorContext = getVectorContext(e);

                features.forEach(feature => {
                    let featureValue = feature.getProperties();
                    if (featureValue.drp >= 50) {
                        // debugger
                        vectorContext.setStyle(pointStyle);
                    }
                    vectorContext.drawGeometry(feature.getGeometry());
                });
                radius = radius + 0.35; //调整闪烁速度
                //请求地图渲染（在下一个动画帧处）
                map.value.render();
            });
        }
    });
}

function rowSelect(row) {
    if (row.stLong && row.stLat) {
        const feature = vector.getFeatures().find(r => r.getProperties().stCode == row.stCode);
        map.value.getView().fit(feature.getGeometry(), { duration: 600, maxZoom: 15 });
    } else {
        ElMessage({
            message: '经纬度不正确',
            type: 'warning'
        });
    }
}

/**
 * 创建弹框
 * @param coord
 */
function createOverlay(coord, feature) {
    overlayTime.value = new Overlay({
        element: popupTime.value,
        id: 'TimeDialog',
        position: coord,
        positioning: 'center-center',
        offset: [-290, -25]
    });
    overlayTime.value.setProperties({ category: 'time' });
    map.value.addOverlay(overlayTime.value);
    getHistoryData(feature.getProperties());
}

/**
 * 关闭弹框
 *
 */
function closeTime() {
    map.value && map.value.removeOverlay(overlayTime.value);
    popup.value = false;
    activeName.value = '1';
}

function useFile(name) {
    return new URL(`../../../assets/imgs/${name}.png`, import.meta.url).href;
}

function show() {
    left.value = 2;
}

function hide() {
    left.value = -100;
}

onBeforeUnmount(() => {
    map.value.setTarget(null);
    map.value = null;
});
</script>

<style scoped lang="scss">
.rain-container {
    position: relative;
    height: calc(100vh - 105px);
    width: 100vw;

    .top {
        position: absolute;
        left: 25%;
        top: 5%;
        background: #fff;
        padding: 10px;
        border-radius: 10px;

        .head-sub-title {
            font-size: 16px;
            margin-bottom: 10px;
        }

        .tag-box {
            display: flex;
            flex-wrap: wrap;

            .sub-tab {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                align-items: center;
                font-size: 14px;
                height: 65px;
                width: 135px;
                color: #fff;
                border-radius: 8px;
                margin: 0 2px 5px 2px;

                strong {
                    font-size: 16px;
                }
            }
        }
    }

    #qs-map {
        height: calc(100vh - 105px);
        width: 100vw;
    }

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
                color: #1791ff;
                font-weight: 600;
                margin-bottom: 0;
            }
        }
    }

    .ol-popup {
        position: absolute;
        bottom: 22px;
        width: 620px;
        padding: 0px 15px 15px 15px;
        background: #fff;
        border-radius: 8px;

        .head {
            display: flex;
            justify-content: space-between;
            // align-items: center;
            height: auto;
            // border-bottom: 1px solid #F1F1F1;

            h4 {
                margin-bottom: 0;
                font-size: 18px;
            }
        }

        .box {
            height: 180px;
            width: 590px;
            margin-top: 15px;
        }

        .camera {
            display: inline-block;
            width: 30px;
            height: 30px;
            background: url('@/assets/images/camera.png') no-repeat center center;
            background-size: contain;
            cursor: pointer;
        }

        .rainChart {
            height: 200px;
            width: 590px;
        }
    }
}
</style>
