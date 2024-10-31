<template>
  <el-container class="h-[calc(100vh-96px)]">
    <el-header height="50">
      <el-form :inline="true" :model="searchValue">
        <el-form-item label="排序类型">
          <el-select
            v-model="searchValue.ranking_type"
            placeholder="请选择"
            style="width: 240px"
          >
            <el-option label="所有类型" value="all" />
            <el-option label="更新中" value="airing" />
            <el-option label="即将播出" value="upcoming" />
            <el-option label="tv" value="tv" />
            <el-option label="ova" value="ova" />
            <el-option label="剧场版" value="movie" />
            <el-option label="特别篇" value="special" />
            <el-option label="受欢迎程度" value="bypopularity" />
            <el-option label="收藏热度" value="favorite" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getAnimeList(true)">查询</el-button>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main v-loading="loading" style="padding: 0; margin: 0">
      <ul
        ref="scrollRef"
        v-infinite-scroll="getAnimeList"
        :infinite-scroll-disabled="searchValue.offset > 1000 && loading"
        class="max-h-full flex flex-row flex-wrap gap-5 justify-around items-center box-border overflow-x-hidden overflow-y-auto"
        :infinite-scroll-immediate="false"
      >
        <li
          v-for="(item, index) of animeList"
          :key="index"
          class="w-56 h-[21rem] shadow-lg border border-pink-200 rounded-lg relative"
        >
          <span class="absolute text-blue-700 inline-block top-2 left-3">{{
            index + 1
          }}</span>
          <!-- <img class="object-cover" :src="item.node.main_picture.medium" alt="" sizes="" srcset="" /> -->
        </li>
      </ul>
    </el-main>
  </el-container>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import type { RankingType, AnimeNode } from "@/api/anime/types/anime-detail";
import { reactive } from "vue";
import { getAnimeRankingListByType } from "@/api/anime/index";

defineOptions({
  name: "AnimalRanking",
});
const scrollRef = ref<HTMLElement>(null);
const loading = ref<Boolean>(false);

onMounted(() => {
  nextTick(() => {
    getAnimeList();
  });
});

// 搜索参数
interface SearchValue {
  ranking_type: RankingType;
  limit: number;
  offset: number;
  fields: string;
}
const searchValue: SearchValue = reactive({
  ranking_type: "all",
  limit: 30,
  offset: 0,
  fields:
    "id,title,main_picture,rank,popularity,num_list_users,num_scoring_users,mean,rating",
});

const animeList = ref<Array<AnimeNode>>([]);
const getAnimeList = (reset: boolean = false): void => {
  loading.value = true;
  if (reset) {
    searchValue.offset = 0;
    animeList.value = [];
  }
  getAnimeRankingListByType(searchValue)
    .then(res => {
      console.log(res);
      animeList.value.push(...res.data);
      searchValue.offset = searchValue.offset + 10;
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
