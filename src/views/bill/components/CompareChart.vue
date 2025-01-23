<template>
  <el-card shadow="hover">
    <template #header>
      <div class="font-bold">同比环比分析</div>
    </template>
    <div ref="chartRef" style="height: 400px" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts/core";

interface CompareData {
  current: PeriodStats;
  lastPeriod: PeriodStats;
  lastYear: PeriodStats;
}

interface PeriodStats {
  totalExpense: number;
  totalIncome: number;
  avgExpense: number;
}

const props = defineProps<{
  data: CompareData;
}>();

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts;

const updateChart = () => {
  if (!chart) return;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["总支出", "总收入", "平均支出"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: ["当前", "上期", "去年同期"],
    },
    yAxis: {
      type: "value",
      name: "金额",
    },
    series: [
      {
        name: "总支出",
        type: "bar",
        data: [
          props.data.current.totalExpense,
          props.data.lastPeriod.totalExpense,
          props.data.lastYear.totalExpense,
        ],
        itemStyle: { color: "#F56C6C" },
      },
      {
        name: "总收入",
        type: "bar",
        data: [
          props.data.current.totalIncome,
          props.data.lastPeriod.totalIncome,
          props.data.lastYear.totalIncome,
        ],
        itemStyle: { color: "#67C23A" },
      },
      {
        name: "平均支出",
        type: "line",
        data: [
          props.data.current.avgExpense,
          props.data.lastPeriod.avgExpense,
          props.data.lastYear.avgExpense,
        ],
        itemStyle: { color: "#E6A23C" },
      },
    ],
  };

  chart.setOption(option);
};

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    updateChart();
  }
});

onUnmounted(() => {
  chart?.dispose();
});

watch(() => props.data, updateChart, { deep: true });

// 监听窗口大小变化
const handleResize = () => chart?.resize();
window.addEventListener("resize", handleResize);
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
