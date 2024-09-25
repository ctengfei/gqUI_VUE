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
      <el-form
        ref="formRef"
        :model="dataObject"
        :disabled="props.type"
        label-width="180px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="deviceCode" label="桩号及位置">
              <el-input v-model="dataObject.partLoc" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="createBy" label="创建人">
              <el-input v-model="dataObject.createBy" ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="createTime" label="上报时间">
              <el-input v-model="dataObject.createTime" ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="remark" label="问题描述">
              <el-input
                type="textarea"
                v-model="dataObject.checkDesc"
                placeholder="请输入问题描述"
                maxlength="3000"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="img" label="问题照片">
              <el-image
                v-for="(item, index) in dataObject.imgs"
                :key="index"
                :src="item.url"
                :preview-src-list="[imgArr]"
                :preview-teleported="true"
                style="width: 50px; height: 50px"
                fit="cover"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
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
import { getAbnormalPartListApi, getPatrolDetailApi, getPatrolProblemDetail } from "../../apis";
import { loopData } from "../../utils";

let props = defineProps(["title", "id", "dialogVisible","type"]);
const emit = defineEmits(["closeDialog"]);

let isShow = ref(false);
let treeRef = ref(null);
let filterText = ref("");
let data = ref([]);
let nodeContent = ref({});
let dataObject = ref({});
let imgArr = ref([]);

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
  // getResultData(props.id);
  getDetail(props.id);
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
// 获取上报详情
const getDetail = (id) => {
  getPatrolProblemDetail(id).then(res=>{
    if (res.success) {
      const result = res.data;
      let imgs = result.img.replace(/\\/g, "\\\\");
      result.imgs = JSON.parse(imgs)
      dataObject.value = result;
      let imgResult = JSON.parse(imgs);
      imgArr.value = imgResult.map(item=>item.url);
    }
  })
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
  
  