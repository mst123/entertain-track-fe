/* 获取玩家信息 */
// GetPlayerSummaries 请求参数类型
export interface GET_PLAYER_SUMMARIES_QUERY {
  key: string;
  steamids: string;
  format?: "json" | "xml" | "vdf";
}
export interface GET_PLAYER_SUMMARIES {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: number;
  realname: string;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
  loccountrycode: string;
  locstatecode: string;
  loccityid: number;
}
export interface GET_PLAYER_SUMMARIES_RES {
  response: {
    players: GET_PLAYER_SUMMARIES[];
  };
}

/* 获取最近游玩的游戏列表 */
// GetRecentlyPlayedGames
export interface GET_RECENTLY_GAME {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
  img_icon_url: string;
}
export interface GET_RECENTLY_GAME_LIST_QUERY {
  key: string;
  steamid: string;
  count?: number;
  format?: "json" | "xml" | "vdf";
}
export interface GET_RECENTLY_GAME_LIST_RES {
  response: {
    total_count: number;
    games: GET_RECENTLY_GAME[];
  };
}

/* 获取拥有的游戏列表 */
export interface GET_OWNED_GAMES {
  appid: number;
  name?: string;
  playtime_2weeks?: number;
  playtime_forever: number;
  img_icon_url?: string;
  img_logo_url?: string;
  has_community_visible_stats?: boolean;
}

export interface GET_OWNED_GAMES_QUERY {
  include_appinfo?: boolean;
  include_played_free_games?: boolean;
  format?: "json" | "xml" | "vdf";
  appids_filter?: number[];
}

export type GET_OWNED_GAMES_RES = GET_OWNED_GAMES[];
