import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layout',
      redirect: '/anime/popular',
      component: () => import('@/layout/index.vue'),
      children: [
        {
          path: '/anime/popular',
          name: 'animePopular',
          component: () => import('@/views/anime/popular/index.vue'),
        },
        {
          path: '/anime/season',
          name: 'animeSeason',
          component: () => import('@/views/anime/season/index.vue'),
        },
        {
          path: '/anime/ranking',
          name: 'animeRanking',
          component: () => import('@/views/anime/ranking/index.vue'),
        },
        {
          path: '/anime/search',
          name: 'animeSearch',
          component: () => import('@/views/anime/search/index.vue'),
        },
      ],
    },
  ],
});

export default router;
