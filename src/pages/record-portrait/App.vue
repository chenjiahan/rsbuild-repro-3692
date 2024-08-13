<template>
  <math-webapp
    v-show="mainStore.pageInited"
    @loaded="init"
    :class="['g-scene-container', isLandScape && 'landscape']"
    :needPostWebappEvent="true"
  >
    <template v-if="isLandScape">
      <div class="opacity-wrapper" :class="{ 'f-opacity': isRecording }">
        <img
          :src="local.btn_back"
          class="img btn-back"
          v-press="{ methods: { end: closePage } }"
          ref="backBtn"
          alt=""
        />
      </div>
      <div class="g-top-area">
        <div class="g-top-area-inner" :style="{ backgroundImage: `url(${resources.bg})` }" />
        <!-- 横版的音频播放按钮需要放到题目容器中 -->
        <audio-btn
          v-if="!isRecording"
          :sprites="local.icon_audio_sprites"
          v-press="{ methods: { end: playHint } }"
          :isPlaying="mainStore.isHintPlaying"
        />
      </div>
      <div class="g-bottom-area">
        <voice-message
          :resources="voiceResources"
          :status="voiceStatus"
          :info="voiceInfo"
          :isPlaying="isVoicePlaying"
          :isToSplitName="isLandScape"
          @play="playVoice"
        />
        <!-- 横版需要讲录音按钮和上传按钮统一定位 -->
        <div class="btn-op-wrap">
          <record-btn
            :resources="recordResources"
            :status="recordStatus"
            @start="onStartRecord"
            @stop="onStopRecord"
            :disabled="mainStore.disableAllEvent"
            :resourcesLoaded="mainStore.pageInited"
          />
          <upload-btn
            :resources="uploadResource"
            :status="recordStatus"
            @upload="uploadRecordReport"
            :disabled="mainStore.disableAllEvent"
          />
        </div>
        <p class="txt-info" v-html="txtInfo" />
      </div>
    </template>
    <template v-else>
      <div class="opacity-wrapper" :class="{ 'f-opacity': isRecording }">
        <img
          :src="local.btn_back"
          class="img btn-back"
          v-press="{ methods: { end: closePage } }"
          ref="backBtn"
          alt=""
        />
        <audio-btn
          :sprites="local.icon_audio_sprites"
          v-press="{ methods: { end: playHint } }"
          :isPlaying="mainStore.isHintPlaying"
        />
      </div>
      <div class="g-top-area" :style="{ backgroundImage: `url(${resources.bg})` }" />
      <div class="g-bottom-area">
        <p class="txt-info">
          {{ txtInfo }}
        </p>
        <voice-message
          :resources="voiceResources"
          :status="voiceStatus"
          :info="voiceInfo"
          :isPlaying="isVoicePlaying"
          :isToSplitName="isLandScape"
          @play="playVoice"
        />
        <record-btn
          :resources="recordResources"
          :status="recordStatus"
          @start="onStartRecord"
          @stop="onStopRecord"
          :disabled="mainStore.disableAllEvent"
          :resourcesLoaded="mainStore.pageInited"
          :isHasVoice="voiceInfo && voiceInfo.url"
        />
        <upload-btn
          :resources="uploadResource"
          :status="recordStatus"
          @upload="uploadRecordReport"
          :disabled="mainStore.disableAllEvent"
        />
      </div>
    </template>
  </math-webapp>
</template>

<script>
import 'animate.css';
import { globalResumeAudio } from '@/utils/audioMath';
import MathWebapp from '@/components/MathWebapp';
import AudioBtn from '@/components/AudioBtn';
import RecordBtn from './components/RecordBtn';
import UploadBtn from './components/UploadBtn';
import VoiceMessage from './components/VoiceMessage';
import local from './lib/local';
import { ADD_COIN_MODE, UPLOAD_REPORT_STATUS, VOICE_STATUS, RECORD_STATUS } from '@/data/data';
import { sleep } from '@/utils';
import {
  confirmCheckNetwork,
  confirmReUpload,
  confirmClosePageWhileRecordNotSubmit,
  confirmRecordNotFinished,
  confirmClosePageWhileUploading,
} from '@/services';
import { mapStores } from 'pinia';
import useStore from '@/stores';

export default {
  name: 'RecordPage',
  components: {
    AudioBtn,
    RecordBtn,
    VoiceMessage,
    UploadBtn,
    MathWebapp,
  },
  data() {
    return {
      // HACK: 控制左下角喇叭动效
      isLandScape: this.$ua.isI18nApp || +this.$query.isLandScape === 1,
      isVoicePlaying: false,
      local,
      report: {},
      resources: {},
      voiceInfo: {},
      VOICE_STATUS,
      RECORD_STATUS,
      voiceStatus: null,
      recordStatus: null,
      hasLocalRecord: false,
      recordResources: {
        new: local.record_new,
        newPress: local.record_new_press,
        reopen: local.record_reopen,
        reopenPress: local.record_reopen_press,
        stop: local.record_stop,
        stopPress: local.record_stop_press,
        again: local.record_again,
        againPress: local.record_again_press,
        reDo: local.record_redo,
      },
      voiceResources: {
        bg: local.voice,
        bgPress: local.voice_press,
        voiceIcon: local.icon_voice_sprites,
        errorIcon: local.icon_error,
        loadingIcon: local.icon_loading,
      },
      uploadResource: {
        icon: local.btn_submit,
        iconPress: local.btn_submit_press,
        iconUpload: local.btn_upload,
      },
    };
  },
  computed: {
    ...mapStores(useStore),
    txtInfo() {
      switch (this.recordStatus) {
        case RECORD_STATUS.IS_RECORDING:
          return this.$t('common.tap_stop_record');
        case RECORD_STATUS.WARNING_TAP:
        case RECORD_STATUS.NORMAL_AS_NEW:
          return this.$t('common.start_record');
        case RECORD_STATUS.NORMAL_AS_OLD:
        default:
          return '';
      }
    },
    isRecording() {
      return this.recordStatus === RECORD_STATUS.IS_RECORDING;
    },
  },
  methods: {
    async init(config, report) {
      this.resources = config.resources;
      !report && this.showNetEndToast();
      this.mainStore.finished = report.finished;
      this.report = { voiceList: [], ...report, operationVideoUrls: [] };
      this.voiceInfo = {
        ...this.report.voiceList?.[0],
        userName: '宝贝',
      };
      this.resetBtnStatus();
      this.mainStore.pageInited = true;
      if (this.isLandScape) {
        // 为横版的html节点添加类名
        const $html = document.querySelector('html');
        $html.classList.add('landscape');
      }

      this.$nextTick(this.notLandScapeShowCoin);
    },
    pauseAudio() {
      // NOTE: 锁屏时关闭喇叭动效
      this.mainStore.isHintPlaying = false;
      this.isVoicePlaying = false;
      globalResumeAudio.stop();
    },
    async playHint() {
      if (this.mainStore.disableAllEvent || !this.resources.hint) {
        return false;
      }
      this.pauseAudio();
      this.mainStore.isHintPlaying = true;
      await globalResumeAudio.play(this.resources.hint);
      this.mainStore.isHintPlaying = false;
    },
    async playVoice(url) {
      this.pauseAudio();
      this.isVoicePlaying = true;
      await globalResumeAudio.play(url);
      this.isVoicePlaying = false;
    },
    showNetEndToast() {
      if (!this.hasShowToast && this.mainStore.isWebappStart) {
        this.$toast(this.$t('toast.cant_get_recording'));
        this.hasShowToast = true;
      }
    },
    netErrToast() {
      if (!this.report || !this.report.chapterId) {
        return this.$toast(this.$t('toast.network_error'));
      }
    },
    handleError() {
      // 禁用录音按钮和上传按钮
      this.mainStore.disableAllEvent = true;
      this.resetBtnStatus();
      this.$toast(this.$t('toast.record_interrupted'));
    },
    resetBtnStatus() {
      if (this.mainStore.finished || this.voiceStatus === VOICE_STATUS.UPLOADING_DONE) {
        this.recordStatus = RECORD_STATUS.NORMAL_AS_OLD;
        this.voiceStatus = VOICE_STATUS.NORMAL;
      } else {
        this.recordStatus = RECORD_STATUS.NORMAL_AS_NEW;
        this.voiceStatus = VOICE_STATUS.HIDE;
      }
    },
    async closePage() {
      if (this.isRecording) {
        return false;
      }
      if (this.hasLocalRecord) {
        const thinkAgain = await confirmClosePageWhileRecordNotSubmit();
        this.exitPage(thinkAgain);
      } else if (!this.mainStore.finished) {
        // 如果是第一次进来，没有提交记录
        const leave = await confirmRecordNotFinished();
        this.exitPage(leave);
      } else if (this.mainStore.reportUploadStatus === UPLOAD_REPORT_STATUS.LOADING) {
        const close = await confirmClosePageWhileUploading();
        this.exitPage(close);
      } else {
        // 直接退出
        this.exitPage(true, false);
      }
    },
    exitPage(result) {
      if (result) {
        globalResumeAudio.destroy();
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/common/variable.scss';
* {
  margin: 0;
  padding: 0;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  font-family: $fontRegular;
}
html {
  font-size: calc(100vw / 7.5);
}
html,
body,
.g-scene-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.btn-back,
.btn-audio {
  position: absolute;
  top: 6.45%;
  transform: translate(-50%, -50%);
  width: 0.6rem;
  height: 0.6rem;
}

.btn-back {
  z-index: $zIndexBtnSystem;
  left: 6.4%;
}

.btn-audio {
  z-index: $zIndexBtnSystem;
  right: 25.3%;
}

@supports (top: constant(safe-area-inset-top)) or (top: env(safe-area-inset-top)) {
  .btn-audio,
  .btn-back {
    top: calc(6.45% + constant(safe-area-inset-top));
    top: calc(6.45% + env(safe-area-inset-top));
  }
}

.opacity-wrapper {
  &.f-opacity {
    * {
      opacity: 0.3;
    }
  }
}
.btn-record {
  left: 50%;
  margin-left: -0.61rem;
  bottom: 0.56rem;
}
.btn-upload {
  bottom: 0.56rem;
  left: 50%;
  margin-left: 0.61rem;
}
.g-scene-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  .g-top-area {
    position: relative;
    width: 100vw;
    flex-grow: 1;
    background-position: center 55%;
    background-repeat: no-repeat;
    background-size: 100% auto;
  }
  .g-bottom-area {
    position: relative;
    width: 100vw;
    height: 4.54rem;
  }
}
.txt-info {
  position: absolute;
  top: 0.6rem;
  left: 0;
  width: 100%;
  line-height: 0.44rem;
  font-size: 0.32rem;
  color: #666;
  text-align: center;
}

/* iPad */
@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: portrait) {
  html {
    font-size: calc(100vw / 15);
  }
}

/* iPad Pro */
@media only screen and (min-device-width: 1024px) and (max-device-width: 1366px) and (orientation: portrait) {
  html {
    font-size: calc(100vw / 15);
  }
}

@media only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait) {
  html {
    font-size: calc(100vw / 7.5);
  }
}

@media only screen and (min-device-width: 375px) and (max-device-width: 812px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait) {
  html {
    font-size: calc(100vw / 7.5);
  }
}
html.landscape {
  font-size: calc(100vw / 15);
}
// 横版样式，postcss转为vh
.g-scene-container.landscape {
  font-size: calc(100vw / 15);
  padding: 15px 0;
  box-sizing: border-box;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  // 左侧容器
  .g-top-area {
    width: calc(0.92 * (96vw - 212px));
    height: calc(330 / 375 * 0.92 * (96vw - 212px));
    flex-grow: 0;
    display: flex;
    align-items: center;
    .g-top-area-inner {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 8px solid #5da6ff;
      box-sizing: border-box;
      border-radius: 16px;
      background-size: 100%;
      background-position: center 58%;
    }
  }

  // 右侧容器
  .g-bottom-area {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    position: static;
    width: 212px;
    height: auto;

    // 操作按钮组容器
    .btn-op-wrap {
      display: flex;
      justify-content: center;
      width: 164px;
    }

    .txt-info {
      position: static;
      margin-top: 20px;
      color: #666;
      font-size: 16px;
      line-height: 22px;
    }
  }

  // 声音信息容器
  .voice-message {
    position: static;
    margin-bottom: 80px;

    .txt-label {
      font-size: 16px;
      line-height: 1.5;
    }

    .voice-wrapper {
      position: relative;
      margin: 16px auto;
      width: 164px;
      height: 34px;
    }

    .icon-voice {
      left: 15px;
      width: 18px;
      height: 18px;
      margin-top: -9px;
    }

    .txt-duration {
      left: 38px;
      font-size: 14px;
      color: #5da6ff;
    }

    .icon-status {
      right: 15px;
      margin-top: -10px;
      width: 20px;
      height: 20px;
    }
  }

  // 返回按钮、提示音按钮
  .btn-back,
  .btn-audio {
    position: absolute;
    width: 30px;
    height: 30px;
    z-index: $zIndexBtnSystem;
    transform: none;
  }

  .btn-back {
    left: 15px;
    top: 20px;
  }

  .btn-audio {
    top: auto;
    left: 16px;
    bottom: 12px;
  }

  // 录音按钮
  .btn-record {
    position: static;
    margin-left: 0;
    height: 60px;
    flex: 1;

    .btn-icon {
      position: relative;
      width: 60px;
      height: 60px;
      margin: 0 auto;

      &.btn-icon-recording {
        width: 120px;
      }
      &.btn-icon-new,
      &.btn-icon-reopen,
      &.btn-icon-recording {
        top: 0;
      }
    }

    .btn-icon-recording,
    .btn-icon-wait {
      left: 0;
    }
    @keyframes pulse {
      0% {
        -webkit-transform: scale3d(1, 1, 1);
        transform: scale3d(1, 1, 1);
      }

      50% {
        -webkit-transform: scale3d(1.1, 1.1, 1.1);
        transform: scale3d(1.1, 1.1, 1.1);
      }

      to {
        -webkit-transform: scale3d(1, 1, 1);
        transform: scale3d(1, 1, 1);
      }
    }

    .animate__pulse {
      -webkit-animation-name: pulse;
      animation-name: pulse;
      -webkit-animation-timing-function: ease-in-out;
      animation-timing-function: ease-in-out;
    }
  }

  // 上传按钮
  .btn-upload {
    position: static;
    width: 60px;
    height: 60px;
    margin-left: 44px;

    .u-icon {
      position: static;
      display: block;
    }
  }
}
@media only screen and (min-aspect-ratio: 668/375) and (orientation: landscape) {
  .g-scene-container.landscape {
    padding: 15px 0;
    justify-content: center;
    // 左侧容器
    .g-top-area {
      width: calc(375 / 330 * (100vh - 30px)) !important;
      height: calc(100vh - 30px) !important;
    }
    .g-bottom-area {
      margin-left: 7vw;
    }
  }
}
/* iPad */
// 横版样式
@media only screen and (min-height: 768px) and (orientation: landscape) {
  .g-scene-container.landscape {
    padding: 12.5vh 0 !important;

    .g-top-area {
      width: 77vh !important;
      margin-left: 11.71875vh !important;

      .g-top-area-inner {
        position: absolute;
        width: 100%;
        height: 0;
        padding-bottom: 88.78%;
        border: 1.17vh solid #5da6ff !important;
        box-sizing: border-box;
        border-radius: 2.3vh !important;
        background-size: 100%;
        background-position: center 58%;
      }
    }

    .g-bottom-area {
      // 操作按钮组容器
      .btn-op-wrap {
        width: 32.03125vh !important;

        .btn-icon-recording {
          .txt-duration {
            font-size: 2.734375vh !important;
          }
        }
      }

      .txt-info {
        margin-top: 5.2083333333333vh !important;
        font-size: 3.125vh !important;
        line-height: 4.5vh !important;
      }
    }

    // 声音信息容器
    .voice-message {
      margin-bottom: 15.625vh !important;

      .txt-label {
        font-size: 3.125vh !important;
      }

      .voice-wrapper {
        width: 32.03125vh !important;
        height: 6.640625vh !important;
      }

      .icon-voice {
        left: 2.441vh !important;
        width: 3.2552083333333vh !important;
        height: 3.6458333333333vh !important;
        margin-top: -1.8229166666667vh !important;
      }

      .txt-duration {
        left: 6.85vh !important;
        font-size: 2.734375vh !important;
      }
    }

    // 返回按钮、提示音按钮
    .btn-back,
    .btn-audio {
      width: 5.859375vh !important;
      height: 5.859375vh !important;
    }

    .btn-audio {
      top: auto;
      left: 3vh !important;
      bottom: 0vh !important;
    }

    // 录音按钮
    .btn-record {
      height: 11.71875vh !important;

      .btn-icon {
        width: 11.71875vh !important;
        height: 11.71875vh !important;

        &.btn-icon-recording {
          width: 22.7864583333333vh !important;
        }
      }
    }

    // 上传按钮
    .btn-upload {
      width: 11.71875vh !important;
      height: 11.71875vh !important;
      margin-left: 8.4635416666667vh !important;
    }
  }
}
</style>
