/* 分页功能 */
export default function use() {
  const currentPage = ref(1);
  const pageSize = ref(10);
  const offset = computed(() => (currentPage.value - 1) * pageSize.value);
  return {
    currentPage,
    pageSize,
    offset,
  };
}
