import Vue from 'vue';
import Dialog from './dialog.vue';

Dialog.createVm = (props = {}) => {
  const vmInstance = new Vue({
    render(h) {
      return h(Dialog, {
        props,
      });
    },
  });

  const vm = vmInstance.$mount();

  const $vm = vm.$children[0];

  document.body.appendChild(vm.$el);

  return {
    add(options) {
      return $vm.add(options);
    },
  };
};

let dialog;

export function ZConfirm(options) {
  dialog = Dialog.createVm(options);
  return dialog.add(options);
}

export function ZAlert(options) {
  dialog = Dialog.createVm({ isAlert: true, ...options });
  return dialog.add({ isAlert: true, ...options });
}
