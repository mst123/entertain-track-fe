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
            style="width: 240px"
            clearable
            collapse-tags
            multiple
            :loading="selectLoading"
          >
            <el-option
              v-for="item in materialOptions"
              :key="item"
              :label="item"
              :value="item"
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
      <el-table :data="menus" stripe style="width: 100%">
        <el-table-column
          show-overflow-tooltip
          align="center"
          width="200"
          prop="name"
          label="菜名"
        />
        <el-table-column align="center" prop="servings" label="份量">
          <template #default="scope"> {{ scope.row.servings }}人份 </template>
        </el-table-column>
        <el-table-column align="center" prop="ingredients" label="配料">
          <template #default="scope">
            <el-tag
              v-for="(item, index) in scope.row.ingredients"
              :key="index"
              class="mx-1"
              type="success"
            >
              {{ item.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="image" label="成品图">
          <template #default="scope">
            <el-image
              style="width: 100px; height: 100px"
              :src="scope.row.image[0]"
              :preview-src-list="scope.row.image"
              :z-index="999"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="250">
          <template #default="scope">
            <el-button
              type="primary"
              @click="$router.push(`/menu/detail/${scope.row._id}`)"
            >
              查看
            </el-button>
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
      :edit-type="editType"
      @close="closeDialog"
    />
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type {
  GET_MENU_LIST_RES,
  GET_MENU_LIST_QUERY,
} from "@/api/menu/types/index";
import { reactive } from "vue";
import {
  getMenus as getMenusAPI,
  deleteMenu as deleteMenuAPI,
  getMaterials as getMaterialsAPI,
} from "@/api/menu/index";
import AddUpdate from "./components/add-update.vue";
import { ElMessage } from "element-plus";

defineOptions({
  name: "MenuList",
});

const loading = ref<Boolean>(false);

// 搜索参数
const searchValue: GET_MENU_LIST_QUERY = reactive({
  materialList: [],
  name: "",
});

// 获取配菜
const selectLoading = ref(false);
const materialOptions = ref<string[]>([]);

onMounted(() => {
  getMaterialsAPI()
    .then(res => {
      materialOptions.value = res.data;
    })
    .catch(error => {
      console.log(error);
    });
});

const menus = ref<GET_MENU_LIST_RES[]>([]);
function getMenus() {
  loading.value = true;
  getMenusAPI(searchValue)
    .then(res => {
      menus.value = res.data;
    })
    .catch(error => {
      console.log(error);
      ElMessage.error("获取菜单列表失败");
    })
    .finally(() => {
      loading.value = false;
    });
}
getMenus();

// 新增/编辑相关
const addUpdateRef = ref<InstanceType<typeof AddUpdate> | null>(null);
const editType = ref<"add" | "edit">("add");
const addDialog = ref<Boolean>(false);

function add() {
  addUpdateRef.value?.reset();
  editType.value = "add";
  addDialog.value = true;
}

function edit(row: GET_MENU_LIST_RES) {
  addUpdateRef.value?.reset(row);
  editType.value = "edit";
  addDialog.value = true;
}

function remove(row: GET_MENU_LIST_RES) {
  deleteMenuAPI(row._id)
    .then(() => {
      ElMessage.success("删除成功");
      getMenus();
    })
    .catch(error => {
      ElMessage.error(error.message);
    });
}

function closeDialog() {
  addDialog.value = false;
  getMenus();
}
</script>
