export default {
  path: "/book",
  meta: {
    title: "书籍",
  },
  children: [
    {
      path: "/book/list",
      name: "book-list",
      component: () => import("@/views/book/list.vue"),
      meta: {
        title: "全部书籍",
        showParent: true,
      },
    },
    {
      path: "/book/detail/:bookID",
      name: "book-detail",
      component: () => import("@/views/book/detail.vue"),
      meta: {
        title: "书籍详情",
        showLink: false,
      },
    },
  ],
};
