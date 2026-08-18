<template>
  <el-dialog
    v-model="visible"
    :title="editType === 'add' ? '新增菜谱' : '编辑菜谱'"
    width="1400"
    align-center
    destroy-on-close
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
          <div class="flex w-full flex-col gap-2">
            <div
              v-for="(ingredient, index) in menuInfo.ingredients"
              :key="index"
              class="flex w-full items-center gap-2"
            >
              <el-input
                v-model="ingredient.name"
                placeholder="如：羊蝎子"
                class="flex-1"
              />
              <el-input
                v-model="ingredient.amount"
                placeholder="如：2斤 / 适量"
                style="width: 160px"
              />
              <el-button type="danger" @click="removeIngredient(index)">
                删除
              </el-button>
            </div>
            <div>
              <el-button type="primary" @click="addIngredient">
                添加配料
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item prop="preparation" label="准备工作">
          <el-input
            v-model="menuInfo.preparation"
            type="textarea"
            rows="3"
            placeholder="如：羊蝎子提前泡出血水、焯水备用"
          />
        </el-form-item>

        <el-form-item prop="steps" label="制作步骤">
          <div class="flex w-full flex-col gap-4">
            <div
              v-for="(step, index) in menuInfo.steps"
              :key="index"
              class="w-full rounded-lg border bg-gray-50 p-4"
            >
              <div class="mb-3 flex items-center justify-between gap-2">
                <span class="text-lg font-bold text-gray-700">
                  步骤 {{ index + 1 }}
                </span>
                <div class="flex items-center gap-2">
                  <el-button
                    :disabled="index === 0"
                    @click="moveStep(index, -1)"
                  >
                    上移
                  </el-button>
                  <el-button
                    :disabled="index === menuInfo.steps.length - 1"
                    @click="moveStep(index, 1)"
                  >
                    下移
                  </el-button>
                  <el-button type="danger" @click="removeStep(index)">
                    删除
                  </el-button>
                </div>
              </div>

              <div class="mb-3 flex items-center gap-2">
                <span class="shrink-0 text-sm text-gray-500">预计时长</span>
                <el-input
                  v-model="step.duration"
                  type="number"
                  min="0"
                  placeholder="可选"
                  style="width: 180px"
                >
                  <template #append>分钟</template>
                </el-input>
              </div>

              <div class="mb-3">
                <div class="mb-1 text-sm text-gray-500">步骤说明</div>
                <el-input
                  v-model="step.description"
                  type="textarea"
                  :rows="2"
                  placeholder="如：焯水去腥，热水洗净捞出"
                />
              </div>

              <div>
                <div class="mb-1 text-sm text-gray-500">
                  操作关键词（可选，回车添加）
                </div>
                <div
                  class="flex min-h-[32px] flex-wrap items-center gap-2 rounded border border-[var(--el-border-color)] bg-white px-2 py-1.5"
                >
                  <el-tag
                    v-for="(action, actionIndex) in step.actions"
                    :key="`${index}-${action}-${actionIndex}`"
                    closable
                    type="info"
                    @close="removeAction(index, actionIndex)"
                  >
                    {{ action }}
                  </el-tag>
                  <input
                    v-model="actionDrafts[index]"
                    class="action-tag-input min-w-[140px] flex-1 border-0 bg-transparent text-sm outline-none"
                    placeholder="如：焯水、洗净"
                    @keydown.enter.prevent="addAction(index)"
                    @keydown.backspace="onActionBackspace(index, $event)"
                  />
                </div>
              </div>
            </div>
            <div>
              <el-button type="primary" @click="addStep">添加步骤</el-button>
            </div>
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
            :on-remove="fileRemove"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </div>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="visible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue";
import type {
  CREATE_MENU_QUERY,
  UPDATE_MENU_QUERY,
} from "@/api/menu/types/index";
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

const emit = defineEmits<{
  success: [];
}>();

const visible = defineModel<boolean>({ default: false });

const emptyMenu = (): UPDATE_MENU_QUERY => ({
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

const menuInfo = reactive<UPDATE_MENU_QUERY>(emptyMenu());
const actionDrafts = ref<string[]>([]);

function reset(params?: UPDATE_MENU_QUERY) {
  const data = params
    ? (JSON.parse(JSON.stringify(params)) as UPDATE_MENU_QUERY)
    : emptyMenu();

  data.steps = (data.steps || []).map(step => ({
    ...step,
    actions: step.actions || [],
    duration: step.duration ?? 0,
  }));
  data.ingredients = data.ingredients || [];

  Object.assign(menuInfo, emptyMenu(), data);
  actionDrafts.value = menuInfo.steps.map(() => "");
  fileList.value = (data.image || []).map((url, index) => ({
    url,
    name: `图片${index + 1}`,
  }));

  nextTick(() => {
    ruleFormRef.value?.clearValidate();
  });
}
defineExpose({ reset });

const ruleFormRef = ref<FormInstance>();
const rules: FormRules = {
  name: [{ required: true, message: "请输入菜名", trigger: "blur" }],
  ingredients: [
    {
      required: true,
      validator: (_rule, _value, callback) => {
        const valid = menuInfo.ingredients.some(
          item => item.name.trim() && item.amount.trim()
        );
        if (!valid) {
          callback(new Error("请至少添加一条完整配料"));
          return;
        }
        callback();
      },
      trigger: "change",
    },
  ],
  servings: [{ required: true, message: "请输入份量", trigger: "blur" }],
  steps: [
    {
      required: true,
      validator: (_rule, _value, callback) => {
        const valid = menuInfo.steps.some(step => step.description.trim());
        if (!valid) {
          callback(new Error("请至少添加一条有说明的制作步骤"));
          return;
        }
        callback();
      },
      trigger: "change",
    },
  ],
};

const fileList = ref<UploadUserFile[]>([]);
const fileSuccess: UploadProps["onSuccess"] = file => {
  ElMessage.success("图片上传成功");
  menuInfo.image.push(file.longurl);
};
const fileError: UploadProps["onError"] = () => {
  ElMessage.error("图片上传失败");
};
const fileRemove: UploadProps["onRemove"] = file => {
  const url = file.url || file.response?.longurl;
  if (!url) return;
  menuInfo.image = menuInfo.image.filter(item => item !== url);
};

function addStep() {
  menuInfo.steps.push({
    duration: 0,
    description: "",
    actions: [],
  });
  actionDrafts.value.push("");
}

function removeStep(index: number) {
  menuInfo.steps.splice(index, 1);
  actionDrafts.value.splice(index, 1);
}

function moveStep(index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= menuInfo.steps.length) return;
  const [step] = menuInfo.steps.splice(index, 1);
  menuInfo.steps.splice(target, 0, step);
  const [draft] = actionDrafts.value.splice(index, 1);
  actionDrafts.value.splice(target, 0, draft);
}

function addAction(stepIndex: number) {
  const value = (actionDrafts.value[stepIndex] || "").trim();
  if (!value) return;
  const actions = menuInfo.steps[stepIndex].actions || [];
  if (!actions.includes(value)) {
    actions.push(value);
    menuInfo.steps[stepIndex].actions = actions;
  }
  actionDrafts.value[stepIndex] = "";
}

function removeAction(stepIndex: number, actionIndex: number) {
  menuInfo.steps[stepIndex].actions.splice(actionIndex, 1);
}

function onActionBackspace(stepIndex: number, event: KeyboardEvent) {
  const draft = actionDrafts.value[stepIndex] || "";
  if (draft) return;
  const actions = menuInfo.steps[stepIndex].actions;
  if (!actions?.length) return;
  event.preventDefault();
  actions.pop();
}

function addIngredient() {
  menuInfo.ingredients.push({
    name: "",
    amount: "",
  });
}

function removeIngredient(index: number) {
  menuInfo.ingredients.splice(index, 1);
}

function buildPayload(): CREATE_MENU_QUERY {
  return {
    name: menuInfo.name.trim(),
    ingredients: menuInfo.ingredients
      .map(({ name, amount }) => ({
        name: name.trim(),
        amount: amount.trim(),
      }))
      .filter(item => item.name && item.amount),
    servings: Number(menuInfo.servings) || 1,
    preparation: menuInfo.preparation.trim(),
    notes: menuInfo.notes.trim(),
    steps: menuInfo.steps
      .map(({ description, duration, actions }) => ({
        description: description.trim(),
        duration: Number(duration) || 0,
        actions: (actions || []).map(item => item.trim()).filter(Boolean),
      }))
      .filter(step => step.description),
    image: menuInfo.image,
    reviews: menuInfo.reviews || [],
    improvements: menuInfo.improvements.trim(),
  };
}

function save() {
  ruleFormRef.value?.validate(valid => {
    if (!valid) return;
    if (props.editType === "add") {
      create();
    } else {
      update();
    }
  });
}

function create() {
  createMenuAPI(buildPayload())
    .then(() => {
      ElMessage.success("新增成功");
      visible.value = false;
      emit("success");
    })
    .catch(() => {
      ElMessage.error("新增失败");
    });
}

function update() {
  if (!menuInfo._id) {
    ElMessage.error("缺少菜谱 ID，无法更新");
    return;
  }
  updateMenuAPI({
    ...buildPayload(),
    _id: menuInfo._id,
  })
    .then(() => {
      ElMessage.success("更新成功");
      visible.value = false;
      emit("success");
    })
    .catch(() => {
      ElMessage.error("更新失败");
    });
}
</script>

<style scoped>
.action-tag-input::placeholder {
  color: var(--el-text-color-placeholder);
}

:deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 10%);
}
</style>
