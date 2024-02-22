/* eslint-disable camelcase */
import { get } from '@/utils/http/request';

// 根据关键词查询动漫列表
export function getAnimeListByKeyword(data: API.GET_ANIME_LIST_SEARCH_QUERY, options?: Record<string, any>) {
  return get<API.GET_ANIME_LIST_SEARCH_RES>('/anime', data, options);
}

// 根据类型查询动漫排行
export function getAnimeRankingListByType(data: API.GET_ANIME_LIST_RANKING_QUERY, options?: Record<string, any>) {
  return get<API.GET_ANIME_LIST_RANKING_RES>('/anime/ranking', data, options);
}

// 根据年份季节查询动漫排行
export function getAnimeRankingBySeason({ year, season, ...data }: API.GET_ANIME_LIST_SEASON_QUERY, options?: Record<string, any>) {
  console.log(data);

  return get<API.GET_ANIME_LIST_SEASON_RES>(`/anime/season/${year}/${season}`, data, options);
}

// 根据id查询动漫详情
export function getAnimeDetailByID({ anime_id, ...params }: API.GET_ANIME_DETAIL_QUERY, options?: Record<string, any>) {
  return get<API.GET_ANIME_DETAIL_RES>(`/anime/${anime_id}`, params, options);
}
