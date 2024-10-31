import { http } from "@/utils/http";
import type { AxiosRequestConfig } from "axios";
import type * as Book from "@/api/book/types/index";

// 增加
export function createBook(
  data: Book.CREATE_BOOK_QUERY,
  config?: AxiosRequestConfig
) {
  return http.post<Book.CREATE_BOOK_QUERY, CommonRes<Book.CREATE_BOOK_RES>>(
    "/api/books",
    data,
    config
  );
}

// 更新
export function updateBook(
  data: Book.UPDATE_BOOK_QUERY,
  config?: AxiosRequestConfig
) {
  return http.put<Book.UPDATE_BOOK_QUERY, CommonRes<Book.UPDATE_BOOK_RES>>(
    "/api/books",
    data,
    config
  );
}

// 获取全部
export function getBooks(
  data: Book.GET_BOOK_LIST_QUERY,
  config?: AxiosRequestConfig
) {
  return http.get<
    Book.GET_BOOK_LIST_QUERY,
    CommonRes<Book.GET_BOOK_LIST_RES[]>
  >("/api/books", data, config);
}

// 删除
export function deleteNewBook(
  data: Book.DELETE_BOOK_QUERY,
  config?: AxiosRequestConfig
) {
  return http.delete<Book.DELETE_BOOK_QUERY, CommonRes<Book.DELETE_BOOK_RES>>(
    "/api/books",
    data,
    config
  );
}

// 获取全部标签
export function getTags(config?: AxiosRequestConfig) {
  return http.get<{}, CommonRes<Book.GET_TAGS_RES>>("/api/books/tags", config);
}
