<template>
  <div class="p-6">
    <!-- 用户信息展示 -->
    <div
      v-if="playerInfo"
      class="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
    >
      <img
        :src="playerInfo.avatarfull"
        class="w-16 h-16 rounded-full"
        :alt="playerInfo.personaname"
      />
      <div>
        <h2 class="text-xl font-bold">{{ playerInfo.personaname }}</h2>
        <div class="text-gray-500">
          状态: {{ getPlayerState(playerInfo.personastate) }}
        </div>
        <a
          :href="playerInfo.profileurl"
          target="_blank"
          class="text-blue-500 hover:text-blue-700 text-sm"
        >
          查看 Steam 个人资料
        </a>
      </div>
    </div>

    <!-- 最近游玩的游戏列表 -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">最近游玩</h3>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          :disabled="syncing"
          @click="handleSync"
        >
          {{ syncing ? "同步中..." : "同步游戏数据" }}
        </button>
      </div>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <div
          v-for="game in recentGames"
          :key="game.appid"
          class="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <img
              :src="`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`"
              class="w-16 h-16 object-cover rounded"
              :alt="game.name"
            />
            <div class="flex-1">
              <h4 class="font-bold mb-2">{{ game.name }}</h4>
              <div class="text-sm text-gray-600">
                <div>
                  总游玩时间: {{ (game.playtime_forever / 60).toFixed(1) }}小时
                </div>
                <div v-if="game.playtime_2weeks">
                  最近两周: {{ (game.playtime_2weeks / 60).toFixed(1) }}小时
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 所有游戏列表 -->
    <div>
      <h3 class="text-lg font-bold mb-4">游戏库</h3>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <div
          v-for="game in ownedGames"
          :key="game.appid"
          class="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <img
              v-if="game.img_icon_url"
              :src="`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`"
              class="w-16 h-16 object-cover rounded"
              :alt="game.name"
            />
            <div class="flex-1">
              <h4 class="font-bold mb-2">{{ game.name }}</h4>
              <div class="text-sm text-gray-600">
                总游玩时间: {{ (game.playtime_forever / 60).toFixed(1) }}小时
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type {
  GET_PLAYER_SUMMARIES,
  GET_OWNED_GAMES,
  GET_RECENTLY_GAME,
  GET_PLAYER_SUMMARIES_RES,
  GET_RECENTLY_GAME_LIST_RES,
} from "@/api/game/types/index";

import {
  getPlayerSummaries,
  getRecentlyPlayedGames,
  getOwnedGames,
  syncGameData,
} from "@/api/game";

// 玩家信息
const playerInfo = ref<GET_PLAYER_SUMMARIES>(null);
// 最近游玩的游戏
const recentGames = ref<GET_RECENTLY_GAME[]>([]);
// 所有游戏
const ownedGames = ref<GET_OWNED_GAMES[]>([]);

// 添加同步状态
const syncing = ref(false);

// 获取玩家状态描述
function getPlayerState(state: number): string {
  const states = {
    0: "离线",
    1: "在线",
    2: "忙碌",
    3: "离开",
    4: "打盹",
    5: "想交易",
    6: "想玩游戏",
  };
  return states[state as keyof typeof states] || "未知";
}

// 添加同步处理函数
const handleSync = async () => {
  if (syncing.value) return;

  syncing.value = true;
  try {
    await syncGameData();
    // 同步完成后重新获取游戏列表
    const ownedRes = await getOwnedGames();
    ownedGames.value = ownedRes.data;
    ElMessage.success("游戏数据同步成功");
  } catch (error) {
    console.error("Failed to sync game data:", error);
    ElMessage.error("游戏数据同步失败");
  } finally {
    syncing.value = false;
  }
};

// 初始化数据
onMounted(async () => {
  try {
    const [playerRes, recentRes, ownedRes] = await Promise.all([
      getPlayerSummaries(),
      getRecentlyPlayedGames(),
      getOwnedGames(),
    ]);
    playerInfo.value = (
      playerRes as unknown as GET_PLAYER_SUMMARIES_RES
    ).response.players[0];
    recentGames.value = (
      recentRes as unknown as GET_RECENTLY_GAME_LIST_RES
    ).response.games;
    ownedGames.value = ownedRes.data;
  } catch (error) {
    console.error("Failed to fetch game data:", error);
  }
});
</script>

<style scoped>
.grid {
  --tw-shadow-color: rgb(0 0 0 / 5%);
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color);
}

.hover\:shadow-md:hover {
  --tw-shadow-color: rgb(0 0 0 / 10%);
  --tw-shadow: 0 4px 6px -1px var(--tw-shadow-color);
}
</style>
