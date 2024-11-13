import { http } from "@/utils/http";
import type { AxiosRequestConfig } from "axios";
import type * as Book from "@/api/book/types/index";

// 增加
export function createBook(
  data: Book.CREATE_BOOK_QUERY,
  config?: AxiosRequestConfig
) {
  return http.post<Book.CREATE_BOOK_QUERY, Book.CREATE_BOOK_RES>(
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
  console.log(data);

  const id = data._id;
  return http.put<Book.UPDATE_BOOK_QUERY, Book.UPDATE_BOOK_RES>(
    "/api/books/" + id,
    data,
    config
  );
}

// 获取全部
export function getBooks(
  data: Book.GET_BOOK_LIST_QUERY,
  config?: AxiosRequestConfig
) {
  return http.post<Book.GET_BOOK_LIST_QUERY, Book.GET_BOOK_LIST_RES[]>(
    "/api/books/query",
    data,
    config
  );
}

// 删除
export function deleteBook(
  data: Book.DELETE_BOOK_QUERY,
  config?: AxiosRequestConfig
) {
  return http.delete<Book.DELETE_BOOK_QUERY, Book.DELETE_BOOK_RES>(
    "/api/books/" + data,
    data,
    config
  );
}

// 获取全部标签
export function getTags(config?: AxiosRequestConfig) {
  return http.get<{}, Book.GET_TAGS_RES>("/api/books/tags", config);
}
