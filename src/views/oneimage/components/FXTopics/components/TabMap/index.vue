<template>
    <div class="mapContainer">
      <div class="tab-map" ref="maps" id="tab-map">
      </div>
      <!-- <div class="legend" :style="{left: 1+'%'}">
        <li><span>边界</span><span style="background: #0070c0;height: 5px"></span></li>
        <li><span>总干渠</span><span style="background: #ff0;height: 5px"></span></li>
        <li><span>干渠</span><span style="background: #89ce66;height: 5px"></span></li>
        <li><span>划界确权</span><span style="background: #c00000;height: 5px"></span></li>
        <li><span>水库</span><span style="background: #00c0ff;height: 5px"></span></li>
        <li><span>灌溉范围</span><span style="background: #ffbf00;height: 5px"></span></li>
        <li><span>供水范围</span><span style="background: #0099cc;height: 5px"></span></li>
        <li><span>河流水系</span><span style="background: #0c73bd;height: 5px"></span></li>
      </div> -->
    </div>
  </template>
  
  <script setup>
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
    onDeactivated
  } from 'vue';
  import DPlayer from "dplayer";
  import Hls from "hls.js";
  import {Vector as VectorSource, XYZ} from 'ol/source';
  import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
  import {TileSuperMapRest} from '@supermap/iclient-ol';
  import View from 'ol/View';
  import Map from 'ol/Map';
  import {Point, Circle} from 'ol/geom';
  import {Feature, Overlay} from 'ol';
  import {Fill, Stroke, Style, Text, Icon} from 'ol/style';
  import CircleStyle from 'ol/style/Circle';
  import {defaults as defaultControls, ScaleLine} from 'ol/control';
  import {GeoJSON} from 'ol/format'
  import {formatterVal, sessionStorage, sleep} from '@/utils';
  import useGqOneImageStore from '@/store/modules/oneimage';
  import {MAP_URL,TDT_URL} from '@/global'
  import json from '@/utils/json'
  import {MultiLineString, MultiPolygon, LineString} from 'ol/geom';
  import * as turf from '@turf/turf';
  import {getGqList} from "@/api/informationManager/basicData/gqBasicData";
  import {getPlayUrl} from "@/api/digitization";
  import {getResList} from "@/api/informationManager/basicData/skBasicData";
  const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
  const gqOneImageStore = useGqOneImageStore();
  let tabMap = ref({});
  const maps = ref({});
  let activeName = ref('1');
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
  let title = ref('');
  const DP = ref(null);
  const cameraDialog = ref(null);
  let playUrl = ref('');
  const customLayer = new TileLayer({
    name: "影像(一张图)",
    source: new TileSuperMapRest({
      url: `/superMapUrl/iserver/services/map-YXFW/rest/maps/YXDOM?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
      wrapX: true
    }),
    properties: {name: "影像(一张图)", id: 'v01', type: 'custom'},
    visible: false
  });
  // `${MAP_URL}iserver/services/map-ZhuanYiLuXianTu/rest/maps/zylx.ol3`
  const TiandiMap_vec = new TileLayer({
    name: "天地图矢量图层",
    source: new TileSuperMapRest({
      url: `${TDT_URL}DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
      wrapX: true
    }),
    properties: {name: "天地图矢量图层", id: 'v01', type: 'vector'},
    visible: false
  });
  const TiandiMap_vecLabel = new TileLayer({
    name: "天地图矢量注记",
    source: new XYZ({
      url: `${TDT_URL}DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
      wrapX: true
    }),
    properties: {name: "天地图矢量注记", id: 'v01', type: 'vector'},
    visible: false
  });
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
  
  const TiandiMap_ter = new TileLayer({
    name: "天地图地形图层",
    source: new XYZ({
      url: `${TDT_URL}DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
      wrapX: true
    }),
    properties: {name: "天地图地形图层", id: 'v01', type: 'terrain'},
    visible: false
  });
  
  const TiandiMap_terLabel = new TileLayer({
    name: "天地图地形注记",
    source: new XYZ({
      url: `${TDT_URL}DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
      wrapX: true
    }),
    properties: {name: "天地图地形注记", id: 'v01', type: 'terrain'},
    visible: false
  });
  
  const vector = new VectorSource();
  const circle = new VectorSource();
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
    visible: true,
  });
  const vectoryCircleLayer = new VectorLayer({
    source: circle,
    properties: {title: `circle-vector`, id: 'v01'},
    
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
    zIndex: 24,
    visible: true,
  });

  const szzyLater = new TileLayer({
    name: "受灾转移图" ,
    source: new TileSuperMapRest({
      url: `/superMapUrl/iserver/services/map-ZhuanYiLuXianTu/rest/maps/zylx?prjCoordSys=%7B"epsgCode":4326%7D`,
      wrapX: true,
    }),
    properties: {name: "受灾转移图", id: 'v01', type: 'terrain'},
    visible: false
  });
  // [TiandiMap_vec, TiandiMap_img, TiandiMap_ter, TiandiMap_imgLabel, TiandiMap_vecLabel, TiandiMap_terLabel];
  const layers = [TiandiMap_vec, TiandiMap_img, TiandiMap_imgLabel, TiandiMap_ter,TiandiMap_vecLabel,TiandiMap_terLabel, customLayer];
  
  onMounted(() => {
    // layers
      views.value = new View({
        center: [115.143469841072,29.7996586265474],
        projection: 'EPSG:4326',
        zoom: 1,
        maxZoom: 2
      });
      tabMap.value = new Map({
        layers: layers,
        target: 'tab-map',
        controls: defaultControls({
          zoom: false,
        }).extend([
          new ScaleLine({
            units: 'metric',
          }),
        ]),
        view: views.value,
      });
      getTool('img')
      tabMap.value.addLayer(vectorLayer);
      tabMap.value.addLayer(vectoryCircleLayer);
      creatMask(tabMap.value);
      gqOneImageStore.getMap({
        Map: tabMap.value,
        vector: vector
      });
      
      // setTimeout(()=>{
      //   let tabMapVal = tabMap.value; 
      //   let gqBuild = gqOneImageStore.buildLayers;
      //   const allLayer = tabMapVal.getLayers().getArray();// 所有图层
      //   if(tabMapVal){
      //     console.log(allLayer,"allLayer")
      //     console.log(gqBuild,"gqBuild")
      //     const oLayers = gqBuild.filter(e => !allLayer.find(c => c.getProperties().id === e.split('-')[0]));
      //     oLayers.forEach(r => {
      //       if(r.split('-')[0] == 'zyt') {
      //           const zyt = new TileLayer({
      //             source: new TileSuperMapRest({
      //               url: `${MAP_URL}iserver/services/map-ZhuanYiLuXianTu/rest/maps/zylx?prjCoordSys=%7B"epsgCode":4326%7D`,
      //               wrapX: true,
      //             }),
      //             zIndex: 23
      //           });
      //           zyt.setProperties({id: 'zyt'});
      //           tabMapVal.addLayer(zyt);
      //           tabMapVal.setView(new View({
      //             center: [115.143469841072,29.7996586265474],
      //             projection: 'EPSG:4326',
      //             zoom: 11,
      //           }))
      //       }
      //     })
          
      //   }
        
      // }, 500)
      
    // const timer = setTimeout(()=>{
    //     maps.value.setAttribute('style', 'padding-top: 0')
    // },300)
    // tabMap.value.on('click',()=>{
    //   const feature = new Feature({
    //     geometry: new Point([114.906669, 29.794011]),
    //   });
    //   tabMap.value.getView().fit(feature.getGeometry(), { duration: 600,maxZoom:16 });
    // })
    // views.value.on('change:resolution', function(event) {
    //   var zoomLevel =views.value.getZoom();
    //   console.log('当前缩放层级：', zoomLevel);
    // });
    // getGqList().then(res => {
    //   if (res.success) {
    //     gqList.value = res.data.map((r) => ({label: r.irrName, value: r.irrCode}));
    //   }
    // })
    // getResList().then(res => {
    //   if (res.success) {
    //     resList.value = res.data.map(r => ({label: r.resName, value: r.resCode}));
    //   }
    // })
  })
  
  // const formatVal = (row) => {
  //   return row ? gqList.value.find(r => r.value == row)?.label : ''
  // }
  
  // const formatSk = (row) => {
  //   return row ? resList.value.find(r => r.value == row)?.label : ''
  // }
  
  /**
   * 实时监测站点
   */
  // watch(() => gqOneImageStore.realtimePoint, (points, oldPoints) => {
  //   if (points.length) {
  //     const feats = vector.getFeatures().filter(r => r.getId().startsWith('er_'))
  //     feats.forEach(r => {
  //       vector.removeFeature(r);
  //     });
  //     const features = points.map(r => {
  //       const feature = new Feature({
  //         geometry: new Point([parseFloat(r.stLong) || parseFloat(r.wmstLong) || parseFloat(r.longitude), parseFloat(r.stLat) || parseFloat(r.wmstLat) || parseFloat(r.latitude)]),
  //         name: r.stName || r.wmstName || r.stCode
  //       });
  //       feature.setStyle(new Style({
  //         image: new Icon({
  //           src: useFile(r.icon),
  //           scale: 1,
  //           size: [20, 20],
  //           anchor: [0.5, 0.2]
  //         }),
  //         text: new Text({
  //           text: formatPointVal(r),
  //           textAlign: 'center',
  //           textBaseline: 'middle',
  //           font: '14px font-size',
  //           fill: new Fill({
  //             color: '#fff'
  //           }),
  //           backgroundFill: new Fill({
  //             color: '#0821c3',
  //           }),
  //           backgroundStroke: new Stroke({
  //             color: 'rgba(255,255,255,.5)',
  //             lineCap: 'round',
  //             lineJoin: 'round',
  //             width: 1
  //           }),
  //           padding: [6, 4, 4, 4],
  //           offsetY: '-21',
  //         })
  //       }));
  //       feature.setId(`er_${r.t}_${Math.random().toString(36).slice(-4)}`);
  //       feature.setProperties({
  //         ...r,
  //         stcd: r.stCode || r.wmstCode,
  //         type: r.t,
  //         state: 'time',
  //         coord: [r.stLong || r.wmstLong || r.longitude, r.stLat || r.wmstLat || r.latitude]
  //       });
  //       return feature;
  //     });
  //     vector.addFeatures(features);
  //   } else {
  //     // 所有实时站点都没选中时 删除全部
  //     const feats = vector.getFeatures().filter(r => r.getId().startsWith('er_'))
  //     feats.forEach(r => {
  //       vector.removeFeature(r);
  //     });
  //     closeTime();
  //   }
  // }, {immediate: true});
  
  /**
   * 水利工程建筑物
   */
  // watch(() => gqOneImageStore.conservancyPoint, (points) => {
  //   if (points.length) {
  //     const feats = vector.getFeatures().filter(r => r.getId().startsWith('os_'))
  //     feats.forEach(r => {
  //       vector.removeFeature(r);
  //     });
  //     const features = points.map(r => {
  //       const feature = new Feature({
  //         geometry: new Point([r.pustLong || r.culvLong || r.hystLong || r.longitude || r.startLong, r.startLat || r.pustLat || r.culvLat || r.hystLat || r.latitude]),
  //         name: r.wagaName || r.pustName || r.flumName || r.culvName || r.hystName || r.insiName || r.damName || r.tunnelName
  //       });
  //       feature.setStyle(new Style({
  //         image: new Icon({
  //           src: useFile(r.icon),
  //           scale: 1,
  //           size: [20, 20],
  //           anchor: [0.5, 0.2]
  //         }),
  //         text: new Text({
  //           text: r.wagaName || r.pustName || r.flumName || r.culvName || r.hystName || r.insiName || r.damName || r.tunnelName,
  //           textAlign: 'center',
  //           textBaseline: 'middle',
  //           font: '14px font-size',
  //           fill: new Fill({
  //             color: '#fff'
  //           }),
  //           backgroundFill: new Fill({
  //             color: '#0821c3',
  //           }),
  //           backgroundStroke: new Stroke({
  //             color: 'rgba(255,255,255,.5)',
  //             lineCap: 'round',
  //             lineJoin: 'round',
  //             width: 1
  //           }),
  //           padding: [6, 4, 4, 4],
  //           offsetY: '-21',
  //         }),
  //       }));
  //       feature.setId(`os_${r.t}_${Math.random().toString(36).slice(-4)}`);
  //       feature.setProperties({
  //         ...r,
  //         stcd: r.wagaCode || r.pustCode || r.flumCode || r.culvCode || r.hystCode || r.insiCode || r.damCode || r.tunnelCode,
  //         type: r.t,
  //         state: 'build',
  //         coord: [r.pustLong || r.longitude || r.culvLong || r.hystLong || r.startLong, r.startLat || r.pustLat || r.culvLat || r.hystLat || r.latitude]
  //       });
  //       return feature;
  //     });
  //     vector.addFeatures(features);
  //   } else {
  //     const feats = vector.getFeatures().filter(r => r.getId().startsWith('os_'))
  //     feats.forEach(r => {
  //       vector.removeFeature(r);
  //     });
  //     closeBuild()
  //   }
  // }, {immediate: true});
  
  /**
   *
   * 图层
   */
  watch([() => tabMap.value, () => gqOneImageStore.buildLayers], ([map, layers], [oldMap, oldLayers]) => {
    // zytMap();

    if (map) {
      const allLayer = map.getLayers().getArray();// 所有图层
      const oLayers = layers.filter(e => !allLayer.find(c => c.getProperties().id === e.split('-')[0]));
      oLayers.forEach(r => {
        if(r.split('-')[0] == 'zyt') {
            const zyt = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-ZhuanYiLuXianTu/rest/maps/zylx?prjCoordSys=%7B"epsgCode":4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            zyt.setProperties({id: 'zyt'});
            map.addLayer(zyt);
            map.setView(new View({
              center: [115.143469841072,29.7996586265474],
              projection: 'EPSG:4326',
              zoom: 11,
            }))
        }
      })
    }

  })
  
  /*
  *
  * 点击点位
  * */
  // watchEffect(() => {
  //   tabMap.value && tabMap.value.on('click', (event) => {
  //     tabMap.value.forEachFeatureAtPixel(event.pixel, async (feature, layer) => {
  //       const {state, coord, type, stcd, name, dataSource} = feature.getProperties();
  //       if (type == 'QQ') {
  //         return true
  //       }
  //       if (state === 'time') { // 实时监测站点
  //         if (type === 'VD') { // 视频点
  //           title.value = name;
  //           getPlayUrl({
  //             protocol: 'hls',
  //             dataSource: dataSource,
  //             wmstCode: stcd
  //           }).then(res => {
  //             dialogVisible.value = true;
  //             playUrl.value = res.data;
  //           })
  //         } else { // 除了视频点
  //           if (overlayTime.value) { // 避免第一报错
  //             const {category} = overlayTime.value.getProperties();
  //             if (state === category) { // 每次点击的都是实时监测站类型的弹框 删除前一个弹框
  //               closeTime();
  //             }
  //           }
  //           currentRealTime.value = feature.getProperties();
  //           show.value = true;
  //           createOverlay(coord, feature);
  //         }
  //       } else {  // 水利工程建筑物
  //         if (overlayStructure.value) { // 避免第一报错
  //           const {category} = overlayStructure.value.getProperties();
  //           if (currentStructure.value.stcd != stcd || currentStructure.value.type != type) {
  //             clearCircle();
  //           }
  //           if (state === category) { // 每次点击的都是水利工程建筑物d弹框 删除前一个弹框
  //             closeBuild();
  //           }
  //         }
  //         currentStructure.value = feature.getProperties();
  //         vise.value = true;
  //         createBuildOverlay(coord, type);
  //       }
  //       return true; // 停止遍历其他要素
  //     }, {hitTolerance: 5});  // hitTolerance 增加点击容错率
  //   });
  // });
  
  // 播放视频
  // watch([cameraDialog, dialogVisible, playUrl], ([dialogRef, vis, url]) => {
  //   if (dialogRef && vis && url) {
  //     let hls = new Hls();
  //     DP.value = new DPlayer({
  //       container: dialogRef,
  //       autoplay: true,
  //       live: true,
  //       screenshot: true,
  //       preload: 'auto',
  //       video: {
  //         url: url,
  //         type: 'customHls',
  //         customType: {
  //           customHls: function (video, player) {
  //             hls.loadSource(video.src);
  //             hls.attachMedia(video);
  //           },
  //         },
  //       },
  //     });
  //     DP.value.on('pause', function () {
  //       hls && hls.stopLoad();
  //     });
  //     DP.value.on('play', function () {
  //       hls && hls.startLoad();
  //     });
  //     DP.value.on('destroy', function () {
  //       hls && hls.destroy();
  //     });
  //   } else {
  //     DP.value && DP.value.destroy();
  //     DP.value = null;
  //   }
  // })
  
  // 实时监测点位值
  function formatPointVal(r) {
    if (r.t === 'RR') {
      return `${r.stName}  |  ${r.rz || 0} m`;
    } else if (r.t === 'PPS') {
      return `${r.stName}  |  ${r.oneHourDrp || 0} mm`;
    } else if (r.t === 'DD') {
      return `${r.stName}  |  ${r.upz || 0} m`;
    } else if (r.t === 'WQ') {
      return `${r.stName}  |  ${formatterVal(r, 'WATER_LEVEL', 'level') || '-'} `;
    } else if (r.t === 'ZQ') {
      return `${r.stName}  |  ${r.z || 0} m`;
    } else if (r.t === 'ZZ') {
      return `${r.stName}  |  ${r.z || 0} m`;
    } else if (r.t === 'VD') {
      return r.wmstName
    } else if (r.t == 'QQ') {
      return r.stCode
    }
  }
  function zytMap() {
      let tabMapVal = tabMap.value; 
      let gqBuild = gqOneImageStore.buildLayers;
      const allLayer = tabMapVal.getLayers().getArray();// 所有图层
      if(tabMapVal){
        const oLayers = gqBuild.filter(e => !allLayer.find(c => c.getProperties().id === e.split('-')[0]));
        oLayers.forEach(r => {
          if(r.split('-')[0] == 'zyt') {
              const zyt = new TileLayer({
                source: new TileSuperMapRest({
                  url: `/superMapUrl/iserver/services/map-ZhuanYiLuXianTu/rest/maps/zylx?prjCoordSys=%7B"epsgCode":4326%7D`,
                  wrapX: true,
                }),
                zIndex: 23
              });
              zyt.setProperties({id: 'zyt'});
              tabMapVal.addLayer(zyt);
              tabMapVal.setView(new View({
                center: [115.143469841072,29.7996586265474],
                projection: 'EPSG:4326',
                zoom: 11,
              }))
          }
        })
        
      }
  }
  onBeforeUnmount(() => {
    tabMap.value.setTarget(null);
    tabMap.value = null;
    gqOneImageStore.initSite = false;
  })
  
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
      id: 'TimeDialog',
      position: coord,
      positioning: 'center-center',
      offset: [-325, -25],
    });
    overlayTime.value.setProperties({category: 'time'})
    tabMap.value.addOverlay(overlayTime.value);
  }
  
  /**
   * 创建水利工程建筑d弹框
   */
  function createBuildOverlay(coord, type) {
    overlayStructure.value = new Overlay({
      element: popupBuild.value,
      id: 'buildDialog',
      position: coord,
      positioning: 'center-center',
      offset: [-325, -25],
    });
    overlayStructure.value.setProperties({category: 'build', type})
    tabMap.value.addOverlay(overlayStructure.value);
  }
  
  /**
   * 关闭实时检测站弹框
   *
   */
  function closeTime() {
    tabMap.value && tabMap.value.removeOverlay(overlayTime.value);
    show.value = false;
    activeName.value = '1'
  }
  
  /**
   * 关闭水利工程建筑物d弹框
   */
  function closeBuild() {
    tabMap.value && tabMap.value.removeOverlay(overlayStructure.value);
    vise.value = false;
    activeName.value = '1'
  }
  
  // 删除污染源圆形
  function clearCircle() {
    const cir = circle.getFeatures().filter(r => r.getId() === 'circle');
    cir.length && circle.removeFeature(cir[0]);
  }
  
  
  function useFile(name) {
    return new URL(`../../assets/imgs/${name}.png`, import.meta.url).href;
  }
  
  // function handleCamera(ops) {
  //   dialogVisible.value = true;
  // }
  
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
      [-180, -90]
    ]
    const maskGeometry = turf.polygon([box1]);
    // let multiPolygon = turf.lineToPolygon(json);
    const multiLineString = new MultiLineString(turf.multiLineString(json).geometry.coordinates);
    let multiPolygon = new MultiPolygon(multiLineString.getCoordinates().map((lineStringCoords) => [lineStringCoords]));
    multiPolygon = new Feature({
      geometry: multiPolygon
    })
    multiPolygon = geo.writeFeatureObject(multiPolygon);
    const diffGeometry = turf.difference(maskGeometry, multiPolygon);
    const maskFeature = geo.readFeature(diffGeometry);
    const source = new VectorSource();
    source.addFeature(maskFeature)
    const maskLayer = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({color: 'rgba(220,240,253,0.1)'}),
      }),
      zIndex: 22,
      id: 'mask',
      visible: true,
    });
    map.addLayer(maskLayer)

  }
  
  
  </script>
  <style lang="scss">
  .camera-dialog {
    .el-dialog__body {
      padding: 0;
    }
  }
  </style>
  <style scoped lang="scss">
  li {
    list-style-type: none;
  }
  
  .mapContainer {
    position: relative;
    height: calc(100vh - 205px);
    width: 50vw;
  
    .legend {
      position: absolute;
      bottom: 5%;
      background: #FFFFFF;
      border-radius: 14px;
      padding: 10px;
      transition: left .8s;
  
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
          width: 40px;
          height: 2px;
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
  }
  
  .tab-map {
    height: calc(100vh - 205px);
    width: 50vw;
  }

  </style>