<template>
  <el-dialog width="600" title="批量更新分类">
    <el-form :model="localForm">
      <el-form-item label="分类">
        <el-select
          v-model="localForm.category"
          allow-create
          filterable
          placeholder="请选择或新建分类"
        >
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close', false)">取消</el-button>
      <el-button type="primary" @click="saveBatchUpdate">保存</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
defineOptions({
  name: "BatchUpdate",
});
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import type { Bill } from "@/api/bill/types";
import { updateBill } from "@/api/bill/index";

const props = defineProps<{
  categories: string[];
  currentSelection: Bill[];
}>();
const emit = defineEmits<{
  (e: "close", value: boolean): void;
  (e: "refresh"): void;
}>();

const localForm = reactive({ category: "" });

// 保存批量更新
function saveBatchUpdate() {
  updateBill({
    ids: props.currentSelection.map(bill => bill._id),
    // 目前只允许更新分类
    update: localForm,
  })
    .then(() => {
      ElMessage.success("更新成功");
      emit("close", false);
      emit("refresh");
    })
    .catch(() => {
      ElMessage.error("更新失败");
    });
}
</script>
