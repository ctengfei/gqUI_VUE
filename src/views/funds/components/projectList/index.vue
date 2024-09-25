<template>
    <div class="card-container">
        <li v-for="(item, index) in projectData" :key="index">
            <el-row style="width:100%;">
                <el-col :span="10" style="text-align: right;">
                    <img :src="item.icon" />
                </el-col>
                <el-col :span="14">
                    <b>{{ item.name }}</b>
                    <strong>{{ item.value || 0 }} <span>{{ item.unit || '个' }}</span></strong>
                </el-col>
            </el-row>

        </li>
    </div>
</template>
  
<script setup>
const props = defineProps(['projectData'])
</script>
  
<style lang="scss" scoped>
@import './index.scss';
</style>
  
  