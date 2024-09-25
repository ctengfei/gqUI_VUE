<template>
  <div class="app-container">
    <div class="title">
      <span class="head-title" style="font-size: 18px">查看结果</span>
      <el-button
        type="primary"
        link
        :icon="ArrowLeftBold"
        @click="emit('returnPage')"
        >返回</el-button
      >
    </div>
    <div class="content">
      <div class="left">
        <h3>巡查部位</h3>
        <div class="tree-box">
          <el-input v-model="filterText" placeholder="请输入" />
          <el-tree
            ref="treeRef"
            class="filter-tree"
            :data="data"
            :props="defaultProps"
            default-expand-all
            :filter-node-method="filterNode"
          >
            <template #default="{ node }">
              <span class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span>
                  <el-tag
                    class="ml-20"
                    type="success"
                    round
                    v-if="node.data.status === '0'"
                    effect="dark"
                    size="small"
                  >
                    正常</el-tag
                  >
                  <el-tag
                    class="ml-20"
                    type="danger"
                    round
                    v-if="node.data.status === '1'"
                    effect="dark"
                    size="small"
                    >异常</el-tag
                  >
                </span>
                <el-button
                  v-if="node.data.status === '1'"
                  class="right-btn"
                  type="primary"
                  text
                  @click="clickNode(node)"
                  >查看</el-button
                >
              </span>
            </template>
          </el-tree>
        </div>
      </div>
      <div class="right">
        <h3>巡查轨迹</h3>
        <div class="map-box" id="infoMap"></div>
      </div>
    </div>
    <DetailDialog
      @closeDialog="dialogVisible = false"
      :dialogVisible="dialogVisible"
      :title="dialogTitle"
      :content="nodeContent"
    />
  </div>
</template>
  
  <script setup>
import DetailDialog from "../detailDialog";
import { nextTick, onMounted, ref, reactive, computed } from "vue";
import { ArrowLeftBold } from "@element-plus/icons-vue";
import Map from "ol/Map";
import View from "ol/View";
import { Feature, Overlay } from "ol";
import { LineString } from "ol/geom";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, XYZ } from "ol/source";
import { Fill, Stroke, Style, Text, Icon } from "ol/style";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { getResultApi, getLogLatListApi } from "../../apis";
import { loopData } from "../../utils";
import {sessionStorage} from "@/utils";
import {MAP_URL,TDT_URL} from '@/global'
const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
let props = defineProps(["id"]);
let map = reactive(null);
let vector = ref();
let treeRef = ref(null);
let filterText = ref("");
let data = ref([]);
let dialogTitle = ref("详情");
let dialogVisible = ref(false);
let nodeContent = ref({});
//设置起点与终点
let pointData = ref([]);

const defaultProps = {
  children: "children",
  label: "label",
};

watch(filterText, (val) => {
  treeRef.value.filter(val);
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

const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.includes(value);
};
const emit = defineEmits(["returnPage"]);
onMounted(() => {
  initMap();
  getResultData(props.id);
  getLogLatList(props.id);
});
const initMap = () => {
  vector.value = new VectorSource();
  //轨迹线的图层
  const LineVector = new VectorLayer({
    source: vector.value,
  });
  map = new Map({
    layers: [TiandiMap_img, TiandiMap_imgLabel, LineVector],
    target: "infoMap",
    controls: defaultControls({
      zoom: false,
    }).extend([
      new ScaleLine({
        units: "metric",
      }),
    ]),
    view: new View({
      center: [114.54912787724153, 29.956171640780035],
      projection: "EPSG:4326",
      zoom: 11,
    }),
  });
};
//画轨迹图
const drawLine = () => {
  //下边来添加一线feature
  let feature = new Feature({
    type: "lineStyle",
    geometry: new LineString(
      pointData.value // 线的坐标
    ),
  });
  //设置线的样式
  let lineStyle = new Style({
    stroke: new Stroke({
      color: "#ffcc33",
      width: 10,
    }),
  });
  // 添加线的样式
  feature.setStyle(lineStyle);
  // 添加线的fature
  vector.value.addFeature(feature);
  setCenterFun();
};
//获取巡查部位数据
const getResultData = (id) => {
  getResultApi(id).then((res) => {
    if (res.success) {
      const result = res.data;
      data.value = loopData(result);
    }
  });
};
//查询巡查经纬度记录
const getLogLatList = (id) => {
  getLogLatListApi({ planId: id }).then((res) => {
    if (res.success) {
      const result = res.data;
      const arr = [];
      if (result && result.length > 0) {
        result.map((item) => {
          arr.push([Number(item.longitude), Number(item.latitude)]);
        });
      }
      pointData.value = [...arr];
      if (pointData.value && pointData.value.length > 0) {
        drawLine();
      }
    }
  });
};
const clickNode = (node) => {
  const { checkDesc, img } = node.data;
  const imgArr = (img && JSON.parse(img)) || [];
  const srcList = imgArr.map((item) => item.url);
  nodeContent.value = {
    checkDesc,
    srcList,
  };
  dialogVisible.value = true;
};
const setCenterFun = () => {
  const view = map.getView();
  view.setCenter(pointData.value[0]);
  // view.setZoom(14);
};
</script>
  
  <style lang="scss" scoped>
@import "./index.scss";
</style>
  
  