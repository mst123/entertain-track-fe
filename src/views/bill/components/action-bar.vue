<template>
  <div class="w-full h-16 flex flex-wrap items-center justify-end gap-1.5">
    <el-switch
      v-model="findSameMode"
      inline-prompt
      active-text="查重模式"
      inactive-text="普通模式"
    />
    <el-upload
      class="ml-2 inline-block mr-2"
      :auto-upload="true"
      :show-file-list="false"
      accept=".csv,.pdf"
      :before-upload="handleBeforeUpload"
    >
      <el-button type="success">上传账单</el-button>
    </el-upload>
    <el-button type="primary" @click="$emit('batch-update')"
      >批量更新</el-button
    >
    <el-button type="danger" @click="$emit('batch-delete')">批量删除</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import type { UploadProps } from "element-plus";
import { uploadFiles } from "@/api/bill";

defineOptions({
  name: "ActionBar",
});

const findSameMode = defineModel("findSameMode");
const loading = defineModel("loading");

const emit = defineEmits<{
  (e: "batch-update"): void;
  (e: "batch-delete"): void;
  (e: "refresh"): void;
}>();

const handleBeforeUpload: UploadProps["beforeUpload"] = async file => {
  loading.value = true;

  const isValidType =
    file.type === "text/csv" || file.type === "application/pdf";
  if (!isValidType) {
    ElMessage.error("只能上传 CSV 或 PDF 文件!");
    loading.value = false;
    return false;
  }

  try {
    const fileType = file.type === "text/csv" ? "csv" : "pdf";
    await uploadFiles([file], fileType);
    ElMessage.success("上传成功");
    emit("refresh");
    return true;
  } catch {
    ElMessage.error("上传失败");
    return false;
  } finally {
    loading.value = false;
  }
};
</script>
