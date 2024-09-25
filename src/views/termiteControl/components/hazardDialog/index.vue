<template>
  <el-dialog
    v-model="props.dialogVisible"
    :title="props.title"
    destroy-on-close
    draggable
    width="60%"
    :before-close="close"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="180px">
      <el-row>
        <el-col :span="12">
          <el-form-item prop="hazardArea" label="危害部位">
            <el-input
              maxlength="50"
              v-model="form.hazardArea"
              placeholder="请输入危害部位"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="hazardPos" label="危害位置">
            <el-input
              maxlength="50"
              v-model="form.hazardPos"
              placeholder="请输入危害位置"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="hazardPosLon" label="危害位置经度">
            <el-input-number
              style="width: 100%"
              v-model.number="form.hazardPosLon"
              :min="0"
              :max="180"
              placeholder="请输入危害位置经度"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="hazardPosLat" label="危害位置纬度">
            <el-input-number
              style="width: 100%"
              v-model.number="form.hazardPosLat"
              :min="0"
              :max="90"
              placeholder="请输入危害位置纬度"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="signType" label="迹象类型">
            <el-select v-model="form.signType" style="width: 100%">
              <el-option
                v-for="item in sign_type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="processMethod" label="建议处理方法">
            <el-select v-model="form.processMethod" style="width: 100%">
              <el-option
                v-for="item in process_method"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="upBnchStartLoc">
            <template #label>
              <span>
                迎水面桩号范围(m): 起
                <el-tooltip placement="top">
                  <template #content>
                    桩号由公里数和米数构成，格式：字母(可省)<br />+公里数+“+”+米数(3位数字，不足前面自动补0)，<br />例：10+120，z10+012
                  </template>
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-input
              maxlength="20"
              v-model="form.upBnchStartLoc"
              placeholder="请输入起桩号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="upBnchEndLoc">
            <template #label>
              <span>
                止
                <el-tooltip placement="top">
                  <template #content>
                    桩号由公里数和米数构成，格式：字母(可省)<br />+公里数+“+”+米数(3位数字，不足前面自动补0)，<br />例：10+120，z10+012
                  </template>
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-input
              maxlength="20"
              v-model="form.upBnchEndLoc"
              placeholder="请输入止桩号"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="downBnchStartLoc">
            <template #label>
              <span>
                背水面桩号范围(m): 起
                <el-tooltip placement="top">
                  <template #content>
                    桩号由公里数和米数构成，格式：字母(可省)<br />+公里数+“+”+米数(3位数字，不足前面自动补0)，<br />例：10+120，z10+012
                  </template>
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-input
              maxlength="20"
              v-model="form.downBnchStartLoc"
              placeholder="请输入起桩号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="downBnchEndLoc">
            <template #label>
              <span>
                止
                <el-tooltip placement="top">
                  <template #content>
                    桩号由公里数和米数构成，格式：字母(可省)<br />+公里数+“+”+米数(3位数字，不足前面自动补0)，<br />例：10+120，z10+012
                  </template>
                  <el-icon><question-filled /></el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-input
              maxlength="20"
              v-model="form.downBnchEndLoc"
              placeholder="请输入止桩号"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="elevation" label="高程(m)">
            <el-input-number
              style="width: 100%"
              v-model.number="form.elevation"
              :min="0"
              :max="999999"
              :precision="2"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="num" label="个数">
            <el-input-number
              style="width: 100%"
              v-model.number="form.num"
              :min="0"
              :max="99999999"
              :precision="0"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item prop="description" label="描述">
            <el-input
              maxlength="3000"
              type="textarea"
              v-model="form.description"
              placeholder="请输入描述"
            />
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
import { nextTick, onMounted, toRef, ref, reactive } from "vue";
import GroupLine from "../groupLine";

const { proxy } = getCurrentInstance();
const { sign_type, process_method } = proxy.useDict(
  "sign_type",
  "process_method"
);

const props = defineProps(["title", "dialogVisible", "formData"]);
const formData = toRef(props, "formData");
const emit = defineEmits(["closeDialog", "confirmDialog"]);
const rules = ref({
  hazardArea: [
    { required: true, message: "请输入危害部位", trigger: ["change", "blur"] },
  ],
  signType: [
    { required: true, message: "请选择迹象类型", trigger: ["change", "blur"] },
  ],
  processMethod: [
    {
      required: true,
      message: "请选择建议处理方法",
      trigger: ["change", "blur"],
    },
  ],
  num: [{ required: true, message: "请输入个数", trigger: ["change", "blur"] }],
});
const formRef = ref();
let form = ref(formData || {});
//确认
const confirm = () => {
  formRef.value.validate().then((flag) => {
    if (flag) {
      emit("confirmDialog", { ...form.value, id: form.value.id || "" });
    }
  });
};
//关闭
const close = () => {
  emit("closeDialog");
};
</script>

<style lang="scss">
@import "./index.scss";
</style>

