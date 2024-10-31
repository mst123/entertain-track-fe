<template>
  <el-container class="h-[calc(100vh-96px)]">
    <el-header height="50">
      <el-form :inline="true" :model="searchValue">
        <el-form-item label="菜谱名称">
          <el-input v-model="searchValue.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="所用配菜">
          <el-select
            v-model="searchValue.materialList"
            multiple
            filterable
            remote
            :reserve-keyword="false"
            placeholder="输入配菜的名字"
            remote-show-suffix
            :remote-method="remoteMethod"
            :loading="selectLoading"
          >
            <el-option
              v-for="item in materialOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getMenus()">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="add()">新增</el-button>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main v-loading="loading" style="padding: 0; margin: 0">
      <ul
        ref="scrollRef"
        class="max-h-full flex flex-row flex-wrap gap-5 justify-around items-center box-border overflow-x-hidden overflow-y-auto"
      >
        <li
          v-for="(item, index) of menus"
          :key="index"
          class="w-56 h-[21rem] shadow-lg overflow-hidden border border-pink-200 rounded-lg relative"
        >
          <span class="absolute text-blue-700 inline-block top-2 left-3">{{
            index + 1
          }}</span>
          <img
            class="object-cover"
            :src="item.coverPhoto"
            alt=""
            sizes=""
            srcset=""
          />
        </li>
      </ul>
    </el-main>
  </el-container>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import type { Menu, GET_MENU_LIST_QUERY } from "@/api/menu/types/index";
import { reactive } from "vue";
import {
  getMenus as getMenusAPI,
  createMenu as createMenuAPI,
} from "@/api/menu/index";

defineOptions({
  name: "MenuList",
});
const scrollRef = ref<HTMLElement>(null);
const loading = ref<Boolean>(false);

// 搜索参数
const searchValue: GET_MENU_LIST_QUERY = reactive({
  materialList: [],
  name: "",
});

// 配菜多选逻辑
const selectLoading = ref(false);
const materialOptions = ref<string[]>([]);
function remoteMethod() {}

const menus = ref<Menu[]>([]);
function getMenus() {
  getMenusAPI(searchValue)
    .then(res => {
      menus.value = res.data;
    })
    .catch(error => {
      console.log(error);
    });
}
getMenus();

// 新增
const menuInfo: Menu = reactive({
  name: "",
  ingredients: [], // 配菜列表
  servings: 0, // 几人份
  preparation: "", // 配菜加工
  notes: "", // 注意事项
  steps: [], // 步骤，时间轴体现，同一个可以有多个操作
  image: [], // 做成后的图片
  reviews: [], // 评价列表
  improvements: "", // 后续改进的部分
});

function add() {
  createMenuAPI(menuInfo);
}
</script>
