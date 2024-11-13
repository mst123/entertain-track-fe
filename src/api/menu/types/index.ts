interface Ingredient {
  name: string; // 配菜名称
  amount: string; // 配菜数量
}

// 步骤的接口
interface Step {
  description: string; // 步骤描述
  duration: number; // 持续时间，以分钟为单位
  actions: string[]; // 操作列表
}

// 评价的接口
interface Review {
  reviewer: string; // 评价人
  rating: number; // 评分
  comment: string; // 评论内容
}

// 菜单的接口
export interface Menu {
  name: string; // 菜单名称
  ingredients: Ingredient[]; // 配菜列表
  servings: number; // 几人份
  preparation: string; // 配菜加工
  notes: string; // 注意事项
  steps: Step[]; // 步骤，时间轴体现，同一个可以有多个操作
  image: string[]; // 做成后的图片
  reviews?: Review[]; // 评价列表
  improvements?: string; // 后续改进的部分
}

// 创建
export type CREATE_MENU_QUERY = Menu;
export interface CREATE_MENU_RES extends Menu {
  _id: string;
}

// 获取
export interface GET_MENU_LIST_QUERY {
  id?: string;
  name?: string;
  // 素材名称
  materialList?: Array<String>;
}

export interface GET_MENU_LIST_RES extends Menu {
  _id: string;
}

// 更新
export interface UPDATE_MENU_QUERY extends Menu {
  _id: string;
}

export type UPDATE_MENU_RES = UPDATE_MENU_QUERY;

// 删除
export interface DELETE_MENU_RES {
  _id: string; // 菜的id
}

export type DELETE_MENU_QUERY = string;

// 标签 Materials
export type GET_MATERIALS_RES = string[];
