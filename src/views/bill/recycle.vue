<template>
  <div class="p-4 h-[calc(100vh-97px)] flex flex-col">
    <div class="flex flex-col flex-1 min-h-0">
      <h3 class="text-lg font-bold mb-2">回收站账单列表</h3>

      <!-- 复用 BillTable 组件 -->
      <BillTable
        v-model:current-page="page"
        v-model:page-size="pageSize"
        v-model:total="total"
        :bill-list="billList"
        :categories="categories"
        :show-checkbox="false"
        :show-category="false"
        :custom-columns="customColumns"
        @paginationChange="paginationChange"
      >
        <!-- 自定义操作列 -->
        <template #operation="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="handleRestore(row._id)"
          >
            复原
          </el-button>
          <el-popconfirm
            title="确定要永久删除吗?"
            @confirm="handleDelete(row._id)"
          >
            <template #reference>
              <el-button type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </BillTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { queryBills, restoreBill, realRemoveBill } from "@/api/bill/index";
import type { Bill } from "@/api/bill/types";
import BillTable from "./components/bill-table.vue";
import { usePagination } from "@/hooks/use-pagination";

const billList = ref<Bill[]>([]);
const categories = ref<string[]>([]);

// 分页相关
const { page, pageSize, total, paginationChange } =
  usePagination(fetchDeletedBills);

// 自定义要显示的列
const customColumns = {
  date: true,
  amount: true,
  merchant: true,
  description: true,
  category: false,
  platform: true,
  type: true,
};

// 获取已删除账单列表
async function fetchDeletedBills() {
  try {
    const response = await queryBills({
      isDeleted: true,
      page: page.value,
      pageSize: pageSize.value,
    });
    billList.value = response.data.bills;
    total.value = response.data.total;
  } catch (error) {
    ElMessage.error("获取已删除账单数据失败");
  }
}

// 复原账单
const handleRestore = async (id: string) => {
  try {
    await restoreBill({ id });
    ElMessage.success("复原成功");
    fetchDeletedBills();
  } catch (error) {
    ElMessage.error("复原失败");
  }
};

// 永久删除账单
const handleDelete = async (id: string) => {
  try {
    await realRemoveBill(id);
    ElMessage.success("删除成功");
    fetchDeletedBills();
  } catch (error) {
    ElMessage.error("删除失败");
  }
};

fetchDeletedBills();
</script>
