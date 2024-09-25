<template>
  <span class="app-side" @click="show">
    <i class="ship"></i>
    <span>图层列表</span>
  </span>
  <div class="real-monitor-list" :style="{left:lef+'%'}">
    <div class="head">
      <h4>图层列表</h4>
      <el-button type="primary" plain @click="hide" circle
                 style="width: 25px;height: 25px;border: 0;align-self: center">
        <ArrowLeftBold style="width: 1em; height: 1em;"/>
      </el-button>
    </div>
    <div class="presentation">
      <div class="info">
        <el-tag effect="dark" round class="tags">
          <h4>灌区信息展示专区</h4>
        </el-tag>
        <div class="content">
          <el-checkbox-group v-model="GqOneImageStore.conservancy">
            <li>
              <h6><span>基本信息</span></h6>
              <el-checkbox label="xzqh-行政区划-layer" key="3"><i class="checkbox-ico xzqh"></i><span>行政区划</span></el-checkbox>
              <el-checkbox label="outer-灌区边界-layer" key="4"><i class="checkbox-ico gqbj"></i><span>灌区边界</span></el-checkbox>
              <el-checkbox label="hlsx-河流水系-layer" key="5"><i class="checkbox-ico hlsx"></i><span>河流水系</span></el-checkbox>
              <el-checkbox label="wy-王英水库-layer" key="1"><i class="checkbox-ico sk"></i><span>王英水库@划界确权</span></el-checkbox>
              <el-checkbox label="cx-蔡贤水库-layer" key="2"><i class="checkbox-ico sk"></i><span>蔡贤水库@划界确权</span></el-checkbox>
              <el-checkbox label="wySurface-王英水库@面-layer" key="6"><i class="checkbox-ico sk"></i><span>王英水库@面</span></el-checkbox>
              <el-checkbox label="cxSurface-蔡贤水库@面-layer" key="90"><i class="checkbox-ico sk"></i><span>蔡贤水库@面</span></el-checkbox>
              <el-checkbox label="zyt-受灾转移路线图@面-layer" key="90"><i class="checkbox-ico sk"></i><span>受灾转移图</span></el-checkbox>
            </li>
            <li style="margin: 10px 0">
              <h6><span>水利工程建筑物</span></h6>
              <el-checkbox label="main-总干渠-layer" key="7"><i class="checkbox-ico zgq"></i><span>总干渠</span></el-checkbox>
              <el-checkbox label="trunk-干渠-layer" key="8"><i class="checkbox-ico zgq"></i><span>干渠</span></el-checkbox>
              <el-checkbox label="tributary-支渠-layer" key="9"><i class="checkbox-ico zgq"></i><span>支渠</span></el-checkbox>
              <el-checkbox label="WAGA-水闸工程-shuizha" key="10"><i class="checkbox-ico sz"></i><span>水闸</span></el-checkbox>
              <el-checkbox label="PUST-泵站-bengzhan" key="11"><i class="checkbox-ico bz"></i><span>泵站</span></el-checkbox>
              <el-checkbox label="FLUM-渡槽-duchao" key="12"><i class="checkbox-ico dz"></i><span>渡槽</span></el-checkbox>
              
              <el-checkbox label="INSI-倒虹吸-siphon" key="13"><i class="checkbox-ico hx"></i><span>倒虹吸</span></el-checkbox>
              <el-checkbox label="DAM-大坝-dam" key="14"><i class="checkbox-ico db"></i><span>大坝</span></el-checkbox>
              <el-checkbox label="TUNNEL-隧洞-tunnel" key="15"><i class="checkbox-ico sd"></i><span>隧洞</span></el-checkbox>
              <!-- <el-checkbox label="CULV-涵洞-handong" key="16"><i class="checkbox-ico hd"></i><span>涵洞</span></el-checkbox>
              <el-checkbox label="CULV-取水口-handong" key="17"><i class="checkbox-ico hd"></i><span>取水口</span></el-checkbox>
              <el-checkbox label="CULV-供水管道-handong" key="18"><i class="checkbox-ico hd"></i><span>供水管道</span></el-checkbox>
              <el-checkbox label="CULV-排水沟-handong" key="19"><i class="checkbox-ico hd"></i><span>排水沟</span></el-checkbox> -->
            </li>
          </el-checkbox-group>
          <el-checkbox-group v-model="GqOneImageStore.checkboxs">
            <li>
              <h6><span>实时站点监测</span></h6>
              <el-checkbox label="RR-水库水情-shuiweizhan" key="RR"><i class="checkbox-ico swz"></i><span>水库水情</span></el-checkbox>
              <el-checkbox label="PPS-雨情站-yuliangzhan" key="PPS"><i class="checkbox-ico ylz"></i><span>雨情站</span></el-checkbox>
              <el-checkbox label="DD-水闸站-shuizhazhan" key="DD"><i class="checkbox-ico szz"></i><span>水闸站</span></el-checkbox>
              <el-checkbox label="VD-视频点-shipindian" key="VD"><i class="checkbox-ico spd"></i><span>视频点</span></el-checkbox>
              <el-checkbox label="WQ-水质站-shuizhizhan" key="WQ"><i class="checkbox-ico szhiz"></i><span>水质站</span></el-checkbox>
              <el-checkbox label="ZZ-渠道水文-shuiweizhan" key="ZZ"><i class="checkbox-ico swz"></i><span>渠道水文</span></el-checkbox>
              <el-checkbox label="ZQ-河道水情-shuiweizhan" key="ZQ"><i class="checkbox-ico swz"></i><span>河道水情</span></el-checkbox>
              <el-checkbox label="QQ-大坝安监-anj" key="QQ"><i class="checkbox-ico anj"></i><span>大坝安监</span></el-checkbox>
              <!-- <el-checkbox label="ZZ-流量站-shuiweizhan" key="ZZ"><i class="checkbox-ico anj"></i><span>流量站</span></el-checkbox> -->
            </li>
          </el-checkbox-group>
        </div>
      </div>
      <div class="analysis">
        <el-tag effect="dark" round class="tags">
          <h4>业务专题分析专区</h4>
        </el-tag>
        <div class="content">
          <li>
            <el-checkbox-group v-model="GqOneImageStore.conservancy">
              <el-checkbox label="gsfw-供水范围-layer"><i class="checkbox-ico gsmj"></i><span>供水范围</span></el-checkbox>
              <el-checkbox label="ggfw-灌溉范围-layer"><i class="checkbox-ico ggmj"></i><span>灌溉范围</span></el-checkbox>
            </el-checkbox-group>
          </li>
        </div>
      </div>
      <div class="management">
        <el-tag effect="dark" round class="tags">
          <h4>业务专题管理专区</h4>
        </el-tag>
        <div class="content">
          <GqTopics/>
          <SGTopics/>
          <SZYTopics/>
          <FXTopics/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {watch} from 'vue';
import GqTopics from '../GqTopics';
import SGTopics from '../SGTopics';
import SZYTopics from '../SZYTopics';
import FXTopics from '../FXTopics';
import useGqOneImageStore from '@/store/modules/oneimage'
import {getStructure} from "@/api/oneimage";

const GqOneImageStore = useGqOneImageStore()
let lef = ref(-100);
let init = false;

watch(() => GqOneImageStore.conservancy, (cos, oldCos = []) => {
  if (cos.length) {
    if (oldCos.length > cos.length) { // 取消选中时
      const not = oldCos.filter(r=> !cos.find(c=> c ===r ));
      if(not.length && not[0].split('-')[2] === 'layer'){  // 取消选中的是图层
        GqOneImageStore.buildLayers = GqOneImageStore.buildLayers.filter(t=> t != not[0]);
      }else{  // 站点
        GqOneImageStore.conservancyPoint = GqOneImageStore.conservancyPoint.filter(c => cos.find(e => e.split('-')[0] == c.t));
        console.log(GqOneImageStore.conservancyPoint,"conservancyPoint");
      }
    }else{
      // 初始渲染默认勾选的水利工程建筑和图层 只执行一次
      if (!GqOneImageStore.initSite) {
        GqOneImageStore.initSite = true;
        const sites = cos.filter(c => { //  先找出默认勾选的站点
          const ts = c.split('-')[0];
          return ts === 'WAGA' || ts === 'PUST' || ts === 'FLUM' || ts === 'CULV' || ts === 'INSI' || ts === 'DAM' || ts === 'TUNNEL' // 水闸站 泵站 渡槽 涵洞 倒虹吸 大坝 隧洞
        });
        sites.forEach(r => {
          const ty = r.split('-')[0];
          const icon = r.split('-')[2];
          getStructure({buildingType: ty}).then(res => {
            const data = setData(res.data);
            GqOneImageStore.getConservancyPoint(data.map(r => ({...r, icon: icon, t: ty})));
          });
        });
        const layers = cos.filter(c => c.split('-')[2] === 'layer') // 找出默认勾选的图层
        GqOneImageStore.buildLayers = layers;
      } else {
        // 后续新增勾选的是水利工程建筑
        const type = cos.slice(-1)[0].split('-')[0];
        if (type === 'WAGA' || type === 'PUST' || type === 'FLUM' || type === 'CULV' || type === 'INSI' || type === 'DAM' || type === 'TUNNEL') { // 水闸站 泵站 渡槽 涵洞 倒虹吸 大坝 隧洞
          const icon = cos.slice(-1)[0].split('-')[2];
          getStructure({buildingType: type}).then(res => {
            const data = setData(res.data);
            GqOneImageStore.getConservancyPoint(data.map(r => ({...r, icon: icon, t: type})));
          });
        } else { // 后续新增勾选的图层
          GqOneImageStore.getBuildLayers(cos.slice(-1));
        }
      }
    }
  } else {
    GqOneImageStore.getConservancyPoint([]);
  }
},{immediate:true});

function setData(data) {
  if(data.wagaList.length){
    return data.wagaList
  }else if(data.pustList.length){
    return data.pustList
  }else if (data.culvList.length){
    return data.culvList
  }else if(data.hystList.length){
    return data.hystList
  }else if(data.flumList.length){
    return data.flumList
  }else if(data.insiList.length){
    return data.insiList
  }else if(data.damList.length){
    return data.damList
  }else if(data.tunnelList.length){
    return data.tunnelList
  }
}

function hide() {
  lef.value = -100
  GqOneImageStore.getLegendPositioning(2);
  GqOneImageStore.getToolBarPositioning(7);
}

function show() {
  lef.value = 2
  GqOneImageStore.getLegendPositioning(22);
  GqOneImageStore.getToolBarPositioning(23);
}

</script>

<style scoped lang="scss">
h4, h6 {
  margin: 0;
}

li {
  list-style-type: none;
}

.app-side {
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

  span {
    font-size: 16px;
    width: 3px;
    color: #1791FF;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    margin-right: 15px;
  }

  .ship {
    display: block;
    width: 40px;
    height: 40px;
    background: url("../../../../assets/images/shexiangtou-3@2x.png") no-repeat center center;
    background-size: cover;
    margin-bottom: 5px;
  }
}

.real-monitor-list {
  position: absolute;
  left: 2%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  transition: left .8s;
  height: 750px;
  min-height: 750px;
  width: 365px;
  padding: 15px;

  :deep(.el-checkbox) {
    margin-right: 12px;
  }

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

  .presentation {
    display: flex;
    flex: 1;
    flex-direction: column;

    .tags {
      padding: 13px 20px;
      height: 28px;
      background: rgba(23, 145, 255, 0.2);
      border-radius: 5px 18.5px 0px 0px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #1791FF;
      border: 0;
    }

    h4 {
      font-size: 14px;
      color: #1791FF;
    }

    .content {
      height: calc(100% - 28px);
      padding: 9px;
      background: #F4F8FB;
      border-radius: 0 14px 14px 14px;

      li {
        h6 {
          font-size: 15px;
          padding-bottom: 5px;
        }

        .checkbox-ico {
          display: inline-block;
          width: 18px;
          height: 18px;
          margin-right: 2px;
        }

        .hdsq{
          //background: url("@/assets/imgs/xingzhengquhua.png") no-repeat center center;
          //background-size: cover;
        }

        .hdsw{

        }

        .xzqh {
          background: url("@/assets/imgs/xingzhengquhua.png") no-repeat center center;
          background-size: cover;
        }

        .gd {
          background: url("@/assets/imgs/guodao.png") no-repeat center center;
          background-size: cover;
        }

        .gqbj {
          background: url("@/assets/imgs/gqbianjie.png") no-repeat center center;
          background-size: cover;
        }

        .hlsx {
          background: url("@/assets/imgs/heliushuixi.png") no-repeat center center;
          background-size: cover;
        }

        .sk {
          background: url("@/assets/imgs/shuiku.png") no-repeat center center;
          background-size: cover;
        }

        .zgq {
          background: url("@/assets/imgs/zongganqu.png") no-repeat center center;
          background-size: cover;
        }

        .ganq {
          background: url("@/assets/imgs/ganqu.png") no-repeat center center;
          background-size: cover;
        }

        .sz {
          background: url("@/assets/imgs/shuizha.png") no-repeat center center;
          background-size: cover;
        }

        .bz {
          background: url("@/assets/imgs/bengzhan.png") no-repeat center center;
          background-size: cover;
        }

        .dz {
          background: url("@/assets/imgs/duchao.png") no-repeat center center;
          background-size: cover;
        }

        .hd {
          background: url("@/assets/imgs/handong.png") no-repeat center center;
          background-size: cover;
        }

        .hx{
          background: url("@/assets/imgs/siphon.png") no-repeat center center;
          background-size: cover;
        }

        .db{
          background: url("@/assets/imgs/dam.png") no-repeat center center;
          background-size: cover;
        }

        .sd{
          background: url("@/assets/imgs/tunnel.png") no-repeat center center;
          background-size: cover;
        }

        .swz {
          background: url("@/assets/imgs/shuiweizhan.png") no-repeat center center;
          background-size: cover;
        }
        .anj{
          background: url("@/assets/imgs/anj.png") no-repeat center center;
          background-size: cover;
        }

        .ylz {
          background: url("@/assets/imgs/yuliangzhan.png") no-repeat center center;
          background-size: cover;
        }

        .szz {
          background: url("@/assets/imgs/shuizhazhan.png") no-repeat center center;
          background-size: cover;
        }

        .spd {
          background: url("@/assets/imgs/shipindian.png") no-repeat center center;
          background-size: cover;
        }

        .szhiz {
          background: url("@/assets/imgs/shuizhizhan.png") no-repeat center center;
          background-size: cover;
        }

      }

      :deep(.el-checkbox__label) {
        display: flex;
        align-items: center;
      }
    }

    .info {
      flex: 0.6;
      margin-bottom: 8px;

      .content {
        .el-checkbox-group:first-child {
          display: flex;
          flex-direction: column;

          li {
            flex: auto;

            h6 {
              display: flex;
              align-items: end;

              .el-icon {
                font-size: 18px;
                margin-right: 3px;
              }
            }
          }
        }
      }
    }

    .analysis {
      flex: 0.15;
      margin-bottom: 8px;

      .checkbox-ico {
        display: inline-block;
        width: 18px;
        height: 18px;
        margin-right: 2px;
      }

      .gsmj {
        background: url("@/assets/imgs/gongshuimianji.png") no-repeat center center;
        background-size: cover;
      }

      .ggmj {
        background: url("@/assets/imgs/ggmianji.png") no-repeat center center;
        background-size: cover;
      }

      :deep(.el-checkbox__label) {
        display: flex;
      }
    }

    .management {
      flex: 0.25;
      margin-bottom: 8px;

      .content {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;

        .man-tags {
          padding: 17px;
          margin: 5px;
          cursor: pointer;
        }
      }
    }

  }
}
</style>

