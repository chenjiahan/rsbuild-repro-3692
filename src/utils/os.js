const u = navigator.userAgent;
const version = u.match(/os\s+(\d+)/i);
export const isBugIos = version && version.length && +version[1] === 11;
export const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
export const isIpad = u.toLowerCase().indexOf('ipad') !== -1;
export const isAndroidPad = isAndroid && !/(?:Mobile)/.test(u);
export const isHD = /productId\/553|productId\/523/i.test(u);
export const checkIOSVersion = version => {
  //获取固件版本
  let getOsv = function () {
    let reg = /OS ((\d+_?){2,3})\s/;
    if (
      navigator.userAgent.match(/iPad/i) ||
      navigator.platform.match(/iPad/i) ||
      navigator.userAgent.match(/iP(hone|od)/i) ||
      navigator.platform.match(/iP(hone|od)/i)
    ) {
      let osv = reg.exec(navigator.userAgent);
      if (osv.length > 0) {
        return osv[0].replace('OS', '').replace('os', '').replace(/\s+/g, '').replace(/_/g, '.');
      }
    }
    return '';
  };
  if (isAndroid) {
    return false;
  }
  let osv = getOsv();
  let osvArr = osv.split('.');
  //初始化显示ios9引导
  if (osvArr && osvArr.length > 0) {
    if (parseInt(osvArr[0]) < version) {
      return true;
    }
  }
  return false;
};
export const getAndroidVersion = () => {
  var version = null;
  if (isAndroid) {
    var reg = /android [\d._]+/gi;
    var v_info = u.match(reg);
    version = (v_info + '').replace(/[^0-9|_.]/gi, '').replace(/_/gi, '.'); //得到版本号4.2.2
    version = parseInt(version.split('.')[0]); // 得到版本号第一位
  }
  return version;
};

export const checkIsLtIOS12 = () =>
  checkIOSVersion(12) || (isAndroidPad && getAndroidVersion() < 10);
