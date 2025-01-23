<template>
  <el-card class="mb-4">
    <template #header>
      <div class="card-header">
        <span>消费时间模式分析</span>
      </div>
    </template>
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <!-- 按时段分析 -->
      <el-tab-pane label="时段分布" name="timeSlot">
        <div ref="timeSlotChartRef" style="height: 400px" />
      </el-tab-pane>
      <!-- 工作日/周末分析 -->
      <el-tab-pane label="工作日/周末" name="weekday">
        <div ref="weekdayChartRef" style="height: 400px" />
      </el-tab-pane>
      <!-- 月度周期分析 -->
      <el-tab-pane label="月度周期" name="monthCycle">
        <div ref="monthCycleChartRef" style="height: 400px" />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import * as echarts from "echarts/core";
import dayjs from "dayjs";

const props = defineProps<{
  data: {
    dates: string[];
    amounts: number[];
    times: string[];
  };
}>();

const activeTab = ref("timeSlot");
const timeSlotChartRef = ref<HTMLElement>();
const weekdayChartRef = ref<HTMLElement>();
const monthCycleChartRef = ref<HTMLElement>();

let timeSlotChart: echarts.ECharts | null = null;
let weekdayChart: echarts.ECharts | null = null;
let monthCycleChart: echarts.ECharts | null = null;

// 时间段定义
const TIME_SLOTS = [
  { start: 5, end: 9, label: "早上(5-9点)" },
  { start: 9, end: 12, label: "上午(9-12点)" },
  { start: 12, end: 14, label: "中午(12-14点)" },
  { start: 14, end: 18, label: "下午(14-18点)" },
  { start: 18, end: 22, label: "晚上(18-22点)" },
  { start: 22, end: 5, label: "深夜(22-5点)" },
];

const WEEKDAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

// 公共图表配色方案
const COLOR_PALETTE = {
  primary: "#6b8ff7",
  secondary: "#45c946",
  grid: "#f5f7fa",
  text: "#666666",
};

// 公共图表配置
const getBaseChartOption = (title: string) => ({
  title: {
    text: title,
    left: "center",
    top: 10,
    textStyle: {
      fontSize: 16,
      color: COLOR_PALETTE.text,
    },
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
      shadowStyle: {
        color: "rgba(107,143,247,0.1)",
      },
    },
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 0,
    textStyle: {
      color: COLOR_PALETTE.text,
    },
    formatter: (params: any) => {
      const count = params[0].data;
      const amount = params[1].data;
      return `<div style="padding: 3px 6px;">
              <div style="margin-bottom: 4px;font-weight:bold">${params[0].name}</div>
              <div style="margin-bottom: 2px">消费次数：${count}次</div>
              <div>消费金额：¥${amount.toFixed(2)}</div>
              </div>`;
    },
  },
  legend: {
    data: ["消费次数", "消费金额"],
    top: 45,
    textStyle: {
      color: COLOR_PALETTE.text,
    },
  },
  grid: {
    top: 90,
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    axisLine: {
      lineStyle: {
        color: "#eee",
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: COLOR_PALETTE.text,
      interval: 0,
      rotate: 15,
    },
  },
  yAxis: [
    {
      type: "value",
      name: "次数",
      position: "left",
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#eee",
        },
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: COLOR_PALETTE.text,
      },
    },
    {
      type: "value",
      name: "金额(元)",
      position: "right",
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: COLOR_PALETTE.text,
      },
    },
  ],
});

// 处理时间段数据
const processTimeSlotData = () => {
  const slotData = TIME_SLOTS.map(() => ({ count: 0, amount: 0 }));

  props.data.times.forEach((time, index) => {
    const hour = parseInt(time.split(":")[0]);
    const slotIndex = TIME_SLOTS.findIndex(slot => {
      if (slot.start < slot.end) {
        return hour >= slot.start && hour < slot.end;
      } else {
        // 处理跨夜的时间段（如22-5点）
        return hour >= slot.start || hour < slot.end;
      }
    });

    if (slotIndex !== -1) {
      slotData[slotIndex].count++;
      slotData[slotIndex].amount += props.data.amounts[index];
    }
  });

  return slotData;
};

// 处理工作日/周末数据
const processWeekdayData = () => {
  const weekdayData = Array(7)
    .fill(0)
    .map(() => ({ count: 0, amount: 0 }));

  props.data.dates.forEach((date, index) => {
    const dayOfWeek = dayjs(date).day();
    const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 调整为周一开始
    weekdayData[adjustedIndex].count++;
    weekdayData[adjustedIndex].amount += props.data.amounts[index];
  });

  return weekdayData;
};

// 处理月度周期数据
const processMonthCycleData = () => {
  const cycleLabels = ["月初(1-10日)", "月中(11-20日)", "月末(21-31日)"];
  const cycleData = Array(3)
    .fill(0)
    .map(() => ({ count: 0, amount: 0 }));

  props.data.dates.forEach((date, index) => {
    const day = dayjs(date).date();
    const cycleIndex = day <= 10 ? 0 : day <= 20 ? 1 : 2;
    cycleData[cycleIndex].count++;
    cycleData[cycleIndex].amount += props.data.amounts[index];
  });

  return { labels: cycleLabels, data: cycleData };
};

// 初始化时间段图表
const initTimeSlotChart = () => {
  if (!timeSlotChartRef.value) return;

  if (!timeSlotChart) {
    timeSlotChart = echarts.init(timeSlotChartRef.value);
  }

  const slotData = processTimeSlotData();
  const option = {
    ...getBaseChartOption("消费时间段分布"),
    xAxis: {
      ...getBaseChartOption("").xAxis,
      data: TIME_SLOTS.map(slot => slot.label),
    },
    series: [
      {
        name: "消费次数",
        type: "bar",
        data: slotData.map(d => d.count),
        barWidth: "20%",
        itemStyle: {
          color: COLOR_PALETTE.primary,
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: "消费金额",
        type: "line",
        yAxisIndex: 1,
        data: slotData.map(d => d.amount),
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: COLOR_PALETTE.secondary,
        },
        itemStyle: {
          color: COLOR_PALETTE.secondary,
          borderWidth: 2,
          borderColor: "#fff",
        },
      },
    ],
  };

  timeSlotChart.setOption(option);
};

// 初始化工作日/周末图表
const initWeekdayChart = () => {
  if (!weekdayChartRef.value) return;

  if (!weekdayChart) {
    weekdayChart = echarts.init(weekdayChartRef.value);
  }

  const weekdayData = processWeekdayData();
  const option = {
    ...getBaseChartOption("工作日/周末消费分布"),
    xAxis: {
      ...getBaseChartOption("").xAxis,
      data: WEEKDAY_LABELS,
    },
    series: [
      {
        name: "消费次数",
        type: "bar",
        data: weekdayData.map(d => d.count),
        barWidth: "20%",
        itemStyle: {
          color: COLOR_PALETTE.primary,
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: "消费金额",
        type: "line",
        yAxisIndex: 1,
        data: weekdayData.map(d => d.amount),
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: COLOR_PALETTE.secondary,
        },
        itemStyle: {
          color: COLOR_PALETTE.secondary,
          borderWidth: 2,
          borderColor: "#fff",
        },
      },
    ],
  };

  weekdayChart.setOption(option);
};

// 初始化月度周期图表
const initMonthCycleChart = () => {
  if (!monthCycleChartRef.value) return;

  if (!monthCycleChart) {
    monthCycleChart = echarts.init(monthCycleChartRef.value);
  }

  const { labels, data: cycleData } = processMonthCycleData();
  const option = {
    ...getBaseChartOption("月度周期消费分布"),
    xAxis: {
      ...getBaseChartOption("").xAxis,
      data: labels,
    },
    series: [
      {
        name: "消费次数",
        type: "bar",
        data: cycleData.map(d => d.count),
        barWidth: "20%",
        itemStyle: {
          color: COLOR_PALETTE.primary,
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: "消费金额",
        type: "line",
        yAxisIndex: 1,
        data: cycleData.map(d => d.amount),
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: COLOR_PALETTE.secondary,
        },
        itemStyle: {
          color: COLOR_PALETTE.secondary,
          borderWidth: 2,
          borderColor: "#fff",
        },
      },
    ],
  };

  monthCycleChart.setOption(option);
};

// 处理窗口大小变化
const handleResize = () => {
  timeSlotChart?.resize();
  weekdayChart?.resize();
  monthCycleChart?.resize();
};

// 处理标签页切换
const handleTabClick = () => {
  setTimeout(() => {
    switch (activeTab.value) {
      case "timeSlot":
        initTimeSlotChart();
        break;
      case "weekday":
        initWeekdayChart();
        break;
      case "monthCycle":
        initMonthCycleChart();
        break;
    }
  }, 0);
};

// 监听属性变化
watch(
  () => props.data,
  () => {
    handleTabClick();
  },
  { deep: true }
);

// 组件挂载时初始化
onMounted(() => {
  handleTabClick();
  window.addEventListener("resize", handleResize);
});

// 组件卸载时清理
const onUnmounted = () => {
  window.removeEventListener("resize", handleResize);
  timeSlotChart?.dispose();
  weekdayChart?.dispose();
  monthCycleChart?.dispose();
};
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
