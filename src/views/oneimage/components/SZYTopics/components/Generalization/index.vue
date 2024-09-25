<template>
  <div class="genera">
    <div class="main-channel-container">
      <div class="main-channel-box">
        <div class="main-channel"></div>
      </div>

      <div class="wy_gs1">
        大冶供水20万t/d
      </div>
      <div class="wy_gs2">
        阳新供水10万t/d
      </div>
      <div class="wy_ngq">
        <span>三溪南干渠</span>
      </div>
      <div class="wy_bgq">
        <span>三溪北支渠</span>
      </div>
      <div class="wy_sxh">
        <span>三溪河</span>
        <el-popover
            placement="top-start"
            :width="100"
            :show-arrow="visible"
            :visible="visible"
            :hide-after="0"
            :popper-style="{'display': visible ? 'block' :'none'  }"
            popper-class="custom-poper"
        >
          <template #reference>
            <h1 class="wy_xhz"></h1>
          </template>
          <template #default>
            <h3 style="color: #fff">{{ slve10.name }}</h3>
            <span  style="color: #fff">流量：{{ slve10.value }} m³/s</span>
          </template>
        </el-popover>
        <el-popover
            placement="bottom"
            :width="100"
            :show-arrow="visible"
            :visible="visible"
            :hide-after="0"
            :popper-style="{'display': visible ? 'block' :'none'  }"
            popper-class="custom-poper"
        >
          <template #reference>
            <h1 class="wy_jzz"></h1>
          </template>
          <template #default>
            <h3 style="color: #fff">{{ slve11.name }}</h3>
            <span  style="color: #fff">流量：{{ slve11.value }} m³/s</span>
          </template>
        </el-popover>
      </div>
      <div class="wy_sk"></div>
      <div class="cx_gs1">
        咸宁供水10万t/d
      </div>
      <div class="cx_gs2">
        思源水厂供水2万t/d
      </div>
      <div class="cx_g">
        <span>蔡贤港</span>
      </div>
      <div class="cx_q">
        <span>蔡贤渠</span>
        <el-popover
            placement="top-start"
            :width="100"
            :show-arrow="visible"
            :visible="visible"
            :hide-after="0"
            :popper-style="{'display': visible ? 'block' :'none'  }"
            popper-class="custom-poper"
        >
          <template #reference>
            <h1 class="cx_jsz"></h1>
          </template>
          <template #default>
            <h3 style="color: #fff">{{ slve9.name }}</h3>
            <span  style="color: #fff">流量：{{ slve9.value }} m³/s</span>
          </template>
        </el-popover>
      </div>
      <div class="cx_sk"></div>
      <div class="gqh"><span>高桥河</span></div>
      <el-popover
          placement="bottom-end"
          :width="100"
          :show-arrow="visible"
          :visible="visible"
          :hide-after="0"
          :popper-style="{'display': visible ? 'block' :'none'  }"
          popper-class="custom-poper"
      >
        <template #reference>
          <h1 class="dm_63"></h1>
        </template>
        <template #default>
          <h3 style="color: #fff">{{ slve1.name }}</h3>
          <span  style="color: #fff">流量：{{ slve1.value }} m³/s</span>
        </template>
      </el-popover>
      <div class="hgh">
        <span>横沟河</span>
<!--        <el-popover-->
<!--            placement="top-start"-->
<!--            :width="100"-->
<!--            trigger="hover"-->
<!--            popper-class="custom-poper"-->
<!--        >-->
<!--          <template #reference>-->
<!--            <h1 class="dm_84"></h1>-->
<!--          </template>-->
<!--          <template #default>-->
<!--            <h3 style="color: #fff">斗门84号闸</h3>-->
<!--            <span  style="color: #fff">流量：0</span>-->
<!--          </template>-->
<!--        </el-popover>-->
      </div>
<!--      <div class="ft_lake"></div>-->
      <div class="ygq">
        <span>一干渠</span>
        <el-popover
            placement="top-start"
            :width="100"
            :show-arrow="visible"
            :visible="visible"
            :hide-after="0"
            :popper-style="{'display': visible ? 'block' :'none'  }"
            popper-class="custom-poper"
        >
          <template #reference>
            <h1 class="dm_65"></h1>
          </template>
          <template #default>
            <h3 style="color: #fff">{{ slve8.name }}</h3>
            <span  style="color: #fff">流量：{{ slve8.value }} m³/s</span>
          </template>
        </el-popover>
      </div>
<!--      <div class="lz_lake"></div>-->
      <el-popover
          placement="bottom"
          :width="100"
          :show-arrow="visible"
          :visible="visible"
          :hide-after="0"
          :popper-style="{'display': visible ? 'block' :'none'  }"
          popper-class="custom-poper"
      >
        <template #reference>
          <h1 class="dm_95"></h1>
        </template>
        <template #default>
          <h3 style="color: #fff">{{ slve2.name }}</h3>
          <span  style="color: #fff">流量：{{ slve2.value }} m³/s</span>
        </template>
      </el-popover>
      <el-popover
          placement="top-start"
          :width="100"
          :show-arrow="visible"
          :visible="visible"
          :hide-after="0"
          :popper-style="{'display': visible ? 'block' :'none'  }"
          popper-class="custom-poper"
      >
        <template #reference>
          <h1 class="dm_117"></h1>
        </template>
        <template #default>
          <h3 style="color: #fff">{{ slve3.name }}</h3>
          <span  style="color: #fff">流量：{{ slve3.value }} m³/s</span>
        </template>
      </el-popover>
      <div class="egq">
        <span>二干渠</span>
        <el-popover
            placement="bottom"
            :width="100"
            :show-arrow="visible"
            :visible="visible"
            :hide-after="0"
            :popper-style="{'display': visible ? 'block' :'none'  }"
            popper-class="custom-poper"
        >
          <template #reference>
            <h1 class="dm_118"></h1>
          </template>
          <template #default>
            <h3 style="color: #fff">{{ slve4.name }}</h3>
            <span  style="color: #fff">流量：{{ slve4.value }} m³/s</span>
          </template>
        </el-popover>
      </div>
      <el-popover
          placement="bottom-end"
          :width="100"
          :show-arrow="visible"
          :visible="visible"
          :hide-after="0"
          :popper-style="{'display': visible ? 'block' :'none'  }"
          popper-class="custom-poper"
      >
        <template #reference>
          <div class="dm_147"></div>
        </template>
        <template #default>
          <h3 style="color: #fff">{{ slve7.name }}</h3>
          <span  style="color: #fff">流量：{{ slve7.value }} m³/s</span>
        </template>
      </el-popover>
      <div class="sgq">
        <span>三干渠</span>
        <el-popover
            placement="top-start"
            :width="100"
            :show-arrow="visible"
            :visible="visible"
            :hide-after="0"
            :popper-style="{'display': visible ? 'block' :'none'}"
            popper-class="custom-poper"
        >
          <template #reference>
            <h1 class="s_fsz"></h1>
          </template>
          <template #default>
            <h3 style="color: #fff">{{ slve5.name }}</h3>
            <span  style="color: #fff">流量：{{ slve5.value }} m³/s</span>
          </template>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script setup>
import {nextTick, onMounted, ref, defineProps, watch, onUnmounted} from "vue";
import {getSite} from "@/api/digitization";
import {getStructure} from "@/api/oneimage";
const props = defineProps(['activeName']);
let slve1 = ref({name:'-',value:0});
let slve2 = ref({name:'-',value:0});
let slve3 = ref({name:'-',value:0});
let slve4 = ref({name:'-',value:0});
let slve5 = ref({name:'-',value:0});
let slve6 = ref({name:'-',value:0});
let slve7 = ref({name:'-',value:0});
let slve8 = ref({name:'-',value:0});
let slve9 = ref({name:'-',value:0});
let slve10 = ref({name:'-',value:0});
let slve11 = ref({name:'-',value:0});
let visible = ref(false);
onMounted(()=>{
  getSite({stType:'DD'}).then(res=>{
    res.data.wagaList.forEach(r=>{
      if(r.stCode == 'WYSW0055'){ // 黄伯敬泄洪闸前
        slve1.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0023'){ // 九支渠节制闸前
        slve2.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0038'){ // 万秀八节制闸
        slve3.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0034'){ // 二千渠分水闸
        slve4.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0057'){ // 前进节制闸后
        slve5.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0035'){ // 三干渠149号闸
        slve6.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0036'){ // 望山泄洪闸
        slve7.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0031'){ // 一干渠分水闸（咸安段）
        slve8.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0047'){ // 蔡贤灌溉渠（放空）
        slve9.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0042'){ // 王英渠首三闸
        slve10.value ={ name:r.stName,value:r.upz};
      }else if(r.stCode == 'WYSW0044'){ // 王英北渠泄洪闸前
        slve11.value ={ name:r.stName,value:r.upz};
      }
    })
    const timer = setTimeout(()=>{
      visible.value = true;
      clearTimeout(timer)
    },100)
  })
})

watch(()=>props.activeName,(vis)=>{
  if(vis == '1'){
    visible.value = false;
  }else {
    const timer = setTimeout(()=>{
      visible.value = true;
      clearTimeout(timer)
    },100)
  }
})
</script>
<style lang="scss">
.custom-poper{
  background: #42b983!important;
  border: 0!important;
  .el-popper__arrow::before{
    background: #42b983!important;
    border: 0!important;
  }
}

</style>
<style scoped lang="scss">
.genera{
  position: relative;
  height: 100%;
  width: 100%;
  .main-channel-container{
    position: relative;
    left: 50%;
    top:50%;
    transform: translate(-50%,-50%);
    width: 100%;
    height: 25px;
    .main-channel-box{
      position: absolute;
      left: 50%;
      top:50%;
      transform: translate(-50%,-50%);
      height: 25px;
      width: 90%;
      background: rgba(59,123,137,.5);
      overflow: hidden;
      .main-channel{
        position: absolute;
        top:50%;
        transform: translateY(-50%);
        height: 5px;
        width: 160%;
        -webkit-animation:goRunning 5s linear infinite normal;
        background: url("@/assets/images/mainChannel.png") no-repeat center center;
        background-size: cover;
      }
    }
    &:before{
      content: '主干渠';
      position: absolute;
      left: 0;
      font-weight: bold;
      color: #3b7b89;
      font-size: 16px;
    }
    .wy_sk{
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 135px;
      width: 135px;
      background-image: url("@/assets/images/wy_img.png");
      background-repeat: no-repeat;
      background-position: center center;
      background-size: contain;
      z-index: 10;
    }
    .wy_gs1{
      position: absolute;
      right: 0;
      top: 153px;
      height: 80px;
      width: 100px;
      text-align: center;
      font-size: 18px;
      background: rgba(58,70,81,.8);
      border-radius: 8px;
      color: #fff;
      padding: 0 5px;
      display: flex;
      align-items: center;
      &:after{
        content: '';
        position: absolute;
        right: 42px;
        top: -73px;
        display: block;
        height: 72px;
        width: 8px;
        background:#63B8FF;
      }
    }
    .wy_gs2{
      position: absolute;
      right: 10%;
      top: 96px;
      height: 80px;
      width: 100px;
      text-align: center;
      font-size: 18px;
      background: rgba(58, 70, 81, 0.8);
      border-radius: 8px;
      color: #fff;
      padding: 0 5px;
      display: flex;
      align-items: center;
      &:after{
        content: '';
        position: absolute;
        right: -50px;
        top: -7px;
        display: block;
        height: 93px;
        width: 8px;
        background: #63B8FF;
        transform: rotateZ(-119deg);
      }
    }
    .wy_ngq{
      position: absolute;
      right: 35px;
      bottom: 79px;
      width: 8px;
      height: 160px;
      background: #20B2AA;
      line-height: 19px;
      span{
        position: absolute;
        left: 15px;
        top: 15px;
        color: #20B2AA;
        font-size: 20px;
      }
    }
    .wy_bgq{
      position: absolute;
      right: 50px;
      bottom: 98px;
      width: 8px;
      height: 115px;
      background: #20B2AA;
      transform: rotate(-15deg);
      line-height: 19px;
      span{
        position: absolute;
        right: 15px;
        top: 15px;
        color: #20B2AA;
        font-size: 20px;
      }
    }
    .wy_sxh{
      position: absolute;
      right: 160px;
      bottom: 70px;
      width: 8px;
      height: 295px;
      background: #90EE90;
      transform: rotate(-19deg);
      z-index: 5;
      span{
        position: absolute;
        left: 10px;
        bottom: 35px;
        color: #90EE90;
        font-size: 20px;
      }
      .wy_xhz{
        position: relative;
        left: -20px;
        top: 20px;
        display: block;
        height: 50px;
        width: 50px;
        background: url("@/assets/images/sluice.png") no-repeat  center center;
        background-size: cover;
        transform: rotate(5deg);
        &:after{
          content: "王英渠首三闸";
          position: absolute;
          right: -98px;
          top: 19px;
          color: #409eff;
          font-size: 16px;
        }
      }
      .wy_jzz{
        position: absolute;
        left: -20px;
        top: 77px;
        display: block;
        height: 50px;
        width: 50px;
        background: url("@/assets/images/sluice.png") no-repeat  center center;
        background-size: cover;
        transform: rotate(4deg);
        &:after{
          content: "王英北渠泄洪闸前";
          position: absolute;
          right: -131px;
          top: 15px;
          color: #409eff;
          font-size: 16px;
          z-index: 10;
        }
      }
    }
    .cx_gs1{
      position: absolute;
      right: 282px;
      top: 234px;
      height: 80px;
      width: 100px;
      text-align: center;
      font-size: 18px;
      background: rgba(58,70,81,.8);
      border-radius: 8px;
      color: #fff;
      padding: 0 5px;
      display: flex;
      align-items: center;
      &:after{
        content: '';
        position: absolute;
        right: 42px;
        top: -172px;
        display: block;
        height: 172px;
        width: 8px;
        background:#63B8FF;
      }
    }
    .cx_gs2{
      position: absolute;
      right: 350px;
      top: 150px;
      height: 80px;
      width: 100px;
      text-align: center;
      font-size: 18px;
      background: rgba(58,70,81,.8);
      border-radius: 8px;
      color: #fff;
      padding: 0 5px;
      display: flex;
      align-items: center;
      &:after{
        content: '';
        position: absolute;
        right: 42px;
        top: -88px;
        display: block;
        height: 88px;
        width: 8px;
        background:#63B8FF;
      }
    }
    .cx_g{
      position: absolute;
      width: 8px;
      bottom: 53px;
      right: 283px;
      height: 249px;
      background: #90EE90;
      transform: rotate(20deg);
      span{
        position: absolute;
        right: 10px;
        top: 0px;
        bottom: 35px;
        color: #90EE90;
        font-size: 20px;
      }
      .wsz{
        position: absolute;
        left: -20px;
        top: 175px;
        display: block;
        height: 50px;
        width: 50px;
        background: url("@/assets/images/sluice.png") no-repeat center center;
        background-size: cover;
        transform: rotate(10deg);
        &:after{
          content: "水闸";
          position: absolute;
          left: -55px;
          top: 15px;
          color: #409eff;
          font-size: 16px;
          z-index: 10;
        }
      }
    }
    .cx_q{
      position: absolute;
      width: 8px;
      top: -233px;
      right: 415px;
      height: 199px;
      background: #20B2AA;
      transform: rotate(-14deg);
      span{
        position: absolute;
        left: 10px;
        top: 100px;
        bottom: 35px;
        color: #20B2AA;
        font-size: 20px;
      }
      .cx_jsz{
        position: absolute;
        left: -20px;
        top: 15px;
        display: block;
        height: 50px;
        width: 50px;
        background: url("@/assets/images/sluice.png") no-repeat center center;
        background-size: cover;
        transform: rotate(0deg);
        &:after{
          content: "蔡贤灌溉渠(放空)";
          position: absolute;
          left: -128px;
          top: 15px;
          color: #409eff;
          font-size: 16px;
          z-index: 10;
        }
      }
    }
    .cx_sk{
      position: absolute;
      right: 315px;
      top: 49%;
      transform: translateY(-50%);
      height: 100px;
      width: 100px;
      background: url("@/assets/images/cx_img.png") no-repeat center center;
      background-size: cover;
      z-index: 10;
    }
    .gqh{
      position: absolute;
      right: 535px;
      top: 25px;
      height: 260px;
      width: 8px;
      background: #90EE90;
      span{
        position: absolute;
        right: 10px;
        top: 50px;
        color: #90EE90;
        font-size: 20px;
      }
    }
    .dm_63{
      position: absolute;
      right: 450px;
      top: 50%;
      transform: translateY(-50%);
      display: block;
      height: 50px;
      width: 50px;
      background: url("@/assets/images/sluice.png") no-repeat center center;
      background-size: cover;
      &:after{
        content: "黄伯敬泄洪闸前";
        position: absolute;
        left: -19px;
        top: -26px;
        color: #409eff;
        white-space: nowrap;
        font-size: 16px;
        z-index: 10;
      }
    }
    .empty{
      position: absolute;
      right: 575px;
      top: 50%;
      transform: translateY(-50%);
      display: block;
      height: 50px;
      width: 50px;
      background: url("@/assets/images/sluice.png") no-repeat center center;
      background-size: cover;
    }
    .hgh{
      position: absolute;
      right: 660px;
      top: 25px;
      height: 200px;
      width: 8px;
      background: #90EE90;
      span{
        position: absolute;
        right: 10px;
        top: 90px;
        color: #90EE90;
        font-size: 20px;
      }
      .dm_84{
        position: absolute;
        right: -21px;
        top: 11px;
        display: block;
        height: 50px;
        width: 50px;
        background: url("@/assets/images/sluice.png") no-repeat center center;
        background-size: cover;
        &:after{
          content: "斗门84号闸";
          position: absolute;
          top: 14px;
          right: 54px;
          color: #409eff;
          white-space: nowrap;
          font-size: 16px;
          z-index: 10;
        }
      }
    }
    .ft_lake{
      position: absolute;
      right: 640px;
      top: 137px;
      height: 200px;
      width: 200px;
      transform: rotateZ(-10deg);
    }
    .ygq{
      position: absolute;
      right: 660px;
      top: -199px;
      height: 200px;
      width: 8px;
      background: #20B2AA;
      span{
        position: absolute;
        left: 10px;
        top: 10px;
        color: #20B2AA;
        font-size: 20px;
      }
      .dm_65{
        position: absolute;
        right: -21px;
        bottom: 0px;
        display: block;
        height: 50px;
        width: 50px;
        background: url("@/assets/images/sluice.png") no-repeat center center;
        background-size: cover;
        &:after{
          content: "一干渠分水闸 (咸安段)";
          position: absolute;
          top: 14px;
          right: 54px;
          color: #409eff;
          white-space: nowrap;
          font-size: 16px;
          z-index: 10;
        }
      }
    }
    .lz_lake{
      position: absolute;
      right: 640px;
      top: -357px;
      height: 200px;
      width: 200px;
      transform: rotateZ(350deg);
    }
    .dm_95{
      position: absolute;
      left: 429px;
      top: 50%;
      transform: translateY(-50%);
      display: block;
      height: 50px;
      width: 50px;
      background: url("@/assets/images/sluice.png") no-repeat center center;
      background-size: cover;
      &:after{
        content: "九支渠节制闸前";
        position: absolute;
        left: -19px;
        top: -26px;
        color: #409eff;
        white-space: nowrap;
        font-size: 16px;
        z-index: 10;
      }
    }
    .dm_117{
      position: absolute;
      left: 329px;
      top: 50%;
      transform: translateY(-50%);
      display: block;
      height: 50px;
      width: 50px;
      background: url("@/assets/images/sluice.png") no-repeat center center;
      background-size: cover;
      &:after{
        content: "万秀八节制闸";
        position: absolute;
        left: -19px;
        top: -26px;
        color: #409eff;
        white-space: nowrap;
        font-size: 16px;
        z-index: 10;
      }
    }
    .egq{
      position: absolute;
      left: 285px;
      top: 25px;
      height: 200px;
      width: 8px;
      background: #20B2AA;
      span{
        position: absolute;
        left: 10px;
        top: 80px;
        color: #20B2AA;
        font-size: 20px;
      }
      .dm_118{
        position: absolute;
        right: -21px;
        top: 32px;
        display: block;
        height: 50px;
        width: 50px;
        background: url("@/assets/images/sluice.png") no-repeat center center;
        background-size: cover;
        &:after{
          content: "二千渠分水闸";
          position: absolute;
          top: 14px;
          left: 55px;
          color: #409eff;
          white-space: nowrap;
          font-size: 16px;
          z-index: 10;
        }
      }
    }
    .dm_147{
      position: absolute;
      left: 205px;
      top: 50%;
      transform: translateY(-50%);
      display: block;
      height: 50px;
      width: 50px;
      background: url("@/assets/images/sluice.png") no-repeat center center;
      background-size: cover;
      &:after{
        content: "望山泄洪闸";
        position: absolute;
        left: -19px;
        top: -26px;
        color: #409eff;
        white-space: nowrap;
        font-size: 16px;
        z-index: 10;
      }
    }
    .sgq{
      position: absolute;
      left: 125px;
      bottom: 24px;
      height: 200px;
      width: 8px;
      background: #20B2AA;
      span{
        position: absolute;
        left: 10px;
        top: 5px;
        color: #20B2AA;
        font-size: 20px;
      }
      .s_fsz{
        position: absolute;
        right: -21px;
        bottom: 0px;
        display: block;
        height: 50px;
        width: 50px;
        background: url("@/assets/images/sluice.png") no-repeat center center;
        background-size: cover;
        &:after{
          content: "前进节制闸后";
          position: absolute;
          top: 14px;
          left: 55px;
          color: #409eff;
          white-space: nowrap;
          font-size: 16px;
          z-index: 10;
        }
      }
    }
  }
}

@-webkit-keyframes goRunning {
  0% {left: 0;}
  100% {left: -50%;}
}
</style>