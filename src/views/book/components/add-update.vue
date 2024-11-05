<template>
  <el-dialog
    :title="editType === 'add' ? '新增书籍' : '编辑书籍'"
    width="700"
    align-center
  >
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      :model="bookInfo"
      :rules="rules"
    >
      <el-form-item prop="name" label="书名">
        <el-input v-model="bookInfo.name" placeholder="请输入" />
      </el-form-item>
      <el-form-item prop="categories" label="分类">
        <el-select
          v-model="bookInfo.categories"
          placeholder="请选择或新增"
          style="width: 240px"
          clearable
          collapse-tags
          allow-create
          filterable
          multiple
        >
          <el-option
            v-for="item of tagOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="introduction" label="简介">
        <el-input
          v-model="bookInfo.introduction"
          type="textarea"
          rows="3"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item prop="coverPhoto" label="封面">
        <el-upload
          v-model:file-list="fileList"
          action="/api/files"
          list-type="picture-card"
          :on-success="fileSuccess"
          :on-error="fileError"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item prop="isHave" label="是否拥有">
        <el-switch v-model="bookInfo.isHave" />
      </el-form-item>
      <el-form-item prop="status" label="观看状态">
        <el-select v-model="bookInfo.status" placeholder="请选择">
          <el-option label="无" value="无" />
          <el-option label="想看" value="想看" />
          <el-option label="正在看" value="正在看" />
          <el-option label="看过" value="看过" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="$emit('close')">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import type {
  CREATE_BOOK_QUERY,
  UPDATE_BOOK_QUERY,
  UPDATE_BOOK_RES,
} from "@/api/book/types/index";
import { Plus } from "@element-plus/icons-vue";
import {
  createBook as createBookAPI,
  updateBook as updateBookAPI,
} from "@/api/book/index";
import {
  type FormInstance,
  type UploadProps,
  type FormRules,
  type UploadUserFile,
  ElMessage,
} from "element-plus";

defineOptions({
  name: "AnimalRanking",
});

const props = defineProps<{
  tagOptions: string[];
  editType: "add" | "edit";
}>();

const emit = defineEmits(["close"]);

// 新增

interface AddOrUpdate extends CREATE_BOOK_QUERY {
  _id?: string;
}
const bookInfo: AddOrUpdate = reactive({
  _id: "",
  priority: 0,
  categories: [], // 分类，用逗号分隔
  name: "", // 书名
  introduction: "", // 简介
  coverPhoto: "", // 封面
  isHave: false, // 是否已经拥有
  status: "无",
});
function reset(params?: UPDATE_BOOK_QUERY) {
  if (params) {
    Object.assign(bookInfo, params);
    fileList.value = [{ url: params.coverPhoto, name: "封面" }];
  } else {
    Reflect.deleteProperty(bookInfo, "_id");
    Object.assign(bookInfo, {
      priority: 0,
      categories: [], // 分类，用逗号分隔
      name: "", // 书名
      introduction: "", // 简介
      coverPhoto: "", // 封面
      isHave: false, // 是否已经拥有
      status: "无",
    });
  }
}
defineExpose({
  reset,
});

// 校验规则
const ruleFormRef = ref<FormInstance>();
const rules: FormRules<CREATE_BOOK_QUERY> = {
  name: [{ required: true, message: "请输入书名", trigger: "blur" }],
  introduction: [{ required: true, message: "请输入简介", trigger: "blur" }],
  coverPhoto: [{ required: true, message: "请上传封面", trigger: "blur" }],
  status: [{ required: true, message: "请选择观看状态", trigger: "blur" }],
};

const fileList = ref<UploadUserFile[]>([]); // fileList
const fileSuccess: UploadProps["onSuccess"] = file => {
  ElMessage.success("文件上传成功");
  bookInfo.coverPhoto = file.longurl;
};
const fileError: UploadProps["onError"] = file => {
  ElMessage.error("文件上传失败");
};

function save() {
  ruleFormRef.value.validate(valid => {
    if (valid) {
      if (props.editType === "add") {
        created();
      }
      if (props.editType === "edit") {
        update();
      }
    }
  });
}

function created() {
  createBookAPI(bookInfo)
    .then(res => {
      if (res.status === "success") {
        ElMessage.success("新增成功");
        emit("close");
      }
    })
    .catch(() => {
      ElMessage.error("新增失败");
    });
}
function update() {
  updateBookAPI(bookInfo as UPDATE_BOOK_QUERY)
    .then(res => {
      if (res.status === "success") {
        ElMessage.success("更新成功");
        emit("close");
      }
    })
    .catch(() => {
      ElMessage.error("更新失败");
    });
}
</script>
