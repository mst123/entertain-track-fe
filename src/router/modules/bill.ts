export default {
  path: "/bill",
  meta: {
    title: "理财",
  },
  children: [
    {
      path: "/bill/list",
      name: "bill-list",
      component: () => import("@/views/bill/list.vue"),
      meta: {
        title: "数据清洗",
        showParent: true,
      },
    },
    {
      path: "/bill/recycle",
      name: "bill-recycle",
      component: () => import("@/views/bill/recycle.vue"),
      meta: {
        title: "回收站",
        showParent: true,
      },
    },
    {
      path: "/bill/statistics",
      name: "bill-statistics",
      component: () => import("@/views/bill/statistics.vue"),
      meta: {
        title: "消费统计",
        showParent: true,
      },
    },
  ],
};
