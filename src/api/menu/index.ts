import { http } from "@/utils/http";
import type { AxiosRequestConfig } from "axios";
import type * as Menu from "@/api/menu/types/index";

// 增加
export function createMenu(
  data: Menu.CREATE_MENU_QUERY,
  config?: AxiosRequestConfig
) {
  return http.post<Menu.CREATE_MENU_QUERY, Menu.CREATE_MENU_RES>(
    "/api/menus",
    data,
    config
  );
}

// 更新
export function updateMenu(
  data: Menu.UPDATE_MENU_QUERY,
  config?: AxiosRequestConfig
) {
  return http.put<Menu.UPDATE_MENU_QUERY, Menu.UPDATE_MENU_RES>(
    "/api/menus/" + data._id,
    data,
    config
  );
}

// 查询菜谱
export function getMenus(
  data: Menu.GET_MENU_LIST_QUERY,
  config?: AxiosRequestConfig
) {
  return http.post<Menu.GET_MENU_LIST_QUERY, Menu.GET_MENU_LIST_RES[]>(
    "/api/menus/query",
    data,
    config
  );
}

export function getMenuById(id: string, config?: AxiosRequestConfig) {
  return http.get<null, Menu.GET_MENU_LIST_RES>(
    "/api/menus/" + id,
    null,
    config
  );
}

// 删除
export function deleteMenu(
  data: Menu.DELETE_MENU_QUERY,
  config?: AxiosRequestConfig
) {
  return http.delete<Menu.DELETE_MENU_QUERY, Menu.DELETE_MENU_RES>(
    "/api/menus/" + data,
    data,
    config
  );
}

// 获取全部配菜
export function getMaterials(config?: AxiosRequestConfig) {
  return http.get<{}, Menu.GET_MATERIALS_RES>("/api/menus/materials", config);
}
