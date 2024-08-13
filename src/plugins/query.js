import { query } from '@/utils/index';

const install = vue => {
  vue.prototype.$query = query;
};

export default { install };
