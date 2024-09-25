<template>
  <div class="app-container">
    <div class="settings-top">
      <li>
        <span>渠道：</span>
        <el-select v-model="channelData.channel" @change="handleChange">
          <el-option
            v-for="item in channelList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </li>
      <li>
        <span style="margin-left: 15px">划分组数：</span>
        <el-select
          v-model="channelData.numberOfGroups"
          placeholder="请选择组数"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </li>
      <el-button type="primary" style="margin-left: 60px" @click="setUp"
        >轮灌组设置</el-button
      >
      <el-button type="success" style="margin-left: 20px" @click="save"
        >保存</el-button
      >
    </div>
    <div class="irrigationDistrict">
      <div class="infoList">
        <h3>灌区</h3>
        <p v-for="item in tagList" :key="item.name">
          <el-tag type="info">{{ item.name + "【" +item.cntSchanBnch+"】" }}</el-tag>
        </p>
      </div>
      <div
        :id="cur.id"
        class="item-box"
        v-for="(cur, index) in irrigationGroup"
        :key="index"
      >
        <h3>{{ cur.title }}</h3>
        <el-tag class="handle" v-for="item in cur.list" :key="item.name">{{
          item.name +"【" +item.cntSchanBnch+"】"
        }}</el-tag>
      </div>
    </div>
    <div class="footer">
      <!-- <el-button type="primary" size="default" @click="prevStep"
        >上一步</el-button
      > -->
      <el-button type="primary" size="default" @click="nextStep"
        >下一步</el-button
      >
    </div>
  </div>
</template>

<script setup>
import Sortable from "sortablejs";
import { ref, nextTick, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getWaterDemandList,
  updateStatic,
  getStaticList,
} from "@/api/scheSchemeData";

const emits = defineEmits(["changeStep"]);
const props = defineProps(["allocCode"]);
//渠道下拉数据
let channelList = ref([]);
const options = ref([
  { label: 1, value: 1 },
  { label: 2, value: 2 },
  { label: 3, value: 3 },
  { label: 4, value: 4 },
]);
const channelData = ref({ channel: "", numberOfGroups: 2 });
//灌区
let tagList = ref([]);
//灌组
let irrigationGroupData = ref([]);
//当前变化的灌组数据
let irrigationGroup = ref([]);

onMounted(() => {
  getChannelList();
});
//获取渠道下拉数据
const getChannelList = () => {
  const params = {
    pageNum: 1,
    pageSize: 9999,
    hasIwrMaoUser: true,
    allocCode: props.allocCode,
  };
  getWaterDemandList(params).then((res) => {
    if (res.success) {
      const result = res.data || [];
      let arr = [];
      result.map((item) => {
        if (arr.length > 0) {
          const newArr = arr.map((it) => it.value);
          if (!newArr.includes(item.spChanCode)) {
            arr.push({ value: item.spChanCode, label: item.spChanName });
          }
        } else {
          arr.push({ value: item.spChanCode, label: item.spChanName });
        }
      });
      channelList.value = arr;
      if (arr && arr.length > 0) {
        const val = arr[0].value;
        channelData.value.channel = val;
        getData(val);
      }
    }
  });
};
//获取轮灌组列表
const getStaticData = () => {
  const params = {
    pageNum: 1,
    pageSize: 9999,
    allocCode: props.allocCode,
    spChanCode: channelData.value.channel,
  };
  getStaticList(params).then((res) => {
    if (res.success) {
      const list = res.data || [];
      if (list && list.length > 0) {
        const priorityList = list.map((item) => item.priority);
        const max = Math.max.apply(null, priorityList);
        const newList = [...tagList.value];
        newList.forEach((cur) => {
          list.forEach((item) => {
            if (item.cntSchanBnch === cur.cntSchanBnch) {
              cur.priority = item.priority;
            }
          });
        });
        tagList.value = newList;
        irrigationGroupData.value = [
          {
            title: "第一轮灌组",
            list: fitData(tagList.value, 1),
            id: "oneGroups",
          },
          {
            title: "第二轮灌组",
            list: fitData(tagList.value, 2),
            id: "twoGroups",
          },
          {
            title: "第三轮灌组",
            list: fitData(tagList.value, 3),
            id: "threeGroups",
          },
          {
            title: "第四轮灌组",
            list: fitData(tagList.value, 4),
            id: "fourGroups",
          },
        ];
        channelData.value.numberOfGroups = max;
        setUp();
      }
    }
  });
};
//过滤灌组
const fitData = (arr, num) => {
  return arr.filter((item) => item.priority === num);
};
//切换渠道
const handleChange = (e) => {
  getData(e);
};
//获取列表数据
const getData = (code) => {
  const params = {
    pageNum: 1,
    pageSize: 9999,
    hasIwrMaoUser: true,
    allocCode: props.allocCode,
    spChanCode: code,
  };
  getWaterDemandList(params).then((res) => {
    if (res.success) {
      const list = res.data || [];
      tagList.value = list.map((item) => {
        const { chanCode, chanName, spChanCode, spChanName, allocCode,distance,cntSchanBnch } = item;
        return {
          name: item.chanName,
          priority: 1,
          chanCode,
          chanName,
          spChanCode,
          spChanName,
          allocCode,
          distance,
          cntSchanBnch
        };
      });
      irrigationGroupData.value = [
        { title: "第一轮灌组", list: tagList.value, id: "oneGroups" },
        { title: "第二轮灌组", list: [], id: "twoGroups" },
        { title: "第三轮灌组", list: [], id: "threeGroups" },
        { title: "第四轮灌组", list: [], id: "fourGroups" },
      ];
      irrigationGroup.value = [
        { title: "第一轮灌组", list: tagList.value, id: "oneGroups" },
        { title: "第二轮灌组", list: [], id: "twoGroups" },
      ];
      setUp();
      nextTick(() => {
        addMove();
      });
      getStaticData();
    }
  });
};
const addMove = () => {
  // 在页面dom元素挂载完成后初始化soratblejs
  new Sortable(oneGroups, {
    group: {
      name: "shared",
      pull: true, //移出
      put: true, //移入
    },
    animation: 150,
    onRemove(evt) {
      const { from, to, item } = evt;
      changeGroup(from.id, to.id, item.innerText);
    },
  });
};
//修改灌组数据
const changeGroup = (fromId, toId, name) => {
  const newData = [...irrigationGroupData.value];
  const chanName = name.substr(0,name.indexOf('【'))
  const filerArr = tagList.value.filter((item) => item.name === chanName);
  const priorityObj = {
    oneGroups: 1,
    twoGroups: 2,
    threeGroups: 3,
    fourGroups: 4,
  };
  newData.forEach((cur) => {
    if (cur.id === fromId) {
      cur.list = cur.list.filter((item) => item.name !== chanName);
    }

    if (cur.id === toId) {
      cur.list = [...cur.list, { ...filerArr[0], priority: priorityObj[toId] }];
    }
  });
};
//轮灌组设置
const setUp = () => {
  const num = channelData.value.numberOfGroups;
  const newData = [...irrigationGroupData.value];
  newData.length = num;
  irrigationGroup.value = newData;
  nextTick(() => {
    createMove(num);
  });
};
const getDataList = () => {
  const arr = [...irrigationGroup.value];
  let data = [];
  arr.forEach((item) => {
    data = [...data, ...item.list];
  });
  return data.map((item) => {
    const { name, ...rest } = item;
    return rest;
  });
};
//灌组移动
const createMove = (num) => {
  if (num === 2) {
    new Sortable(twoGroups, {
      group: {
        name: "shared",
        pull: true, //移出
        put: true, //移入
      },
      animation: 150,
      onRemove(evt) {
        const { from, to, item } = evt;
        changeGroup(from.id, to.id, item.innerText);
      },
    });
  }
 else if (num === 3) {
    new Sortable(threeGroups, {
      group: {
        name: "shared",
        pull: true, //移出
        put: true, //移入
      },
      animation: 150,
      onRemove(evt) {
        const { from, to, item } = evt;
        changeGroup(from.id, to.id, item.innerText);
      },
    });
  }
 else if (num == 4) {
    new Sortable(fourGroups, {
      group: {
        name: "shared",
        pull: true, //移出
        put: true, //移入
      },
      animation: 150,
      onRemove(evt) {
        const { from, to, item } = evt;
        changeGroup(from.id, to.id, item.innerText);
      },
    });
  }
};
//上一步
const prevStep = () => {
  emits("changeStep", -1);
};
//下一步
const nextStep = () => {
  const params = getDataList();
  updateStatic(props.allocCode, params).then((res) => {
    if (res.success) {
      ElMessage({
        message: "操作成功",
        type: "success",
      });
      emits("changeStep", 1);
    }
  });
};
const save = () => {
  const params = getDataList();

  updateStatic(props.allocCode, params).then((res) => {
    if (res.success) {
      ElMessage({
        message: "操作成功",
        type: "success",
      });
    }
  });
};
</script>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  height: 100%;

  .settings-top {
    display: flex;
    margin: 10px 0;

    li {
      display: flex;
      align-items: center;

      span {
        white-space: nowrap;
      }
    }
  }

  .irrigationDistrict {
    display: flex;

    .infoList {
      min-height: 400px;
      width: 280px;
      border: 1px solid #ebeef5;

      h3 {
        text-align: center;
        padding: 10px;
        border-bottom: #ebeef5;
      }

      p {
        text-align: center;
      }
    }

    .item-box {
      flex: 1;
      min-height: 400px;
      border: 1px solid #ebeef5;
      border-left: none;

      h3 {
        text-align: center;
        padding: 10px;
        border-bottom: 1px solid #ebeef5;
      }

      .handle {
        margin: 20px;
        cursor: move;
      }
    }
  }

  .footer {
    text-align: center;
    margin-top: 30px;
  }
}
</style>
