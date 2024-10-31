<template>
  <el-container class="h-[calc(100vh-96px)]">
    <el-header height="50">
      <el-form :inline="true" :model="searchValue">
        <el-form-item label="书名">
          <el-input v-model="searchValue.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="searchValue.categories"
            placeholder="请选择"
            style="width: 240px"
            clearable
            collapse-tags
            multiple
          >
            <el-option
              v-for="item of tagOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchValue.status"
            placeholder="请选择"
            style="width: 240px"
          >
            <el-option label="想看" value="想看" />
            <el-option label="正在看" value="正在看" />
            <el-option label="看过" value="看过" />
            <el-option label="无" value="无" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getBooks()">查询</el-button>
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
          v-for="(item, index) of books"
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
import type { Book, GET_BOOK_LIST_QUERY } from "@/api/book/types/index";
import { reactive } from "vue";
import {
  getBooks as getBooksAPI,
  getTags as getTagsAPI,
  createBook as createBookAPI,
} from "@/api/book/index";

defineOptions({
  name: "AnimalRanking",
});
const scrollRef = ref<HTMLElement>(null);
const loading = ref<Boolean>(false);

// 搜索参数
const searchValue: GET_BOOK_LIST_QUERY = reactive({
  categories: [],
  name: "",
  status: null,
});

// 获取所有的书籍标签
const tagOptions = ref<string[]>([]);
onMounted(() => {
  getTagsAPI()
    .then(res => {
      tagOptions.value = res.data;
    })
    .catch(error => {
      console.log(error);
    });
});

const books = ref<Book[]>([]);
function getBooks() {
  getBooksAPI(searchValue)
    .then(res => {
      books.value = res.data;
    })
    .catch(error => {
      console.log(error);
    });
}
getBooks();

// 新增
const bookInfo: Book = reactive({
  priority: 0,
  categories: [], // 分类，用逗号分隔
  name: "", // 书名
  introduction: "", // 简介
  coverPhoto: "", // 封面
  isHave: false, // 是否已经拥有
  status: "无",
});

function add() {
  createBookAPI(bookInfo);
}
</script>
