<template>
  <div class="w-full h-full flex flex-col">
    <search-bar @search="onSearch" />
    <el-scrollbar class="w-full h-full flex-1">
      <div class="w-full flex flex-wrap justify-around content-around gap-12.5">
        <anime-card v-for="(item, index) in animeList" :key="index" :info="item" />
      </div>
    </el-scrollbar>
    <div class="page-control h-12.5 relative">
      <el-pagination
        class="absolute bottom-0 right-5"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        background
        :page-count="10"
        layout="prev, pager, next"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { getAnimeRankingListByType } from '@/api/anime/index';
import AnimeCard from '../components/anime-card.vue';
import SearchBar from './components/search-bar/index.vue';
import usePage from '@/hooks/usePage.js';

/* 分页功能 */
const {
  currentPage,
  pageSize,
  offset,
} = usePage();
/* 请求动漫列表数据 */
// eslint-disable-next-line no-undef
const animeList = ref<Array<API.Node>>([]);
function onSearch(rankingType: API.RankingType = 'all'): void {
  getAnimeRankingListByType({
    ranking_type: rankingType,
    limit: pageSize.value,
    offset: offset.value,
    fields: 'id,title,main_picture,rank,popularity,num_list_users,num_scoring_users,mean,rating',
  }).then((res) => {
    console.log(res);
    animeList.value = res.data;
  }).catch((error) => {
    console.log(error);
  });
}
/* 页码改变请求数据 */
watch([currentPage, pageSize], () => {
  onSearch();
}, {
  immediate: true,
});
</script>
<style scoped lang='scss'>
</style>
