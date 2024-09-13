import 'whatwg-fetch'; // pixi.js 7 依赖 fetch
import Vue from 'vue';
import App from './index.vue';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
