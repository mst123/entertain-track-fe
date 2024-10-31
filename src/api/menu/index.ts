import { http } from "@/utils/http";
import type { AxiosRequestConfig } from "axios";
import type * as Menu from "@/api/menu/types/index";

// 增加
export function createMenu(
  data: Menu.CREATE_MENU_QUERY,
  config?: AxiosRequestConfig
) {
  return http.post<Menu.CREATE_MENU_QUERY, CommonRes<Menu.CREATE_MENU_RES>>(
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
  return http.put<Menu.UPDATE_MENU_QUERY, CommonRes<Menu.UPDATE_MENU_RES>>(
    "/api/menus",
    data,
    config
  );
}

// 获取全部
export function getMenus(
  data: Menu.GET_MENU_LIST_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<
    Menu.GET_MENU_LIST_QUERY,
    CommonRes<Menu.GET_MENU_LIST_RES[]>
  >("/api/menus", data, config);
}

// 删除
export function deleteMenu(
  data: Menu.DELETE_MENU_QUERY,
  config?: AxiosRequestConfig
) {
  return http.delete<Menu.DELETE_MENU_QUERY, CommonRes<Menu.DELETE_MENU_RES>>(
    "/api/menus",
    data,
    config
  );
}