/* eslint-disable no-param-reassign */
import type { InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import { HEADER_PARAMETER_NAME, CLIENT_ID } from '@/const/index';

export const handleConfigureAuth = (config: InternalAxiosRequestConfig) => {
  config.headers[HEADER_PARAMETER_NAME] = CLIENT_ID;
  return config;
};

export const handleNetworkError = (errStatus?: number): void => {
  const networkErrMap: any = {
    400: '无效参数',
    401: '未授权，令牌无效',
    403: '拒绝访问',
    404: '请求错误，未找到该资源',
    405: '请求方法未允许',
    408: '请求超时',
    500: '服务器端出错',
    501: '网络未实现',
    502: '网络错误',
    503: '服务不可用',
    504: '网络超时',
    505: 'http版本不支持该请求',
  };
  if (errStatus) {
    ElMessage.error(networkErrMap[errStatus] ?? `其他连接错误 --${errStatus}`);
    return;
  }

  ElMessage.error('无法连接到服务器！');
};
