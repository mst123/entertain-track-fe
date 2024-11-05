<template>
  <el-container class="h-[calc(100vh-96px)]">
    <el-header height="50">
      <el-form :inline="true">
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
      <el-table :data="books" stripe style="width: 100%">
        <el-table-column
          show-overflow-tooltip
          align="center"
          width="300"
          prop="name"
          label="名字"
        />
        <el-table-column align="center" prop="categories" label="分类" />
        <el-table-column align="center" prop="coverPhoto" label="封面">
          <template #default="scope">
            <el-image
              style="width: 100px; height: 100px"
              :src="scope.row.coverPhoto"
              fit="contain"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" prop="isHave" label="是否拥有">
          <template #default="scope">
            <el-tag :type="scope.row.isHave ? 'success' : 'danger'">
              {{ scope.row.isHave ? "拥有" : "未拥有" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="status" label="状态" />
        <el-table-column align="center" label="操作">
          <template #default="scope">
            <!-- <el-button
              type="primary"
              @click="$router.push(`/book/detail/${scope.row._id}`)"
            >
              查看
            </el-button> -->
            <el-button type="primary" @click="edit(scope.row)">
              编辑
            </el-button>
            <el-popconfirm
              icon-color="#626AEF"
              title="确定要删除吗?"
              @confirm="remove(scope.row)"
            >
              <template #reference>
                <el-button type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <AddUpdate
      ref="addUpdateRef"
      v-model="addDialog"
      :tag-options="tagOptions"
      :editType="editType"
      @close="closeDIalog"
    />
  </el-container>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type {
  CREATE_BOOK_RES,
  GET_BOOK_LIST_QUERY,
} from "@/api/book/types/index";
import { reactive } from "vue";
import {
  getBooks as getBooksAPI,
  getTags as getTagsAPI,
  deleteBook as deleteBookAPI,
} from "@/api/book/index";
import AddUpdate from "./components/add-update.vue";
import { ElMessage } from "element-plus";

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

// 查询书籍
const books = ref<CREATE_BOOK_RES[]>([]);
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
const addUpdateRef = ref<InstanceType<typeof AddUpdate> | null>(null);
const editType = ref<"add" | "edit">("add");
const addDialog = ref<Boolean>(false);
function add() {
  addUpdateRef.value?.reset();
  editType.value = "add";
  addDialog.value = true;
}

// 编辑
function edit(row: CREATE_BOOK_RES) {
  addUpdateRef.value?.reset(row);
  editType.value = "edit";
  addDialog.value = true;
}
// 删除
function remove(row: CREATE_BOOK_RES) {
  deleteBookAPI(row._id)
    .then(() => {
      ElMessage.success("删除成功");
    })
    .catch(error => {
      ElMessage.error(error.message);
    })
    .finally(() => {
      getBooks();
    });
}

// 关闭弹窗
function closeDIalog() {
  addDialog.value = false;
  getBooks();
}
</script>
