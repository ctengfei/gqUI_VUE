<template>
  <div class="rain-container">
    <div id="qs-map">
    </div>
    <div class="ol-popup" ref="popupTime" v-show="popup">
      <div class="head">
        <h4>{{currentRealTime.stName}}</h4>
        <el-button type="primary" plain @click="closeTime" circle style="width: 25px;height: 25px;border: 0;align-self: center">
          <Close style="width: 1.3em; height: 1.3em;"/>
        </el-button>
      </div>
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
    </div>
    <div class="tips" @click="show">
      <i></i>
      <span>实时监测</span>
    </div>
    <div class="point-list" :style="{ left:left+'%' }">
      <div class="head">
        <h4>实时监测</h4>
        <el-button type="primary" plain @click="hide" circle
                   style="width: 25px;height: 25px;border: 0;align-self: center">
          <ArrowLeftBold style="width: 1em; height: 1em;"/>
        </el-button>
      </div>
<!--      <div style="display:flex;align-items: center;margin-bottom: 10px;">-->
<!--        <span style="margin-right: 10px;white-space: nowrap;width: 112px">开始时间</span>-->
<!--        <el-date-picker-->
<!--            v-model="value1"-->
<!--            type="datetime"-->
<!--            style="width: 100%"-->
<!--            placeholder="开始时间"-->
<!--        />-->
<!--      </div>-->
<!--      <div style="display:flex;align-items: center;margin-bottom: 10px;">-->
<!--        <span style="margin-right: 10px;white-space: nowrap;width: 112px">结束时间</span>-->
<!--        <el-date-picker-->
<!--            v-model="value1"-->
<!--            type="datetime"-->
<!--            style="width: 100%"-->
<!--            placeholder="结束时间"-->
<!--        />-->
<!--      </div>-->
      <div style="display:flex;align-items: center;margin-bottom: 10px;">
        <span style="margin-right: 10px;white-space: nowrap;width: 112px">站点名称</span>
        <el-input clearable v-model="input" @change="debFunc" placeholder="请输入站点名称" style="width: 100%">
          <template #append>
            <el-button type="primary" style="background: #409eff">
              <el-icon :size="16" style="color: #Ffff">
                <Search/>
              </el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      <!--      78%-->
      <div style="height: 90%">
        <el-table :data="tableData" height="100%" @row-click="rowSelect">
          <el-table-column prop="stName" align="center" label="站点名称"/>
          <el-table-column prop="drp" align="center" label="时段降雨量(mm)"/>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import {getCurrentInstance, onBeforeUnmount, onMounted, ref, watch, watchEffect} from 'vue';
import {Tile as TileLayer, Vector as VectorLayer} from "ol/layer";
import {TileSuperMapRest} from "@supermap/iclient-ol";
import {Vector as VectorSource, XYZ} from "ol/source";
import Map from "ol/Map";
import {defaults as defaultControls, ScaleLine} from "ol/control";
import View from "ol/View";
import {getTimeRain} from "@/api/schedulingCtord/realRainfall";
import {Fill, Icon, Stroke, Style, Text} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {Feature, Overlay} from "ol";
import {Point} from "ol/geom";
import {ElMessage} from "element-plus";
import {debounce, sessionStorage} from "@/utils";
import {MAP_URL,TDT_URL} from "@/global";
const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
const { proxy } = getCurrentInstance();
const TiandiMap_img = new TileLayer({
  name: "天地图影像图层",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true
  }),
  properties: {name: "天地图影像图层", id: 'v01', type: 'img'},
  visible: true
});
const TiandiMap_imgLabel = new TileLayer({
  name: "天地图影像注记",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=cia_w&tk=${MAP_TOKEN}&x={x}&y={y}&l={z}`,
    wrapX: true
  }),
  properties: {name: "天地图影像注记", id: 'v01', type: 'img'},
  visible: true
});
const pianQu = new TileLayer({
  source: new TileSuperMapRest({
    url: `/superMapUrl/iserver/services/map-ShanHongPianQuFanWei/rest/maps/basin_14_geo@%E5%B1%B1%E6%B4%AA%E7%89%87%E5%8C%BA%E8%8C%83%E5%9B%B4?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
    wrapX: true,
  }),
})
let map = ref(null);
const popupTime = ref();
let overlayTime = ref(null);
let input = ref('');
let left = ref(2);
let popup =ref(false)
let tableData = ref([]);
let currentRealTime = ref({});
const vector = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vector,
  properties: {title: `base-vector`, id: 'v01'},
  style: new Style({
    fill: new Fill({
      color: 'rgba(249, 231, 159 , 0.2)',
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2,
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
  zIndex: 25,
  declutter: true,
  visible: true,
});
const debFunc = debounce(onChange,500,false); // 防抖
onMounted(() => {
  map.value = new Map({
    layers: [vectorLayer,TiandiMap_img, TiandiMap_imgLabel,pianQu],
    target: 'qs-map',
    controls: defaultControls({
      zoom: false,
    }).extend([
      new ScaleLine({
        units: 'metric',
      }),
    ]),
    view: new View({
      center: [114.65208746275314, 29.884163408981514],
      projection: 'EPSG:4326',
      zoom: 14,
    }),
  });
  onChange('')
})

watchEffect(() => {
  map.value && map.value.on('click', (event) => {
    map.value.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
      const {state, coord, type,stcd} = feature.getProperties();
      if (state === 'time') { // 实时监测站点
        if (overlayTime.value) { // 避免第一报错
          const {category} = overlayTime.value.getProperties();
          if (state === category) { // 每次点击的都是实时监测站类型的弹框 删除前一个弹框
            closeTime();
          }
        }
        currentRealTime.value = feature.getProperties();
        popup.value = true;
        createOverlay(coord);
      }
      return true; // 停止遍历其他要素
    }, {hitTolerance: 5});  // hitTolerance 增加点击容错率
  });
});

function onChange(name){
  getTimeRain({
    stType:'PP',
    sourceType:'0',
    stName:name
  }).then(res=>{
    if(res.success){
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
        feature.setStyle(new Style({
          image: new Icon({
            src: useFile('yuliangzhan'),
            scale: 1,
            size:[20,20],
            anchor:[0.5,0.2]
          }),
          text: new Text({
            text: r.stName,
            textAlign:'center',
            textBaseline:'middle',
            font: '14px font-size',
            fill: new Fill({
              color: '#fff'
            }),
            backgroundFill: new Fill({
              color:'#0821c3',
            }),
            backgroundStroke:new Stroke({
              color:'rgba(255,255,255,.5)',
              lineCap:'round',
              lineJoin:'round',
              width:1
            }),
            padding: [6, 30, 4, 30],
            offsetY: '-21',
          })
        }));
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
    }
  })
}

function rowSelect(row) {
  if(row.stLong && row.stLat){
    const feature = vector.getFeatures().find(r=> r.getProperties().stCode == row.stCode);
    map.value.getView().fit(feature.getGeometry(), { duration: 600,maxZoom:16 });
  }else{
    ElMessage({
      message: '经纬度不正确',
      type: 'warning',
    })
  }
}

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
    offset: [-290, -25],
  });
  overlayTime.value.setProperties({category: 'time'})
  map.value.addOverlay(overlayTime.value);
}

/**
 * 关闭弹框
 *
 */
function closeTime() {
  map.value && map.value.removeOverlay(overlayTime.value);
  popup.value = false;
}


function useFile(name) {
  return new URL(`../../../assets/imgs/${name}.png`, import.meta.url).href;
}

function show() {
  left.value = 2
}

function hide() {
  left.value = -100
}

onBeforeUnmount(() => {
  map.value.setTarget(null);
  map.value = null;
})
</script>

<style scoped lang="scss">
.rain-container{
  position: relative;
  height: calc(100vh - 105px);
  width: 100vw;
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
      background: url("@/assets/images/dn.png") no-repeat center center;
      background-size: cover;
      margin-bottom: 5px;
    }

    span {
      width: 3px;
      font-size: 16px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #1791FF;
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
    transition: left .8s;
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
      border-bottom: 1px solid #F1F1F1;

      h4 {
        font-size: 18px;
        color: #1791FF;
        font-weight: 600;
        margin-bottom: 0;
      }
    }
  }
  .ol-popup {
    position: absolute;
    bottom: 22px;
    width: 580px;
    padding: 0px 15px 15px 15px;
    background: #fff;
    border-radius: 8px;

    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      border-bottom: 1px solid #F1F1F1;

      h4 {
        margin-bottom: 0;
        font-size: 18px;
      }
    }

    .box {
      height: 180px;
      width: 580px;
      margin-top: 15px;
    }

    .camera {
      display: inline-block;
      width: 30px;
      height: 30px;
      background: url("@/assets/images/camera.png") no-repeat center center;
      background-size: contain;
      cursor: pointer;
    }

  }
}

</style>