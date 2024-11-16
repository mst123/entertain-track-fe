export default {
  path: "/game",
  meta: {
    title: "游戏",
  },
  children: [
    {
      path: "/game/list",
      name: "game-list",
      component: () => import("@/views/game/index.vue"),
      meta: {
        title: "全部游戏",
        showParent: true,
      },
    },
  ],
};
