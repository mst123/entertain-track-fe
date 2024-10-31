<template>
  <div v-loading="isLoading" class="h-full w-full flex">
    <div v-if="!isLoading" class="flex-[1.5_0_0%] h-full p-5">
      <div
        class="h-15 flex justify-center items-center text-2xl font-bold text-amber-400 mb-4"
      >
        {{ animeInfo.title }}
      </div>
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
            style="width: 600px; height: 600px"
            :src="item.large"
            fit="cover"
          />
        </el-carousel-item>
      </el-carousel>
      <div class="h-8 flex items-center justify-start gap-4">
        评分：
        <el-rate
          :model-value="animeInfo.mean"
          :max="10"
          disabled
          show-score
          text-color="#ff9900"
          score-template="{value} 分"
        />
        评分人数（{{ animeInfo.num_scoring_users }}）
      </div>
      <div class="min-h-7 flex flex-wrap items-center gap-3">
        <el-tag
          v-for="(item, index) of animeInfo.genres"
          :key="index"
          type="primary"
          >item.name</el-tag
        >
      </div>
      <div>animeInfo.status</div>
    </div>
    <div class="flex-1 h-full">
      <div>相关动画</div>
      <el-carousel type="card" height="400" indicator-position="outside">
        <el-carousel-item v-for="item in 4" :key="item">
          <div>
            <el-image style="width: 500px; height: 400px" src="" fit="cover" />
            <span>title</span>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div>相关漫画</div>
      <el-carousel type="card" height="400" indicator-position="outside">
        <el-carousel-item v-for="item in 4" :key="item">
          <div>
            <el-image style="width: 500px; height: 400px" src="" fit="cover" />
            <span>title</span>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import { getAnimeDetailByID } from "@/api/anime/index";
import { reactive, ref } from "vue";
import type {
  RelatedAnime,
  RelatedManga,
  Genre,
  Status,
  Picture,
} from "@/api/anime/types/anime-detail";
const route = useRoute();
const animeID = route.params.animeID as string;
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
const animeInfo: AnimeInfo = reactive({
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
if (animeID) {
  isLoading.value = true;
  getAnimeDetailByID({
    anime_id: animeID,
    fields:
      "id,title,main_picture,pictures,rank,popularity,num_scoring_users,mean,rating,genres,related_anime,related_manga",
  })
    .then(res => {
      Object.assign(animeInfo, res);
    })
    .finally(() => {
      isLoading.value = false;
    });
}

defineOptions({
  name: "AnimalDetail",
});
</script>
