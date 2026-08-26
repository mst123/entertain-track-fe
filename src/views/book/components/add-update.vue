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
          :limit="1"
          :on-exceed="() => ElMessage.warning('只能上传一张封面')"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="EPUB 文件">
        <el-upload
          v-model:file-list="epubFileList"
          action="/api/files"
          accept=".epub"
          :limit="1"
          :on-success="epubSuccess"
          :on-error="epubError"
          :on-remove="epubRemove"
          :on-exceed="() => ElMessage.warning('只能上传一个 EPUB 文件')"
        >
          <el-button type="primary" :loading="epubParsing">
            上传 EPUB
          </el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持 .epub，最大
              100MB；上传后自动提取书名/简介/封面（已有内容不覆盖）
            </div>
          </template>
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
import { ref, reactive } from "vue";
import type {
  CREATE_BOOK_QUERY,
  UPDATE_BOOK_QUERY,
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
import { extractEpubMeta, uploadCoverBlob } from "@/utils/epub-meta";

defineOptions({
  name: "BookAddUpdate",
});

const props = defineProps<{
  tagOptions: string[];
  editType: "add" | "edit";
}>();

const emit = defineEmits(["close"]);

interface AddOrUpdate extends CREATE_BOOK_QUERY {
  _id?: string;
}
const bookInfo: AddOrUpdate = reactive({
  _id: "",
  priority: 0,
  categories: [],
  name: "",
  introduction: "",
  coverPhoto: "",
  isHave: true,
  status: "无",
  epubUrl: "",
  epubFileName: "",
});

const fileList = ref<UploadUserFile[]>([]);
const epubFileList = ref<UploadUserFile[]>([]);
const epubParsing = ref(false);

function reset(params?: UPDATE_BOOK_QUERY) {
  if (params) {
    Object.assign(bookInfo, {
      ...params,
      epubUrl: params.epubUrl || "",
      epubFileName: params.epubFileName || "",
    });
    fileList.value = params.coverPhoto
      ? [{ url: params.coverPhoto, name: "封面" }]
      : [];
    epubFileList.value = params.epubUrl
      ? [
          {
            name: params.epubFileName || "book.epub",
            url: params.epubUrl,
          },
        ]
      : [];
  } else {
    Reflect.deleteProperty(bookInfo, "_id");
    Reflect.deleteProperty(bookInfo, "readingProgress");
    Object.assign(bookInfo, {
      priority: 0,
      categories: [],
      name: "",
      introduction: "",
      coverPhoto: "",
      isHave: true,
      status: "无",
      epubUrl: "",
      epubFileName: "",
    });
    fileList.value = [];
    epubFileList.value = [];
  }
}
defineExpose({
  reset,
});

const ruleFormRef = ref<FormInstance>();
const rules: FormRules<CREATE_BOOK_QUERY> = {
  name: [{ required: true, message: "请输入书名", trigger: "blur" }],
  introduction: [{ required: true, message: "请输入简介", trigger: "blur" }],
  coverPhoto: [{ required: true, message: "请上传封面", trigger: "blur" }],
  status: [{ required: true, message: "请选择观看状态", trigger: "blur" }],
};

const fileSuccess: UploadProps["onSuccess"] = file => {
  ElMessage.success("封面上传成功");
  bookInfo.coverPhoto = file.longurl;
};
const fileError: UploadProps["onError"] = () => {
  ElMessage.error("封面上传失败");
};

async function fillFromEpub(rawFile: File) {
  epubParsing.value = true;
  try {
    const meta = await extractEpubMeta(rawFile);
    const filled: string[] = [];

    if (meta.title && !bookInfo.name) {
      bookInfo.name = meta.title;
      filled.push("书名");
    }
    if (meta.description && !bookInfo.introduction) {
      bookInfo.introduction = meta.description;
      filled.push("简介");
    }
    if (meta.coverBlob && !bookInfo.coverPhoto) {
      const safeBase = (meta.title || rawFile.name || "book")
        .replace(/[\\/:*?"<>|]/g, "_")
        .slice(0, 40);
      const coverUrl = await uploadCoverBlob(
        meta.coverBlob,
        `${safeBase}-cover-${Date.now()}.${meta.coverExt}`
      );
      bookInfo.coverPhoto = coverUrl;
      fileList.value = [{ name: "封面", url: coverUrl }];
      filled.push("封面");
    }

    if (filled.length) {
      ElMessage.success(`已从 EPUB 提取：${filled.join("、")}`);
    } else {
      ElMessage.info("未从 EPUB 提取到可填充的信息（或表单已有内容）");
    }
  } catch (error) {
    console.warn("EPUB 元数据解析失败", error);
    ElMessage.warning("EPUB 已上传，但自动提取书名/封面失败，请手动填写");
  } finally {
    epubParsing.value = false;
  }
}

const epubSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
  ElMessage.success("EPUB 上传成功");
  bookInfo.epubUrl = response.longurl;
  bookInfo.epubFileName = uploadFile.name;
  if (uploadFile.raw) {
    fillFromEpub(uploadFile.raw);
  }
};
const epubError: UploadProps["onError"] = () => {
  ElMessage.error("EPUB 上传失败");
};
const epubRemove: UploadProps["onRemove"] = () => {
  bookInfo.epubUrl = "";
  bookInfo.epubFileName = "";
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
