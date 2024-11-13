<template>
  <!-- 高度是h-full-48px -->
  <div
    v-loading="isLoading"
    class="flex flex-col"
    style="height: calc(100% - 48px)"
  >
    <div class="flex-[1.5_0_0%] flex flex-wrap w-full p-5 box-border">
      <div class="flex-[3_1_600px]">
        <el-carousel
          motion-blur
          type="card"
          height="600px"
          indicator-position="outside"
        >
          <el-carousel-item
            v-for="(item, index) of [
              animeInfo.main_picture,
              ...animeInfo.pictures,
            ]"
            :key="index"
          >
            <el-image
              style="width: 600px; filter: blur(50px)"
              :src="item?.medium"
              fit="cover"
            />
          </el-carousel-item>
        </el-carousel>
      </div>

      <div class="flex-[1_1_300px] h-full p-4 box-border">
        <div
          class="h-15 flex w-full justify-center items-center text-2xl font-bold text-amber-400 mb-4"
        >
          {{ animeInfo.title }}
        </div>
        <div class="h-40 flex flex-col items-center justify-start gap-4">
          <div class="w-full flex items-center justify-center gap-2">
            评分：
            <el-rate
              :model-value="animeInfo.mean"
              :max="10"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value} 分"
            />
          </div>

          <div class="w-full flex items-center justify-center gap-2">
            评分人数（{{ animeInfo.num_scoring_users }}）
          </div>
        </div>
        <div class="min-h-7 flex flex-wrap items-center gap-4">
          <el-tag
            v-for="(item, index) of animeInfo.genres"
            :key="index"
            type="primary"
            >{{ item.name }}
          </el-tag>
        </div>
      </div>

      <div>{{ animeInfo.status }}</div>
    </div>
    <div class="flex-1 flex w-full">
      <div class="flex-1 flex flex-col">
        <div
          class="text-2xl font-bold text-center h-8 w-full flex items-center"
        >
          相关动画
        </div>
        <el-scrollbar class="w-full flex-1">
          <div class="flex gap-3 h-full">
            <template v-if="animeInfo.related_anime.length">
              <div
                v-for="item of animeInfo.related_anime"
                :key="item?.node?.id"
                class="h-full w-40 relative"
                @click="$router.push(`/anime/detail/${item?.node?.id}`)"
              >
                <el-image
                  style="height: 100%"
                  :src="item?.node?.main_picture?.medium"
                  fit="contain"
                />
                <span class="absolute bottom-1 left-1/2 -translate-x-1/2">{{
                  item?.node?.title
                }}</span>
              </div>
            </template>
            <template v-else>
              <div class="h-full w-full flex items-center justify-center">
                暂无动漫
              </div>
            </template>
          </div>
        </el-scrollbar>
      </div>

      <div class="flex-1">
        <div class="flex-1 h-full flex flex-col">
          <div
            class="text-2xl font-bold text-center h-8 w-full flex items-center"
          >
            相关漫画
          </div>
          <el-scrollbar class="w-full flex-1">
            <div class="flex gap-3 h-full">
              <template v-if="animeInfo.related_manga.length">
                <div
                  v-for="item of animeInfo.related_manga"
                  :key="item?.node?.id"
                  class="h-full w-40 relative"
                >
                  <el-image
                    style="height: 100%"
                    :src="item?.node?.main_picture?.medium"
                    fit="contain"
                  />
                  <span class="absolute bottom-1 left-1/2 -translate-x-1/2">{{
                    item?.node?.title
                  }}</span>
                </div>
              </template>
              <template v-else>
                <div class="h-full w-full flex items-center justify-center">
                  暂无漫画
                </div>
              </template>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import { getAnimeDetailByID } from "@/api/anime/index";
import { computed, reactive, ref, watch } from "vue";
import type {
  RelatedAnime,
  RelatedManga,
  Genre,
  Status,
  Picture,
} from "@/api/anime/types/anime-detail";
const route = useRoute();
const animeID = computed(() => route.params.animeID);
const isLoading = ref(false);

interface AnimeInfo {
  num_scoring_users: number;
  related_anime: Array<RelatedAnime>;
  related_manga: Array<RelatedManga>;
  status: Status | "";
  genres: Array<Genre>;
  title: string;
  mean: number;
  main_picture: Picture;
  pictures: Array<Picture>;
}

const animeInfo = reactive<AnimeInfo>({
  num_scoring_users: 0,
  mean: 0,
  genres: [],
  related_anime: [],
  related_manga: [],
  status: "",
  title: "",
  main_picture: null,
  pictures: [],
});

watch(
  animeID,
  () => {
    isLoading.value = true;
    getAnimeDetailByID({
      anime_id: animeID.value as string,
      fields:
        "id,title,main_picture,pictures,rank,popularity,num_scoring_users,mean,rating,genres,related_anime,related_manga",
    })
      .then(res => {
        for (const key of Object.keys(animeInfo)) {
          animeInfo[key] = res[key];
        }
      })
      .finally(() => {
        isLoading.value = false;
      });
  },
  {
    immediate: true,
  }
);

defineOptions({
  name: "AnimalDetail",
});
</script>
<style lang="scss" scoped>
.el-scrollbar :deep(.el-scrollbar__view) {
  height: 100%;
}
</style>
