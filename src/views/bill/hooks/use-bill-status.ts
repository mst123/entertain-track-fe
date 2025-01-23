import { ref } from "vue";

export const useBillStatus = () => {
  const currentSelection = ref<Bill[]>([]);
  const currentPage = ref(1);
  const pageSize = ref(100);
  const total = ref(0);
  return { currentSelection, currentPage, pageSize, total };
};
