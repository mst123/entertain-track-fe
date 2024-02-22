<template>
  <el-menu
    :default-active="defaultActive"
    router
    class="menu-vertical h-full"
  >
    <el-sub-menu index="0">
      <template #title>
        <el-icon><location /></el-icon>
        <span>动画</span>
      </template>
      <el-menu-item index="/anime/popular">热门动画</el-menu-item>
      <el-menu-item index="/anime/season">番季动画</el-menu-item>
      <el-menu-item index="/anime/ranking">动画排名</el-menu-item>
      <el-menu-item index="anime/search">动画搜索</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script lang="ts" setup>
import {
  Location,
} from '@element-plus/icons-vue';

const route = useRoute()
console.log(route);
const defaultActive = computed(() => route.path);
</script>
<style scoped lang="scss">
  .menu-vertical {
    --el-menu-text-color: #0067c9;
    --el-menu-active-color: #f7de45;
    --el-menu-bg-color: rgba(12, 56, 113, 0.6);
    --el-menu-hover-bg-color: transparent;

    background-image: linear-gradient(to bottom, #132a59, #0a1746);
  }
</style>
