import { createApp } from 'vue';
import { createPinia } from 'pinia';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import 'normalize.css';
import 'element-plus/es/components/message/style/css';
import 'uno.css';
// 调试
import 'virtual:unocss-devtools';

const app = createApp(App);

app.use(createPinia());
app.use(router);

Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
  app.component(key, component);
});

app.mount('#app');
