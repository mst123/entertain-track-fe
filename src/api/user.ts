import { http } from "@/utils/http";

export type UserBase = {
  _id: string;
  username: string;
  password: string;
  email: string;
  registrationDate: string;
  userPermission: string;
  passwordChangedAt: string;
};
export type LoginResult = {
  user: UserBase;
  refresh: RefreshTokenResult;
};

export type UserResult = CommonRes<LoginResult>;

export type RefreshTokenResult = {
  refreshToken: string;
  /** `refreshToken`的过期时间（单位秒） */
  expiresIn: number;
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/api/login", { data });
};

/** 刷新token */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/api/get-refresh-token", {
    data,
  });
};
/** 登出 */
export const getLogout = () => {
  return http.request<any>("post", "/api/logout");
};
// 获取用户信息
export const getUser = () => {
  return http.request<UserBase>("get", "/api/users");
};
