import Vue from 'vue';
import VueI18n from 'vue-i18n';
import zh from './langs/zh';

Vue.use(VueI18n);

const DEFAULT_LANG = 'zh';

const locales = {
  zh: zh,
};

const LANGUAGE_TYPE = {
  common: 'courseLanguage',
  toast: 'language',
  alert: 'language',
  confirm: 'language',
};

export const i18n = new VueI18n({
  locale: DEFAULT_LANG,
  messages: locales,
});

Vue.prototype.language = 'zh';
Vue.prototype.courseLanguage = 'zh';
/**
 * 修改语言
 * @param lang
 */
Vue.prototype.$setLang = lang => {
  i18n.locale = lang;
};

export const $t = (key, locale) => {
  const typeKey = LANGUAGE_TYPE[key.substr(0, key.indexOf('.'))];
  return i18n.t(key, locale || Vue.prototype[typeKey] || i18n.locale);
};

Vue.prototype.$t = $t;
