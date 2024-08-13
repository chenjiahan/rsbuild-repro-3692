<template>
  <div
    :class="['g-scene-container', info.content.pattern]"
    :style="{ ...setInitialBg, ...{ backgroundSize: 'cover' } }"
  >
    <div
      v-for="item in collides"
      :key="`collide-item-${item.index}`"
      class="collide-item"
      :class="`collide-item${item.index}`"
      :style="{ zIndex: item.zIndex || 10 }"
    >
      <v-image :src="resources[item.imageId]" class="u-icon" />
    </div>
    <movable-view
      v-for="item in options"
      :key="`option-item-${item.index}`"
      direction="all"
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
      :timeLineData="timeLineOptionData[item.index]"
      :offsets="offsets"
      :operableArea="operableArea"
      :position.sync="curPos[item.index]"
      :disabled="isDisableEvent"
      :bindtouchstart="onTouchStart"
      :bindtouchmove="onTouchMove"
      :bindtouchend="onTouchEnd"
      class="option-item"
      :data-index="item.index"
      :class="[`option-item${item.index}`, ...getOptionClasses(item.index)]"
      :style="getZIndex(item.index)"
      @replay-finished="replayFinished"
      @record-option-data="recordOptionData"
    >
      <v-image
        class="u-icon u-icon-default"
        :src="resources[item.imageId]"
        :data-index="item.index"
      />
      <v-image
        class="u-icon u-icon-move"
        :src="resources[item.moveImageId]"
        :data-index="item.index"
      />
    </movable-view>
  </div>
</template>
<style scoped>
.container.game .collide-item .u-icon {
  opacity: 1;
}
</style>
<script>
import { getPosInfo } from '@/utils/recordInitData';
import { insertCss } from '@/utils/initData';

export default {
  props: {
    info: {
      default: () => ({}),
      type: Object,
    },
    isRestore: {
      type: Boolean,
      default: false,
    },
    toReset: {
      type: Boolean,
      default: false,
    },
    toRestore: {
      type: Boolean,
      default: false,
    },
    isRecording: {
      type: Boolean,
      default: false,
    },
    recordStartTime: {
      type: Number,
      default: 0,
    },
    recordEndTime: {
      type: Number,
      default: 0,
    },
    isReplaying: {
      type: Boolean,
      default: false,
    },
    replayStartTime: {
      type: Number,
      default: 0,
    },
    replayEndTime: {
      type: Number,
      default: 0,
    },
    recordPauseDuration: {
      type: Number,
      default: 0,
    },
    isPausing: {
      type: Boolean,
      default: false,
    },
    replayPauseTime: {
      type: Number,
      default: 0,
    },
    replayResumeTime: {
      type: Number,
      default: 0,
    },
    timeLineOptionData: {
      type: Array,
      default() {
        return [];
      },
    },
    offsets: {
      default() {
        return {
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        };
      },
      type: Object,
    },
    operableArea: {
      default() {
        return {
          x: 0,
          y: 0,
        };
      },
      type: Object,
    },
  },
  watch: {
    // 录制回放，触发重置 by zhaiwanli
    toReset: {
      handler() {
        this.restore();
        this.finishedCounter = 0;
      },
    },
    toRestore: {
      handler() {
        this.optionDataList = new Array(this.options.length).fill(null);
      },
    },
  },
  mounted() {
    this.initAudio();
    this.isInitPageRight = true;
    this.initPage(this.info);
    window.addEventListener(
      'resize',
      () => {
        this.resetPage();
      },
      false
    );
    this.optionDataList = new Array(this.options.length).fill(null);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resetPage);
  },
  data() {
    return {
      optionZIndex: [],
      dragTimes: 0,

      resources: {},
      collides: [],
      options: [],
      activeIndex: -1,
      isDisableEvent: false,
      curPos: null,

      // 录制回放，完成回放的option计数 by zhaiwanli
      finishedCounter: 0,
    };
  },
  computed: {
    getZIndex() {
      return function (index) {
        return `zIndex: ${this.optionZIndex[index]}`;
      };
    },
    setInitialBg() {
      const bg = this.info.resources[`bg${this.info.index}`];
      if (bg) {
        return {
          backgroundImage: `url(${bg})`,
        };
      } else {
        return {};
      }
    },
  },
  methods: {
    // 录制回放，完成回放的option计数 by zhaiwanli
    replayFinished() {
      // 录制回放，判断是否已回放完成 by zhaiwanli
      if (++this.finishedCounter === this.timeLineOptionData.length) {
        this.$emit('updateReplayFinished', true);
      }
    },
    recordOptionData(index, optionData) {
      this.optionDataList[index] = optionData;
      if (this.optionDataList.every(optData => optData)) {
        this.$emit('update:timeLineOptionData', this.optionDataList);
      }
    },
    resetPage() {
      // NOTE: refresh current scene to prevent the wrong rendering of positions caused by screen's rotation
      if (
        document.documentElement.clientWidth > document.documentElement.clientHeight &&
        !this.isDisableEvent &&
        !this.isInitPageRight
      ) {
        this.initPage(this.info);
        this.restore();
      }
    },
    initPage(info) {
      const {
        resources,
        content: { collides, options },
      } = info;
      this.resources = resources;
      // NOTE: 场景切换题型单独处理
      const { originPos, cssStr } = getPosInfo(collides, options);
      insertCss(cssStr);

      this.collides = collides || [];
      this.options = options || [];

      this.originPos = originPos;
      this.customInit();
    },
    customInit() {
      // 录制回放，重置
      this.isDisableEvent = false;
      this.curPos = JSON.parse(JSON.stringify(this.originPos));
      this.dragTimes = 0;
    },
    initAudio() {
      // for click/correct/error.mp3
      this.audio = new Audio();
    },
    onTouchStart(evt) {
      if (this.ifDisableTouch(evt)) return false;
      this.activeIndex = +evt.target.dataset.index;
      this.audio.src = this.resources.click;
      this.dragTimes++;
    },
    onTouchMove(evt) {
      if (this.ifDisableTouch(evt)) return false;
    },
    onTouchEnd(evt) {
      if (this.ifDisableTouch(evt)) return false;
      this.$emit('updateRecordDragTimes', this.dragTimes);
      this.activeIndex = -1;
    },

    restore() {
      this.isLock = true;

      this.customInit();
      this.optionZIndex.fill(10);
      this.activeIndex = -1;
      this.dragTimes = 0;
      this.$emit('updateRecordDragTimes', this.dragTimes);
    },
    ifDisableTouch(evt) {
      switch (evt.type) {
        case 'touchstart':
          return this.isDisableEvent || Number(this.activeIndex) !== -1;
        case 'touchend':
        default:
          return (
            this.isDisableEvent || Number(this.activeIndex) !== Number(evt.target.dataset.index)
          );
      }
    },
    getOptionClasses(index) {
      // NOTE: activeIndex强制class可以及时获取
      if (this.activeIndex === +index) {
        return ['f-select', 'f-highest', 'f-move'];
      } else {
        return ['f-default'];
      }
    },
  },
};
</script>
