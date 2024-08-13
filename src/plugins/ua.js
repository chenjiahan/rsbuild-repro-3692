import { ua } from '@/utils/index';

const install = vue => {
  vue.prototype.$ua = ua;
};

export default { install };
