/* eslint-disable camelcase */
import { http } from "@/utils/http";
const { VITE_HEADER_PARAMETER_NAME, VITE_CLIENT_ID } = import.meta.env;
const headers = {
  Authorization: "",
  [VITE_HEADER_PARAMETER_NAME]: VITE_CLIENT_ID
};
// 根据关键词查询动漫列表
export function getAnimeListByKeyword(options?: Record<string, any>) {
  return http.get<
    API.GET_ANIME_LIST_SEARCH_QUERY,
    API.GET_ANIME_LIST_SEARCH_RES
  >("/anime", {
    ...options,
    headers
  });
}

// 根据类型查询动漫排行
export function getAnimeRankingListByType(options?: Record<string, any>) {
  return http.get<
    API.GET_ANIME_LIST_RANKING_QUERY,
    API.GET_ANIME_LIST_RANKING_RES
  >("/anime/ranking", {
    ...options,
    headers
  });
}

// 根据年份季节查询动漫排行
export function getAnimeRankingBySeason({ year, season, ...options }) {
  return http.get<
    API.GET_ANIME_LIST_SEASON_QUERY,
    API.GET_ANIME_LIST_SEASON_RES
  >(`/anime/season/${year}/${season}`, {
    ...options,
    headers
  });
}

// 根据id查询动漫详情
export function getAnimeDetailByID({ anime_id, ...options }) {
  return http.get<API.GET_ANIME_DETAIL_QUERY, API.GET_ANIME_DETAIL_RES>(
    `/anime/${anime_id}`,
    {
      ...options,
      headers
    }
  );
}
