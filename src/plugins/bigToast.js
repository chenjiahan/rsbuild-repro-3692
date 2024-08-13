import Toast from '../components/BigToast.vue';

const install = Vue => {
  const T = Vue.extend(Toast);

  Vue.prototype.$toast = function (msg, duration = 1000) {
    const div = document.createElement('div');

    const t = new T({
      el: div,
      data() {
        return { msg };
      },
    });

    document.body.appendChild(t.$el);
    window.setTimeout(() => {
      document.body.removeChild(t.$el);
    }, duration);
  };
};

export default { install };
