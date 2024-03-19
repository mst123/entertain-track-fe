<template>
  <ul
    ref="scrollRef"
    v-infinite-scroll="getAnimeList"
    v-loading="loading"
    class="infinite-list"
    :infinite-scroll-immediate="false"
    :style="{ height: realHeight ? realHeight + 'px' : 'calc(100% - 48px)' }"
  >
    <li
      v-for="(item, index) of animeList"
      :key="index"
      class="infinite-list-item"
    >
      <!-- <img :src="item.node.main_picture.large" alt="" sizes="" srcset="" /> -->
    </li>
  </ul>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { getAnimeRankingListByType } from "@/api/anime/index";

const scrollRef = ref<HTMLElement>(null);
const realHeight = ref<number>(null);
defineOptions({
  name: "AnimalPopular"
});

const animeList = ref<Array<API.Node>>([]);
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
    params: {
      ranking_type: "bypopularity",
      limit: pageSize.value,
      offset: offset.value,
      fields:
        "id,title,main_picture,rank,popularity,num_list_users,num_scoring_users,mean,rating"
    }
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
<style scoped>
.infinite-list {
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
  gap: 20px;
  align-self: center;
  justify-content: space-around;
  width: calc(100% - 48px);
  overflow: hidden auto;
}

.infinite-list-item {
  width: 225px;
  height: 338px;
  border: 1px saddlebrown solid;
  border-radius: 5px;
}
</style>
