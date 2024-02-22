/* eslint-disable no-param-reassign */
import axios from 'axios';
import {
  handleConfigureAuth,
  handleNetworkError,
} from './tools';

const instance = axios.create({
  baseURL: '/api',
});

instance.interceptors.request.use((config) => {
  config = handleConfigureAuth(config);
  return config;
});

instance.interceptors.response.use(
  (response) => {
    console.log('🚀 ~ file: request.ts:19 ~ response:', response);
    return response;
  },
  (err) => {
    console.log('🚀 ~ file: request.ts:24 ~ err:', err);
    handleNetworkError(err.response.status);
    return Promise.reject(err.response);
  },
);

export const get = <T>(
  url: string,
  params?: Record<string, any>,
  options?: Record<string, any>,
): Promise<T> => new Promise((resolve, reject) => {
    instance({
      method: 'get',
      url,
      params,
      ...options,
    }).then(({ data: response }) => {
      resolve(response as T);
    })
      .catch((error) => {
        reject(error);
      });
  });

export const post = <T>(
  url: string,
  params?: Record<string, any>,
  options?: Record<string, any>,
): Promise<T> => new Promise((resolve, reject) => {
    instance({
      method: 'post',
      url,
      data: params,
      ...options,
    }).then(({ data: response }) => {
      resolve(response as T);
    })
      .catch((error) => {
        reject(error);
      });
  });
