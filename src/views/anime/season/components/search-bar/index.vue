<template>
  <el-form :inline="true" class="form-search absolute left-5 top-3">
    <el-form-item label="年份">
      <el-date-picker
        v-model="local.year"
        value-format="YYYY"
        :clearable="false"
        type="year"
        placeholder="选择年份"
      />
    </el-form-item>
    <el-form-item label="季节">
      <el-select v-model="local.season" placeholder="选择季节">
        <el-option value="winter" label="冬季" />
        <el-option value="spring" label="春季" />
        <el-option value="summer" label="夏季" />
        <el-option value="fall" label="秋季" />
      </el-select>
    </el-form-item>
    <el-form-item label="排序">
      <el-select v-model="local.sort" placeholder="排序">
        <el-option value="anime_score" label="评分" />
        <el-option value="anime_num_list_users" label="收藏人数" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSearch">Query</el-button>
    </el-form-item>
  </el-form>
</template>
<script name="search-bar" setup lang="ts">

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue', 'search']);

const local = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
function onSearch(): void {
  emit('search');
}
</script>
<style scoped lang='scss'>
</style>
