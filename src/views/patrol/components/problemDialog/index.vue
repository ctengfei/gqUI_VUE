<template>
  <el-dialog
    v-model="props.dialogVisible"
    :title="props.title"
    width="48%"
    draggable
    destroy-on-close
    :before-close="close"
  >
    <div class="content">
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
                  v-if="node.data.status === '2'"
                  effect="dark"
                  size="small"
                >
                  已处理</el-tag
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
                <el-button
                  v-if="['1', '2'].includes(node.data.status)"
                  class="right-btn"
                  type="primary"
                  text
                  @click="clickNode(node)"
                  >查看</el-button
                >
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
    <div class="timeline-box" v-if="isShow">
      <el-timeline>
        <el-timeline-item
          :timestamp="nodeContent.createTime"
          color="#67C23A"
          placement="top"
          v-if="['1', '2'].includes(nodeContent.status)"
        >
          <el-card>
            <h4>{{ nodeContent.reporter }}</h4>
            <div>
              <h3>图片:</h3>
              <div class="demo-image__preview">
                <el-image
                  style="width: 100px; height: 100px"
                  :src="item"
                  :zoom-rate="1.2"
                  :max-scale="7"
                  :min-scale="0.2"
                  :preview-src-list="nodeContent.srcList"
                  :initial-index="index"
                  fit="cover"
                  v-for="(item, index) in nodeContent.srcList"
                />
                <div class="description">
                  <h3>问题描述:</h3>
                  <div>{{ nodeContent.checkDesc }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
        <el-timeline-item
          :timestamp="nodeContent.processTime"
          color="#67C23A"
          placement="top"
          v-if="nodeContent.status === '2'"
        >
          <el-card>
            <h4>{{ nodeContent.handlers }}</h4>
            <div>
              <h3>图片:</h3>
              <div class="demo-image__preview">
                <el-image
                  style="width: 100px; height: 100px"
                  :src="item"
                  :zoom-rate="1.2"
                  :max-scale="7"
                  :min-scale="0.2"
                  :preview-src-list="nodeContent.processSrcList"
                  :initial-index="index"
                  fit="cover"
                  v-for="(item, index) in nodeContent.processSrcList"
                />
                <div class="description">
                  <h3>问题描述:</h3>
                  <div>{{ nodeContent.processResult }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>
  
  <script setup>
import { nextTick, onMounted, ref, reactive, computed } from "vue";
import { ArrowLeftBold } from "@element-plus/icons-vue";
import { getAbnormalPartListApi, getPatrolDetailApi } from "../../apis";
import { loopData } from "../../utils";

let props = defineProps(["title", "id", "dialogVisible"]);
const emit = defineEmits(["closeDialog"]);

let isShow = ref(false);
let treeRef = ref(null);
let filterText = ref("");
let data = ref([]);
let nodeContent = ref({});

const defaultProps = {
  children: "children",
  label: "label",
};

watch(filterText, (val) => {
  treeRef.value.filter(val);
});

const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.includes(value);
};
onMounted(() => {
  getResultData(props.id);
});
//获取巡查部位数据
const getResultData = (id) => {
  getAbnormalPartListApi(id).then((res) => {
    if (res.success) {
      const result = res.data;
      data.value = loopData(result);
    }
  });
};
const clickNode = (node) => {
  getPatrolDetailApi(node.data.id).then((res) => {
    if (res.success) {
      const result = res.data;
      const {
        checkDesc,
        img,
        createTime,
        createBy,
        processImg,
        processTime,
        updateBy,
        processResult,
        status,
      } = result;
      const imgArr = (img && JSON.parse(img)) || [];
      const srcList = imgArr.map((item) => item.url);
      const processImgArr = (processImg && JSON.parse(processImg)) || [];
      const processSrcList = processImgArr.map((item) => item.url);
      nodeContent.value = {
        checkDesc,
        srcList,
        createTime,
        reporter: `上报人：${createBy}`,
        handlers: `处理人：${updateBy}`,
        processTime,
        processSrcList,
        processResult,
        status,
      };
      isShow.value = true;
    }
  });
};
//关闭
const close = () => {
  emit("closeDialog");
};
</script>
  
  <style lang="scss" scoped>
@import "./index.scss";
</style>
  
  