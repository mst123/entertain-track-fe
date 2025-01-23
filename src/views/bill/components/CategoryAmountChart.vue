<template>
  <el-card shadow="hover">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-bold">分类金额统计</span>
        <el-radio-group v-model="currentDimension" @change="updateChart">
          <el-radio-button value="category">按分类</el-radio-button>
          <el-radio-button value="time">按时间</el-radio-button>
        </el-radio-group>
      </div>
    </template>
    <div ref="chartRef" style="height: 400px" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import * as echarts from "echarts/core";
import type { CategoryData } from "../types";

const props = defineProps<{
  data: CategoryData;
  timeDimension: "year" | "month" | "day";
}>();

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts;
const currentDimension = ref<"category" | "time">(props.data.currentDimension);

const option = computed(() => {
  const isTimeMode = currentDimension.value === "time";

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["支出", "收入"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: isTimeMode ? props.data.timeLabels : props.data.categories,
      axisLabel: { interval: 0, rotate: 30 },
    },
    yAxis: {
      type: "value",
      name: "金额",
    },
    series: [
      {
        name: "支出",
        type: "bar",
        data: isTimeMode ? props.data.timeExpenses : props.data.expenses,
        itemStyle: { color: "#F56C6C" },
        label: {
          show: true,
          position: "top",
          formatter: (params: any) => params.value.toFixed(2),
        },
      },
      {
        name: "收入",
        type: "bar",
        data: isTimeMode ? props.data.timeIncomes : props.data.incomes,
        itemStyle: { color: "#67C23A" },
        label: {
          show: true,
          position: "top",
          formatter: (params: any) => params.value.toFixed(2),
        },
      },
    ],
  };
});

const updateChart = () => {
  if (!chart) return;
  chart.setOption(option.value);
};

watch(() => props.data, updateChart, { deep: true });
watch(
  () => currentDimension.value,
  () => {
    updateChart();
    // 同步到父组件
    emit("update:dimension", currentDimension.value);
  }
);

const emit = defineEmits<{
  (e: "update:dimension", value: "category" | "time"): void;
}>();

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    updateChart();
  }
});

onUnmounted(() => {
  chart?.dispose();
});

// 监听窗口大小变化
window.addEventListener("resize", () => chart?.resize());
</script>
