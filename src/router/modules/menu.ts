export default {
  path: "/menu",
  meta: {
    title: "菜谱",
  },
  children: [
    {
      path: "/menu/list",
      name: "menu-list",
      component: () => import("@/views/menu/list.vue"),
      meta: {
        title: "全部菜谱",
        showParent: true,
      },
    },
    {
      path: "/menu/detail/:menuID",
      name: "menu-detail",
      component: () => import("@/views/menu/detail.vue"),
      meta: {
        title: "菜谱详情",
        showLink: false,
      },
    },
  ],
};
