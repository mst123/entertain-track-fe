import { http } from "@/utils/http";
import type { AxiosRequestConfig } from "axios";
import type * as Game from "@/api/game/types/index";
const { VITE_STEAM_KEY, VITE_STEAM_ID }: Record<string, string> = import.meta
  .env;

const commonParams = {
  key: VITE_STEAM_KEY,
  steamid: VITE_STEAM_ID,
};
/* 获取最近游玩的游戏列表 */
export function getRecentlyPlayedGames(
  data?: Game.GET_RECENTLY_GAME_LIST_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<
    Game.GET_RECENTLY_GAME_LIST_QUERY,
    Game.GET_RECENTLY_GAME_LIST_RES
  >(
    "/steampowered/IPlayerService/GetRecentlyPlayedGames/v0001/",
    { ...data, ...commonParams },
    config
  );
}

/* 获取拥有的游戏列表 自己的接口 */
export function getOwnedGames(
  data?: Game.GET_OWNED_GAMES_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<Game.GET_OWNED_GAMES_QUERY, Game.GET_OWNED_GAMES_RES>(
    "/api/games",
    data,
    config
  );
}

/* 获取玩家信息 */
export function getPlayerSummaries(
  data?: Game.GET_PLAYER_SUMMARIES_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<
    Game.GET_PLAYER_SUMMARIES_QUERY,
    Game.GET_PLAYER_SUMMARIES_RES
  >(
    "/steampowered/ISteamUser/GetPlayerSummaries/v0002/",
    // steam接口有点问题 这里是 steamids 多一个s
    {
      ...data,
      key: VITE_STEAM_KEY,
      steamids: VITE_STEAM_ID,
    },
    config
  );
}

/* 同步游戏数据 */
export function syncGameData(data?: null, config?: AxiosRequestConfig) {
  return http.get<null, null>("/api/games/sync", data, config);
}
