import Toast from '../components/Toast.vue';

const install = Vue => {
  const T = Vue.extend(Toast);

  Vue.prototype.$toast = function (msg, duration = 1000, { x, y } = {}) {
    // 防止重复显示弹窗
    if (window.toastTimer) {
      return;
    }
    const div = document.createElement('div');

    const t = new T({
      el: div,
      data() {
        return { msg };
      },
    });

    const dom = document.body.appendChild(t.$el);

    if (x && y) {
      dom.style.left = `${x}px`;
      dom.style.top = `${y}px`;
    }

    window.toastTimer = window.setTimeout(() => {
      document.body.removeChild(t.$el);
      window.clearTimeout(window.toastTimer);
      window.toastTimer = null;
    }, duration);
  };
};

export default { install };
