<template>
  <el-dialog
    :title="editType === 'add' ? '新增菜谱' : '编辑菜谱'"
    width="1400"
    align-center
  >
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      :model="menuInfo"
      :rules="rules"
    >
      <div class="flex flex-col gap-4">
        <el-form-item prop="name" label="菜名">
          <el-input v-model="menuInfo.name" placeholder="请输入" />
        </el-form-item>

        <el-form-item prop="servings" label="份量">
          <el-input
            v-model="menuInfo.servings"
            type="number"
            placeholder="请输入几人份"
          />
        </el-form-item>

        <el-form-item prop="ingredients" label="配料">
          <div
            v-for="(ingredient, index) in menuInfo.ingredients"
            :key="index"
            class="mb-2"
          >
            <div class="flex items-center gap-2">
              <el-input
                v-model="ingredient.name"
                placeholder="配料名称"
                style="width: 200px"
              />
              <el-input
                v-model="ingredient.amount"
                placeholder="用量"
                style="width: 150px"
              />
              <el-button type="danger" @click="removeIngredient(index)">
                删除
              </el-button>
            </div>
          </div>
          <div class="mb-2 w-full">
            <el-button type="primary" @click="addIngredient">
              添加配料
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="preparation" label="准备工作">
          <el-input
            v-model="menuInfo.preparation"
            type="textarea"
            rows="3"
            placeholder="请输入准备工作"
          />
        </el-form-item>
        <el-form-item prop="steps" label="制作步骤">
          <div class="flex flex-wrap gap-4">
            <div
              v-for="(step, index) in menuInfo.steps"
              :key="index"
              class="w-[calc(50%-1rem)] p-4 border rounded-lg bg-gray-50"
            >
              <div class="flex items-center gap-2 mb-3">
                <span class="text-lg font-bold text-gray-700">
                  步骤 {{ index + 1 }}
                </span>
                <el-button type="danger" @click="removeStep(index)">
                  删除
                </el-button>
              </div>
              <div class="flex items-center gap-2 mb-3">
                <el-input
                  v-model="step.duration"
                  type="number"
                  placeholder="时长(分钟)"
                  style="width: 200px"
                >
                  <template #append>分钟</template>
                </el-input>
              </div>
              <div class="flex items-center gap-2 mb-3">
                <el-input
                  v-model="step.description"
                  type="textarea"
                  placeholder="步骤描述"
                />
              </div>
              <el-select
                v-model="step.actions"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请添加具体操作步骤"
                class="w-full"
              />
            </div>
          </div>
          <div class="mt-4">
            <el-button type="primary" @click="addStep">添加步骤</el-button>
          </div>
        </el-form-item>

        <el-form-item prop="notes" label="注意事项">
          <el-input
            v-model="menuInfo.notes"
            type="textarea"
            rows="3"
            placeholder="请输入注意事项"
          />
        </el-form-item>

        <el-form-item prop="improvements" label="改进建议">
          <el-input
            v-model="menuInfo.improvements"
            type="textarea"
            rows="3"
            placeholder="请输入改进建议"
          />
        </el-form-item>

        <el-form-item prop="image" label="成品图片">
          <el-upload
            v-model:file-list="fileList"
            action="/api/files"
            list-type="picture-card"
            :on-success="fileSuccess"
            :on-error="fileError"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </div>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="$emit('close')">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { UPDATE_MENU_QUERY } from "@/api/menu/types/index";
import { Plus } from "@element-plus/icons-vue";
import {
  createMenu as createMenuAPI,
  updateMenu as updateMenuAPI,
} from "@/api/menu/index";
import {
  type FormInstance,
  type UploadProps,
  type FormRules,
  type UploadUserFile,
  ElMessage,
} from "element-plus";

const props = defineProps<{
  editType: "add" | "edit";
}>();

const emit = defineEmits(["close"]);

// 表单数据
const menuInfo = reactive<UPDATE_MENU_QUERY>({
  _id: "",
  name: "",
  ingredients: [],
  servings: 1,
  preparation: "",
  notes: "",
  steps: [],
  image: [],
  reviews: [],
  improvements: "",
});

// 重置表单
function reset(params?: UPDATE_MENU_QUERY) {
  if (params) {
    Object.assign(menuInfo, params);
    fileList.value = params.image.map((url, index) => ({
      url,
      name: `图片${index + 1}`,
    }));
  } else {
    Object.assign(menuInfo, {
      _id: "",
      name: "",
      ingredients: [],
      servings: 1,
      preparation: "",
      notes: "",
      steps: [],
      image: [],
      reviews: [],
      improvements: "",
    });
    fileList.value = [];
  }
}
defineExpose({ reset });

// 表单校验规则
const ruleFormRef = ref<FormInstance>();
const rules: FormRules = {
  name: [{ required: true, message: "请输入菜名", trigger: "blur" }],
  ingredients: [{ required: true, message: "请添加配料", trigger: "change" }],
  servings: [{ required: true, message: "请输入份量", trigger: "blur" }],
  steps: [{ required: true, message: "请添加制作步骤", trigger: "change" }],
};

// 文件上传相关
const fileList = ref<UploadUserFile[]>([]);
const fileSuccess: UploadProps["onSuccess"] = file => {
  ElMessage.success("图片上传成功");
  menuInfo.image.push(file.longurl);
};
const fileError: UploadProps["onError"] = () => {
  ElMessage.error("图片上传失败");
};

// 步骤管理
function addStep() {
  menuInfo.steps.push({
    duration: 1,
    description: "",
    actions: [],
  });
}

function removeStep(index: number) {
  menuInfo.steps.splice(index, 1);
}

// 配料管理
function addIngredient() {
  menuInfo.ingredients.push({
    name: "",
    amount: "",
  });
}

function removeIngredient(index: number) {
  menuInfo.ingredients.splice(index, 1);
}

// 保存
function save() {
  ruleFormRef.value?.validate(valid => {
    if (valid) {
      if (props.editType === "add") {
        create();
      } else {
        update();
      }
    }
  });
}

function create() {
  createMenuAPI(menuInfo)
    .then(() => {
      ElMessage.success("新增成功");
      emit("close");
    })
    .catch(() => {
      ElMessage.error("新增失败");
    });
}

function update() {
  updateMenuAPI(menuInfo)
    .then(() => {
      ElMessage.success("更新成功");
      emit("close");
    })
    .catch(() => {
      ElMessage.error("更新失败");
    });
}
</script>

<style scoped>
.el-select {
  --el-select-input-focus-border-color: var(--el-color-primary);
}

:deep(.el-select .el-input__wrapper) {
  padding: 8px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 10%);
}
</style>
