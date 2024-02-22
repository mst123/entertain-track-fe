declare namespace API {
  import { AnimeDetail } from './anime/types/anime-detail';

  export interface MyResponseType<T = any> {
    code: number;
    message: string;
    data: T;
  }
  /** /api/anime */
  export interface Node {
    node: AnimeNode
    ranking: {
      rank: number
    }
  }
  interface CommonParams {
    limit?: number;
    offset?: number;
    fields?: string;
  }
  interface CommonResponse {
    paging: {
      next: string
      previous?: string
    }
  }
  // 根据关键字查询动漫列表
  export interface GET_ANIME_LIST_SEARCH_QUERY extends CommonParams {
    q: string;
  }
  export interface GET_ANIME_LIST_SEARCH_RES extends CommonResponse {
    data: Array<Node>;
  }
  // 动漫排名
  export type RankingType = 'all' |'airing'|'upcoming'|'tv'|'ova'|'movie'|'special'|'bypopularity'|'favorite';

  export interface GET_ANIME_LIST_RANKING_QUERY extends CommonParams {
    ranking_type: RankingType;
  }
  export interface GET_ANIME_LIST_RANKING_RES extends CommonResponse {
    data: Array<Node>;
  }
  // 根据年份和季度查询动漫
  export type SeasonType = 'winter' | 'spring' | 'summer' | 'fall' // 季度
  export interface GET_ANIME_LIST_SEASON_QUERY extends CommonParams {
    year: string;
    season: SeasonType;
    sort?: 'anime_score' | 'anime_num_list_users'
  }
  export interface GET_ANIME_LIST_SEASON_RES extends CommonResponse {
    data: Array<Node>;
  }
  // 查询动漫详情
  export interface GET_ANIME_DETAIL_QUERY extends CommonParams {
    anime_id: string;
    fields?: SeasonType;
  }
  export interface GET_ANIME_DETAIL_RES extends AnimeDetail {

  }
}
