<template>
  <div class="voice-message" :class="statusClass" v-if="info && info.url">
    <template v-if="isToSplitName">
      <p class="txt-label">
        {{ info.userName }}
      </p>
      <p class="txt-label">
        {{ $t('common.baby_explain') }}
      </p>
    </template>
    <p v-else class="txt-label">
      {{ `${info.userName}${$t('common.baby_explain')}` }}
    </p>
    <div
      class="voice-wrapper"
      v-press="{
        methods: {
          start: showPressBg,
          end: emitPlay,
          cancel: hidePressBg,
        },
      }"
      :style="{ backgroundImage: isPress ? `url(${resources.bgPress})` : `url(${resources.bg})` }"
    >
      <span class="icon-voice" :style="{ backgroundImage: `url(${resources.voiceIcon})` }"></span>
      <span class="txt-duration">{{ info.duration | formatDuration }}</span>
      <span
        class="icon-status btn-err"
        :style="{ backgroundImage: `url(${resources.errorIcon})` }"
      ></span>
      <span
        class="icon-status btn-loading"
        :style="{ backgroundImage: `url(${resources.loadingIcon})` }"
      ></span>
    </div>
  </div>
</template>

<script>
import { VOICE_STATUS } from '@/data/data';

export default {
  props: {
    resources: {
      default: () => ({}),
      type: Object,
    },
    info: {
      default: () => ({}),
      type: Object,
    },
    // 语音的播放状态和语音右侧icon状态是不同层级
    status: {
      default: VOICE_STATUS.HIDE,
      type: Number,
    },
    isPlaying: {
      default: false,
      type: Boolean,
    },
    // 是否将姓名和提示语拆成两行
    isToSplitName: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      isPress: false,
    };
  },
  filters: {
    formatDuration(val) {
      // 转换格式为 00:00 分:秒
      const v = Math.ceil(+val);
      const m = Math.floor(v / 60);
      const s = v % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
  },
  computed: {
    statusClass() {
      const classes = [];
      this.isPlaying && classes.push('f-playing');
      switch (this.status) {
        case VOICE_STATUS.UPLOAD_ERROR:
          classes.push('f-error');
          break;
        case VOICE_STATUS.UPLOADING:
          classes.push('f-loading');
          break;
        case VOICE_STATUS.HIDE:
          classes.push('f-hide');
          break;
        case VOICE_STATUS.NORMAL:
        default:
          break;
      }
      return classes;
    },
  },
  methods: {
    emitPlay() {
      this.isPress = false;
      this.$emit('play', this.info.url);
    },
    showPressBg() {
      this.isPress = true;
    },
    hidePressBg() {
      this.isPress = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.voice-message {
  position: absolute;
  left: 0;
  top: 0.6rem;
  width: 100%;
  &.f-default {
    .icon-status {
      display: none;
    }
  }
  &.f-playing {
    .icon-voice {
      animation: sequence steps(3) infinite 1s reverse;
      -webkit-animation: sequence steps(3) infinite 1s reverse;
    }
  }
  &.f-hide {
    display: none;
  }
  &.f-loading {
    .icon-status.btn-loading {
      display: inline-block;
    }
  }
  &.f-error {
    .icon-status.btn-err {
      display: inline-block;
    }
  }
}
.txt-label {
  width: 100%;
  text-align: center;
  line-height: 0.44rem;
  font-size: 0.32rem;
  color: #555e66;
}
.voice-wrapper {
  position: relative;
  margin: 0.34rem auto;
  width: 3.26rem;
  height: 0.68rem;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.icon-voice {
  position: absolute;
  display: inline-block;
  top: 50%;
  left: 0.3rem;
  margin-top: -0.21rem;
  width: 0.42rem;
  height: 0.42rem;
  background-position: -200% 0;
  background-size: 300% 100%;
}
.txt-duration {
  font-family: 'PingFang SC';
  position: absolute;
  display: inline-block;
  top: 50%;
  left: 0.85rem;
  margin-top: -0.2rem;
  font-size: 0.28rem;
  color: #44a6ff;
  line-height: 0.4rem;
}
.icon-status {
  position: absolute;
  display: none;
  top: 50%;
  right: -0.6rem;
  margin-top: -0.2rem;
  width: 0.4rem;
  height: 0.4rem;
  background-size: 100% 100%;
  &.btn-loading {
    transform-origin: center;
    animation: rotate steps(8) infinite 1s;
    -webkit-animation: rotate steps(8) infinite 1s;
  }
}

@keyframes sequence {
  from {
    background-position: -300% 0;
  }
  to {
    background-position: 0 0;
  }
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
