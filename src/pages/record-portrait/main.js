import Vue from 'vue';
import App from './App';
import vuePress from '@/plugins/press';
import toast from '@/plugins/toast';
import { i18n } from '@/mixins/i18n';
import eventBus from '@/utils/eventBus';
import logger from '@/plugins/logger';
import ua from '@/plugins/ua';
import query from '@/plugins/query';
import queryUtil from '@/utils/query';
import uaUtil from '@/utils/ua';
import { createPinia, PiniaVuePlugin } from 'pinia';

Vue.use(PiniaVuePlugin);

Vue.prototype.$bus = eventBus;
Vue.config.productionTip = false;
Vue.use(vuePress);
Vue.use(toast);
Vue.use(logger, {});
Vue.use(ua);
Vue.use(query);

const pinia = createPinia();
new Vue({
  i18n,
  pinia,
  render: h =>
    h(App, { props: { isLandScape: uaUtil.isI18nApp() || +queryUtil.parse().isLandScape === 1 } }),
}).$mount('#app');
