import Vue from 'vue';
import App from './App';
import vuePress from '@/plugins/press';
import toast from '@/plugins/bigToast';
import MovableView from '@/components/RecordMovableView';
import VImage from '@/components/VImage';
import { i18n } from '@/mixins/i18n';
import eventBus from '@/utils/eventBus';
import logger from '@/plugins/logger';
import ua from '@/plugins/ua';
import query from '@/plugins/query';
import { createPinia, PiniaVuePlugin } from 'pinia';

Vue.use(PiniaVuePlugin);

Vue.prototype.$bus = eventBus;
Vue.config.productionTip = false;
Vue.use(vuePress);
Vue.use(toast);
Vue.use(logger, {});
Vue.use(ua);
Vue.use(query);

Vue.component('MovableView', MovableView);
Vue.component('VImage', VImage);

const pinia = createPinia();
new Vue({
  i18n,
  pinia,
  render: h => h(App),
}).$mount('#app');
