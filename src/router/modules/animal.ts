export default {
  path: "/anime",
  meta: {
    title: "动漫",
  },
  children: [
    {
      path: "/anime/popular",
      name: "anime-popular",
      component: () => import("@/views/anime/popular.vue"),
      meta: {
        title: "热门动漫",
      },
    },
    {
      path: "/anime/ranking",
      name: "anime-ranking",
      component: () => import("@/views/anime/ranking.vue"),
      meta: {
        title: "动漫排名",
      },
    },
    {
      path: "/anime/season",
      name: "anime-season",
      component: () => import("@/views/anime/season.vue"),
      meta: {
        title: "番季动漫",
      },
    },
    {
      path: "/anime/detail/:animeID",
      name: "anime-detail",
      component: () => import("@/views/anime/detail.vue"),
      meta: {
        title: "动漫详情",
        showLink: false,
      },
    },
  ],
};
