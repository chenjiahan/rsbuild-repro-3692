<template>
  <math-webapp v-show="mainStore.pageInited" @loaded="init" :needPostWebappEvent="true">
    <div class="record-replay">
      <back-button v-show="recordStatus !== RECORD_STATUS.IS_RECORDING" @click="closePage" />

      <div ref="gameWrap" class="game-wrap">
        <div id="game-wrap-inner" class="game-wrap-inner">
          <!-- clickmove.prevent避免ios屏幕拖拽晃动 -->
          <div
            class="container game"
            @touchmove.prevent
            v-press="{ methods: { end: gameTouchEndHandler } }"
          >
            <div v-if="isReplaying" class="scene-cover" />

            <div ref="recordWrap" class="recordWrap" v-if="info">
              <div>
                <component
                  v-if="info.content.pattern"
                  :is="pattern"
                  :info="info"
                  :toReset="toReset"
                  :toRestore="toRestore"
                  :isRecording="isRecording"
                  :recordStartTime="recordStartTime"
                  :recordEndTime="recordEndTime"
                  :recordPauseDuration="recordPauseDuration"
                  :isReplaying="isReplaying"
                  :replayStartTime="replayStartTime"
                  :replayEndTime="replayEndTime"
                  :isPausing="isPausing"
                  :replayPauseTime="replayPauseTime"
                  :replayResumeTime="replayResumeTime"
                  :timeLineOptionData.sync="timeLineOptionData"
                  :offsets="offsets"
                  :operableArea="operableArea"
                  @updateReplayFinished="replayFinished = $event"
                  @updateRecordDragTimes="recordDragTimes = $event"
                />
              </div>
              <div class="finger-wrap" ref="finger" v-show="isTouch">
                <v-image :style="transform" :src="info.resources.finger" />
              </div>
            </div>
          </div>
        </div>

        <div
          class="progress-bar"
          :style="{
            opacity: showProgressBar ? 1 : 0,
          }"
        >
          <span
            :style="{
              width: `${progressRate}%`,
            }"
          ></span>
        </div>

        <div
          class="replay-button"
          v-press="{ methods: { end: togglePlay } }"
          v-show="showRePlayBtn"
        >
          <div class="mask-layer" :style="{ opacity: showPlayButton ? 1 : 0 }"></div>
          <div class="replay-duration">
            {{ totalDuration }}
          </div>
        </div>

        <audio-btn
          v-show="recordStatus !== RECORD_STATUS.IS_RECORDING"
          :sprites="iconVoice"
          v-press="{ methods: { end: handlePlayHint } }"
          :isPlaying="isHintPlaying"
        />
      </div>

      <div
        class="operate-wrap"
        :style="{ width: operateWrapWidth + 'px', opacity: Number(!!operateWrapWidth) }"
        v-if="info"
      >
        <div class="start-record" v-show="recordStatus === RECORD_STATUS.NORMAL_AS_NEW">
          <div class="record-button" v-press="{ methods: { end: startRecord } }">
            <div v-show="!loadBreathAni"></div>
            <APNG
              :src="info.resources.loadBreathAnimation"
              :isLoop="false"
              :interval="3000"
              @loaded="loadBreathAni = true"
              :playState="breathAniStatus"
            />
          </div>
          <p>{{ $t('common.start_record') }}</p>
        </div>

        <div class="recording" v-show="recordStatus === RECORD_STATUS.IS_RECORDING">
          <div class="btn-wrapper">
            <div
              class="recording-start"
              v-show="recordAnimationStatus === RECORD_ANIMATION_STATUS.ANIMATION_START"
              v-press="{ methods: { end: stopRecord } }"
            >
              <APNG
                :src="info.resources.recording"
                :isLoop="false"
                v-show="resetRecordStartAni"
                :bindEnd="recordStartPartEnd"
                :playState="startState"
              />
            </div>
            <div
              class="recording-processing"
              v-show="recordAnimationStatus === RECORD_ANIMATION_STATUS.ANIMATION_PROCESSING"
              v-press="{ methods: { end: stopRecord } }"
            >
              <APNG
                :src="info.resources.recordingProcessing"
                :isLoop="true"
                :playState="processState"
              />
              <div class="txt-duration">
                {{ recordingDuration }}
              </div>
            </div>
          </div>
          <p v-html="$t('common.tap_stop_record')"></p>
        </div>

        <div class="record-end" v-show="recordStatus === RECORD_STATUS.WAIT_SUBMIT">
          <div class="upload-btn">
            <div v-press="{ methods: { end: uploadRecord } }">
              <img :src="iconDone" v-show="loadBtn_status === LOADING_STATUS.IS_HIDDEN" alt="" />
              <APNG
                v-show="loadBtn_status === LOADING_STATUS.IS_SHOW"
                :src="info.resources.loadingAnimation"
                :isLoop="true"
                class="loading-animation"
                :playState="1"
              />
            </div>
            <p>{{ $t('common.upload_record') }}</p>
          </div>
          <div class="reset-btn" v-press="{ methods: { end: resetRecord } }">
            <span></span>
            <p>{{ $t('common.restart_record') }}</p>
          </div>
        </div>
      </div>

      <div
        class="feedback"
        :style="{
          backgroundImage: `url(${feedbackImageUrl})`,
          backgroundSize: `${this.offsets.width}px, ${this.offsets.height}px`,
        }"
        v-show="showFeedbackPart && feedbackImageUrl"
      ></div>
    </div>
  </math-webapp>
</template>

<script>
import RecordDragFill from '@/scenes/record-drag-fill/scene';

import MathWebapp from '@/components/MathWebapp';
import BackButton from '@/components/BackButton.vue';
import AudioBtn from '@/components/AudioBtn.vue';
import APNG from '@/components/APNG';

import iconVoice from '@/assets/record-portarit/icon-audio-sprites.png';
import iconDone from '@/assets/record-portarit/icon_done.png';

import * as jsBridge from '@/utils/jsBridge';
import { sleep } from '@/utils';

import { globalResumeAudio } from '@/utils/audioMath';
import {
  confirmClosePageWhileWorkNotSubmit,
  confirmRecordNotFinished,
  confirmClosePageWhileUploading,
  confirmCheckNetwork,
} from '@/services';
import useStore from '@/stores/index';
import { mapStores } from 'pinia';
import {
  ADD_COIN_MODE,
  IOS_GT15_IPAD_NOT_HD,
  ChapterTypeMap,
  VOICE_STATUS,
  RECORD_STATUS,
  ChapterContentType,
} from '@/data/data';
import { ZAlert } from '@/plugins/dialog';
import ua from '@/utils/ua';

const RECORD_ANIMATION_STATUS = {
  ANIMATION_START: 0,
  ANIMATION_PROCESSING: 1,
};

const APNG_STATUS = {
  PAUSE: 0,
  START: 1,
};

const LOADING_STATUS = {
  IS_HIDDEN: 0,
  IS_SHOW: 1,
};

const MAX_RECORD_DURATION = 3 * 60 * 1000;
const MIN_RECORD_DURATION = 1000;

export default {
  components: {
    RecordDragFill,
    MathWebapp,
    BackButton,
    AudioBtn,
    APNG,
  },
  data() {
    return {
      RECORD_STATUS,
      recordStatus: RECORD_STATUS.NORMAL_AS_NEW,
      info: { resources: {}, content: {} },
      pattern: '',
      report: {},
      showProgressBar: false,
      progressRate: 0,
      showRePlayBtn: false,
      showPlayButton: false,
      replayDuration: 0,
      iconVoice,
      iconDone,
      uploadRecording: false,
      isHintPlaying: false,
      isHintPlayingDone: false,
      operateWrapWidth: 0,
      loadBreathAni: false,
      breathAniStatus: 0,
      RECORD_ANIMATION_STATUS,
      recordAnimationStatus: RECORD_ANIMATION_STATUS.ANIMATION_START,
      resetRecordStartAni: true,
      startState: APNG_STATUS.PAUSE,
      processState: APNG_STATUS.PAUSE,
      LOADING_STATUS,
      loadBtn_status: LOADING_STATUS.IS_HIDDEN,
      feedbackAudioUrl: '',
      feedbackImageUrl: '',
      endVideoUrl: '',
      offsets: {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      },
      showFeedbackPart: false,
      startRecordTime: 0,
      now: 0,
      hasAddedCoin: false,
      hasLocalReport: false,
      needResumeCb: false,
      needAddCoin: false,

      // 用于存放手指的移动轨迹
      fingerTimeLine: [],
      position: {
        x: 0,
        y: 0,
      },
      timeLineStep: 0,
      isTouch: true,
      // 暂停总时长
      pauseDuration: 0,
      operableArea: {
        x: 0,
        y: 0,
      },

      recordQuestionType: '', // 新版小老师题型名字
      isRecordQuestionInteract: false, //新版小老师是否是交互题
      toReset: false, // 录制回放 - 复位，复原状态，不清除timeline数据,
      toRestore: false, // 录制回放 - 重置，复位，复原状态，清除timeline数据,
      recordStartTime: 0, // 录制回放 - 录制动画开始时间
      recordEndTime: 0, // 录制回放 - 录制动画开始时间
      recordPauseTime: 0, // 录制回放 - 录制动画暂停时间 - 为时间戳
      recordResumeTime: 0, // 录制回放 - 录制动画恢复时间 - 为时间戳
      recordPauseDuration: 0, // 录制回放 - 暂停总时长 - 为时间戳的差值
      recordDragTimes: 0, //  新版我是小老师 - 拖拽次数 - 用于frog埋点
      recordValidDragTimes: 0,
      oneRecordDragTimes: 0, // 从开始录制到上传成功，拖拽次数统计
      oneRecordValidDragTimes: 0,
      isRecording: false, // 录制回放 - 是否正在录制动画
      replayStartTime: 0, // 录制回放 - 录制动画开始时间
      replayEndTime: 0, // 录制回放 - 录制动画开始时间
      isReplaying: false, // 录制回放 - 是否正在回放动画
      isPausing: false, // 录制回放 - 是否正在暂停回放动画
      replayPauseTime: 0, // 录制回放 - 动画回放暂停时间
      replayResumeTime: 0, // 录制回放 - 动画回放恢复时间
      timeLineOptionData: [], // 录制回放 - 动画数据
      timeLineFingerData: [], // 录制回放 - 动画数据
      replayFinished: false, // 录制回放 - 全部动画播放结束
      recordSrc: '',
    };
  },
  computed: {
    ...mapStores(useStore),
    // 录音进行中的时长
    recordingDuration() {
      const v = Math.round((this.now - this.startRecordTime) / 1000);
      return this.formatDuration(v);
    },
    // 总时长
    totalDuration() {
      const v = Math.ceil(this.replayDuration);
      return this.formatDuration(v);
    },
    transform() {
      return {
        transform: `translate3d(${this.position.x}px, ${this.position.y}px, 0)`,
      };
    },
  },
  watch: {
    'mainStore.isWebappStart'(value) {
      value && this.playHint();
    },
    recordStatus: {
      handler(newVal, oldVal) {
        if (newVal === RECORD_STATUS.IS_RECORDING) {
          this.startRecordTime = Date.now();
          this.now = Date.now();
          this.countTimer = setInterval(() => {
            this.now = Date.now();
          }, 1000);
        }
        if (oldVal === RECORD_STATUS.IS_RECORDING && this.countTimer) {
          clearInterval(this.countTimer);
        }
      },
    },
    isHintPlaying: {
      handler(val) {
        if (val && this.replaying) {
          this.pauseReplay();
          this.replaying = false;
          this.showPlayButton = true;
          this.isPauseReplaying = true;
          this.audio.pause();
        }
      },
    },
    'mainStore.isWebappActive': {
      async handler(val) {
        if (val) {
          // 恢复
          if (this.recordStatus === RECORD_STATUS.IS_RECORDING) {
            if (this.recordAnimationStatus === RECORD_ANIMATION_STATUS.ANIMATION_START) {
              this.startState = 0;
            } else {
              this.processState = 0;
            }
            await sleep(100);
            this.resumeRecord();
          }
          if (this.needResumeCb) {
            this.needResumeCb = false;
            this.resumeCb();
          }
        } else {
          // 打断操作
          if (this.replaying) {
            this.togglePlay();
          }
          if (this.recordStatus === RECORD_STATUS.IS_RECORDING) {
            this.pauseRecord();
          }
        }
      },
    },
    recordEndTime: {
      handler() {
        this.timeLineFingerData = this.fingerTimeLine;
      },
    },
    isRecording: {
      handler(val) {
        if (val) {
          this.fingerTimeLine = [];
        }
      },
    },
    isReplaying: {
      handler(val) {
        val && this.replay();
      },
    },
    toReset: {
      handler() {
        this.timeLineStep = 0;
        this.pauseDuration = 0;
        this.isTouch = false;
        clearInterval(this.timeLineEngine);
        this.timeLineEngine = null;
        this.identifier = null;
      },
    },
    toRestore: {
      handler() {
        this.timeLineStep = 0;
        this.pauseDuration = 0;
        this.fingerTimeLine = [];
        this.timeLineLocked = false;
        clearInterval(this.timeLineEngine);
        this.timeLineEngine = null;
        this.isTouch = false;
        this.identifier = null;
        this.position = Object.assign(
          {},
          {
            x: 0,
            y: 0,
          }
        );
      },
    },
    isPausing: {
      handler(val) {
        val ? this.pause() : this.replay();
      },
    },
    replayResumeTime: {
      handler(val) {
        this.pauseDuration += val - this.replayPauseTime;
      },
    },
    timeLineFingerData: {
      handler(val) {
        this.fingerTimeLine = val;
      },
    },
  },
  mounted() {
    this.$logger.writeAndSend('record_replay_mounted');
    this.fadeInTimer = setTimeout(() => {
      this.breathAniStatus = 1;
      this.fadeInTimer && clearTimeout(this.fadeInTimer);
    }, 5000);
    this.getGameWrapSize();
    window.addEventListener('resize', () => {
      this.getGameWrapSize();
    });
    this.initTipsAudio();
  },
  beforeDestroy() {
    const recordWrap = this.$refs.recordWrap;
    recordWrap.removeEventListener('touchstart', this.touchstart, false);
    recordWrap.removeEventListener('touchmove', this.touchmove, false);
    recordWrap.removeEventListener('touchend', this.touchend, false);
    recordWrap.removeEventListener('touchcancel', this.touchcancel, false);

    this.fingerTimeLine = [];
  },
  methods: {
    touchstart(el) {
      if (
        this.isTouch ||
        (el.touches && el.touches.length !== 1) ||
        !!this.identifier ||
        !el.targetTouches[0]
      )
        return false;
      this.identifier = el.touches[0].identifier;
      this.isTouch = true;
      this.position.x = el.targetTouches[0].clientX - this.offsets.x;
      this.position.y = el.targetTouches[0].clientY - this.offsets.y;
      this.isRecording &&
        this.fingerTimeLine.push({
          e: 's',
          t: +Date.now() - this.recordStartTime - this.recordPauseDuration,
          x: +(this.position.x / this.offsets.width).toFixed(6),
          y: +(this.position.y / this.offsets.height).toFixed(6),
        });
    },
    touchmove(el) {
      const touch = el.targetTouches[0];

      if (!touch) return false;
      this.isTouch = true;
      const { clientX, clientY } = touch;
      this.position.x = clientX - this.offsets.x;
      this.position.y = clientY - this.offsets.y;
      if (this.position.x >= this.operableArea.x) this.position.x = this.operableArea.x;
      if (this.position.x < 0) this.position.x = 0;
      if (this.position.y < 0) this.position.y = 0;
      if (this.position.y >= this.operableArea.y) this.position.y = this.operableArea.y;
      if (!this.timeLineLocked && this.isRecording) {
        this.timeLineLocked = true;
        setTimeout(() => {
          if (!this.timeLineLocked) return;
          this.timeLineLocked = false;
          this.fingerTimeLine.push({
            e: 'm',
            t: Date.now() - this.recordStartTime - this.recordPauseDuration,
            x: +(this.position.x / this.offsets.width).toFixed(6),
            y: +(this.position.y / this.offsets.height).toFixed(6),
          });
        }, 20);
      }
    },
    touchend(el) {
      const touch = [...el.changedTouches].some(touch => touch.identifier === this.identifier);
      this.timeLineLocked = false;
      this.isTouch = false;
      if (!touch) return false;
      this.identifier = null;
      this.isRecording &&
        this.fingerTimeLine.push({
          e: 'e',
          t: +Date.now() - this.recordStartTime - this.recordPauseDuration,
          x: +(this.position.x / this.offsets.width).toFixed(6),
          y: +(this.position.y / this.offsets.height).toFixed(6),
        });
    },
    replay() {
      this.timeLineEngine = window.setInterval(() => {
        // 无回放数据
        if (!this.fingerTimeLine[this.timeLineStep] || this.isPausing || !this.isReplaying) return;
        if (
          Date.now() - this.pauseDuration - this.replayStartTime >=
          this.fingerTimeLine[this.timeLineStep].t
        ) {
          // 时间轴开始循环调用
          switch (this.fingerTimeLine[this.timeLineStep].e) {
            case 's':
              this.position.x = this.fingerTimeLine[this.timeLineStep].x * this.offsets.width;
              this.position.y = this.fingerTimeLine[this.timeLineStep].y * this.offsets.height;
              this.touchstart({
                type: 'touchstart',
                replay: true,
                touches: [{ identifier: 1 }],
                targetTouches: [
                  {
                    clientX: this.position.x + this.offsets.x,
                    clientY: this.position.y + this.offsets.y,
                    identifier: 1,
                  },
                ],
              });
              this.timeLineStep++;
              break;
            case 'm':
              this.position.x = this.fingerTimeLine[this.timeLineStep].x * this.offsets.width;
              this.position.y = this.fingerTimeLine[this.timeLineStep].y * this.offsets.height;
              this.touchmove({
                type: 'touchmove',
                replay: true,
                targetTouches: [
                  {
                    clientX: this.position.x + this.offsets.x,
                    clientY: this.position.y + this.offsets.y,
                    identifier: 1,
                  },
                ],
                changedTouches: [
                  {
                    clientX: this.position.x + this.offsets.x,
                    clientY: this.position.y + this.offsets.y,
                    identifier: 1,
                  },
                ],
              });
              this.timeLineStep++;
              break;
            case 'e':
              this.touchend({
                type: 'touchend',
                replay: true,
                targetTouches: [
                  {
                    clientX: this.position.x,
                    clientY: this.position.y,
                    identifier: 1,
                  },
                ],
                changedTouches: [
                  {
                    clientX: this.position.x,
                    clientY: this.position.y,
                    identifier: 1,
                  },
                ],
              });
              this.timeLineStep++;
              break;
            default:
              break;
          }
        }
      }, 20);
    },
    pause() {
      clearInterval(this.timeLineEngine);
      this.timeLineEngine = null;
    },
    touchcancel() {
      this.isTouch = false;
      this.identifier = null;
      this.isRecording &&
        this.fingerTimeLine.push({
          e: 'e',
          t: +Date.now() - this.recordStartTime - this.recordPauseDuration,
          x: +(this.position.x / this.offsets.width).toFixed(6),
          y: +(this.position.y / this.offsets.height).toFixed(6),
        });
    },
    async closePage() {
      if (this.recordStatus === RECORD_STATUS.IS_RECORDING || this.isDisableEvent) {
        return false;
      }

      if (this.hasLocalReport) {
        this.replaying && this.togglePlay();
        const thinkAgain = await confirmClosePageWhileWorkNotSubmit();
        this.exitPage(thinkAgain);
      } else if (!this.hasAddedCoin) {
        // 如果是第一次进来，没有提交记录
        const leave = await confirmRecordNotFinished();
        this.exitPage(leave);
      } else if (this.uploadRecording) {
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
        jsBridge.emitClose();
      }
    },
    initTipsAudio() {
        this.audio = document.createElement('audio');
        this.audio.preload = 'auto';
        // 监听音频被打断， 被系统强行打断无法通过客户端回调来判断
        this.audio.addEventListener(
          'pause',
          () => {
            !this.recordUploaded && this.replaying && this.togglePlay();
          },
          false
        );
        this.audio.addEventListener(
          'playing',
          () => {
            !this.recordUploaded && !this.replaying && this.audio.pause();
          },
          false
        );
        this.audio.addEventListener(
          'ended',
          () => {
            this.playRecordAudioEnded();
          },
          false
        );
      
    },
    playRecordAudioEnded() {
      this.stopReplay();
      this.reset();
      this.showPlayButton = true;
    },
    resetBtnStatus() {
      if (this.hasAddedCoin || this.voiceStatus === VOICE_STATUS.UPLOADING_DONE) {
        this.recordStatus = RECORD_STATUS.NORMAL_AS_OLD;
        this.voiceStatus = VOICE_STATUS.NORMAL;
      } else {
        this.recordStatus = RECORD_STATUS.NORMAL_AS_NEW;
        this.voiceStatus = VOICE_STATUS.HIDE;
      }
    },
    handleError() {
      // 禁用录音按钮和上传按钮
      this.isDisableEvent = true;
      ZAlert({ title: this.$t('toast.record_interrupted') });
    },
    getGameWrapSize() {
      const getGameWrapRealSize = () => {
        const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = this.$refs.gameWrap;
        const winWidth = document.documentElement.clientWidth;
        if (offsetWidth * offsetHeight !== 0) {
          // game-wrap 绝对定位，需要计算一下 x/y 坐标
          this.offsets.x = offsetLeft - offsetWidth / 2;
          this.offsets.y = offsetTop - offsetHeight / 2;
          this.offsets.height = offsetHeight;
          this.offsets.width = offsetWidth;
          this.operateWrapWidth = winWidth - this.offsets.width - this.offsets.x;
        } else {
          window.requestAnimationFrame(getGameWrapRealSize);
        }
      };
      setTimeout(getGameWrapRealSize, IOS_GT15_IPAD_NOT_HD ? 500 : 0);
    },
    async init(config, report) {
      const { resources, content = {} } = config;

      this.info = {
        index: 1,
        resources: { ...resources, hint: resources.hint1 },
        content: content[0],
      };

      this.pattern = [
        'record-drag-fill',
        'record-tap',
        'record-tap-flip-drag',
        'record-tap-rotate-drag',
      ].includes(this.info.content.pattern)
        ? this.info.content.pattern
        : 'record-replay';

      this.recordQuestionType = this.info.content.pattern;
      this.isRecordQuestionInteract = this.info.content.options.length > 0;
      this.$nextTick(() => {
        this.timeLineLocked = false;
        this.isTouch = false;
        const recordWrap = this.$refs.recordWrap;
        const { width, height } = recordWrap.getBoundingClientRect();
        this.operableArea = {
          x: width,
          y: height,
        };
        recordWrap.addEventListener('touchstart', this.touchstart, false);
        recordWrap.addEventListener('touchmove', this.touchmove, false);
        recordWrap.addEventListener('touchend', this.touchend, false);
        recordWrap.addEventListener('touchcancel', this.touchcancel, false);
      });

      this.report = report;

      // 有消息代表加过币
      const { voiceList = [] } = this.report;
      this.hasAddedCoin = !!voiceList.length;
      if (this.hasAddedCoin) {
        this.voiceInfo = Object.assign({}, this.voiceInfo, voiceList[0]);
      }
      this.mainStore.pageInited = true;

      this.$logger.writeAndSend('record_replay_method_initPage');
    },
    reset() {
      this.toReset = !this.toReset;
    },
    restore() {
      this.reset();
      this.timeLineFingerData = [];
      this.timeLineOptionData = [];
      this.toRestore = !this.toRestore;
    },
    async startRecord() {
      this.recordValidDragTimes += this.recordDragTimes || 0;
      this.oneRecordDragTimes = 0;
      this.$logger.writeAndSend('record_replay_startRecord');
      this.restore();
      // 暂停音频播放
      this.stopHint();
      await sleep(300);
      this.isRecording = true;
      this.recordStartTime = Date.now();
      this.$logger.writeAndSend('record_replay_emit_startRecord');
      this.startTime = Date.now();
      this.countRecordTimer = setTimeout(() => {
        if (this.recordStatus !== RECORD_STATUS.IS_RECORDING) {
          return;
        }

        // 录制时间过长
        this.stopRecord();
        ZAlert({
          title: this.$t('toast.recording_too_long'),
          mainText: this.$t('alert.confirm'),
        });
        this.$logger.writeAndSend('record_replay_record_timeout');
        clearTimeout(this.countRecordTimer);
      }, MAX_RECORD_DURATION);

      try {
        await jsBridge.emitStartRecord();
        this.recordStatus = RECORD_STATUS.IS_RECORDING;
        this.recordAnimationStatus = RECORD_ANIMATION_STATUS.ANIMATION_START;
        this.startState = APNG_STATUS.START;
      } catch (err) {
        this.$logger.writeAndSend('record_replay_startRecord_error', { errMsg: err });
      }
    },
    async stopRecord() {
      this.fadeInTimer && clearTimeout(this.fadeInTimer);
      this.stopHint();
      // 停止录制
      this.recordEndTime = Date.now();
      this.isRecording = false;
      this.recordPauseDuration = 0;
      this.$logger.writeAndSend('record_replay_stopRecord');
      this.recordValidDragTimes += this.recordDragTimes || 0;
      this.oneRecordValidDragTimes = this.recordDragTimes || 0;
      this.countRecordTimer && clearTimeout(this.countRecordTimer);
      if (Date.now() - this.startTime < MIN_RECORD_DURATION) {
        // 录音时间过短
        this.$toast(this.$t('toast.recording_too_short'));
        this.recordStatus = RECORD_STATUS.NORMAL_AS_NEW;
        this.$logger.writeAndSend('record_replay_emit_stopRecord_short');
        jsBridge.emitStopRecord().catch(() => {});
        this.restore();
        this.fadeInTimer = setTimeout(() => {
          this.breathAniStatus = 1;
          this.fadeInTimer && clearTimeout(this.fadeInTimer);
        }, 3000);
        return;
      }
      this.showRePlayBtn = true;
      this.showPlayButton = true;
      this.showProgressBar = true;
      this.reset();
      this.recordStatus = RECORD_STATUS.WAIT_SUBMIT;
      try {
        const info = await jsBridge.emitStopRecord();
        const { duration, url, localPath } = info;
        this.replayDuration = duration;
        this.voiceInfo = Object.assign({}, this.voiceInfo, {
          duration: duration * 1000 < MAX_RECORD_DURATION ? duration : MAX_RECORD_DURATION / 1000,
          url,
          localPath,
        });

          this.audio.src = await jsBridge.fileIdToBase64String(localPath);
          this.audio.load();
        
        this.hasLocalReport = true;
      } catch (err) {
        ZAlert({ title: this.$t('alert.record_video_fail') });
        this.$logger.writeAndSend('record_video_fail');
        this.resetRecord(false);
      }
    },
    pauseRecord() {
      jsBridge.pauseRecordAudio();
      this.stopRecord();
      this.recordPauseTime = Date.now();
      this.isRecording = true;
      this.$logger.writeAndSend('record_replay_pauseRecord');
      if (this.recordAnimationStatus === RECORD_ANIMATION_STATUS.ANIMATION_START) {
        this.startState = 0;
      } else {
        this.processState = 0;
      }
    },
    resumeReplay() {
      this.replayResumeTime = Date.now();
      this.isPausing = false;
    },
    updateProgressBar() {
      const curBarRate = () => {
        this.progressRate = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressRate < 100 && this.replaying && window.requestAnimationFrame(curBarRate);
      };
      this.replaying && curBarRate();
    },
    startReplay() {
      this.replayFinished = false;
      this.replayStartTime = Date.now();
      this.isReplaying = true;
    },
    togglePlay() {
      // 如果题干语音正在播放，禁止录音回放
      if (this.isHintPlaying) {
        this.stopHint();
      }
      if (this.isDisableEvent) return;
      if (this.replaying) {
        this.pauseReplay();
        this.replaying = false;
        this.showPlayButton = true;
        this.isPauseReplaying = true;
        this.audio.pause();
      } else if (this.isPauseReplaying) {
        this.resumeReplay();
        this.replaying = true;
        this.isPauseReplaying = false;
        this.showPlayButton = false;

          this.audio.play();
          this.updateProgressBar();
        
      } else {
          const src = this.audio.src;
          this.audio.src = undefined;
          this.audio.src = src;
          this.audio.addEventListener(
            'loadedmetadata',
            () => {
              this.audio.currentTime = 0;
              this.audio.play();
              this.showPlayButton = false;
              this.startReplay();
              this.replaying = true;
              this.updateProgressBar();
            },
            {
              once: true,
            }
          );
        
      }
    },
    async handleNetworkError() {
      const res = await confirmCheckNetwork();
      res && this.uploadRecord();
    },
    async uploadRecord() {
      // 上传语音、操作轨迹、报告
      if (!this.hasLocalReport || this.isDisableEvent || this.uploadRecording) {
        this.$logger.writeAndSend('record_replay_uploadRecord', {
          hasLocalReport: this.hasLocalReport,
          isDisableEvent: this.isDisableEvent,
          uploadRecording: this.uploadRecording,
        });
        return false;
      }
      this.uploadRecording = true;
      // 如果题干语音正在播放，禁止录音回放
      if (this.isHintPlaying) {
        this.stopHint();
      }
      this.replaying && this.togglePlay();
      this.startUploadTime = Date.now();
      this.stopReplay();
      this.reset();
      this.loadBtn_status = LOADING_STATUS.IS_SHOW;
      this.isDisableEvent = true;
      this.isUploadTimeOut = false;
      this.mainStore.chapterFinishedTime = Date.now();
      try {
        const { duration, localPath } = this.voiceInfo;
        const url = await jsBridge.getRemoteUrl(localPath);
        const voiceList = this.report.voiceList || [];
        this.report.voiceList = [{ duration, url }, ...voiceList];
      } catch (err) {
        this.loadBtn_status = LOADING_STATUS.IS_HIDDEN;
        this.isDisableEvent = false;
        this.uploadRecording = false;
        if (this.isUploadTimeOut) return;
        this.handleNetworkError();
        return;
      }
      try {
        const timeLineDataStr = JSON.stringify({
          optionData: this.timeLineOptionData,
          fingerData: this.timeLineFingerData,
        });
        this.timeLineFileUrl = await jsBridge.uploadFileByString(timeLineDataStr);
      } catch (err) {
        this.isDisableEvent = false;
        this.loadBtn_status = LOADING_STATUS.IS_HIDDEN;
        this.uploadRecording = false;
        if (this.isUploadTimeOut) return;
        this.handleNetworkError();
        return;
      }
      if (this.isUploadTimeOut) {
        this.$logger.writeAndSend('record_replay_upload_timeout');
        return;
      }
      this.report.operationVideoUrls = [
        this.timeLineFileUrl,
        ...(this.report.operationVideoUrls || []),
      ];
      this.report.finished = true;
      this.report.chapterSessionId = this.$query.sessionId;
      this.report.webappSessionId = this.$query.webappSessionId;
      if (!this.isDisableEvent) return;

      try {
        if (!this.report.voiceList || this.report.voiceList.length === 0) {
          this.$logger.writeAndSend('record_report_voice_list_null', { report: this.report });
        }
        this.loadBtn_status = LOADING_STATUS.IS_HIDDEN;
        this.uploadRecording = false;
        if (!this.mainStore.isWebappActive) {
          this.needAddCoin = true;
          return;
        }

        if (this.isUploadTimeOut) return;
        this.isDisableEvent = true;
        this.mainStore.chapterCompletedTime = Date.now();
      } catch (e) {
        this.isDisableEvent = false;
        this.loadBtn_status = LOADING_STATUS.IS_HIDDEN;
        this.uploadRecording = false;
        if (this.isUploadTimeOut) return;
        this.handleNetworkError();
      }
    },
    gameTouchEndHandler() {
      this.recordDragTimes++;
      this.oneRecordDragTimes++;
    },
    formatDuration(val) {
      const m = Math.floor(val / 60);
      const s = val % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
    async playHint() {
      this.isHintPlaying = true;
      await globalResumeAudio.play(this.info.resources.hint);
      this.isHintPlaying = false;
      this.isHintPlayingDone = true;
    },
    stopHint() {
      this.isHintPlaying = false;
      globalResumeAudio.stop();
    },
    handlePlayHint() {
      this.playHint();
    },
    recordStartPartEnd() {
      this.recordAnimationStatus = RECORD_ANIMATION_STATUS.ANIMATION_PROCESSING;
      this.processState = 1;
      this.resetRecordStartAni = false;
      this.startState = 0;
      this.resetRecordStartAni = true;
    },
    async resetRecord() {
      if (this.isDisableEvent) return;
      this.stopReplay();
      globalResumeAudio.pause();
      this.audio.pause();
      this.restore();
      this.showPlayButton = false;
      this.showRePlayBtn = false;
      this.showProgressBar = false;
      this.hasLocalReport = false;
      await sleep(100);
      this.recordStatus = RECORD_STATUS.NORMAL_AS_NEW;
      this.progressRate = 0;
      this.fadeInTimer = setTimeout(() => {
        this.breathAniStatus = 1;
        this.fadeInTimer && clearTimeout(this.fadeInTimer);
      }, 3000);
    },
    pauseReplay() {
      this.replayPauseTime = Date.now();
      this.isPausing = true;
      this.isPauseReplaying = true;
    },
    stopReplay() {
      this.replayStopTime = Date.now();
      this.isPauseReplaying = false;
      this.replaying = false;
      this.isReplaying = false;
      this.isPausing = false;
      this.replayStartTime = 0;
      this.replayEndTime = 0;
      this.replayPauseTime = 0;
      this.replayResumeTime = 0;
    },
    setResumeRecord() {
      this.recordResumeTime = Date.now();
      this.isRecording = true;
      this.recordPauseDuration =
        this.recordPauseDuration + this.recordResumeTime - this.recordPauseTime;
    },
    resumeRecord() {
      jsBridge.resumeRecordAudio();
      this.setResumeRecord();
      if (this.recordAnimationStatus === RECORD_ANIMATION_STATUS.ANIMATION_START) {
        this.startState = 1;
      } else {
        this.processState = 1;
      }
      this.$logger.writeAndSend('record_replay_resumeRecord');
    },
    async resumeCb() {
      // 在本页面有过上传操作 && 没有本地报告 && 报告上传成功/没有报告上传 -> 进片尾
      if (!this.mainStore.isWebappActive) {
        this.needResumeCb = true;
        return;
      }
      jsBridge.emitChapterFinish();
      this.hasAddedCoin = true;
      this.isDisableEvent = false;
      if (!this.endVideoUrl) {
        // 此时展示反馈音频
        this.showFeedbackPart = true;
        this.recordUploaded = true;
        this.hasLocalReport = false;
        await globalResumeAudio.play(this.feedbackAudioUrl);
      }
      jsBridge.emitComplete();
      jsBridge.emitFinish();
    },
  },
};
</script>

<style lang="scss">
@import '@/common/common.scss';
body {
  width: 100%;
  height: 100%;
}

.game-wrap .container.game .btn-audio {
  bottom: 0.5rem;
  width: 1rem;
  height: 1rem;
}

.record-replay {
  width: 100%;
  height: 100%;
  .btn_back {
    position: absolute;
    left: 0.375rem;
    top: 0.45rem;
    width: 1.2rem;
    height: 1.2rem;
    z-index: 99;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .game-wrap {
    position: absolute;
    left: 44%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    // border: 8px solid #5da6ff;
    // border-radius: 16px;
    // overflow: hidden;

    &:before {
      position: absolute;
      left: -8px;
      top: -8px;
      width: 100%;
      height: 100%;
      content: '';
      background: #5da6ff;
      border: 8px solid #5da6ff;
      border-radius: 16px;
    }

    .game-wrap-inner {
      position: relative;
      border-radius: 8px;
      background-color: #5da6ff;
      overflow: hidden;
    }

    .container.game,
    .g-scene-container {
      // width: 436px;
      // height: 327px;
      width: 116.25vh;
      height: 87.2vh;
      background-color: #5da6ff;
    }

    .scene-cover {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      z-index: 100;
    }
    .progress-bar {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 4px;
      z-index: 1000;
      background-color: rgba(0, 0, 0, 0.6);
      border-radius: 2px;
      & > span {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 100%;
        background-color: #fff;
        border-radius: 2px;
      }
    }
    .replay-button {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 999;
      width: 100%;
      height: 100%;
      .mask-layer {
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        background-image: url('@/assets/record-portarit/icon_play.png');
        background-repeat: no-repeat;
        background-size: 44px 44px;
        background-position: center;
        border-radius: 8px;
      }
      .replay-duration {
        font-family: 'PingFang SC';
        position: absolute;
        right: 2vh;
        bottom: 2vh;
        color: #fff;
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
        font-size: 14px;
      }
    }

    .btn-audio {
      position: absolute;
      z-index: 9999;
      left: 2vh;
      bottom: 2vh;
      width: 1rem;
      height: 1rem;
    }
  }

  .operate-wrap {
    position: absolute;
    right: 0;
    top: 0;
    width: 151px;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;

    .op-btn {
      display: block;
      margin: 2vw 0.5vw;
      font-size: 2vw;
    }

    .op-tip {
      font-size: 2vw;
    }
    p {
      height: 22px;
      margin-top: 8px;
      font-size: 16px;
      color: #666;
      line-height: 22px;
      text-align: center;
    }
    .start-record {
      .record-button {
        width: 70px;
        height: 70px;
        margin: 0 25px;
        position: relative;
        div {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
        }
        & > div:first-child {
          width: 60px;
          height: 60px;
          left: 5px;
          top: 5px;
          background-color: #4296ff;
          background-image: url('@/assets/report/icon_record.png');
          background-repeat: no-repeat;
          background-size: 46% 46%;
          background-position: center;
          border-radius: 100%;
          overflow: hidden;
          z-index: 2;
        }
      }
    }
    .recording {
      .btn-wrapper {
        width: 128px;
        height: 64px;
        margin: 0 auto;
        .recording-start,
        .recording-processing {
          position: absolute;
          width: 128px;
          height: 64px;
        }

        .txt-duration {
          font-family: 'PingFang SC';
          position: absolute;
          display: inline-block;
          top: -6vh;
          left: 50%;
          transform: translateX(-50%);
          font-size: 14px;
          color: #44a6ff;
        }
      }

      p {
        white-space: nowrap;
      }
    }
    .record-end {
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      .upload-btn,
      .reset-btn {
        width: 100px;
        height: 90px;
        span,
        & > div {
          display: flex;
          width: 60px;
          height: 60px;
          margin-left: 20px;
          justify-content: center;
          align-items: center;
          background-color: #4296ff;
          background-repeat: no-repeat;
          background-size: 46% 46%;
          background-position: center;
          border-radius: 100%;
          overflow: hidden;
          img,
          .loading-animation {
            display: flex;
            width: 28px;
            height: 28px;
            position: relative;
          }
        }
      }
      .reset-btn span {
        background-color: transparent;
        background-image: url('@/assets/record-portarit/icon_restar.png');
      }
      .reset-btn {
        margin-top: 32px;
      }

      .upload-btn > div,
      .reset-btn span,
      .reset-btn p {
        transform: translateZ(0);
      }
    }
  }
  .feedback {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    background-color: #fff;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
  @media only screen and (max-aspect-ratio: 666/375) {
    .game-wrap .container.game,
    .game-wrap .g-scene-container {
      width: 104.625vh;
      height: 78.48vh;
    }
    .operate-wrap {
      transform: scale(0.9);
    }
  }

  /* iPad */
  @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 1) and (-webkit-max-device-pixel-ratio: 2) {
    .game-wrap {
      left: 40%;
      &:before {
        left: -12px !important;
        top: -12px !important;
        border: 12px solid #5da6ff !important;
        border-radius: 24px !important;
      }
      .game-wrap-inner {
        border-radius: 12px !important;
      }
      .mask-layer {
        border-radius: 12px !important;
      }
    }
    .game-wrap .container.game,
    .game-wrap .g-scene-container {
      width: 87.5vh;
      height: 65.5vh;
    }
    .operate-wrap {
      transform: scale(0.75);
      p {
        font-size: 4vh !important;
      }
    }
  }

  /* iPad Pro */
  @media only screen and (min-device-width: 1024px) and (max-device-width: 1366px) and (-webkit-min-device-pixel-ratio: 1) and (-webkit-max-device-pixel-ratio: 2) {
    .game-wrap {
      left: 40%;
      &:before {
        left: -12px !important;
        top: -12px !important;
        border: 12px solid #5da6ff !important;
        border-radius: 24px !important;
      }
      .game-wrap-inner {
        border-radius: 12px !important;
      }
      .mask-layer {
        border-radius: 12px !important;
      }
    }
    .game-wrap .container.game,
    .game-wrap .g-scene-container {
      width: 87.5vh;
      height: 65.5vh;
    }
    .operate-wrap {
      transform: scale(0.75);
      p {
        font-size: 4vh !important;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.recordWrap {
  width: 100%;
  height: 100%;
}
.finger-wrap {
  position: relative;
  top: 0;
  left: 0;
  width: 76px;
  height: 76px;
  z-index: 99;
  transform-origin: 0px 0px;

  img {
    display: block;
    width: 100%;
    height: 100%;
  }
}
/* iPad */
@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-device-pixel-ratio: 2) {
  .recordWrap .finger-wrap {
    width: 15.2vh;
    height: 15.2vh;
  }
}

/* iPad Pro */
@media only screen and (min-device-width: 1024px) and (max-device-width: 1366px) and (-webkit-device-pixel-ratio: 2) {
  .recordWrap .finger-wrap {
    width: 15.2vh;
    height: 15.2vh;
  }
}
</style>
