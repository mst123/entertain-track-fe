import { http } from "@/utils/http";
import type { AxiosRequestConfig } from "axios";
const { VITE_HEADER_PARAMETER_NAME, VITE_CLIENT_ID } = import.meta.env;
import type * as Anime from "@/api/anime/types/anime-detail";
const headers = {
  headers: {
    Authorization: "",
    [VITE_HEADER_PARAMETER_NAME]: VITE_CLIENT_ID
  }
};
// 根据关键词查询动漫列表
export function getAnimeListByKeyword(
  params: Anime.GET_ANIME_LIST_SEARCH_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<
    Anime.GET_ANIME_LIST_SEARCH_QUERY,
    Anime.GET_ANIME_LIST_SEARCH_RES
  >("/anime", params, { ...headers, ...config });
}

// 根据类型查询动漫排行
export function getAnimeRankingListByType(
  params: Anime.GET_ANIME_LIST_RANKING_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<
    Anime.GET_ANIME_LIST_RANKING_QUERY,
    Anime.GET_ANIME_LIST_RANKING_RES
  >("/anime/ranking", params, { ...headers, ...config });
}

// 根据年份季节查询动漫排行
export function getAnimeRankingBySeason(
  params: Anime.GET_ANIME_LIST_SEASON_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<
    Anime.GET_ANIME_LIST_SEASON_QUERY,
    Anime.GET_ANIME_LIST_SEASON_RES
  >(`/anime/season/${params.year}/${params.season}`, params, {
    ...headers,
    ...config
  });
}

// 根据id查询动漫详情
export function getAnimeDetailByID(
  params: Anime.GET_ANIME_DETAIL_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<Anime.GET_ANIME_DETAIL_QUERY, Anime.GET_ANIME_DETAIL_RES>(
    `/anime/${params.anime_id}`,
    params,
    {
      ...headers,
      ...config
    }
  );
}
