<template>
  <div class="container">
    <pro-form
      ref="formRef"
      v-model="form"
      :columns="followUpColumns"
      label-width="120px"
      :menu="menu"
      column="2"
      :disabled="type === 'detail'"
    />
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, reactive, defineExpose } from "vue";
import { followUpColumns } from "../../constant";
import {
  defineFormColumns,
  defineFormMenuColumns,
  defineFormSubmit,
} from "element-pro-components";
const { type } = defineProps(["type"]);
let form = ref({});
const formRef = ref(null);

const menu = defineFormMenuColumns({
  submit: false,
  reset: false,
});

defineExpose({
  formData: form.value,
});
</script>

<style lang="scss">
@import "./index.scss";
</style>

