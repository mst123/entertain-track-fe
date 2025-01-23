import { http } from "@/utils/http";
import type * as Bill from "./types";
import type { AxiosRequestConfig } from "axios";

// 更新
export function updateBill(
  data: Bill.UPDATE_BILL_QUERY,
  config?: AxiosRequestConfig
) {
  return http.put<Bill.UPDATE_BILL_QUERY, Bill.Bill>(
    "/api/bills/update",
    data,
    config
  );
}

// 假删除
export function removeBill(
  data: Bill.DELETE_BILL_QUERY,
  config?: AxiosRequestConfig
) {
  return http.post<Bill.DELETE_BILL_QUERY, Bill.DELETE_BILL_RES>(
    "/api/bills/fakeDelete",
    data,
    config
  );
}
// 复原
export function restoreBill(
  data: Bill.RESTORE_BILL_QUERY,
  config?: AxiosRequestConfig
) {
  return http.put<Bill.RESTORE_BILL_QUERY, Bill.RESTORE_BILL_RES>(
    "/api/bills/restore",
    data,
    config
  );
}

// 真删除
export function realRemoveBill(
  id: Bill.REAL_DELETE_BILL_QUERY,
  config?: AxiosRequestConfig
) {
  return http.delete<Bill.REAL_DELETE_BILL_QUERY, Bill.REAL_DELETE_BILL_RES>(
    "/api/bills/" + id,
    null,
    config
  );
}

// 查询单个
export function getBillById(id: string, config?: AxiosRequestConfig) {
  return http.get<null, Bill.GET_BILL_BY_ID_RES>(
    "/api/bills/" + id,
    null,
    config
  );
}

// 查询列表
export function queryBills(
  params: Bill.GET_BILL_LIST_QUERY,
  config?: AxiosRequestConfig
) {
  return http.post<Bill.GET_BILL_LIST_QUERY, Bill.GET_BILL_LIST_RES>(
    "/api/bills/query",
    params,
    config
  );
}

// 查询金额相同的多条记录
export function findBillsWithSameAmount(
  params: Bill.GET_BILLS_WITH_SAME_AMOUNT_QUERY,
  config?: AxiosRequestConfig
) {
  return http.post<
    Bill.GET_BILLS_WITH_SAME_AMOUNT_QUERY,
    Bill.GET_BILLS_WITH_SAME_AMOUNT_RES
  >("/api/bills/sameAmount", params, config);
}
// 获取所有分类
export function getAllCategories(config?: AxiosRequestConfig) {
  return http.get<null, Bill.GET_ALL_CATEGORIES_RES>(
    "/api/bills/categories",
    null,
    config
  );
}

// 上传文件
export function uploadFiles(
  files: File[],
  type: "csv" | "pdf",
  config?: AxiosRequestConfig
) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append("files", file);
  });

  return http.post<FormData, Bill.UPLOAD_FILES_RES>(
    "/api/bills/upload/" + type,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    }
  );
}

// 获取日统计数据
export function getDailyStatistics(
  params: Bill.GET_DAILY_STATISTICS_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<any, Bill.GET_DAILY_STATISTICS_RES>(
    "/api/bills/statistics/daily",
    { params },
    config
  );
}

// 获取月统计数据
export function getMonthlyStatistics(
  params: Bill.GET_MONTHLY_STATISTICS_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<any, Bill.GET_MONTHLY_STATISTICS_RES>(
    "/api/bills/statistics/monthly",
    { params },
    config
  );
}
