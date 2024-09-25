import * as echarts from "echarts";

//获取月份、次数
export const getArrData = (arr, type) => {
  if (arr && arr.length > 0) {
    return arr.map((item) => item[type] || "");
  }
  return [];
};
//柱状图
export const setChart = (type, { legendData, list, keys, title }) => {
  const bar = echarts.init(type.value);
  bar.setOption(
    {
      title: {
        text: title,
      },
      legend: { data: legendData },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "8%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          name: "月份",
          type: "category",
          data: getArrData(list, "month"),
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      yAxis: [
        {
          name: "次数",
          type: "value",
        },
      ],
      series: [
        {
          name: legendData[0],
          type: "bar",
          barWidth: "10%",
          data: getArrData(list, keys[0]),
          itemStyle: {
            normal: {
              barBorderRadius: [10, 10, 0, 0], // 设置柱状图圆角
            },
          },
        },
        {
          name: legendData[1],
          type: "bar",
          barWidth: "10%",
          data: getArrData(list, keys[1]),
          itemStyle: {
            normal: {
              barBorderRadius: [10, 10, 0, 0], // 设置柱状图圆角
            },
          },
        },
      ],
    },
    true
  );
};
//遍历树
export const loopData = (list) => {
  const loop = (arr) => {
    if (arr && arr.length === 0) return [];
    return arr.map((item) => {
      const {
        engId,
        id,
        partId,
        engName,
        partName,
        itemTree,
        recordsTree,
        checkContent,
        children,
        status,
        checkDesc,
        img,
      } = item;
      const node = {
        id: id || partId || engId,
        label: checkContent || engName || partName || "",
        children: itemTree || recordsTree || children,
        status,
        checkDesc,
        img,
        ...item,
      };
      // 递归
      if (node.children && node.children.length) {
        node.children = loop(node.children);
      }
      return node;
    });
  };
  return loop(list);
};
//获取水利工程name
export const getName = (r) => {
  return (
    r.wagaName ||
    r.pustName ||
    r.flumName ||
    r.culvName ||
    r.hystName ||
    r.stName ||
    r.wmstName ||
    r.insiName ||
    r.damName ||
    r.tunnelName ||
    r.chanName
  );
};
//获取水利工程code
export const getCode = (r) => {
  return (
    r.wagaCode ||
    r.pustCode ||
    r.flumCode ||
    r.culvCode ||
    r.hystCode ||
    r.stCode ||
    r.wmstCode ||
    r.insiCode ||
    r.damCode ||
    r.tunnelCode ||
    r.chanCode
  );
};
