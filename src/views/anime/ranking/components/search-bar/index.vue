<template>
  <el-form :inline="true" class="form-search absolute left-5 top-3">
    <el-form-item label="类型">
      <el-select v-model="rankingType" placeholder="Activity zone">
        <el-option value="all" label="Top Anime Series" />
        <el-option value="airing" label="Top Airing Anime" />
        <el-option value="upcoming" label="Top Upcoming Anime" />
        <el-option value="tv" label="Top Anime TV Series" />
        <el-option value="ova" label="Top Anime OVA Series" />
        <el-option value="movie" label="Top Anime Movies" />
        <el-option value="special" label="Top Anime Specials" />
        <el-option value="bypopularity" label="Top Anime by Popularity" />
        <el-option value="favorite" label="Top Favorited Anime" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSearch">Query</el-button>
    </el-form-item>
  </el-form>
</template>
<script name="search-bar" setup lang="ts">
const rankingType: Ref<API.RankingType> = ref('all');
const emit = defineEmits(['search']);

function onSearch(): void {
  emit('search', rankingType.value);
}
</script>
<style scoped lang='scss'>
</style>
