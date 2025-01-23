// import type { AxiosRequestConfig } from "axios"; // 移除未使用的导入

export interface BillBase {
  amount: number;
  category: string;
  date: string;
  description: string;
  type: "支出" | "收入";
  platform: "alipay" | "wechat" | "jd" | "unknown";
  merchant: string;
  currency: "CNY" | "USD";
  remark?: string;
  tag?: string;
}

export interface Bill extends BillBase {
  _id: string;
}
// 查询
export interface BillQuery {
  startDate?: string;
  endDate?: string;
  isDeleted?: boolean;
  page: number;
  pageSize: number;
  minAmount?: number;
  maxAmount?: number;
  type?: "支出" | "收入";
  category?: string;
  merchant?: string;
  platform?: "alipay" | "wechat" | "jd" | "unknown";
  tag?: string;
}

export interface CategoryStatistics {
  amount: number;
  count: number;
}

// 每日统计
export interface DailyStatistics {
  date: string;
  totalExpense: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
  categories: {
    [key: string]: CategoryStatistics;
  };
}

// 每月统计
export interface MonthlyStatistics {
  month: string;
  totalExpense: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
  categories: {
    [key: string]: CategoryStatistics;
  };
  merchant?: string;
}

// 单个查询
export type GET_BILL_BY_ID_QUERY = string;
export type GET_BILL_BY_ID_RES = Bill;

// 列表查询的请求
export type GET_BILL_LIST_QUERY = BillQuery;
export type GET_BILL_LIST_RES = {
  bills: Bill[];
  total: number;
};

// 查询金额相同的多条记录
export type GET_BILLS_WITH_SAME_AMOUNT_QUERY = {
  page: number;
  pageSize: number;
};
export type GET_BILLS_WITH_SAME_AMOUNT_RES = {
  bills: Bill[];
  total: number;
};

// 获取所有分类
export type GET_ALL_CATEGORIES_RES = string[];

// 更新的接口
export type UPDATE_BILL_QUERY = {
  ids?: string[];
  id?: string;
  update: Partial<BillBase>;
};
export type UPDATE_BILL_RES = Bill;

// 假删除的接口
export type DELETE_BILL_QUERY = {
  ids?: string[];
  id?: string;
};
export type DELETE_BILL_RES = string;

// 真删除的接口
export type REAL_DELETE_BILL_QUERY = string;
export type REAL_DELETE_BILL_RES = string;

// 恢复的接口
export type RESTORE_BILL_QUERY = {
  ids?: string[];
  id?: string;
};
export type RESTORE_BILL_RES = Bill;

// 上传文件;
export type UPLOAD_FILES_QUERY = File[];
export interface UPLOAD_FILES_RES {
  success: number;
  failed: number;
  errors: any[];
  insertedCount: number;
  updatedCount: number;
}

// 日统计查询参数
export interface GET_DAILY_STATISTICS_QUERY {
  startDate: string;
  endDate: string;
  category?: string;
  type?: "支出" | "收入";
  minAmount?: number;
  maxAmount?: number;
}

// 月统计查询参数
export interface GET_MONTHLY_STATISTICS_QUERY {
  year: number;
  month?: number | null;
  category?: string;
  type?: "支出" | "收入";
  minAmount?: number;
  maxAmount?: number;
}

// 统计响应
export type GET_DAILY_STATISTICS_RES = DailyStatistics[];
export type GET_MONTHLY_STATISTICS_RES = MonthlyStatistics[];
