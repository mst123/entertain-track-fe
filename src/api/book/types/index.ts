export interface Book {
  priority?: number; // 想看才会起效的优先级 默认 0
  categories: Array<String>; // 分类，用逗号分隔
  name: string; // 书名
  introduction: string; // 简介
  coverPhoto: string; // 封面
  isHave?: boolean; // 是否已经拥有
  status?: "想看" | "正在看" | "看过" | "无"; // 状态
}
// 创建
export type CREATE_BOOK_QUERY = Book;

export interface CREATE_BOOK_RES extends Book {
  _id: string;
}

// 获取
export interface GET_BOOK_LIST_QUERY {
  status?: "想看" | "正在看" | "看过" | "无";
  name?: string;
  categories?: Array<String>;
}

export type GET_BOOK_LIST_RES = Book;

// 更新
export interface UPDATE_BOOK_QUERY extends Book {
  _id: string; // 书的id
}

export type UPDATE_BOOK_RES = UPDATE_BOOK_QUERY;

// 删除
export interface DELETE_BOOK_QUERY {
  _id: string; // 书的id
}

export type DELETE_BOOK_RES = Book;

// 标签
export type GET_TAGS_RES = string[];
