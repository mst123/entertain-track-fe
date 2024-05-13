<template>
  <ul
    ref="scrollRef"
    v-infinite-scroll="getAnimeList"
    v-loading="loading"
    class="w-[calc(100% - 48px)] flex flex-row flex-wrap gap-5 justify-around items-center box-border overflow-x-hidden overflow-y-auto"
    :infinite-scroll-immediate="false"
    :style="{ height: realHeight ? realHeight + 'px' : 'calc(100% - 48px)' }"
  >
    <li
      v-for="(item, index) of animeList"
      :key="index"
      class="w-56 h-[21rem] shadow-lg border border-pink-200 rounded-lg"
    >
      <!-- <img :src="item.node.main_picture.medium" alt="" sizes="" srcset="" /> -->
    </li>
  </ul>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { getAnimeRankingListByType } from "@/api/anime/index";
import { type AnimeNode } from "@/api/anime/types/anime-detail";

const scrollRef = ref<HTMLElement>(null);
const realHeight = ref<number>(null);
defineOptions({
  name: "AnimalPopular"
});

const animeList = ref<Array<AnimeNode>>([]);
const pageSize = ref(30);
const offset = ref(0);
const loading = ref<Boolean>(false);
onMounted(() => {
  realHeight.value = scrollRef.value.offsetHeight - 48;
  nextTick(() => {
    getAnimeList();
  });
});
const getAnimeList = () => {
  if (offset.value > 1000) return;
  loading.value = true;
  offset.value = offset.value + 10;

  getAnimeRankingListByType({
    ranking_type: "bypopularity",
    limit: pageSize.value,
    offset: offset.value,
    fields:
      "id,title,main_picture,rank,popularity,num_list_users,num_scoring_users,mean,rating"
  })
    .then(res => {
      console.log(res);
      animeList.value = [...animeList.value, ...res.data];
      offset.value = offset.value + 10;
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
