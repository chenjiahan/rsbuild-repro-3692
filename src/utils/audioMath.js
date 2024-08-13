import { logger } from '@/plugins/logger';
import eventBus from '@/utils/eventBus';

class BasicAudio {
  constructor(props = { url: '', canAutoResume: true }) {
    this.url = props.url;
    this.canAutoResume = props.canAutoResume; // 切后台再恢复后是否自动播放
    this.autoResume = true; // 主动调用pause()后，切后台再恢复后是否自动播放
    if (this.canAutoResume) {
      eventBus.$on('webappPause', this.pauseCallback);
      eventBus.$on('webappResume', this.resumeCallback);
    }
  }

  validateUrl = (url, msg = 'audio url is not valid') => {
    if (!url) {
      logger.writeAndSend(msg, url);
      return false;
    }
    return true;
  };

  pauseCallback = () => {
    this.pause(true);
  };

  resumeCallback = () => {
    if (!this.autoResume) return; // 主动调用pause()后，切后台再恢复后不自动播放
    this.resume();
  };

  play() {
    return Promise.resolve();
  }

  pause() {
    return Promise.resolve();
  }

  resume() {
    return Promise.resolve();
  }

  stop() {
    return Promise.resolve();
  }

  destroy() {
    return Promise.resolve();
  }
}

class HTMLAudio extends BasicAudio {
  constructor(props) {
    super(props);

    this.audio = new Audio(this.url);
    this.audio.preload = 'auto';
    this.audio.loop = this.loop;
  }

  play(url) {
    if (!this.audio || !this.validateUrl(url, "can't play, audio src is not valid!"))
      return Promise.resolve();
    if (this.url === url) {
      this.audio.currentTime = 0;
    } else {
      this.url = url;
      this.audio.src = url;
    }
    this.autoResume = true;
    return new Promise((resolve, reject) => {
      const audioPromise = this.audio.play();
      // 某些低端机器中，audio.play()可能为undefined
      if (audioPromise !== undefined) {
        audioPromise.catch(reject);
      }
      this.audio.onended = resolve;
      this.audio.onerror = reject;
    }).catch(error => {
      console.error(error);
    });
  }

  pause(autoResume = false) {
    if (!this.autoResume) return; // 主动调用一次pause()后再次调用，直接return
    this.autoResume = autoResume;
    this.audio && !this.audio.paused && this.audio.src && this.url && this.audio.pause();
  }

  resume() {
    this.autoResume = true;
    if (this.audio && !this.audio.ended && this.audio.paused && this.url && this.audio.src) {
      this.audio.play();
    }
  }

  stop() {
    this.autoResume = true;
    this.audio && !this.audio.paused && this.audio.src && this.url && this.audio.pause();
  }

  destroy() {
    this.stop();
    this.audio = null;
    if (this.canAutoResume) {
      eventBus.$off('webappPause', this.pauseCallback);
      eventBus.$off('webappResume', this.resumeCallback);
    }
  }
}

const MathAudio = HTMLAudio;

// 全局的音频实例，支持切后台打断和恢复
export const globalResumeAudio = new MathAudio();

export const soundEffectAudio = new MathAudio({ canAutoResume: false });

export default MathAudio;
