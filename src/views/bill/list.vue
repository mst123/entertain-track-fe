<template>
  <div v-loading="loading" class="p-4 h-[calc(100vh-97px)] flex flex-col">
    <!-- 搜索表单 -->
    <div
      v-if="!findSameMode"
      class="min-h-12 bg-white shadow-sm rounded-md p-4"
    >
      <QuerySearch
        v-model:queryForm="queryForm"
        :categories="categories"
        @search="getTableData"
      />
    </div>

    <!-- 展示区域 -->
    <div class="flex flex-col flex-1 min-h-0">
      <!-- 操作栏 -->
      <ActionBar
        v-model:findSameMode="findSameMode"
        v-model:loading="loading"
        @batch-update="handleBatchUpdate"
        @batch-delete="handleBatchDelete"
        @refresh="getTableData"
      />

      <!-- 表格 -->
      <BillTable
        v-model:current-page="page"
        v-model:page-size="pageSize"
        v-model:total="total"
        v-model:current-selection="currentSelection"
        :bill-list="billList"
        :categories="categories"
        :show-checkbox="true"
        :show-category="true"
        @paginationChange="paginationChange"
        @edit="openEditDialog"
        @refresh="getTableData"
      />
    </div>

    <!-- 对话框组件 -->
    <BillEdit
      v-model="editDialogVisible"
      :categories="categories"
      :editForm="editForm"
      @close="editDialogVisible = false"
      @refresh="getTableData"
    />

    <BatchUpdate
      v-model="batchUpdateDialogVisible"
      :categories="categories"
      :currentSelection="currentSelection"
      @close="batchUpdateDialogVisible = false"
      @refresh="getTableData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { Bill } from "@/api/bill/types";
import type { QueryForm } from "./types";
import BillEdit from "./components/bill-edit.vue";
import BatchUpdate from "./components/batch-update.vue";
import QuerySearch from "./components/query-search.vue";
import BillTable from "./components/bill-table.vue";
import ActionBar from "./components/action-bar.vue";

import { usePagination } from "@/hooks/use-pagination";
import {
  queryBills,
  getAllCategories,
  findBillsWithSameAmount,
  removeBill,
} from "@/api/bill/index";

// 分页
const { page, pageSize, total, paginationChange } = usePagination(getTableData);

// 搜索条件
const queryForm = ref<QueryForm>({
  dateRange: ["", ""],
  merchant: "",
  type: null,
  category: "",
  platform: null,
  minAmount: undefined,
  maxAmount: undefined,
});

// 获取分类
const categories = ref<string[]>([]);
async function fetchCategories() {
  try {
    const response = await getAllCategories();
    categories.value = response.data;
  } catch (error) {
    ElMessage.error("获取分类数据失败");
  }
}

// TABLE数据
const billList = ref<Bill[]>([]);

// 文件上传和table查询状态
const loading = ref(false);

// 搜索table数据
async function handleSearch() {
  loading.value = true;
  try {
    const response = await queryBills({
      startDate: queryForm.value.dateRange?.[0],
      endDate: queryForm.value.dateRange?.[1],
      merchant: queryForm.value.merchant,
      type: queryForm.value.type,
      category: queryForm.value.category,
      platform: queryForm.value.platform,
      minAmount: queryForm.value.minAmount,
      maxAmount: queryForm.value.maxAmount,
      page: page.value,
      pageSize: pageSize.value,
    });
    billList.value = response.data.bills;
    total.value = response.data.total;
  } catch (error) {
    ElMessage.error("获取账单数据失败");
  } finally {
    loading.value = false;
  }
}

// 编辑对话框相关
const editDialogVisible = ref(false);
const editForm = ref<Partial<Bill>>({});

const openEditDialog = (row: Bill) => {
  editForm.value = row;
  editDialogVisible.value = true;
};

// 多选功能
const currentSelection = ref<Bill[]>([]);

// 批量更新 弹窗 仅支持更新分类
const batchUpdateDialogVisible = ref(false);
const handleBatchUpdate = () => {
  batchUpdateDialogVisible.value = true;
};

// 批量删除
const handleBatchDelete = async () => {
  // 是否确认删除，删除可在回收站复原
  ElMessageBox.confirm("确定要删除吗，删除可在回收站复原?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    console.log(currentSelection.value);
    removeBill({
      ids: currentSelection.value.map(item => item._id),
    })
      .then(res => {
        ElMessage.success("删除成功");
        getTableData();
      })
      .catch(error => {
        console.log(error);
        ElMessage.error("删除失败");
      });
  });
};

// 查重模式和普通模式切换
const findSameMode = ref(false);

// 查询金额相同的多条记录
function findBillsWSA() {
  findBillsWithSameAmount({
    page: page.value,
    pageSize: pageSize.value,
  })
    .then(res => {
      console.log(res);
      billList.value = res.data.bills;
      total.value = res.data.total;
    })
    .catch(error => {
      console.log(error);
    });
}

watch(
  findSameMode,
  () => {
    page.value = 1;
    getTableData();
  },
  {
    immediate: true,
  }
);
function getTableData() {
  if (findSameMode.value) {
    findBillsWSA();
  } else {
    handleSearch();
  }
}
// 初始化 获取标签及table数据
fetchCategories();
getTableData();
</script>
