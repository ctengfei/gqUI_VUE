<template>
  <div class="map-continer">
    <div class="map-box" id="Bmap">
    </div>
    <div class="tips" @click="show">
      <i></i>
      <span>遥感监测列表</span>
    </div>
    <div class="point-list" :style="{ left: lef + '%' }">
      <div class="head">
        <h4>遥感监测列表</h4>
        <el-button type="primary" plain @click="hide" circle
          style="width: 25px;height: 25px;border: 0;align-self: center">
          <ArrowLeftBold style="width: 1em; height: 1em;" />
        </el-button>
      </div>
      <div style="display:flex;align-items: center;margin-bottom: 10px;">
        <span style="margin-right: 10px;white-space: nowrap;width: 112px">遥感图层</span>
        <el-select-v2 v-model="select1" :options="options1" filterable style="width: 100%"
          placeholder="选择图层"></el-select-v2>
      </div>
      <div style="display:flex;align-items: center;margin-bottom: 10px;">
        <span style="margin-right: 10px;white-space: nowrap">种植结构图层</span>
        <el-select-v2 v-model="select2" clearable :options="options2" filterable style="width: 100%"
          placeholder="选择图层"></el-select-v2>
      </div>
      <div style="display: flex">
        <el-input clearable v-model="input" placeholder="请输入区域名称" style="margin-bottom: 10px;flex: 1;margin-right: 5px">
          <template #append>
            <el-button type="primary" style="background: #409eff">
              <el-icon :size="16" style="color: #Ffff">
                <Search />
              </el-icon>
            </el-button>
          </template>
        </el-input>
        <el-switch v-model="switchBtn" inactive-text="种植结构" />
      </div>
      <div style="height: 78%">
        <el-table :data="tableData" height="100%" @row-click="rowSelect">
          <el-table-column type="index" align="center" label="序号" width="50" />
          <el-table-column prop="areaName" align="center" label="区域名称" />
        </el-table>
      </div>
    </div>
    <div class="r-tips" @click="hanldeShow">
      <i></i>
      <span>种植结构面积统计</span>
    </div>
    <div class="plant-list" :style="{ right: rig + '%' }">
      <div class="head">
        <h4>种植结构面积统计</h4>
        <el-button type="primary" plain @click="hidden" circle
          style="width: 25px;height: 25px;border: 0;align-self: center">
          <ArrowRightBold style="width: 1em; height: 1em;" />
        </el-button>
      </div>
      <el-input class="search" clearable v-model="input_val" placeholder="请输入区域名称">
        <template #append>
          <el-button type="primary" style="background: #409eff">
            <el-icon :size="16" style="color: #Ffff">
              <Search />
            </el-icon>
          </el-button>
        </template>
      </el-input>
      <el-table :data="tableVal"  show-summary align="center" height="100%" style="width: 100%" border :span-method="spanMethod">
        <el-table-column align="center" prop="areaName" label="区域名称" />
        <el-table-column align="center" prop="crop" label="农作物种类" />
        <el-table-column align="center" prop="plantArea" label="种植面积(k㎡)" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect,getCurrentInstance } from "vue";
import Map from "ol/Map";
import { Search } from '@element-plus/icons-vue'
import { defaults as defaultControls, ScaleLine } from "ol/control";
import View from "ol/View";
import { TileSuperMapRest } from "@supermap/iclient-ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { GeoJSON } from "ol/format";
import * as turf from "@turf/turf";
import { MultiLineString, MultiPolygon, Point } from "ol/geom";
import json from '@/utils/json'
import { Feature } from "ol";
import { Vector as VectorSource, XYZ } from "ol/source";
import { Fill, Stroke, Style } from "ol/style";
import { fromLonLat } from "ol/proj";
import { getPlant, getRemoteSelect, getSense } from "@/api/remoteMonitoring";
import { ElMessage } from "element-plus";
import CircleStyle from "ol/style/Circle";
import {getSpanArr, sessionStorage} from "@/utils";
const { proxy } = getCurrentInstance();
const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
import { MAP_URL,TDT_URL } from '@/global'
let tableData = ref([]);
let tableVal = ref([]);
let lef = ref(2);
let rig = ref(2);
let switchBtn = ref(false);
let map = reactive(null);
let vector = ref();
let visible = ref(true);
let input = ref();
let input_val = ref();
let ZhongZ = ref();
let select1 = ref(null);
let options1 = ref([]);
let select2 = ref(null);
let options2 = ref([]);
let mergeRow = ref([]);
onMounted(() => {
  vector.value = new VectorSource();
  const TiandiMap_img = new TileLayer({
    name: "天地图影像图层",
    source: new XYZ({
      url: `${TDT_URL}DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
      wrapX: true
    }),
    properties: { name: "天地图影像图层", id: 'v01', type: 'img' },
    visible: true
  });
  const bj = new TileLayer({
    name: "边界",
    source: new TileSuperMapRest({
      url: `/superMapUrl/iserver/services/map-ugcv5-YaoGanYingXiangBianJieXianErWeiYaoGan/rest/maps/%E9%81%A5%E6%84%9F%E5%BD%B1%E5%83%8F%E8%BE%B9%E7%95%8C_%E7%BA%BF%40%E4%BA%8C%E7%BB%B4%E9%81%A5%E6%84%9F`,
      wrapX: true
    }),
    properties: { name: "边界", id: 'v01', type: 'bj' },
    visible: true
  });
  const vectorLayer = new VectorLayer({
    source: vector.value,
    properties: { title: `base-vector`, id: 'v01' },
    style: new Style({
      fill: new Fill({
        color: 'rgba(249, 231, 159 , 0.2)',
      }),
      stroke: new Stroke({
        color: 'rgba(2231, 76, 60 , 0.5)',
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
  map = new Map({
    layers: [TiandiMap_img, vectorLayer, bj],
    target: "Bmap",
    controls: defaultControls({
      zoom: false,
    }).extend([
      new ScaleLine({
        units: 'metric',
      }),
    ]),
    view: new View({
      center: [114.54912787724153, 29.956171640780035],
      projection: 'EPSG:4326',
      zoom: 11,
    }),
  });
  clearLayer();
  // 遥感图层
  getRemoteSelect({ mapType: 0 }).then(res => {
    if (res.success) {
      options1.value = res.data.map(r => ({ label: r.mapName, value: r.id, ...r }));
      select1.value = options1.value.length ? options1.value[0].id : null;
    }
  });
  // 种植结构图层
  getRemoteSelect({ mapType: 1 }).then(res => {
    if (res.success) {
      options2.value = res.data.map(r => ({ label: r.mapName, value: r.id, ...r }));
      select2.value = options2.value.length ? options2.value[0].id : null;
    }
  })
})

watch(select1, (el) => {
  const ops = options1.value.find(r => r.id == el);
  if (ops) {
    const layers = map.getLayers().getArray();
    layers.find(r => {
      if (r.getProperties().id) {
        if (r.getProperties().id === 'YAOGAN') {
          map.removeLayer(r);
        }
      }
    })
    const ygLayer = new TileLayer({
      name: ops.mapName,
      source: new TileSuperMapRest({
        url: `${MAP_URL}${ops.mapUrl}`,
        wrapX: true
      }),
      properties: { id: 'YAOGAN' },
      visible: true,
      zIndex: 23
    });
    map.addLayer(ygLayer)
  }
})

watch(select2, (el) => {
  const ops = options2.value.find(r => r.id == el);
  if (ops) {
    const layers = map.getLayers().getArray();
    layers.find(r => {
      if (r.getProperties().id) {
        if (r.getProperties().id === 'ZHONGZ') {
          map.removeLayer(r);
        }
      }
    })
    const zZlayer = new TileLayer({
      name: ops.mapName,
      source: new TileSuperMapRest({
        url: `${MAP_URL}${ops.mapUrl}`,
        wrapX: true
      }),
      properties: { id: 'ZHONGZ' },
      visible: false,
      zIndex: 24
    });
    map.addLayer(zZlayer)
  }
})

watch([select2, input], ([el, it]) => {
  getSense({ mapId: el, areaName: it }).then(res => {
    if (res.success) {
      tableData.value = res.data;
    }
  })
})

watch([select2, input_val], ([el, it]) => {
  getPlant({ mapId: el, areaName: it }).then(res => {
    if (res.success) {
      const data = res.data.map(r=> ({...r,plantArea:parseFloat(r.plantArea).toFixed(2)}));
      mergeRow.value = getSpanArr(data, 'areaName');
      tableVal.value = data
    }
  })
})

watch(switchBtn, (btn) => {
  const layers = map.getLayers().getArray();
  layers.find(r => {
    if (r.getProperties().id === 'ZHONGZ') {
      r.setVisible(btn)
    }
  })
})

function spanMethod({ row, column, rowIndex, columnIndex }) {
  if (columnIndex == 0) {
    const _row = mergeRow.value[rowIndex]  // 合并行数
    const _col = _row > 0 ? 1 : 0 // 合并列数，1：不改变，0：被消除
    return {
      rowspan: _row,
      colspan: _col
    }
  }
}


function clearLayer() {
  const layers = map.getLayers().getArray();
  layers.find(r => {
    if (r.getProperties().id) {
      if (r.getProperties().id === 'YAOGAN' || r.getProperties().id === 'ZHONGZ') {
        map.removeLayer(r);
      }
    }
  })
}

onBeforeUnmount(() => {
  map.setTarget(null);
  map = null;
})

function show() {
  lef.value = 2
}

function hide() {
  lef.value = -100
}

function hanldeShow() {
  rig.value = 2
}

function hidden() {
  rig.value = -100
}

function rowSelect(row) {
  if (row.longitude && row.latitude) {
    const feat = vector.value.getFeatures().find(r => r.getProperties().id === 'point');
    if (feat) {
      vector.value.removeFeature(feat);
    }
    const feature = new Feature({
      geometry: new Point([parseFloat(row.longitude), parseFloat(row.latitude)]),
      properties: { id: 'point' }
    });
    vector.value.addFeature(feature)
    // map.getView().fit(feature.getGeometry(), {duration: 600, maxZoom: 20})
  } else {
    ElMessage({
      message: '经纬度错误',
      type: 'error',
    });
  }

}

</script>

<style scoped lang="scss">
.map-continer {
  position: relative;
  height: calc(100vh - 105px);
  width: calc(100vw - 270px);

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

  .r-tips {
    position: absolute;
    right: 3%;
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

    .search {
      margin: 0 auto;
      width: 90%;
      margin-bottom: 15px;
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
    transition: right .8s;
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

    .search {
      margin: 0 auto;
      width: 90%;
      margin-bottom: 15px;
    }
  }
}

.map-box {
  height: calc(100vh - 105px);
  width: 100vw;
}
</style>