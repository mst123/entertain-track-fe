<template>
  <el-card shadow="hover">
    <template #header>
      <div class="font-bold">大额消费统计 (>=200元)</div>
    </template>
    <div ref="chartRef" style="height: 400px" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts/core";
import type { LargeExpenseData } from "../types";

const props = defineProps<{
  data: LargeExpenseData;
}>();

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts;

const updateChart = () => {
  if (!chart) return;

  // 对数据进行排序
  const sortedIndices = props.data.amounts
    .map((_, index) => index)
    .sort((a, b) => props.data.amounts[b] - props.data.amounts[a]);

  const sortedDates = sortedIndices.map(i => props.data.dates[i]);
  const sortedAmounts = sortedIndices.map(i => props.data.amounts[i]);
  const sortedMerchants = sortedIndices.map(i => props.data.merchants[i]);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex;
        return `${sortedDates[dataIndex]}<br/>
                ${sortedMerchants[dataIndex]}<br/>
                金额: ¥${params[0].value}`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
      },
    ],
    xAxis: {
      type: "category",
      data: sortedDates,
      axisLabel: { interval: 0, rotate: 30 },
    },
    yAxis: {
      type: "value",
      name: "金额",
    },
    series: [
      {
        type: "bar",
        data: sortedAmounts,
        itemStyle: { color: "#F56C6C" },
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
