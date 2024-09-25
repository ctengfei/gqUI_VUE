<template>
  <div class="app-container">
    <div class="time-select">
      <span class="head-sub-title">时间选择：</span>
      <el-radio-group v-model="radio1">
        <el-radio-button :label="1">今天</el-radio-button>
        <el-radio-button :label="2">昨天</el-radio-button>
        <el-radio-button :label="3">前天</el-radio-button>
      </el-radio-group>
    </div>
    <div class="image" ref="imageBox">
      <canvas ref="ctx" :width="width" :height="height" ></canvas>
    </div>
    <div class="control-btn">
      <el-button @click="handlePrev" :disabled="index <= 0">上一张</el-button>
      <el-button type="warning" @click="handlePlay" :disabled="images.length == 0">{{ play ? '播放' : '暂停' }}</el-button>
      <el-button @click="handleNext" :disabled="images.length == 0 ||index == images.length-1">下一张</el-button>
    </div>

  </div>
</template>

<script setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {getSatelliteImage} from "@/api/schedulingCtord/satelliteImage";
import dayjs from "dayjs";
import {ElMessage} from "element-plus";

let ctx = ref();
let canvas = ref();
const imageBox = ref();
let play = ref(true);
let images = ref([]);
let height = ref(0);
let width = ref(0);
const today = ref(dayjs().format('YYYY-MM-DD'));
const yesterday = ref(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
const beforeDay = ref(dayjs().subtract(2, 'day').format('YYYY-MM-DD'))
const radio1 = ref(1);
let img = new Image();
let index = ref(0);
let timer = null;
// 播放
function handlePlay() {
  if(play.value){ // 播放
    play.value = false;
    animate();
  }else{ // 暂停
    clearInterval(timer);
    timer=null;
    play.value = true;
  }
}
// 上一张
function handlePrev(){
  index.value--;
  if(index.value < 0){
    index.value = 0;
    return
  }
  drawImg(index.value);
  if(!play.value){
    play.value = true;
    clearInterval(timer);
    timer=null;
    return;
  }
}3
// 下一张
function handleNext() {
  index.value++;
  if(index.value > images.value.length){
    index.value = images.value.length-1;
    return
  }
  drawImg(index.value);
  if(!play.value){
    play.value = true;
    clearInterval(timer);
    timer=null;
    return;
  }
}
// 加载图片
function drawImg(index) {
  img.src = images.value[index];
  img.onload = function () {
    canvas.value.drawImage(img, 0, 0, width.value, height.value);
    var pattern = canvas.value.createPattern(img, 'no-repeat');
    canvas.value.fillStyle = pattern;
  };
}

// 播放图片动画
function animate() {
  timer = setInterval(()=>{
    img.src = images.value[index.value];
    img.onload = function () {
      canvas.value.drawImage(img, 0, 0, width.value, height.value);
      var pattern = canvas.value.createPattern(img, 'no-repeat');
      canvas.value.fillStyle = pattern;
      index.value++;
      if (index.value >= images.value.length) {
        index.value = 0;
        clearInterval(timer);
        timer=null;
        animate();
      }
    };
  },400)
}
let date;
watch(radio1,(ra)=>{
  if(ra == 1){
    date = today.value;
  }else if(ra == 2){
    date = yesterday.value;
  }else{
    date = beforeDay.value;
  }
  getSatelliteImage({date: date}).then(res => {
    if (res.success) {
      // 清除定时器 重新开始
      clearInterval(timer);
      timer = null;
      index.value = 0;
      // 清楚画布
      canvas.value.clearRect(0,0,width.value,height.value);
      play.value = true;
      images.value = res.data.map(r => `${import.meta.env.VITE_FILE_URL}${r}`);
      if(images.value.length == 0){
        ElMessage({
          message: '无图片',
          type: 'success',
        });
      }
      drawImg(index.value);
    }
  })
})

onMounted(() => {
  height.value = imageBox.value.clientHeight;
  width.value = imageBox.value.clientWidth;
  canvas.value = ctx.value.getContext('2d');
  getSatelliteImage({date: today.value}).then(res => {
    if (res.success) {
      images.value = res.data.map(r => `${import.meta.env.VITE_FILE_URL}${r}`);
      if(images.value.length == 0){
        ElMessage({
          message: '无图片',
          type: 'success',
        });
      }
      // 初始化
      drawImg(index.value);
    }
  })
})

onBeforeUnmount(()=>{
  clearInterval(timer);
  timer = null;
  index.value = 0;
})
</script>

<style scoped lang="scss">
.app-container {
  height: calc(100% - 40px);
  position: relative;

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 5%;
  }

  .time-select {
    display: flex;
    align-items: center;
    height: 5%;
  }

  .image {
    height: 90%;
  }
}
</style>