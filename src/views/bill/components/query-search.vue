<template>
  <el-form :model="queryForm" class="min-h-12 flex flex-wrap" inline>
    <el-form-item label="时间范围">
      <el-date-picker
        v-model="queryForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="dateShortcuts"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item label="商户">
      <el-input v-model="queryForm.merchant" placeholder="请输入商户名称" />
    </el-form-item>

    <el-form-item class="w-60" label="平台">
      <el-select v-model="queryForm.platform" placeholder="请选择">
        <el-option label="全部" value="" />
        <el-option label="支付宝" value="alipay" />
        <el-option label="微信" value="wechat" />
        <el-option label="京东" value="jd" />
        <el-option label="信用卡" value="unknown" />
      </el-select>
    </el-form-item>

    <el-form-item class="w-60" label="交易类型">
      <el-select v-model="queryForm.type" placeholder="请选择">
        <el-option label="支出" value="支出" />
        <el-option label="收入" value="收入" />
      </el-select>
    </el-form-item>

    <el-form-item class="w-60" label="交易分类">
      <el-select v-model="queryForm.category" placeholder="请选择">
        <el-option
          v-for="category in categories"
          :key="category"
          :label="category"
          :value="category"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="最小金额">
      <el-input-number
        v-model="queryForm.minAmount"
        :min="0"
        clearable
        placeholder="请输入最小金额"
      />
    </el-form-item>

    <el-form-item label="最大金额">
      <el-input-number
        v-model="queryForm.maxAmount"
        type="number"
        :min="0"
        clearable
        placeholder="请输入最大金额"
      />
    </el-form-item>
    <el-form-item class="ml-auto">
      <el-button type="primary" @click="emit('search', queryForm.value)"
        >搜索</el-button
      >
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
defineOptions({
  name: "QuerySearch",
});
import { ref } from "vue";

defineProps<{
  categories: string[];
}>();
const emit = defineEmits<{
  (e: "search"): void;
}>();
const queryForm = defineModel("queryForm");

// 日期快捷选项
const dateShortcuts = [
  {
    text: "本月",
    value: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      return [start, end];
    },
  },
  {
    text: "上月",
    value: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0);
      return [start, end];
    },
  },
];

const resetForm = () => {
  queryForm.value = {
    dateRange: ["", ""],
    merchant: "",
    type: null,
    category: "",
    platform: "",
    minAmount: undefined,
    maxAmount: undefined,
    page: 1,
    pageSize: 100,
  };
  emit("search");
};
</script>
