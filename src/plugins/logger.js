import { serializeObj } from '@/utils/index';

let mathPageWebTrack = null;

class webTrackReplace {
  send() {
    return Promise.resolve();
  }
}

mathPageWebTrack = new webTrackReplace();

class Logger {
  writeAndSend = (event, info) => {
    this.send(event, info);
  };
  send = (event, info) => {
    if (!event) return;
    if (typeof info === 'object') {
      Object.keys(info).forEach(key => {
        info[key] instanceof Error && (info[key] = serializeObj(info[key]));
      });
    }
    const params = info ? [event, info] : [event];
    console.log(...params);
  };
}

export const logger = new Logger();

const install = Vue => {
  Vue.prototype.$logger = logger;
};
export default { install };
