<template>
  <div ref="tableRef" class="w-full flex-1">
    <el-table
      :data="billList"
      :max-height="tableMaxHeight"
      stripe
      class="w-full"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="showCheckbox" type="selection" width="55" />
      <el-table-column align="center" prop="date" label="日期" width="200" />
      <el-table-column
        sortable
        align="center"
        prop="amount"
        label="金额"
        width="100"
      >
        <template #default="{ row }">
          <el-tag :type="row.type === '支出' ? 'danger' : 'primary'">
            {{ row.type === "支出" ? "-" : "+" }}{{ row.amount }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="customColumns?.merchant"
        show-overflow-tooltip
        align="center"
        prop="merchant"
        label="商户"
      />
      <el-table-column
        v-if="customColumns?.platform"
        align="center"
        prop="platform"
        :formatter="platformFormatter"
        label="平台"
        width="100"
      />
      <el-table-column
        v-if="customColumns?.description"
        show-overflow-tooltip
        align="center"
        prop="description"
        label="描述"
      />
      <el-table-column
        v-if="customColumns?.type"
        align="center"
        prop="type"
        label="类型"
        width="80"
      />
      <el-table-column
        v-if="showCategory"
        align="center"
        prop="category"
        label="分类"
        width="120"
      >
        <template #default="{ row }">
          <el-select v-model="row.category" @change="handleCategoryChange(row)">
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        v-if="customColumns?.tag"
        align="center"
        prop="tag"
        label="标签"
        width="120"
      >
        <template #default="{ row }">
          <el-input v-model="row.tag" @change="handleTagChange(row)" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="customColumns?.remark"
        align="center"
        show-overflow-tooltip
        prop="remark"
        label="备注"
      >
        <template #default="{ row }">
          <el-input v-model="row.remark" @change="handleRemarkChange(row)" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="150">
        <template #default="{ row }">
          <slot name="operation" :row="row">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除吗，删除可在回收站复原?"
              @confirm="handleDelete(row._id)"
            >
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </slot>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      style="margin-top: 10px"
      background
      layout="prev, pager, next, jumper, ->, total, sizes"
      :total="total"
      :page-sizes="[30, 50, 100]"
      @change="paginationChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Bill } from "@/types/bill";
import { ElMessage } from "element-plus";
import { updateBill, removeBill } from "@/api/bill/index";

// 使用 defineModel 来处理双向绑定
const currentPage = defineModel("currentPage");
const pageSize = defineModel("pageSize");
const total = defineModel("total");
const currentSelection = defineModel("currentSelection");

interface Props {
  billList: Bill[];
  categories: string[];
  showCheckbox?: boolean;
  showCategory?: boolean;
  customColumns?: {
    merchant?: boolean;
    platform?: boolean;
    description?: boolean;
    type?: boolean;
    tag?: boolean;
    remark?: boolean;
  };
}

// 定义 emit
const emit = defineEmits<{
  (e: "edit", row: Bill): void;
  (e: "refresh"): void;
  (e: "paginationChange", newPage: number, newPageSize: number): void;
}>();

const props = withDefaults(defineProps<Props>(), {
  showCheckbox: true,
  showCategory: true,
  customColumns: () => ({
    merchant: true,
    platform: true,
    description: true,
    type: true,
    tag: true,
    remark: true,
  }),
});

// 表格高度自适应
const tableRef = ref<HTMLElement | null>(null);
const tableMaxHeight = ref(0);

const resizeObserver = new ResizeObserver(() => {
  computedTableMaxHeight();
});

function computedTableMaxHeight() {
  if (tableRef.value?.clientHeight) {
    tableMaxHeight.value = tableRef.value.clientHeight - 50;
  }
}

onMounted(() => {
  if (tableRef.value) {
    resizeObserver.observe(tableRef.value);
  }
});

// 表格事件处理
const handleSelectionChange = (selection: Bill[]) => {
  currentSelection.value = selection;
};

// 快捷更新处理
const handleCategoryChange = async (row: Bill) => {
  try {
    await updateBill({
      id: row._id,
      update: { category: row.category },
    });
    ElMessage.success("更新成功");
  } catch {
    ElMessage.error("更新失败");
  }
};

const handleTagChange = async (row: Bill) => {
  try {
    await updateBill({
      id: row._id,
      update: { tag: row.tag },
    });
    ElMessage.success("更新成功");
  } catch {
    ElMessage.error("更新失败");
  }
};

const handleRemarkChange = async (row: Bill) => {
  try {
    await updateBill({
      id: row._id,
      update: { remark: row.remark },
    });
    ElMessage.success("更新成功");
  } catch {
    ElMessage.error("更新失败");
  }
};

// 整体编辑
const handleEdit = (row: Bill) => {
  emit("edit", row);
};

// 删除
const handleDelete = async (id: string) => {
  try {
    await removeBill({ id });
    ElMessage.success("删除成功");
    emit("refresh");
  } catch {
    ElMessage.error("删除失败");
  }
};

// 分页处理
const paginationChange = (newPage: number, newPageSize: number) => {
  emit("paginationChange", newPage, newPageSize);
};

// 平台格式化
const platformFormatter = (row: Bill) => {
  const platformMap = {
    jd: "京东",
    wechat: "微信",
    alipay: "支付宝",
    unknown: "信用卡",
  };
  return platformMap[row.platform as keyof typeof platformMap] || "其他";
};
</script>
