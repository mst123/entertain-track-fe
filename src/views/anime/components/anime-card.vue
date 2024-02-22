<template>
  <div class="anime-card cursor-pointer w-65 flex-none h-85 rounded-3xl overflow-hidden relative">
    <el-image class="w-full h-full" :src="props.info.node.main_picture.large" fit="cover">
      <template #placeholder>
        <el-image class="w-full h-full bg-light-400" :src="loadingImg" fit="none" />
      </template>
    </el-image>
    <div class="title text-sm h-20 opacity-90 text-yellow-200 absolute bottom-0 left-0 w-full leading-6 pl-5 z-10">
      <div class="shadow absolute w-full h-full top-0 left-0 blur-sm bg-cyan-600 -z-10"></div>
      <span class="truncate">{{ props.info.node.title }}</span><br/>
      <el-rate size="small" allow-half :max="10" disabled v-model="score" /> {{ props.info.node.mean }}<br/>
      排名 <span class="i-mdi-shield-crown-outline inline-block text-lg text-yellow-400" /> {{ props.info.ranking?.rank || props.info.node.rank }}<br/>
    </div>
  </div>
</template>
<script setup lang="ts">
const loadingImg = new URL('../../../assets/image/image-loading.webp', import.meta.url).href;
const props = defineProps < {
  info: API.Node,
}>();
// NOTICE 你想一想你没有给props 设定类型，他怎么判断你传递的对不对
const score = computed(() => Math.round(props.info.node.mean * 2) / 2);
</script>
<style scoped lang='scss'>
</style>
