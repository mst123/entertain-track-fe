import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer,
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig,
} from "./types.d";
import { stringify } from "qs";
import NProgress from "../progress";
import { getToken } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";

const whiteList = ["/refresh-token", "/login"];

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 请求超时时间
  timeout: 20000,
  baseURL: "/",
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** token过期后，暂存待执行的请求 */
  private static requests = [];

  /** 防止重复刷新token */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前Axios实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise((resolve, reject) => {
      PureHttp.requests.push(() => {
        PureHttp.axiosInstance
          .request(config)
          .then((response: PureHttpResponse) => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    // 这里应该只加了一个请求拦截器
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        // 开启进度条动画
        NProgress.start();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        // 这个应该是自定义的回调函数
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        // NOTICE: 默认的回调参数 会被上方自定义的回调参数覆盖
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        // 关闭进度条动画
        NProgress.done();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: PureHttpError) => {
        const { config, response } = error;
        // token过期
        if (response.status === 401 && !whiteList.includes(config.url)) {
          if ((response as PureHttpResponse).data.message === "token已过期") {
            // TODO
            return "refreshToken已经过期了";
          }
          // TODO any
          return new Promise<any>(resolve => {
            const data = getToken();
            debugger;
            // 已经存在请求refreshToken的请求了
            if (!PureHttp.isRefreshing) {
              PureHttp.isRefreshing = true;
              // token过期刷新 获取新的accessToken（后端设置cookie的方式）
              useUserStoreHook()
                .handRefreshToken({ refreshToken: data.refreshToken })
                .then(() => {
                  // NOTICE  数组中存在N个Promise 每一个Promise都有自己独一无二的resolve 没有重复
                  PureHttp.requests.forEach(cb => cb(config));
                  PureHttp.requests = [];
                })
                .finally(() => {
                  PureHttp.isRefreshing = false;
                });
            }
            // 放在待重新请求的请求池
            resolve(PureHttp.retryOriginalRequest(config));
          });
        }
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        NProgress.done();
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      }
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    // 自定义的config 覆盖
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    // DOUBT 看不懂这个as
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    } as PureHttpRequestConfig;

    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  public post<T, P>(
    url: string,
    data: T,
    config?: AxiosRequestConfig
  ): Promise<P> {
    return this.request<P>("post", url, { data, ...(config || {}) });
  }
  public put<T, P>(
    url: string,
    data: T,
    config?: AxiosRequestConfig
  ): Promise<P> {
    return this.request<P>("put", url, { data, ...(config || {}) });
  }
  public get<T, P>(
    url: string,
    params: T,
    config?: AxiosRequestConfig
  ): Promise<P> {
    return this.request<P>("get", url, { params, ...(config || {}) });
  }

  public delete<T, P>(
    url: string,
    params: T,
    config?: AxiosRequestConfig
  ): Promise<P> {
    return this.request<P>("delete", url, { params, ...(config || {}) });
  }
}

export const http = new PureHttp();
