<template>
  <el-dialog
    v-model="centerDialogVisible"
    title="新增书籍"
    width="500"
    align-center
  >
    <el-form>
      <el-form-item label="书名">
        <el-input v-model="bookInfo.name" placeholder="请输入" />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { Book, GET_BOOK_LIST_QUERY } from "@/api/book/types/index";
import { createBook as createBookAPI } from "@/api/book/index";

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
