<template>
  <el-card shadow="hover">
    <template #header>
      <div class="font-bold">异常消费分析</div>
    </template>
    <el-table :data="data" style="width: 100%" max-height="400">
      <el-table-column prop="date" label="日期" width="100" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="merchant" label="商户" width="120" />
      <el-table-column prop="amount" label="金额" width="100">
        <template #default="{ row }">
          <span class="text-red-500">¥{{ row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="avgAmount" label="分类平均" width="100">
        <template #default="{ row }">
          <span>¥{{ row.avgAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deviation" label="偏差率" width="100">
        <template #default="{ row }">
          <span class="text-red-500">+{{ row.deviation }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="备注" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
interface AbnormalExpense {
  date: string;
  amount: number;
  category: string;
  merchant: string;
  description: string;
  avgAmount: number;
  deviation: number;
}

defineProps<{
  data: AbnormalExpense[];
}>();
</script>
