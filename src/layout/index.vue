<template>
  <div class="common-layout h-full">
    <el-container class="h-full">
      <el-aside class="h-full" width="210px">
        <aside-menu />
      </el-aside>
      <el-container class=" relative">
        <div class="shadow-layer bg-url-@/assets/image/zhenhai-bg.jpg absolute top-0 right-0 left-0 bottom-0 -z-10">
          <div class="frosted-glass z-10 absolute blur-lg :hover:blur-0 w-full h-full transition-all delay-500"></div>
        </div>
        <el-header height="60px">

        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup lang="ts">
import AsideMenu from './aside.vue';

</script>
<style scoped lang='scss'>
// TODO
.shadow-layer {
  .frosted-glass {
    background-image: linear-gradient(to left top, rgba(5, 33, 91, 0.9), rgba(57, 95, 159, 0.9));

    &:hover {
      background-image: linear-gradient(to left top, rgba(5, 33, 91, 0.5), rgba(57, 95, 159, 0.5));
    }
  }
}
</style>
