<template>
  <div class="wy" style="margin-top: 20px">
    <div class="title">王英水库</div>
    <div class="content">
      <li>
        <div class="head">
          <span>总蓄水量：{{ (wy.w / 100).toFixed(3) || 0 }}亿m³</span>
          <span
            >有效蓄水量：{{
              ((wy.w - wy.deadCap / 100) / 100).toFixed(3) || 0
            }}亿m³</span
          >
        </div>
        <div id="SGchart1">
          <div class="charts">
            <div class="line-a">
              <span>校核：{{ wy.cfZ || 0 }}m</span>
            </div>
            <div class="line-b">
              <span>设计：{{ wy.desFz || 0 }}m</span>
            </div>
            <div class="line-f">
              <span>正常蓄水位：{{ wy.normWatLev || 0 }}m</span>
            </div>
            <div class="line-c">
              <span>控制运用水位：{{ wy.fsltdz || 0 }}m</span>
            </div>
            <div class="line-d">
              <span>实时：{{ wy.rz || 0 }}m</span>
            </div>
            <div class="line-e">
              <span>死水位：{{ wy.deadLev || 0 }}m</span>
            </div>
            <div ref="SGchart1" style="height: 100%"></div>
          </div>
          <div class="line-box">
            <div class="total-box">
              <span class="lien-ol"></span>
              <span class="total">总库容 {{ formatTotal1 }} 亿m³</span>
              <div class="total-tr">
                <div>调洪库容</div>
                <div>{{ wy.storFlCap / 10000 || 0 }}亿m³</div>
              </div>
              <div class="total-xl">
                <div>兴利库容</div>
                <div>{{ wy.benResCap / 10000 || 0 }}亿m³</div>
              </div>
              <div class="total-s">
                <div>死库容</div>
                <div>{{ wy.deadCap / 10000 || 0 }}亿m³</div>
              </div>
            </div>
          </div>
        </div>
      </li>
      <li>
        <h4>水位变化图</h4>
        <div ref="SGchart2" id="SGchart2"></div>
      </li>
    </div>
  </div>
  <div class="cy">
    <div class="title">蔡贤水库</div>
    <div class="content">
      <li>
        <div class="head" style="display: flex">
          <span>总蓄水量：{{ (cx.w / 100).toFixed(3) || 0 }}亿m³</span>
          <span
            >有效蓄水量：{{
              ((cx.w - cx.deadCap / 100) / 100).toFixed(3) || 0
            }}亿m³</span
          >
        </div>
        <div id="SGchart3">
          <div class="charts">
            <div class="line-a">
              <span>校核：{{ cx.cfZ || 0 }}m</span>
            </div>
            <div class="line-b">
              <span>设计：{{ cx.desFz || 0 }}m</span>
            </div>
            <div class="line-f">
              <span>正常蓄水位：{{ cx.normWatLev || 0 }}m</span>
            </div>
            <!--            <div class="line-c">-->
            <!--              <span>控制运用水位：{{cx.fsltdz || 0}}m</span>-->
            <!--            </div>-->
            <div class="line-d">
              <span>实时：{{ cx.rz || 0 }}m</span>
            </div>
            <div class="line-e">
              <span>死水位：{{ cx.deadLev || 0 }}m</span>
            </div>
            <div ref="SGchart3" style="height: 100%"></div>
          </div>
          <div class="line-box">
            <div class="total-box">
              <span class="lien-ol"></span>
              <span class="total">总库容 {{ formatTotal2 }}亿m³</span>
              <div class="total-tr">
                <div>调洪库容</div>
                <div>{{ cx.storFlCap / 10000 || 0 }}亿m³</div>
              </div>
              <div class="total-xl">
                <div>兴利库容</div>
                <div>{{ cx.benResCap / 10000 || 0 }}亿m³</div>
              </div>
              <div class="total-s">
                <div>死库容</div>
                <div>{{ cx.deadCap / 10000 || 0 }}亿m³</div>
              </div>
            </div>
          </div>
        </div>
      </li>
      <li>
        <h4>水位变化图</h4>
        <div ref="SGchart4" id="SGchart4"></div>
      </li>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import * as echarts from "echarts";
import "echarts-liquidfill";
import dayjs from "dayjs";
import { getSk } from "@/api/oneimage";
const SGchart1 = ref();
const SGchart2 = ref();
const SGchart3 = ref();
const SGchart4 = ref();
let wy = ref({ totCap: 0 }); //王英
let cx = ref({ totCap: 0 }); //蔡贤
const formatTotal1 = computed(() => {
  if (wy.value.totCap) {
    var wyTotCap = wy.value.totCap / 10000 || 0;
    return Array.from(JSON.stringify(wyTotCap)).join("  ");
  }
  return 0;
});
const formatTotal2 = computed(() => {
  if (cx.value.totCap) {
    var cxTotCap = cx.value.totCap / 10000 || 0;
    return Array.from(JSON.stringify(cxTotCap)).join("  ");
  }
  return 0;
});

nextTick(() => {
  getSk().then((res) => {
    let wyList = [];
    let cxList = [];
    if (res.success) {
      res.data.forEach((r) => {
        if (r.resCode == "42022220001") {
          // 王英
          wy.value = r;
          wyList = r.waterLevelList;
        } else if (r.resCode == "42022230001") {
          cx.value = r;
          cxList = r.waterLevelList;
        }
      });
      const chart1 = echarts.init(SGchart1.value);
      chart1.setOption(
        {
          series: [
            {
              type: "liquidFill",
              direction: "left",
              data: [
                {
                  value: (wy.value.rz / 70).toFixed(1),
                  itemStyle: {
                    normal: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                          offset: 0,
                          color: "rgba(69, 191, 247, 1)",
                        },
                        {
                          offset: 1,
                          color: "rgba(44, 155, 253, 1)",
                        },
                      ]),
                    },
                  },
                },
              ],
              radius: "68%",
              center: ["56%", "61%"],
              itemStyle: {
                // 设置默认样式和强调样式颜色相同
                shadowBlur: 0,
              },
              waveLength: "100%",
              outline: {
                show: false,
              },
              label: {
                show: false,
              },
              shape:
                "path://M1,16.0788674 C27.2273861,1.52252535 50.2273861,-3.04185782 70,2.3857179 C91.3382611,8.7533117 107.018986,13.3176949 117.042176,16.0788674 C136.411565,21.1884304 158.064173,22.4658211 182,19.9110396 C181.906446,19.8357284 179.494145,69.2756611 174.763098,168.230838 L110.719241,168.230838 C69.3285982,165.891596 38.1943974,147.788067 17.3166384,113.92025 C3.49794039,94.1397514 -1.9409391,61.5259573 1,16.0788674 Z",
            },
          ],
        },
        true
      );
      const chart3 = echarts.init(SGchart3.value);
      chart3.setOption(
        {
          series: [
            {
              type: "liquidFill",
              direction: "left",
              data: [
                {
                  value: (cx.value.rz / 80).toFixed(1),
                  itemStyle: {
                    normal: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                          offset: 0,
                          color: "rgba(69, 191, 247, 1)",
                        },
                        {
                          offset: 1,
                          color: "rgba(44, 155, 253, 1)",
                        },
                      ]),
                    },
                  },
                },
              ],
              radius: "68%",
              center: ["56%", "61%"],
              itemStyle: {
                // 设置默认样式和强调样式颜色相同
                shadowBlur: 0,
              },
              waveLength: "100%",
              outline: {
                show: false,
              },
              label: {
                show: false,
              },
              shape:
                "path://M1,16.0788674 C27.2273861,1.52252535 50.2273861,-3.04185782 70,2.3857179 C91.3382611,8.7533117 107.018986,13.3176949 117.042176,16.0788674 C136.411565,21.1884304 158.064173,22.4658211 182,19.9110396 C181.906446,19.8357284 179.494145,69.2756611 174.763098,168.230838 L110.719241,168.230838 C69.3285982,165.891596 38.1943974,147.788067 17.3166384,113.92025 C3.49794039,94.1397514 -1.9409391,61.5259573 1,16.0788674 Z",
            },
          ],
        },
        true
      );

      const chart2 = echarts.init(SGchart2.value);
      chart2.setOption(
        {
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: "3%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: wyList.map((r) => r.tm.substr(5, 13)),
          },
          tooltip: {
            trigger: "axis",
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: wyList.map((r) => r.rz),
              type: "line",
              name: "水位变化图",
              showSymbol: false,
              smooth: true,
              areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "rgba(51, 196, 255, 0.30)",
                  },
                  {
                    offset: 1,
                    color: "rgba(23, 145, 255, 0)",
                  },
                ]),
              },
              lineStyle: {
                color: "rgba(23, 145, 255, 1)",
              },
            },
          ],
        },
        true
      );
      const chart4 = echarts.init(SGchart4.value);
      chart4.setOption(
        {
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: "3%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: cxList.map((r) => r.tm.substr(5, 13)),
          },
          tooltip: {
            trigger: "axis",
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: cxList.map((r) => r.rz),
              type: "line",
              name: "水位变化图",
              showSymbol: false,
              smooth: true,
              areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "rgba(252, 127, 0, 0.30)",
                  },
                  {
                    offset: 1,
                    color: "rgba(252, 127, 0, 0)",
                  },
                ]),
              },
              lineStyle: {
                color: "rgba(252, 127, 0, 1)",
              },
            },
          ],
        },
        true
      );
    }
  });
});
</script>

<style scoped lang="scss">
li {
  list-style-type: none;
}

#blue {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: url("../../../../../../assets/images/blue.png") no-repeat center
    center;
  background-size: cover;
  margin-right: 5px;
}
#orange {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: url("../../../../../../assets/images/orange.png") no-repeat center
    center;
  background-size: cover;
  margin-right: 5px;
}
#SGchart2,
#SGchart3,
#SGchart4 {
  height: 100%;
}

#SGchart1,
#SGchart3 {
  display: flex;
  height: 275px;
  .charts {
    position: relative;
    flex: 0.6;
    .line-a {
      position: absolute;
      top: 12%;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      line-height: 0px;
      width: 77%;
      text-align: center;
      border-top: 1px dashed #de4841;
      span {
        color: #de4841;
        font-size: 14px;
        background: #fff;
        padding: 0 5px;
        vertical-align: text-top;
      }
    }
    .line-b {
      position: absolute;
      top: 18%;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      line-height: 0px;
      width: 77%;
      text-align: center;
      border-top: 1px dashed #fc7f00;
      span {
        color: #fc7f00;
        font-size: 14px;
        background: #fff;
        padding: 0 5px;
        vertical-align: text-top;
      }
    }
    .line-c {
      position: absolute;
      top: 32%;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      line-height: 0px;
      width: 77%;
      text-align: center;
      border-top: 1px dashed #1791ff;
      z-index: 10;
      span {
        color: #1791ff;
        font-size: 14px;
        background: #fff;
        padding: 0 5px;
        vertical-align: text-top;
        border-radius: 20px;
      }
    }
    .line-d {
      position: absolute;
      top: 38%;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      line-height: 0px;
      width: 77%;
      text-align: center;
      border-top: 1px dashed #6bb2f3;
      z-index: 10;
      span {
        color: #6bb2f3;
        font-size: 14px;
        background: #e3f7ff;
        padding: 0 5px;
        vertical-align: text-top;
        border-radius: 20px;
      }
    }
    .line-e {
      position: absolute;
      top: 57%;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      line-height: 0px;
      width: 77%;
      text-align: center;
      border-top: 1px dashed #fff;
      z-index: 10;
      span {
        color: #fff;
        font-size: 14px;
        background: rgba(69, 191, 247, 1);
        padding: 0 5px;
        vertical-align: text-top;
        border-radius: 20px;
      }
    }
    .line-f {
      position: absolute;
      top: 24%;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      line-height: 0px;
      width: 77%;
      text-align: center;
      border-top: 1px dashed #00ff2a;
      z-index: 10;
      span {
        color: #00ff2a;
        font-size: 14px;
        font-weight: bold;
        background: #fff;
        padding: 0 5px;
        vertical-align: text-top;
        //border-radius: 20px;
      }
    }
  }
  .line-box {
    flex: 0.4;
    .total-box {
      position: relative;
      top: 51%;
      left: -20px;
      transform: translateY(-50%);
      height: 83%;
      &:before {
        content: "";
        position: absolute;
        top: 4%;
        height: 1px;
        border-top: 1px solid #eee;
        width: 100%;
      }
      &:after {
        content: "";
        position: absolute;
        bottom: 0;
        width: 100%;
        border-bottom: 1px solid #eee;
      }
      .lien-ol {
        position: absolute;
        right: 13%;
        top: 52%;
        transform: translateY(-50%);
        width: 1px;
        height: 96%;
        background: #eeeeee;
      }
      .total {
        position: absolute;
        right: 5%;
        top: 50%;
        transform: translateY(-50%);
        text-align: center;
        background: #eeeeee;
        border-radius: 10px;
        color: #666666;
        width: 24px;
        line-height: 17px;
        font-weight: bold;
        font-size: 14px;
        padding: 5px 5px;
        writing-mode: horizontal-tb;
      }
      .total-tr {
        position: absolute;
        top: 5%;
        text-align: center;
        width: 60%;
        div {
          color: #999999;
          font-size: 14px;
        }
      }
      .total-xl {
        position: absolute;
        top: 24%;
        padding: 21px 0px;
        text-align: center;
        width: 60%;
        border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;
        div {
          color: #999999;
          font-size: 14px;
        }
      }
      .total-s {
        position: absolute;
        bottom: 10%;
        text-align: center;
        width: 60%;
        div {
          color: #999999;
          font-size: 14px;
        }
      }
    }
  }
  .charts:after {
    content: "";
    display: block;
    width: 35px;
    height: 100%;
    position: absolute;
    right: 19px;
    top: 51%;
    transform: translateY(-50%);
    background: url("../../../../../../assets/images/dam.png") no-repeat center
      center;
    background-size: contain;
  }
  .charts:before {
    content: "";
    display: block;
    width: 1px;
    height: 88%;
    position: absolute;
    left: 10%;
    top: 5%;
    border-left: 1px solid #eeeeee;
  }
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 5px;
  td {
    padding: 8px 0;
    text-align: center;
  }

  tr:nth-child(1) td {
    padding: 5px 0;
  }
  tr:nth-child(2) {
    color: #1791ff;
    background: rgba(23, 145, 255, 0.1);
    margin-bottom: 5px;
  }
  tr:nth-child(3) {
    color: #fc7f00;
    background: rgba(252, 127, 0, 0.1);
  }
}
.wy,
.cy {
  .title {
    height: 35px;
    line-height: 35px;
    width: 125px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    border-radius: 5px 20.5px 0px 0px;
  }
  .content {
    display: flex;
    background: #f4f8fb;
    border-radius: 0px 14px 14px 14px;
    li {
      flex: 1;
      display: flex;
      flex-direction: column;
      .head {
        display: flex;
        justify-content: space-around;
        text-align: center;
        margin-top: 10px;
        span {
          display: inline-block;
          height: 36px;
          padding: 8px;
          background: rgba(165, 165, 165, 0.1);
          color: #333333;
          border-radius: 5px;
        }
        span:nth-child(1) {
          margin-right: 20px;
        }
      }
      h4 {
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: bold;
        color: #333333;
        margin: 16px 0;
      }
    }
  }
}
.wy {
  margin-bottom: 10px;
  .title {
    color: #1791ff;
    background: rgba(23, 145, 255, 0.1);
  }
  .content {
  }
}
.cy {
  .title {
    color: #fc7f00;
    background: rgba(252, 127, 0, 0.1);
  }
  .content {
  }
}
</style>