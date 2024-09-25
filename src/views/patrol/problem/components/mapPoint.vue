<template>
  <div class="mapContainer">
    <div class="tab-map" ref="maps" id="tab-map"></div>
  </div>
</template>
  
  <script setup name="mapPoint">
import {
  ref,
  reactive,
  onMounted,
  nextTick,
  watch,
  onBeforeUnmount,
  onBeforeMount,
  watchEffect,
  onActivated,
  onDeactivated,
} from "vue";
import { Vector as VectorSource, XYZ } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { TileSuperMapRest } from "@supermap/iclient-ol";
import View from "ol/View";
import Map from "ol/Map";
import { Point, Circle } from "ol/geom";
import { Feature, Overlay } from "ol";
import { Fill, Stroke, Style, Text, Icon } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { GeoJSON } from "ol/format";
import { formatterVal, sessionStorage, sleep } from "@/utils";
import useGqOneImageStore from "@/store/modules/oneimage";
import { MAP_URL,TDT_URL } from "@/global";
import json from "@/utils/json";
import { MultiLineString, MultiPolygon, LineString } from "ol/geom";
import * as turf from "@turf/turf";
import { getGqList } from "@/api/informationManager/basicData/gqBasicData";
import { getPlayUrl } from "@/api/digitization";
import { getResList } from "@/api/informationManager/basicData/skBasicData";
let props = defineProps(["pointObj"]);
const MAP_TOKEN = sessionStorage.get("MAP_TOKEN");
const gqOneImageStore = useGqOneImageStore();
let tabMap = ref(null);
const maps = ref();
let activeName = ref("1");
let show = ref(false);
let left = ref(gqOneImageStore.legend);
let vise = ref(false);
let count = ref(1);
const popupTime = ref();
const popupBuild = ref();
const history = ref();
let historyData = ref([]);
let gqList = ref([]);
let resList = ref([]);
let currentStructure = ref({});
let currentRealTime = ref({});
let overlayTime = ref(null);
let overlayStructure = ref(null);
let dialogVisible = ref(false);
let views = ref({});
let title = ref("");
const DP = ref(null);
const cameraDialog = ref(null);

let playUrl = ref("");
const customLayer = new TileLayer({
  name: "影像(一张图)",
  source: new TileSuperMapRest({
    url: `/superMapUrl/iserver/services/map-YXFW/rest/maps/YXDOM?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
    wrapX: true,
  }),
  properties: { name: "影像(一张图)", id: "v01", type: "custom" },
  visible: false,
});
// `${MAP_URL}iserver/services/map-ZhuanYiLuXianTu/rest/maps/zylx.ol3`
const TiandiMap_vec = new TileLayer({
  name: "天地图矢量图层",
  source: new TileSuperMapRest({
    url: `/superMapUrl/iserver/services/map-china400/rest/maps/China_4326`,
    wrapX: true,
  }),
  properties: { name: "天地图矢量图层", id: "v01", type: "vector" },
  visible: false,
});
const TiandiMap_img = new TileLayer({
  name: "天地图影像图层",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true,
  }),
  properties: { name: "天地图影像图层", id: "v01", type: "img" },
  visible: true,
});

const TiandiMap_imgLabel = new TileLayer({
  name: "天地图影像注记",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=cia_w&tk=${MAP_TOKEN}&x={x}&y={y}&l={z}`,
    wrapX: true,
  }),
  properties: { name: "天地图影像注记", id: "v01", type: "img" },
  visible: true,
});

const TiandiMap_ter = new TileLayer({
  name: "天地图地形图层",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true,
  }),
  properties: { name: "天地图地形图层", id: "v01", type: "terrain" },
  visible: false,
});

const TiandiMap_terLabel = new TileLayer({
  name: "天地图地形注记",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true,
  }),
  properties: { name: "天地图地形注记", id: "v01", type: "terrain" },
  visible: false,
});

const vector = new VectorSource();
const circle = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vector,
  properties: { title: `base-vector`, id: "v01" },
  style: new Style({
    fill: new Fill({
      color: "rgba(249, 231, 159 , 0.2)",
    }),
    stroke: new Stroke({
      color: "#ffcc33",
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: "rgba(2231, 76, 60 , 0.5)",
      }),
      stroke: new Stroke({
        color: "#ffcc33",
        width: 2,
      }),
    }),
  }),
  zIndex: 25,
  visible: true,
});
const vectoryCircleLayer = new VectorLayer({
  source: circle,
  properties: { title: `circle-vector`, id: "v01" },

  style: new Style({
    fill: new Fill({
      color: "rgba(249, 231, 159 , 0.2)",
    }),
    stroke: new Stroke({
      color: "#ffcc33",
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: "rgba(2231, 76, 60 , 0.5)",
      }),
      stroke: new Stroke({
        color: "#ffcc33",
        width: 2,
      }),
    }),
  }),
  zIndex: 24,
  visible: true,
});
// [TiandiMap_vec, TiandiMap_img, TiandiMap_ter, TiandiMap_imgLabel, TiandiMap_vecLabel, TiandiMap_terLabel];
const layers = [
  TiandiMap_vec,
  TiandiMap_img,
  TiandiMap_imgLabel,
  TiandiMap_ter,
  TiandiMap_terLabel,
  customLayer,
];

onMounted(() => {
  initMap();
});
// 初始化地图
function initMap() {
  views.value = new View({
    center: [115.143469841072, 29.7996586265474],
    projection: "EPSG:4326",
    zoom: 11,
    maxZoom: 20,
  });
  tabMap.value = new Map({
    layers: layers,
    target: "tab-map",
    controls: defaultControls({
      zoom: false,
    }).extend([
      new ScaleLine({
        units: "metric",
      }),
    ]),
    view: views.value,
  });
  tabMap.value.addLayer(vectorLayer);
  tabMap.value.addLayer(vectoryCircleLayer);
  creatMask(tabMap.value);
  gqOneImageStore.getMap({
    Map: tabMap.value,
    vector: vector,
  });

  let conservancy = gqOneImageStore.conservancy;
  const allLayer = tabMap.value.getLayers().getArray(); // 所有图层
  let map = tabMap.value;
  const oLayers = conservancy.filter(
    (e) => !allLayer.find((c) => c.getProperties().id === e.split("-")[0])
  );
  oLayers.forEach((r) => {
    switch (r.split("-")[0]) {
      case "outer": // 外边界
        const bj = new TileLayer({
          source: new TileSuperMapRest({
            url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyingouter?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
            wrapX: true,
          }),
          zIndex: 23,
        });
        bj.setProperties({ id: "outer" });
        map.addLayer(bj);
        break;
      case "hlsx": // 河流水系
        const hlsx = new TileLayer({
          source: new TileSuperMapRest({
            url: `/superMapUrl/iserver/services/map-WangYingCaiXianShuiKuMianTuCeng/rest/maps/T_%E6%B2%B3%E6%B9%96%E9%95%BF_%E7%8E%8B%E8%8B%B1%E6%B0%B4%E5%BA%93_%E7%9B%B8%E5%85%B3%E6%B2%B3%E6%B5%81@%E6%B0%B4%E5%BA%93%E9%9D%A2%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
            wrapX: true,
          }),
          zIndex: 23,
        });
        hlsx.setProperties({ id: "hlsx" });
        map.addLayer(hlsx);
        break;
      case "main": // 主干渠
        const main = new TileLayer({
          source: new TileSuperMapRest({
            url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyingmain?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
            wrapX: true,
          }),
          zIndex: 23,
        });
        main.setProperties({ id: "main" });
        map.addLayer(main);
        break;
      case "trunk": // 干渠
        const trunk = new TileLayer({
          source: new TileSuperMapRest({
            url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyingtrunk?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
            wrapX: true,
          }),
          zIndex: 23,
        });
        trunk.setProperties({ id: "trunk" });
        map.addLayer(trunk);
        break;
      case "xzqh": //行政区划
        const xzqh = new TileLayer({
          source: new TileSuperMapRest({
            url: `/superMapUrl/iserver/services/map-WangYingGuanQu-XingZhengQuHua/rest/maps/%E5%8E%BF%E7%95%8C_%E9%9D%A2_%E7%8E%8B%E8%8B%B1%E7%9B%B8%E5%85%B35%E5%8E%BF@%E5%8C%BA%E5%8E%BF%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
            wrapX: true,
          }),
          zIndex: 20,
        });
        xzqh.setProperties({ id: "xzqh" });
        map.addLayer(xzqh);
        break;
      case "wySurface": // 王英 面
        const wySurface = new TileLayer({
          source: new TileSuperMapRest({
            url: `/superMapUrl/iserver/services/map-WangYingCaiXianShuiKuMianTuCeng/rest/maps/%E7%8E%8B%E8%8B%B1%E6%B0%B4%E5%BA%93_%E9%9D%A2@%E6%B0%B4%E5%BA%93%E9%9D%A2%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
            wrapX: true,
          }),
          zIndex: 23,
        });
        wySurface.setProperties({ id: "wySurface" });
        map.addLayer(wySurface);
        break;
      case "cxSurface": // 蔡贤 面
        const cxSurface = new TileLayer({
          source: new TileSuperMapRest({
            url: `/superMapUrl/iserver/services/map-WangYingCaiXianShuiKuMianTuCeng/rest/maps/%E8%94%A1%E8%B4%A4%E6%B0%B4%E5%BA%93_%E9%9D%A2@%E6%B0%B4%E5%BA%93%E9%9D%A2%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
            wrapX: true,
          }),
          zIndex: 23,
        });
        cxSurface.setProperties({ id: "cxSurface" });
        map.addLayer(cxSurface);
        map.setView(
          new View({
            center: [115.143469841072, 29.7996586265474],
            projection: "EPSG:4326",
            zoom: 11,
          })
        );
        break;
    }
  });
}

/**
 * 点击列表查看点位
 */
watch(
  () => props.pointObj,
  (points, oldPoints) => {
    if (Object.keys(points).length) {
      const feats = vector
        .getFeatures()
        .filter((r) => r.getId().startsWith("er_"));
      feats.forEach((r) => {
        vector.removeFeature(r);
      });
      const feature = new Feature({
        geometry: new Point([
          parseFloat(points.longitude),
          parseFloat(points.latitude),
        ]),
        name: points.partLoc,
      });
      feature.setStyle(
        new Style({
          image: new Icon({
            src: useFile(`${"shuiweizhan"}`),
            scale: 1,
            size: [20, 20],
            anchor: [0.5, 0.2],
          }),
          text: new Text({
            text: props.pointObj.partLoc,
            textAlign: "center",
            textBaseline: "middle",
            font: "14px font-size",
            fill: new Fill({
              color: "#fff",
            }),
            backgroundFill: new Fill({
              color: "#0821c3",
            }),
            backgroundStroke: new Stroke({
              color: "rgba(255,255,255,.5)",
              lineCap: "round",
              lineJoin: "round",
              width: 1,
            }),
            padding: [6, 4, 4, 4],
            offsetY: "-21",
          }),
        })
      );
      feature.setId(`er_${points.id}_${Math.random().toString(36).slice(-4)}`);
      feature.setProperties({
        ...points,
        stcd: points.id,
        type: "report",
        state: "time",
        coord: [points.longitude, points.latitude],
      });
      vector.addFeatures([feature]);
      const temp = vector
        .getFeatures()
        .find((r) => r.getProperties().stcd == points.id);
      const features = vector
        .getFeatures()
        .find((r) => r.getProperties().stcd == points.id);
      tabMap.value
        .getView()
        .fit(features.getGeometry(), { duration: 600, maxZoom: 12 });
    } else {
      // 所有实时站点都没选中时 删除全部
      const feats = vector
        .getFeatures()
        .filter((r) => r.getId().startsWith("er_"));
      feats.forEach((r) => {
        vector.removeFeature(r);
      });
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  tabMap.value.setTarget(null);
  tabMap.value = null;
  gqOneImageStore.initSite = false;
});

function getTool(type) {
  layers.forEach((r) => {
    r.setVisible(r.getProperties().type === type);
  });
}

/**
 * 创建实时监测站弹框
 * @param coord
 */
function createOverlay(coord, feature) {
  overlayTime.value = new Overlay({
    element: popupTime.value,
    id: "TimeDialog",
    position: coord,
    positioning: "center-center",
    offset: [-325, -25],
  });
  overlayTime.value.setProperties({ category: "time" });
  tabMap.value.addOverlay(overlayTime.value);
}

function useFile(name) {
  return new URL(`../../../../assets/imgs/${name}.png`, import.meta.url).href;
}

/**
 * 创建遮罩层
 * @param map
 * @returns {boolean}
 */
function creatMask(map) {
  const geo = new GeoJSON();
  const box1 = [
    [-180, -90],
    [-180, 90],
    [180, 90],
    [180, -90],
    [-180, -90],
  ];
  const maskGeometry = turf.polygon([box1]);
  // let multiPolygon = turf.lineToPolygon(json);
  const multiLineString = new MultiLineString(
    turf.multiLineString(json).geometry.coordinates
  );
  let multiPolygon = new MultiPolygon(
    multiLineString
      .getCoordinates()
      .map((lineStringCoords) => [lineStringCoords])
  );
  multiPolygon = new Feature({
    geometry: multiPolygon,
  });
  multiPolygon = geo.writeFeatureObject(multiPolygon);
  const diffGeometry = turf.difference(maskGeometry, multiPolygon);
  const maskFeature = geo.readFeature(diffGeometry);
  const source = new VectorSource();
  source.addFeature(maskFeature);
  const maskLayer = new VectorLayer({
    source: source,
    style: new Style({
      fill: new Fill({ color: "rgba(220,240,253,0.1)" }),
    }),
    zIndex: 22,
    id: "mask",
    visible: true,
  });
  map.addLayer(maskLayer);
}
</script>
  <style lang="scss">
.camera-dialog {
  .el-dialog__body {
    padding: 0;
  }
}
</style>
  <style lang="scss">
.mapContainer {
  height: 75vh;
  width: 40vw;
}

#tab-map {
  height: 75vh;
  width: 40vw;
}
</style>