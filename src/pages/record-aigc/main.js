import Vue from 'vue';
import App from './App';
import eventBus from '@/utils/eventBus';
import logger from '@/plugins/logger';
import ua from '@/plugins/ua';
import query from '@/plugins/query';
import { createPinia, PiniaVuePlugin } from 'pinia';

Vue.use(PiniaVuePlugin);

Vue.prototype.$bus = eventBus;
Vue.config.productionTip = false;
Vue.use(logger, {});
Vue.use(ua);
Vue.use(query);

const pinia = createPinia();
new Vue({
  pinia,
  render: h => h(App),
}).$mount('#app');
