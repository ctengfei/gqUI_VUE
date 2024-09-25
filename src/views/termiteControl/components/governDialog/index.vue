<template>
  <el-dialog
    v-model="props.dialogVisible"
    :title="props.title"
    destroy-on-close
    width="52%"
    draggable
    :before-close="close"
  >
    <el-form ref="formRef" :model="form" label-width="180px">
      <el-row>
        <el-col :span="12">
          <el-form-item prop="time">
            <template #label>
              <span> 起止时间 </span>
            </template>
            <el-date-picker
              v-model="form.time"
              clearable
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="loc3">
            <template #label>
              <span>
                主巢桩号
                <el-tooltip placement="top">
                  <template #content>
                    桩号由公里数和米数构成，格式：字母(可省)<br />+公里数+“+”+米数(3位数字，不足前面自动补0)，<br />例：10+120，z10+012
                  </template>
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-input v-model="form.loc3" placeholder="请输入主巢桩号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="elevation">
            <template #label>
              <span> 高程(m)</span>
            </template>
            <el-input v-model="form.elevation" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="num">
            <template #label>
              <span>主巢腔直径(cm)</span>
            </template>
            <el-input type="number" v-model="form.num" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="elevation">
            <template #label>
              <span> 副巢数量(个)</span>
            </template>
            <el-input v-model="form.elevation" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="num">
            <template #label>
              <span>蚁后长度(mm)</span>
            </template>
            <el-input type="number" v-model="form.num" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="elevation">
            <template #label>
              <span>人力投入(人)</span>
            </template>
            <el-input v-model="form.elevation" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="num">
            <template #label>
              <span>耗费工时(小时)</span>
            </template>
            <el-input type="number" v-model="form.num" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="checkTheType">
            <template #label>
              <span> 有无繁殖蚁 </span>
            </template>
            <el-select v-model="form.checkTheType" style="width: 100%">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { nextTick, onMounted, ref, reactive } from "vue";
import GroupLine from "../groupLine";
const props = defineProps(["title", "dialogVisible"]);
const emit = defineEmits(["closeDialog"]);
const formRef = ref();
const options = reactive([{ label: "11", value: "11" }]);
let form = ref({});

//确认
const confirm = () => {
  formRef.value.validate().then((flag) => {
    if (flag) {
      console.log("form", form);
    }
  });
  //   close();
};
//关闭
const close = () => {
  emit("closeDialog");
};
</script>

<style lang="scss">
@import "./index.scss";
</style>

