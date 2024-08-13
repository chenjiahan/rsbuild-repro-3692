import queryString from '@/utils/query';

const uaUtil = {
  parse() {
    return {
      isMobile: this.isMobile(),
      isIOS: this.isIOS(),
      isAndroid: this.isAndroid(),
      isWebapp: this.isWebapp(),
      isMathWebapp: this.isMathWebapp(),
    };
  },

  isWebapp() {
    // 判断当前容器是不是Webapp容器，同时不是预览页preview.html，preview.html用于 html 中iframe
    return /Webapp/i.test(navigator.userAgent) && !window.location.pathname.includes('preview');
  },

  isMathWebapp() {
    const search = queryString.parse(window.location.search);
    // 判断当前容器是否是实现了思维接口的webapp
    return this.isWebapp() && search.webappId;
  },



  isMobile() {
    return this.isIOS() || this.isAndroid();
  },

  isIOS() {
    return /iP(hone|od|ad)/.test(navigator.userAgent);
  },

  isAndroid() {
    return /Android/.test(navigator.userAgent);
  },

  getAndroidVersion(ua = navigator.userAgent) {
    ua = ua.toLowerCase();
    const match = ua.match(/android\s(\d+)/);
    return match ? match[1].split('.')[0] : false;
  },

  getIOSVersion(ua = navigator.userAgent) {
    ua = ua.toLowerCase();
    const match = ua.match(/os\s+(\d+)/);
    return match ? match[1].split('.')[0] : false;
  },

  isVersionValid(left, op, right) {
    return this._isOpMatch(op, this._compareVersion(left, right));
  },

  _isOpMatch(op, value) {
    switch (op) {
      case '>':
        return value === 1;
      case '>=':
        return value === 1 || value === 0;
      case '<':
        return value === -1;
      case '<=':
        return value === -1 || value === 0;
      default:
        return false;
    }
  },

  _compareVersion(left, right) {
    var a = left.split('.'),
      b = right.split('.'),
      i = 0,
      len = Math.max(a.length, b.length);

    for (; i < len; i++) {
      if ((a[i] && !b[i] && parseInt(a[i]) > 0) || parseInt(a[i]) > parseInt(b[i])) {
        return 1;
      } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || parseInt(a[i]) < parseInt(b[i])) {
        return -1;
      }
    }
    return 0;
  },

  // 取值为pad或者phone
  getDeviceType() {
    const UA_BIZ_REGION = /\s+device-type\/([a-z]+)(\s+|$)/i;
    const deviceTypeMatches = navigator.userAgent.match(UA_BIZ_REGION);
    if (deviceTypeMatches) {
      return deviceTypeMatches[1];
    }
    return '';
  },
};

export default uaUtil;
