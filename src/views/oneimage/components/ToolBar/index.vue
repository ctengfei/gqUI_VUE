<template>
  <div class="too-bar" :style="{left:gqOneImageStore.toolBar+'%'}">
    <el-select v-model="select"  class="select" placeholder="工具">
      <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
      </el-option>
    </el-select>
    <el-divider direction="vertical"/>
    <span :style="{color:index == 0 ? '#409eff' : '#606266'}" class="tool-text" @click="handleChange(0,'img')" >影像</span>
    <el-divider direction="vertical"/>
    <span :style="{color:index == 1 ? '#409eff' : '#606266'}" class="tool-text"  @click="handleChange(1,'terrain')">地形</span>
    <el-divider direction="vertical"/>
    <span :style="{color:index == 2 ? '#409eff' : '#606266'}" class="tool-text"  @click="handleChange(2,'vector')">地图</span>
    <el-divider direction="vertical"/>
    <span :style="{color:index == 3 ? '#409eff' : '#606266'}" class="tool-text"  @click="handleChange(3,'custom')">影像(省厅)</span>
  </div>
</template>

<script setup>
  import {ref,watch} from 'vue'
  import { unByKey } from 'ol/Observable';
  import {
    Circle as CircleStyle,
    Fill,
    RegularShape,
    Stroke,
    Style,
    Text
  } from 'ol/style';
  import Overlay from 'ol/Overlay';
  import { Draw, Modify, Select, Snap } from 'ol/interaction';
  import { LineString, Polygon,Point } from 'ol/geom';
  import useGqOneImageStore from '@/store/modules/oneimage'
  import { formatArea,formatLength } from '@/utils';
  import {Vector as VectorSource} from "ol/source";
  import {Vector as VectorLayer} from "ol/layer";
  const gqOneImageStore = useGqOneImageStore();
  const emit = defineEmits(['getTool']);
  const select = ref(-1);
  const options = ref([{label:'工具',value:-1},{label:'长度',value:'LineString'},{label:'面积',value:'Polygon'},{label:'清除',value:2}]);
  const index = ref(0);
  let draw=ref(null);
  let map=null
  let measureTooltipElement;
  let sketch;
  let tipPoint;
  const source = new VectorSource();
  const vectorLayer = new VectorLayer({
    source: source,
    properties: { title: `base-vector`, id: 'v01' },
    style: function (feature) {
      return styleFunction(feature, true);
    },
    zIndex: 25,
    visible: true,
  });
  const style = new Style({
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
  });

  const labelStyle = new Style({
    text: new Text({
      font: '14px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [3, 3, 3, 3],
      textBaseline: 'bottom',
      offsetY: -15,
    }),
    image: new RegularShape({
      radius: 8,
      points: 3,
      angle: Math.PI,
      displacement: [0, 10],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
    }),
  });

  const tipStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15,
    }),
  });

  const modifyStyle = new Style({
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
    text: new Text({
      text: '拖动修改',
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15,
    }),
  });

  const segmentStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
      padding: [2, 2, 2, 2],
      textBaseline: 'bottom',
      offsetY: -12,
    }),
    image: new RegularShape({
      radius: 6,
      points: 3,
      angle: Math.PI,
      displacement: [0, 8],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
    }),
  });

  const segmentStyles = [segmentStyle];

  const modify = new Modify({source: source, style: modifyStyle});

  function styleFunction(feature, segments, drawType, tip) {
    const styles = [style];
    const geometry = feature.getGeometry();
    const type = geometry.getType();
    let point, label, line;
    if (!drawType || drawType === type) {
      if (type === 'Polygon') {
        point = geometry.getInteriorPoint();
        label = formatArea(geometry);
        line = new LineString(geometry.getCoordinates()[0]);
      } else if (type === 'LineString') {
        point = new Point(geometry.getLastCoordinate());
        label = formatLength(geometry);
        line = geometry;
      }
    }
    if (segments && line) {
      let count = 0;
      line.forEachSegment(function (a, b) {
        const segment = new LineString([a, b]);
        const label = formatLength(segment);
        if (segmentStyles.length - 1 < count) {
          segmentStyles.push(segmentStyle.clone());
        }
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        segmentStyles[count].setGeometry(segmentPoint);
        segmentStyles[count].getText().setText(label);
        styles.push(segmentStyles[count]);
        count++;
      });
    }
    if (label) {
      labelStyle.setGeometry(point);
      labelStyle.getText().setText(label);
      styles.push(labelStyle);
    }
    if (
        tip &&
        type === 'Point' &&
        !modify.getOverlay().getSource().getFeatures().length
    ) {
      tipPoint = geometry;
      tipStyle.getText().setText(tip);
      styles.push(tipStyle);
    }
    return styles;
  }

  function addInteraction(type) {
    map.removeInteraction(draw.value);
    draw.value=null;
    const activeTip = '点击开始绘制';
    const idleTip = '点击开始测量';
    let tip = idleTip;
    draw.value = new Draw({
      source: source,
      type: type,
      style: function (feature) {
        return styleFunction(feature, true, type, tip);
      },
    });
    draw.value.on('drawstart', function () {
      modify.setActive(false);
      tip = activeTip;
    });
    draw.value.on('drawend', function () {
      modifyStyle.setGeometry(tipPoint);
      modify.setActive(true);
      map.once('pointermove', function () {
        modifyStyle.setGeometry();
      });
      tip = idleTip;
    });
    modify.setActive(true);
    map.addInteraction(draw.value);
  }

  watch(select,(val)=>{
    switch (val) {
      case -1:
        map.removeInteraction(draw.value);
        break;
      case 'LineString': // 长度
        addInteraction('LineString');
        break
      case 'Polygon': // 长度
        addInteraction('Polygon');
        break;
      case 2:
        map.removeInteraction(draw.value);
        source.clear();
        break;
    }
  })
  watch(()=>gqOneImageStore.MapLayer,(ops)=>{
    map = ops.Map;
    map.addLayer(vectorLayer);
    map.addInteraction(modify);
  });

  function handleChange(num,type) {
    index.value = num;
    emit('getTool',type);
  }
</script>

<style scoped lang="scss">
.too-bar {
  position: absolute;
  top: 20px;
  display: flex;
  align-items: center;
  padding: 0px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
  transition: left .8s;
  .tool-text{
    color: #606266;
    font-size: 16px;
    display: flex;
    align-items: center;
    padding: 0 5px;
  }
  :deep(.el-input){
    --el-input-focus-border:#fff;
    --el-input-transparent-border: 0 0 0 0px;
    --el-input-border-color:#fff;
    --el-input-hover-border:0px !important;
    --el-input-hover-border-color:#fff;
    --el-input-focus-border-color:#fff;
    --el-input-clear-hover-color:#fff;
    box-shadow: 0 0 0 0px !important;
    --el-input-border:0px;
  }
  :deep(.el-select .el-input__wrapper.is-focus){
    box-shadow: 0 0 0 0px !important;
  }
  :deep(.el-select .el-input.is-focus .el-input__wrapper){
    box-shadow: 0 0 0 0px !important;
  }
  :deep(.el-select .el-input__wrapper){
    width: 75px;
  }
  :deep(.el-select){
    --el-select-border-color-hover:#fff;
    width: 85px;
  }
  :deep(input::placeholder) {
    color: #606266;
  }
}

.ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
  cursor: default;
  user-select: none;
}
.ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}
.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
  font-weight: bolder;
}
.ol-tooltip-measure:before,
.ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}
.ol-tooltip-static:before {
  border-top-color: #ffcc33;
}

.ol-start{
  font-weight: bold;
  color: chartreuse;
  font-size: 25px;
}

</style>