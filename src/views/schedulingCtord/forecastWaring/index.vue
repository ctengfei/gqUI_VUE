<template>
    <div class="box">
        <div id="mapForecast">
        </div>
        <div class="head">
            雨量预警阈值(mm)<el-input-number v-model="threshol" placeholder="阈值"
                style="width:160px;margin-left: 15px;margin-right: 15px" />
            超过阈值 <strong style="color: #BE4242">{{ num }}</strong> 个
            <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
        <div class="legend">
            <li>
                <span>0 mm</span>
                <span style="background: #ddd"></span>
            </li>
            <li>
                <span>0 - 10 mm</span>
                <span style="background: #4adb1b"></span>
            </li>
            <li>
                <span>10 - 25 mm</span>
                <span style="background: #ebeb00"></span>
            </li>
            <li>
                <span>25 - 50 mm</span>
                <span style="background: #ff8100"></span>
            </li>
            <li>
                <span>50 - 100 mm</span>
                <span style="background: #e55050"></span>
            </li>
            <li>
                <span>100 - 250 mm</span>
                <span style="background: #a907a9"></span>
            </li>
            <li>
                <span>≥250 mm</span>
                <span style="background: #cc00ff"></span>
            </li>
        </div>
        <div class="dialog">
            <div class="head-title">智能网格预报</div>
            <div style="margin-top: 10px;width: 100%">
                <span style="margin-bottom: 10px;margin-right: 8px">预报时效</span>
                <pro-select style="width: 305px" v-model="select" :data="selects" @change="handleSelectChange" />
            </div>
            <div style="margin-top: 20px">
                <el-button type="success" @click="handlePlay">播放</el-button>
                <el-button type="warning" @click="handleParse">暂停</el-button>
                <el-button type="primary" @click="handlePrev" :disabled="select <= 0">上时次</el-button>
                <el-button type="primary" @click="handleNext" :disabled="select >= selects.length - 1">下时次</el-button>
            </div>
        </div>
    </div>

</template>

<script setup>
import { TileSuperMapRest } from "@supermap/iclient-ol";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import Map from "ol/Map";
import { Feature } from 'ol';
import { Polygon, Circle, Point } from "ol/geom";
import { toLonLat } from "ol/proj";
import { fromCircle } from "ol/geom/Polygon";
import { Vector as VectorSource, XYZ } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { defaults as defaultControls, ScaleLine } from "ol/control";
import View from "ol/View";
import { Fill, Stroke, Style, Text, Icon } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { getEcast } from "@/api/schedulingCtord/ecastRainfall";
import { MAP_URL,TDT_URL } from '@/global'
import { ElMessage } from "element-plus";
import {formatterVal, sessionStorage, sleep} from '@/utils';
const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
import {
    addAreaRainfallWaring,
    getAreaRainfallWaring,
    getAreaRainfallWaringList,
    putAreaRainfallWaring
} from "@/api/schedulingCtord/forecastWaring";
let select = ref('');
let selects = ref([]);
let state = ref(0); // 0 暂停  1播放  2播放结束
let rainArea = ref({});
const source = ref({});
let map = ref();
const threshol = ref('');
let num = ref(0)
let timer = null;

const TiandiMap_vec = new TileLayer({
  name: "天地图矢量图层",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true
  }),
  properties: {name: "天地图矢量图层", id: 'v01', type: 'vector'},
  visible: true
});

const TiandiMap_vecLabel = new TileLayer({
  name: "天地图矢量注记",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true
  }),
  properties: {name: "天地图矢量注记", id: 'v01', type: 'vector'},
  visible: true
});

const pianQu = new TileLayer({
    source: new TileSuperMapRest({
        url: `/superMapUrl/iserver/services/map-ShanHongPianQuFanWei/rest/maps/basin_14_geo@%E5%B1%B1%E6%B4%AA%E7%89%87%E5%8C%BA%E8%8C%83%E5%9B%B4?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
        wrapX: true,
    }),
})

// 阈值
const handleSave = () => {
    getAreaRainfallWaring().then(res => {
        if (res.success) {
            if (res.data.length) { // 修改
                const af = res.data[0];
                putAreaRainfallWaring(af.id, { wv: threshol.value }).then(res => {
                    ElMessage({
                        message: '修改成功',
                        type: 'success',
                    });
                    getData();
                })
            } else { // 没有阈值 就新增
                addAreaRainfallWaring({ wv: threshol.value }).then(res => {
                    if (res.success) {
                        ElMessage({
                            message: '保存成功',
                            type: 'success',
                        });
                        getData();
                    }
                })
            }
        }
    })
}

// 获取超过阈值个数
const getData = () => {
  getAreaRainfallWaringList({WV:threshol.value}).then(res=>{
    num.value = 0
    if(res.success){
      res.data.forEach((r,i)=>{
        if(parseFloat(r.areaRainfall) > parseFloat(threshol.value)){
           num.value++;
        }
      })
    }
  })
}
// 图形转换
function generateRectangleCoordinates(center, width, height) {
    // 计算四边形的半宽度和半高度
    var halfWidth = width / 2;
    var halfHeight = height / 2;

    // 获取中心点的经度和纬度
    var centerLonLat = center;

    // 计算四边形的四个角的经纬度坐标
    var topLeft = [centerLonLat[0] - halfWidth, centerLonLat[1] + halfHeight]; // 左上角
    var topRight = [centerLonLat[0] + halfWidth, centerLonLat[1] + halfHeight]; // 右上角
    var bottomRight = [centerLonLat[0] + halfWidth, centerLonLat[1] - halfHeight]; // 右下角
    var bottomLeft = [centerLonLat[0] - halfWidth, centerLonLat[1] - halfHeight]; // 左下角

    // 返回四个角的经纬度坐标数组
    return [topLeft, topRight, bottomRight, bottomLeft];
}

// 播放
function handlePlay() {
    if (state.value == 1) {
        return
    }
    state.value = 1;
}

// 暂停
function handleParse() {
    if (state.value == 0 || state.value == 2) {
        return
    }
    state.value = 0;
}

// 上时次
function handlePrev() {
    if (select.value <= 0) {  // 第一个不变
        select.value = 0;
        return
    }
    state.value = 0;
    select.value--;
}

// 下时次
function handleNext() {
    if (select.value >= selects.value.length - 1) { // 最后一个不变
        select.value = selects.value.length - 1;
        return
    }
    state.value = 0;
    select.value++;
}

// 手动选择时段
function handleSelectChange(val) {
    console.log('val',val)
    state.value = 0;
    source.value.clear();
    source.value.addFeatures(Object.values(rainArea.value)[val]);
}

watch([select, state], ([se, sa]) => {
    if (sa == 0 || sa == 2) {
        source.value.clear();
        let temp = Object.values(rainArea.value)[select.value];
        temp ? source.value.addFeatures(temp) : '';
    }
})

watch(state, (sa) => {
    if (sa == 1) { // 播放
        ElMessage({
            message: '播放开始',
            type: 'success',
        });
        timer = setInterval(() => {
            if (select.value >= selects.value.length - 1) {  // 播放结束
                state.value = 2;
            } else { // 播放中
                select.value++
                // // 清除上已时段
                source.value.clear();
                let temp = Object.values(rainArea.value)[select.value];
                temp ? source.value.addFeatures(temp) : '';

            }
        }, 5000);
    } else if (sa == 0) { // 暂停
        clearInterval(timer);
        timer = null
        ElMessage({
            message: '播放暂停',
            type: 'success',
        });
    } else { // 播放结束
        ElMessage({
            message: '播放结束',
            type: 'success',
        });
        clearInterval(timer);
        timer = null
        select.value = 0;
        state.value = 0;
        // 清除上已时段
        source.value.clear();
        source.value.addFeatures(Object.values(rainArea.value)[0]);
    }
})


onMounted(() => {
    // baseLayer
    map.value = new Map({
        layers: [TiandiMap_vec,TiandiMap_vecLabel, pianQu],
        target: 'mapForecast',
        controls: defaultControls({
            zoom: false,
        }).extend([
            new ScaleLine({
                units: 'metric',
            }),
        ]),
        view: new View({
            center: [114.6607190071207, 29.975431893776882],
            projection: 'EPSG:4326',
            zoom: 10.5,
        }),
    });
    source.value = new VectorSource();
    //创建图层和要素
    var vectorLayer = new VectorLayer({
        source: source.value,
        style: new Style({
            fill: new Fill({
                color: 'rgba(249, 231, 159 , 0.2)',
            }),
            stroke: new Stroke({
                color: '#ffcc33',
                width: 1,
            }),
            image: new CircleStyle({
                radius: 7,
                fill: new Fill({
                    color: 'rgba(2231, 76, 60 , 0.5)',
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2,
                }),
            }),
        }),
        visible: true,
    });
    map.value.addLayer(vectorLayer);
    let arr = [];
    // 设置矩形宽度和高度
    var width = 0.025;
    var height = 0.025;
    let polygon = null;
    let feature = null;
    let mergeData = {};
    let mergeDataPoint = {};
    // 查询阈值
    getAreaRainfallWaring().then(res=>{
        if(res.success){
            if(res.data.length){
                const af = res.data[0];
                threshol.value = af.wv
            }else{
                threshol.value = 0
            }
        }
        getData();
    })
    getEcast().then(res => {
        if (res.success) {
            // 处理数据
            res.data.forEach(col1 => {
                col1.data.forEach((col2, i) => {
                    col2.forEach((col3, l) => {
                        console.log(col3,"col3")
                        arr.push({
                            coord: [col1.x1 + l * col1.dw, col1.y1 + i * col1.dh],
                            value: col3,
                            tm: `${col1.tmRange.tm1}-${col1.tmRange.tm2}`
                        })
                    })
                })
            });
            // 按时间分割 点位
            arr.forEach(r => {
                mergeData[r.tm] = mergeData[r.tm] || [];
                mergeDataPoint[r.tm] = mergeDataPoint[r.tm] || [];
                mergeData[r.tm].push(r)
                mergeDataPoint[r.tm].push(r)
            })
            // 面
            // console.log(mergeData,"mergeData")
            Object.keys(mergeData).forEach((item1, k) => {
                selects.value.push({ value: k, label: item1 });
                mergeData[item1] = mergeData[item1].map(item2 => {
                    // 创建矩形几何体，将点转换成矩形
                    let coord = generateRectangleCoordinates([item2.coord[0], item2.coord[1]], width, height)
                    polygon = new Polygon([coord]);
                    feature = new Feature(polygon);
                    feature.setStyle(new Style({
                        fill: new Fill({
                            color: setColor(item2.value),
                        }),
                        stroke: new Stroke({
                            color: setColor(item2.value),
                            width: 1,
                        }),
                        text: item2.value > 0 ? new Text({
                            text: Number(item2.value).toFixed(1),
                            textAlign: 'center',
                            textBaseline: 'middle',
                            font: '13px font-size',
                            fill: new Fill({
                                color: '#000'
                            }),
                        }) : null,
                    }));
                    return feature;
                })
                select.value = 0;
                rainArea.value = mergeData;
                source.value.addFeatures(Object.values(mergeData)[0]);
            });
            // 点
            // Object.keys(mergeDataPoint).forEach((item1, k) => {
            //     // selects.value.push({ value: k, label: item1 });
            //     mergeDataPoint[item1] = mergeDataPoint[item1].map(item2 => {
            //         // 创建矩形几何体，将点转换成矩形
            //         let coord = generateRectangleCoordinates([item2.coord[0], item2.coord[1]], width, height)
            //         // polygon = new Point([item2.coord[0], item2.coord[1]]);
            //         feature = new Feature({
            //             geometry: new Point([item2.coord[0], item2.coord[1]]),
            //         });
            //         // console.log(polygon,"polygon")
            //         // feature = new Feature(polygon);
            //         feature.setStyle(new Style({
                        
            //             image: new Icon({
            //                 src: useFile('yuliangzhan'),
            //                 scale: 1,
            //                 size: [20, 20],
            //                 anchor: [0.5, 0.2]
            //             }),
                        
            //         }));
            //         return feature;
            //     })
                
            // });
            select.value = 0;
            rainArea.value = mergeDataPoint;
            source.value.addFeatures(Object.values(mergeDataPoint)[0]);
        }
    })
})
function useFile(name) {
    return new URL(`../../../assets/imgs/${name}.png`, import.meta.url).href;
}
function setColor(val) {
    if (val == 0) {
        return 'rgba(221,221,221,0.4)';
    } else if (val > 0 && val < 10) {
        return 'rgba(74,219,27,0.8)';
    } else if (val >= 10 && val < 25) {
        return 'rgba(235,235,0,0.8)';
    } else if (val >= 25 && val < 50) {
        return 'rgba(255,129,0,0.9)';
    } else if (val >= 50 && val < 100) {
        return 'rgba(229,80,80,0.9)';
    } else if (val >= 100 && val < 250) {
        return 'rgba(169,7,169,0.9)';
    } else if (val >= 250) {
        return 'rgba(204,0,255,0.9)';
    }
}

onBeforeUnmount(() => {
    map.value.setTarget(null);
    map.value = null;
    state.value = false;
})


</script>

<style scoped lang="scss">
.box {
    position: relative;
    height: calc(100vh - 105px);
    width: calc(100vw - 270px);

    #mapForecast {
        position: relative;
        height: calc(100vh - 105px);
        width: 100vw;
    }

    .head {
        position: absolute;
        left: 2%;
        top: 5%;
        background: #FFFFFF;
        border-radius: 14px;
        padding: 10px;
        font-weight: bold;
    }

    .legend {
        position: absolute;
        left: 2%;
        bottom: 5%;
        padding: 10px;
        background: #FFFFFF;
        border-radius: 14px;

        li {
            display: flex;
            align-items: center;
            color: #999;
            font-size: 12px;
            margin: 5px 0;

            span:nth-child(1) {
                flex: 1;
                white-space: nowrap;
                color: #383a3d;
            }

            span:nth-child(2) {
                display: inline-block;
                flex: 1;
                width: 71px;
                height: 5px;
                border-radius: 8px;
                margin-left: 5px;
            }

            &:first-child {
                margin-top: 0;
            }

            &:last-child {
                margin-bottom: 0;
            }
        }
    }

    .dialog {
        position: absolute;
        right: 2%;
        top: 5%;
        width: 400px;
        height: 165px;
        padding: 10px;
        background: #FFFFFF;
        border-radius: 14px;
    }
}
</style>