import { defineStore } from "pinia";
import { store } from "@/store";
import type { userType } from "./types";
import { routerArrays } from "@/layout/types";
import { router, resetRouter } from "@/router";
import { storageLocal } from "@pureadmin/utils";
import { getLogin, refreshTokenApi, getLogout } from "@/api/user";
import type { UserResult } from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 刷新用的token
    refreshToken:
      storageLocal().getItem<DataInfo<number>>(userKey)?.refreshToken ?? ""
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 登入 */
    async loginByEmail(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(res => {
            if (res.status === "success") {
              const data = res.data;
              setToken({
                ...data.refresh,
                username: data.user.username,
                roles: [data.user.userPermission]
              });
              resolve(res);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    async logOut() {
      return new Promise<void>((resolve, reject) => {
        getLogout()
          .then(res => {
            if (res.status === "success") {
              this.username = "";
              this.roles = [];
              removeToken();
              useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
              resetRouter();
              router.push("/login");
              resolve();
            } else {
              reject(res.message);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<void>((resolve, reject) => {
        refreshTokenApi(data)
          .then(res => {
            if (res) {
              resolve();
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
