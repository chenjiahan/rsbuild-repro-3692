<template>
  <div class="btn-record">
    <div class="mask" v-show="status === RECORD_STATUS.IS_RECORDING"></div>
    <div
      class="btn-icon btn-icon-normal btn-icon-new"
      v-show="status === RECORD_STATUS.WARNING_TAP"
      v-press="{
        methods: {
          start: showPressIcon,
          end: onLimitingRecordEnd,
          cancel: onRecordStartCancel,
        },
      }"
    >
      <img
        :class="[
          'u-icon',
          'u-icon-default',
          'animate__animated',
          breathAniStatus === 1 ? 'animate__pulse' : '',
        ]"
        :src="resources.new"
        v-show="!isShowPressIcon"
      />
      <img class="u-icon u-icon-press" :src="resources.newPress" v-show="isShowPressIcon" />
    </div>

    <div
      class="btn-icon btn-icon-normal btn-icon-reopen"
      :class="getBtnIconClass()"
      v-show="status === RECORD_STATUS.NORMAL_AS_OLD || status === RECORD_STATUS.NORMAL_AS_NEW"
      v-press="{
        methods: {
          start: showPressIcon,
          end: onLimitingRecordEnd,
          cancel: onRecordStartCancel,
        },
      }"
    >
      <img
        :class="[
          'u-icon',
          'u-icon-default',
          'animate__animated',
          breathAniStatus === 1 ? 'animate__pulse' : '',
        ]"
        :src="resources.new"
        v-show="!isShowPressIcon"
      />
      <img class="u-icon u-icon-press" :src="resources.newPress" v-show="isShowPressIcon" />
    </div>
    <div
      class="btn-icon btn-icon-recording"
      v-show="status === RECORD_STATUS.IS_RECORDING"
      v-press="{
        methods: {
          start: showPressIcon,
          end: onRecordEnd,
          cancel: onRecordEndCancel,
        },
      }"
    >
      <APNG :src="recordingUrl" :isLoop="true" :playState="1" />
      <div class="txt-duration">
        {{ duration }}
      </div>
    </div>
    <div
      class="btn-icon btn-icon-wait"
      v-show="status === RECORD_STATUS.WAIT_SUBMIT"
      v-press="{
        methods: {
          start: showPressIcon,
          end: onRecordStart,
          cancel: onRecordStartCancel,
        },
      }"
    >
      <img class="u-icon u-icon-default" :src="resources.reDo" v-show="!isShowPressIcon" />
      <img class="u-icon u-icon-press" :src="resources.reDo" v-show="isShowPressIcon" />
    </div>
  </div>
</template>

<script>
import { RECORD_STATUS } from '@/data/data';
import APNG from '@/components/APNG';

const isReopen = true;

export default {
  name: 'record-btn',
  components: {
    // RecordLine,
    APNG,
  },
  props: {
    resources: {
      default: () => ({}),
      type: Object,
    },
    status: {
      default: RECORD_STATUS.NORMAL_AS_NEW,
      type: Number,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    resourcesLoaded: {
      default: false,
      type: Boolean,
    },
    isHasVoice: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      isShowPressIcon: false,
      RECORD_STATUS,
      limitingTimer: null,
      playState: 1,
      loadBreathAni: false,
      breathAniStatus: 0,
      recordingUrl: '',
      now: 0,
      startTime: 0,
    };
  },
  computed: {
    duration() {
      const v = Math.round((this.now - this.startTime) / 1000);
      if (!v) {
        return '';
      }
      const m = Math.floor(v / 60);
      const s = v % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
  },
  watch: {
    status: {
      handler(newVal, oldVal) {
        if (newVal === RECORD_STATUS.IS_RECORDING) {
          this.startTime = Date.now();
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
  },
  created() {
    this.recordingUrl =
      'https://conan-online.fbcontent.cn/webapp-question-common-resource/recordingProcessing.png';
  },
  mounted() {
    this.recordStartBreath();
  },
  methods: {
    showPressIcon() {
      if (this.disabled) return false;
      this.isShowPressIcon = true;
    },
    hidePressIcon() {
      if (this.disabled) return false;
      this.isShowPressIcon = false;
    },
    onRecordStart() {
      if (this.disabled) return false;
      this.hidePressIcon();
      this.$emit('start', isReopen);
    },
    onRecordEnd() {
      if (this.disabled) return false;
      this.isShowPressIcon = false;
      this.$emit('stop');
    },
    onRecordStartCancel() {
      this.hidePressIcon();
    },
    onRecordEndCancel() {
      this.hidePressIcon();
    },
    onLimitingRecordEnd() {
      if (!this.limitingTimer) {
        if (this.disabled) return false;
        this.hidePressIcon();
        this.$emit('start');
      } else {
        this.$toast(this.$t('toast.operation_too_frequent'));
        this.isShowPressIcon = false;
      }
      clearTimeout(this.limitingTimer);
      this.limitingTimer = setTimeout(() => {
        this.limitingTimer = null;
      }, 500);
    },
    apngLoaded(duration, index) {
      if (index === 0) {
        this.loadBreathAni = true;
      }
    },
    recordStartBreath() {
      setInterval(() => {
        this.breathAniStatus = this.breathAniStatus === 0 ? 1 : 0;
      }, 2000);
    },
    getBtnIconClass() {
      return this.isHasVoice ? 'btn-icon-with-voice' : 'btn-icon-no-voice';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/common/variable.scss';
.btn-record {
  position: absolute;
  z-index: $zIndexMask;
  width: 1.22rem;
  height: 1.22rem;
}
.btn-icon {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  .u-icon {
    width: 100%;
    height: 100%;
  }
  &.btn-icon-new,
  &.btn-icon-recording {
    top: -1rem;
  }
}
.btn-icon-no-voice {
  top: -1rem;
}
.btn-icon-with-voice {
  bottom: 0.68rem;
}
.btn-icon-recording {
  width: 2.42rem;
  left: -0.6rem;

  .txt-duration {
    font-family: 'PingFang SC';
    position: absolute;
    display: inline-block;
    top: -0.4rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 14px;
    color: #44a6ff;
    line-height: 0.4rem;
  }
}
.btn-icon-wait {
  left: -1.12rem;
}
.mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0;
}
.record-line {
  top: 50%;
}
.record-line:nth-last-of-type(odd) {
  left: -1rem;
}
.record-line:nth-last-of-type(even) {
  right: -1rem;
}
</style>
