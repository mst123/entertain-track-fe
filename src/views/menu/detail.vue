<template>
  <div v-loading="isLoading" class="h-full w-full flex bg-slate-50/60">
    <!-- 左侧主要内容区 -->
    <div v-if="!isLoading" class="flex-[1.5_0_0%] h-full p-8 overflow-y-auto">
      <!-- 标题区域 -->
      <div class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-4">
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent"
          >
            {{ menuInfo.name }}
          </h1>
          <el-tag
            type="warning"
            effect="light"
            class="ml-2 border-none bg-amber-50 text-amber-600"
          >
            <el-icon class="mr-1"><Timer /></el-icon>
            {{ getTotalTime }}分钟
          </el-tag>
        </div>
        <el-button
          type="primary"
          :icon="Edit"
          class="!bg-amber-500 hover:!bg-amber-600 border-none shadow-sm"
          @click="handleEdit"
        >
          编辑菜谱
        </el-button>
      </div>

      <!-- 图片轮播 -->
      <div class="rounded-2xl overflow-hidden shadow-sm mb-8 bg-white p-2">
        <el-carousel
          motion-blur
          type="card"
          height="450px"
          indicator-position="outside"
          :interval="5000"
        >
          <el-carousel-item
            v-for="(item, index) of menuInfo.image"
            :key="index"
            class="rounded-xl overflow-hidden"
          >
            <el-image
              class="w-full h-full transition-all duration-300 hover:scale-105"
              :src="item"
              fit="cover"
            />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 基本信息卡片 -->
      <div
        class="bg-white p-8 rounded-2xl shadow-sm mb-8 transition-all duration-300 hover:shadow-md"
      >
        <h2
          class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"
        >
          <div class="w-1 h-6 bg-amber-500 rounded-full" />
          基本信息
        </h2>
        <div class="grid grid-cols-2 gap-6">
          <div class="flex items-center gap-4 bg-slate-50/70 p-6 rounded-xl">
            <div
              class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"
            >
              <el-icon class="text-2xl text-amber-500"><User /></el-icon>
            </div>
            <div>
              <div class="text-sm text-slate-500">建议食用人数</div>
              <div class="text-lg font-medium text-slate-800">
                {{ menuInfo.servings }}人份
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4 bg-slate-50/70 p-6 rounded-xl">
            <div
              class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"
            >
              <el-icon class="text-2xl text-amber-500"><Timer /></el-icon>
            </div>
            <div>
              <div class="text-sm text-slate-500">总耗时</div>
              <div class="text-lg font-medium text-slate-800">
                {{ getTotalTime }}分钟
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 食材清单 -->
      <div
        class="bg-white p-8 rounded-2xl shadow-sm mb-8 transition-all duration-300 hover:shadow-md"
      >
        <h2
          class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"
        >
          <div class="w-1 h-6 bg-amber-500 rounded-full" />
          食材清单
        </h2>
        <el-table :data="menuInfo.ingredients" :border="false" class="w-full">
          <el-table-column label="食材" prop="name">
            <template #default="{ row }">
              <span class="font-medium text-slate-700">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用量" prop="amount" width="200">
            <template #default="{ row }">
              <el-tag
                type="info"
                effect="plain"
                class="border-none bg-slate-100 text-slate-600"
              >
                {{ row.amount }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 制作步骤 -->
      <div
        class="bg-white p-8 rounded-2xl shadow-sm mb-8 transition-all duration-300 hover:shadow-md"
      >
        <h2
          class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"
        >
          <div class="w-1 h-6 bg-amber-500 rounded-full" />
          制作步骤
        </h2>
        <el-timeline>
          <el-timeline-item
            v-for="(step, index) of menuInfo.steps"
            :key="index"
            :type="getTimelineItemType(index)"
            class="step-item"
          >
            <template #dot>
              <div class="timeline-dot">{{ index + 1 }}</div>
            </template>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-lg font-bold mb-2 text-gray-800">
                {{ step.description }}
              </div>
              <div class="text-amber-500 mb-3 text-sm">
                预计时间：{{ step.duration }}分钟
              </div>
              <div class="space-y-2">
                <div
                  v-for="(action, idx) of step.actions"
                  :key="idx"
                  class="flex items-center gap-2 text-gray-600"
                >
                  <el-icon><CircleCheck /></el-icon>
                  {{ action }}
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 注意事项 -->
      <div
        class="bg-white p-8 rounded-2xl shadow-sm mb-8 transition-all duration-300 hover:shadow-md"
      >
        <h2
          class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"
        >
          <div class="w-1 h-6 bg-amber-500 rounded-full" />
          注意事项
        </h2>
        <div class="text-gray-600 whitespace-pre-line">
          {{ menuInfo.notes }}
        </div>
      </div>
    </div>

    <!-- 右侧评价区 -->
    <div
      class="flex-1 h-full p-8 bg-white border-l border-slate-100 overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          <div class="w-1 h-6 bg-amber-500 rounded-full" />
          评价列表
        </h2>
        <el-button
          type="primary"
          :icon="Plus"
          class="!bg-amber-500 hover:!bg-amber-600 border-none shadow-sm"
          @click="handleAddReview"
        >
          添加评价
        </el-button>
      </div>

      <div class="space-y-4">
        <div
          v-for="(review, index) of menuInfo.reviews"
          :key="index"
          class="bg-slate-50/70 p-6 rounded-xl transition-all duration-300 hover:shadow-md"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <el-avatar
                :size="40"
                :icon="User"
                class="bg-amber-100 text-amber-500"
              />
              <div>
                <div class="font-medium text-slate-800">
                  {{ review.reviewer }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ new Date().toLocaleDateString() }}
                </div>
              </div>
            </div>
            <el-rate
              v-model="review.rating"
              disabled
              class="scale-90"
              void-icon="Star"
              :colors="['#f59e0b', '#f59e0b', '#f59e0b']"
            />
          </div>
          <div class="text-slate-600 leading-relaxed">{{ review.comment }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed, reactive, ref } from "vue";
import type { Menu } from "@/api/menu/types/index";
import { getMenuById } from "@/api/menu/index";
import { User, Timer, Edit, Plus, CircleCheck } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const menuID = route.params.menuID as string;
const isLoading = ref(false);

const menuInfo: Menu = reactive({
  name: "",
  ingredients: [],
  servings: 0,
  preparation: "",
  notes: "",
  steps: [],
  image: [],
  reviews: [],
  improvements: "",
});

// 计算总耗时
const getTotalTime = computed(() => {
  return menuInfo.steps.reduce((total, step) => total + step.duration, 0);
});

// 获取时间轴项的类型
const getTimelineItemType = (index: number) => {
  const types = ["primary", "success", "warning", "danger"];
  return types[index % types.length];
};

// 处理编辑
const handleEdit = () => {
  router.push(`/menu/edit/${menuID}`);
};

// 处理添加评价
const handleAddReview = () => {
  // TODO: 实现添加评价的逻辑
};

// 获取菜谱详情
console.log(menuID);

if (menuID) {
  isLoading.value = true;
  getMenuById(menuID)
    .then(res => {
      Object.assign(menuInfo, res.data);
    })
    .finally(() => {
      isLoading.value = false;
    });
}

defineOptions({
  name: "MenuDetail",
});
</script>

<style lang="scss" scoped>
.timeline-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-weight: bold;
  color: white;
  background-color: var(--el-color-primary);
  border-radius: 9999px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%);
}

.step-item {
  :deep(.el-timeline-item__node) {
    background: transparent;
    border: none;
  }

  :deep(.el-timeline-item__dot) {
    transform: translateX(-40%);
  }
}

:deep(.el-timeline-item__tail) {
  border-left: 2px solid rgb(226 232 240);
}

:deep(.el-table__header) {
  background-color: rgb(248 250 252 / 70%);
}

:deep(.el-table__cell) {
  padding: 1rem 0;
  border-color: rgb(241 245 249);
}

:deep(.el-carousel__item) {
  border-radius: 0.75rem;
}

:deep(.el-button--primary) {
  --el-button-hover-bg-color: #f59e0b;
  --el-button-hover-border-color: #f59e0b;
}
</style>
