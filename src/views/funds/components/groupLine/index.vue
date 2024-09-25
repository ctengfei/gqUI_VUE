<template>
  <div class="container">
    <div class="left">
      <span class="title">{{ props.title }}</span>
    </div>
  </div>
  <hr class="divide" />
</template>

<script setup>
const props = defineProps(["title"]);
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>

