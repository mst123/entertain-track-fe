<template>
  <div class="statistics-container p-4">
    <!-- 新增：总览统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总支出</span>
            </div>
          </template>
          <div class="statistic-number expense">
            ¥{{ formatNumber(totalStats.totalExpense) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总收入</span>
            </div>
          </template>
          <div class="statistic-number income">
            ¥{{ formatNumber(totalStats.totalIncome) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>结余</span>
            </div>
          </template>
          <div
            class="statistic-number"
            :class="totalStats.balance >= 0 ? 'income' : 'expense'"
          >
            ¥{{ formatNumber(totalStats.balance) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>平均支出</span>
            </div>
          </template>
          <div class="statistic-number">
            ¥{{ formatNumber(totalStats.avgExpense) }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 查询条件 -->
    <el-form :inline="true" class="mb-4">
      <el-form-item label="时间维度">
        <el-radio-group v-model="timeDimension" @change="handleDimensionChange">
          <el-radio-button value="year">年度统计</el-radio-button>
          <el-radio-button value="month">月度统计</el-radio-button>
          <el-radio-button value="day">日统计</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-date-picker
          v-if="timeDimension === 'year'"
          v-model="selectedDate"
          type="year"
          placeholder="选择年份"
          @change="fetchData"
        />
        <el-date-picker
          v-else-if="timeDimension === 'month'"
          v-model="selectedDate"
          type="month"
          placeholder="选择月份"
          @change="fetchData"
        />
        <el-date-picker
          v-else
          v-model="selectedDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          @change="fetchData"
        />
      </el-form-item>

      <el-form-item label="交易类型">
        <el-select v-model="queryParams.type" clearable @change="fetchData">
          <el-option label="支出" value="支出" />
          <el-option label="收入" value="收入" />
        </el-select>
      </el-form-item>

      <el-form-item label="分类">
        <el-select v-model="queryParams.category" clearable @change="fetchData">
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="商户">
        <el-input
          v-model="queryParams.merchant"
          clearable
          @change="fetchData"
        />
      </el-form-item>
    </el-form>

    <!-- 图表展示区域 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 分类金额统计 -->
      <el-col :span="12">
        <category-amount-chart
          v-model:dimension="categoryData.currentDimension"
          :data="categoryData"
          :time-dimension="timeDimension"
        />
      </el-col>

      <!-- 分类频次统计 -->
      <el-col :span="12">
        <category-count-chart
          v-model:dimension="categoryData.currentDimension"
          :data="categoryData"
          :time-dimension="timeDimension"
        />
      </el-col>
    </el-row>

    <!-- 大额消费统计 -->
    <el-row>
      <el-col :span="24">
        <large-expense-chart :data="largeExpenseData" />
      </el-col>
    </el-row>

    <!-- 异常消费分析 -->
    <abnormal-expense-list :data="abnormalExpenses" class="mb-4" />

    <!-- 消费时间模式分析 -->
    <time-pattern-chart :data="timePatternData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, PieChart, BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import { ElMessage } from "element-plus";
import { queryBills } from "@/api/bill";
import type { Bill, GET_BILL_LIST_QUERY } from "@/api/bill/types";
import type { CategoryData, LargeExpenseData } from "./types";
import dayjs from "dayjs";
import CategoryAmountChart from "./components/CategoryAmountChart.vue";
import CategoryCountChart from "./components/CategoryCountChart.vue";
import LargeExpenseChart from "./components/LargeExpenseChart.vue";
import AbnormalExpenseList from "./components/AbnormalExpenseList.vue";
import TimePatternChart from "./components/TimePatternChart.vue";

// 注册必要的 echarts 组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
]);

// 状态管理
// 定义时间维度选择器的可选值类型
const timeDimension = ref<"year" | "month" | "day">("year");
// 单个日期选择，用于年度和月度统计
const selectedDate = ref<Date>(new Date());
// 日期范围选择，用于按日统计
const selectedDateRange = ref<[Date, Date]>([new Date(), new Date()]);
// 分类选项
const categories = ref<string[]>([]);

// 查询参数对象，用于筛选账单数据
const queryParams = ref<Partial<GET_BILL_LIST_QUERY>>({});

// 时间模式分析数据
const timePatternData = ref({
  dates: [] as string[],
  amounts: [] as number[],
  times: [] as string[],
});

// 图表数据
const categoryData = ref<CategoryData>({
  categories: [],
  expenses: [],
  incomes: [],
  counts: [],
  timeLabels: [],
  timeExpenses: [],
  timeIncomes: [],
  timeCounts: [],
  currentDimension: "category",
});

const largeExpenseData = ref<LargeExpenseData>({
  dates: [],
  amounts: [],
  merchants: [],
});

// 日期快捷选项配置
const dateShortcuts = [
  {
    text: "最近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "最近一月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
];

// 异常消费数据
interface AbnormalExpense {
  date: string;
  amount: number;
  category: string;
  merchant: string;
  description: string;
  avgAmount: number;
  deviation: number;
}

const abnormalExpenses = ref<AbnormalExpense[]>([]);

// 统计总览数据，包含总收入、支出、结余等
const totalStats = ref({
  totalExpense: 0,
  totalIncome: 0,
  balance: 0,
  avgExpense: 0,
});

/**
 * 格式化数字，添加千位分隔符
 * @param num 需要格式化的数字
 * @returns 格式化后的字符串
 */
const formatNumber = (num: number | string) => {
  // toLocaleString() 方法返回一个字符串，内容是该数字在特定语言环境下的表示形式。
  // 第一个参数是 locale，表示语言环境，zh-CN 代表简体中文。
  // 第二个参数是 options，表示格式化选项，可以设置小数点位数、分隔符等。
  // minimumFractionDigits 和 maximumFractionDigits 选项分别表示小数点后最小和最大位数。
  // useGrouping 选项表示是否使用千位分隔符。

  return Number(num).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
};

/**
 * 处理时间维度变化的回调函数
 * 当切换年度/月度/日统计时，重置相关的时间选择器
 */
const handleDimensionChange = () => {
  if (timeDimension.value === "year") {
    selectedDate.value = new Date();
  } else if (timeDimension.value === "month") {
    selectedDate.value = new Date();
  } else {
    selectedDateRange.value = [new Date(), new Date()];
  }
  fetchData();
};

/**
 * 处理账单数据，生成各种统计图表所需的数据结构
 * 包括分类统计、时间线数据、大额消费等
 * @param bills 原始账单数据数组
 */
const processData = (bills: Bill[]) => {
  const expenseBills = bills.filter(bill => bill.type === "支出");
  const incomeBills = bills.filter(bill => bill.type === "收入");

  // 处理时间模式数据
  const timePattern = expenseBills.map(bill => ({
    date: dayjs(bill.date).format("YYYY-MM-DD"),
    amount: bill.amount,
    time: dayjs(bill.date).format("HH:mm"),
  }));

  timePatternData.value = {
    dates: timePattern.map(item => item.date),
    amounts: timePattern.map(item => item.amount),
    times: timePattern.map(item => item.time),
  };

  // 按分类统计
  const categoryStats = new Map<
    string,
    { expense: number; income: number; count: number }
  >();

  // 按时间统计
  const timeStats = new Map<
    string,
    { expense: number; income: number; count: number }
  >();

  // 计算总览统计
  let totalExpense = 0;
  let totalIncome = 0;
  let expenseCount = 0;

  bills.forEach(bill => {
    // 处理分类统计
    const categoryKey = bill.category;
    if (!categoryStats.has(categoryKey)) {
      categoryStats.set(categoryKey, { expense: 0, income: 0, count: 0 });
    }
    const stats = categoryStats.get(categoryKey)!;
    if (bill.type === "支出") {
      stats.expense += bill.amount;
      totalExpense += bill.amount;
      expenseCount++;
    } else {
      stats.income += bill.amount;
      totalIncome += bill.amount;
    }
    stats.count++;

    // 处理时间维度统计
    let timeKey;
    if (timeDimension.value === "year") {
      timeKey = dayjs(bill.date).format("M月");
    } else {
      timeKey = dayjs(bill.date).format("MM-DD");
    }

    if (!timeStats.has(timeKey)) {
      timeStats.set(timeKey, { expense: 0, income: 0, count: 0 });
    }
    const timeStatsItem = timeStats.get(timeKey)!;
    if (bill.type === "支出") {
      timeStatsItem.expense += bill.amount;
    } else {
      timeStatsItem.income += bill.amount;
    }
    timeStatsItem.count++;
  });

  // 生成分类数据
  const categories: string[] = [];
  const expenses: number[] = [];
  const incomes: number[] = [];
  const counts: number[] = [];

  categoryStats.forEach((value, key) => {
    categories.push(key);
    expenses.push(value.expense);
    incomes.push(value.income);
    counts.push(value.count);
  });

  // 生成时间维度数据
  const timeLabels: string[] = [];
  const timeExpenses: number[] = [];
  const timeIncomes: number[] = [];
  const timeCounts: number[] = [];

  if (timeDimension.value === "year") {
    // 对于年度统计，确保显示所有月份
    for (let i = 1; i <= 12; i++) {
      const monthKey = `${i}月`;
      timeLabels.push(monthKey);
      const stats = timeStats.get(monthKey) || {
        expense: 0,
        income: 0,
        count: 0,
      };
      timeExpenses.push(stats.expense);
      timeIncomes.push(stats.income);
      timeCounts.push(stats.count);
    }
  } else {
    // 对于其他维度，按日期排序
    Array.from(timeStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, value]) => {
        timeLabels.push(key);
        timeExpenses.push(value.expense);
        timeIncomes.push(value.income);
        timeCounts.push(value.count);
      });
  }

  // 更新状态
  categoryData.value = {
    categories,
    expenses,
    incomes,
    counts,
    timeLabels,
    timeExpenses,
    timeIncomes,
    timeCounts,
    currentDimension: categoryData.value.currentDimension,
  };

  // 更新总览数据
  totalStats.value = {
    totalExpense,
    totalIncome,
    balance: totalIncome - totalExpense,
    avgExpense: expenseCount > 0 ? totalExpense / expenseCount : 0,
  };

  // 处理大额消费数据
  const largeExpenses = bills
    .filter(bill => bill.type === "支出" && bill.amount >= 200)
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  largeExpenseData.value = {
    dates: largeExpenses.map(bill => dayjs(bill.date).format("YYYY-MM-DD")),
    amounts: largeExpenses.map(bill => bill.amount),
    merchants: largeExpenses.map(bill => bill.merchant),
  };
};

/**
 * 获取账单数据并处理
 * 根据当前选择的时间维度和筛选条件请求数据
 */
const fetchData = async () => {
  try {
    const params: GET_BILL_LIST_QUERY = {
      ...queryParams.value,
      page: 1,
      pageSize: 50000,
      startDate:
        timeDimension.value === "day"
          ? dayjs(selectedDateRange.value[0]).format("YYYY-MM-DD")
          : dayjs(selectedDate.value)
              .startOf(timeDimension.value)
              .format("YYYY-MM-DD"),
      endDate:
        timeDimension.value === "day"
          ? dayjs(selectedDateRange.value[1]).format("YYYY-MM-DD")
          : dayjs(selectedDate.value)
              .endOf(timeDimension.value)
              .format("YYYY-MM-DD"),
    };

    const { data } = await queryBills(params);
    processData(data.bills);
    calculateAbnormalExpenses(data.bills);
  } catch (error) {
    console.error(error);
    ElMessage.error("获取统计数据失败");
  }
};

/**
 * 计算异常消费
 * 通过统计分析识别可能的异常消费记录
 * @param bills 账单数据数组
 */
const calculateAbnormalExpenses = (bills: Bill[]) => {
  const categoryAvgMap = new Map<string, number>();
  const categoryBills = new Map<string, Bill[]>();

  // 按分类分组
  bills
    .filter(bill => bill.type === "支出")
    .forEach(bill => {
      const categoryBillList = categoryBills.get(bill.category) || [];
      categoryBillList.push(bill);
      categoryBills.set(bill.category, categoryBillList);
    });

  // 计算每个分类的平均值
  categoryBills.forEach((bills, category) => {
    const avg =
      bills.reduce((sum, bill) => sum + bill.amount, 0) / bills.length;
    categoryAvgMap.set(category, avg);
  });

  // 出异常消费（超过平均值200%的消费）
  const abnormal = bills
    .filter(bill => {
      if (bill.type !== "支出") return false;
      const avgAmount = categoryAvgMap.get(bill.category) || 0;
      return bill.amount > avgAmount * 3; // 200% = 3倍
    })
    .map(bill => {
      const avgAmount = categoryAvgMap.get(bill.category) || 0;
      const deviation = Math.round((bill.amount / avgAmount - 1) * 100);
      const result: AbnormalExpense = {
        date: dayjs(bill.date).format("YYYY-MM-DD"),
        amount: bill.amount,
        category: bill.category,
        merchant: bill.merchant,
        description: bill.description,
        avgAmount: Math.round(avgAmount * 100) / 100,
        deviation,
      };
      return result;
    })
    .sort((a, b) => b.deviation - a.deviation);

  abnormalExpenses.value = abnormal;
};

// 组件挂载时自动获取数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.statistics-container {
  .el-card {
    height: 100%;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .statistic-number {
    font-size: 24px;
    font-weight: bold;
    text-align: center;

    &.expense {
      color: #f56c6c;
    }

    &.income {
      color: #67c23a;
    }
  }
}
</style>
