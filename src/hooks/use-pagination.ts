import { ref } from "vue";

export const usePagination = (callback: () => void) => {
  const page = ref(1);
  const pageSize = ref(50);
  const total = ref(0);
  const paginationChange = (newPage: number, newSize: number) => {
    page.value = newPage;
    pageSize.value = newSize;
    callback?.();
  };
  return { page, pageSize, total, paginationChange };
};
