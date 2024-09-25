<template>
  <div class="card-container">
    <li v-for="(item, index) in navData" :key="index">
      <el-row style="width: 100%; margin-left: 60px">
        <el-col :span="24">
          <b>{{ item.name }}</b>
          <strong
            >{{ item.value || 0 }} <span>{{ item.unit || "次" }}</span></strong
          >
        </el-col>
      </el-row>
    </li>
  </div>
</template>
  
<script setup>
const props = defineProps(["navData"]);
</script>
  
<style lang="scss" scoped>
@import "./index.scss";
</style>
  
  