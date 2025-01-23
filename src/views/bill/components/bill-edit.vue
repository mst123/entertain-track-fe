<template>
  <el-dialog width="800" title="编辑账单">
    <el-form :model="localForm">
      <el-form-item label="日期">
        <el-date-picker
          v-model="localForm.date"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="金额">
        <el-input v-model="localForm.amount" />
      </el-form-item>
      <el-form-item label="商户">
        <el-input v-model="localForm.merchant" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="localForm.description" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="localForm.type">
          <el-option label="支出" value="支出" />
          <el-option label="收入" value="收入" />
        </el-select>
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="localForm.category">
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标签">
        <el-input v-model="localForm.tag" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="localForm.remark" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close', false)">取消</el-button>
      <el-button type="primary" @click="saveEdit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({
  name: "BillEdit",
});
import { ElMessage } from "element-plus";
import { updateBill } from "@/api/bill/index";
import type { Bill } from "@/api/bill/types";
import { ref, watch } from "vue";

const props = defineProps<{
  editForm: Partial<Bill>;
  categories: string[];
}>();

const localForm = ref({ ...props.editForm });

watch(
  () => props.editForm,
  newVal => {
    localForm.value = { ...newVal };
  },
  { deep: true }
);

const emit = defineEmits<{
  (e: "close", value: boolean): void;
  (e: "refresh"): void;
}>();

const saveEdit = async () => {
  try {
    await updateBill({
      id: localForm.value._id,
      update: localForm.value,
    });
    ElMessage.success("更新成功");
    emit("refresh");
    emit("close", false);
  } catch (error) {
    ElMessage.error("更新失败");
  }
};
</script>

<style lang="scss" scoped>
/* 添加一些样式以避免空的样式块 */
</style>
