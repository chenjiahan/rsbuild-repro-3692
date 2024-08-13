<template>
  <!--
  NOTE: 为什么在通用组件中加transition，而不在scene-link-drag中特别加transition-group?
  因为transition-group子元素中的动画会出现闪现的bug，暂无法解决
  -->
  <div
    class="moveable-view"
    :class="{ 'f-animation': !isTouch && !isRestore }"
    :style="transform"
    :data-index="dataIndex"
    ref="moveableView"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.moveable-view {
  // 保证所有moveeable-view不会被其他normal元素遮住
  z-index: 10;
  left: 0;
  top: 0;
  transform-origin: center center;
  &.f-animation {
    transition: transform 0.3s ease;
  }
}
</style>

<script>
// const DIRECTION = {
//   all: "all",
//   // vertical: "vertical",
//   // horizontal: "horizontal",
//   none: "none"
// };

export default {
  props: {
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
    timeLineData: {
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
    position: {
      default() {
        return {
          x: 0,
          y: 0,
          angle: 0,
        };
      },
      type: Object,
    },
    // 可移动的方向
    // direction: {
    //   default: DIRECTION.all,
    //   type: String
    // },
    disabled: {
      default: false,
      type: Boolean,
    },
    dataIndex: {
      default: 0,
      type: Number,
    },
    bindtouchstart: null,
    bindtouchmove: null,
    bindtouchend: null,
  },
  data() {
    return {
      touchX: 0,
      touchY: 0,
      // 停止touch后设置curX/curY会有缓动动画
      isTouch: false,
      started: false,
      // 时间轴步进序列号
      timeLineStep: 0,
      // 时间轴数据队列
      timeLine: [],
      // 时间轴锁，以防一次循环执行两次回调
      timeLineLocked: false,
      // 时间轴动画raf
      timeLineEngine: null,
      // 暂停总时长
      pauseDuration: 0,
    };
  },
  mounted() {
    this.timeLine = this.timeLineData;
    this.$nextTick(() => {
      const moveableDom = this.$refs.moveableView;
      moveableDom.addEventListener('touchstart', this.touchStartHandler, false);
      moveableDom.addEventListener('touchmove', this.touchMoveHandler, false);
      moveableDom.addEventListener('touchend', this.touchEndHandler, false);
      moveableDom.addEventListener('touchcancel', this.touchEndHandler, false);
    });
  },
  beforeDestroy() {
    const moveableDom = this.$refs.moveableView;
    moveableDom.removeEventListener('touchstart', this.touchStartHandler, false);
    moveableDom.removeEventListener('touchmove', this.touchMoveHandler, false);
    moveableDom.removeEventListener('touchend', this.touchEndHandler, false);
    moveableDom.removeEventListener('touchcancel', this.touchEndHandler, false);
  },
  computed: {
    transform() {
      if (this.position.angle) {
        return {
          transform: `translate3d(${this.position.x}px, ${this.position.y}px, 0) rotate${this.position.axis}(${this.position.angle}deg)`,
        };
      } else {
        return {
          transform: `translate3d(${this.position.x}px, ${this.position.y}px, 0)`,
        };
      }
    },
  },
  watch: {
    timeLineData(val) {
      this.timeLine = val;
    },
    toReset() {
      this.timeLineStep = 0;
      this.pauseDuration = 0;
      this.timeLineEngine = null;
    },
    toRestore() {
      this.timeLineStep = 0;
      this.pauseDuration = 0;
      this.timeLine = [];
      this.timeLineLocked = false;
      this.timeLineEngine = null;
    },
    isReplaying(val) {
      val && this.replay();
    },
    isPausing(val) {
      val ? this.pause() : this.replay();
    },
    replayResumeTime(val) {
      this.pauseDuration += val - this.replayPauseTime;
    },
    isRecording(val) {
      if (val) {
        this.timeLine = [];
      }
    },
    recordEndTime() {
      this.$emit('record-option-data', this.dataIndex, this.timeLine);
    },
  },
  methods: {
    touchStartHandler(el) {
      el.preventDefault();
      this.touchstart(el);
    },
    touchMoveHandler(el) {
      el.preventDefault();
      this.touchmove(el);
    },
    touchEndHandler(el) {
      el.preventDefault();
      this.touchend(el);
    },
    touchstart(el) {
      if (this.disabled) return false;
      !!this.bindtouchstart && this.bindtouchstart(el);
      this.isRecording &&
        this.timeLine.push({
          // 事件类型，s: touchstart，m: touchmove，e: touchend
          e: 's',
          // 距录制开始的时长
          t: Date.now() - this.recordStartTime - Number(this.recordPauseDuration),
          // 轨迹点在横轴的百分比位置
          x: +(this.position.x / this.offsets.width).toFixed(6),
          // 轨迹点在纵轴的百分比位置
          y: +(this.position.y / this.offsets.height).toFixed(6),
        });
    },
    touchmove(el) {
      if (this.disabled || !el.targetTouches[0]) return false;

      // NOTE: bindtouchmove有return false才可以禁掉，return;或无return都不起作用
      const isDisableMove = this.bindtouchmove ? this.bindtouchmove(el) : true;

      // isTouch放在touchstart中会导致位置闪现的bug
      !this.isTouch && isDisableMove !== false && (this.isTouch = true);

      if (isDisableMove !== false) {
        // 将props传入的属性直接修改,使用targetTouches 可避免多指同时在一个元素上跳转的问题
        let x = el.targetTouches[0].clientX - el.target.offsetWidth / 2 - this.offsets.x;
        let y = el.targetTouches[0].clientY - el.target.offsetHeight / 2 - this.offsets.y;

        if (x <= 0) x = 0;
        if (x >= this.operableArea.x - el.target.offsetWidth)
          x = this.operableArea.x - el.target.offsetWidth;
        if (y <= 0) y = 0;
        if (y >= this.operableArea.y - el.target.offsetHeight)
          y = this.operableArea.y - el.target.offsetHeight;

        this.$emit('update:position', { ...this.position, x, y });

        if (this.isRecording && !this.timeLineLocked) {
          this.timeLineLocked = true;

          window.setTimeout(() => {
            this.timeLineLocked = false;

            this.timeLine.push({
              e: 'm',
              t: Date.now() - this.recordStartTime - Number(this.recordPauseDuration),
              x: +(x / this.offsets.width).toFixed(6),
              y: +(y / this.offsets.height).toFixed(6),
            });
          }, 20);
        }
      }
    },
    touchend(el) {
      if (this.disabled) return false;
      this.isTouch = false;
      !!this.bindtouchend && this.bindtouchend(el);

      this.isRecording &&
        this.timeLine.push({
          e: 'e',
          t: Date.now() - this.recordStartTime - Number(this.recordPauseDuration),
          x: +(this.position.x / this.offsets.width).toFixed(6),
          y: +(this.position.y / this.offsets.height).toFixed(6),
        });
    },
    pause() {
      this.timeLineEngine = null;
    },
    replay() {
      this.timeLineEngine = () =>
        window.setTimeout(() => {
          // 无回放数据
          if (!this.timeLine[this.timeLineStep] || this.isPausing || !this.isReplaying) return;

          if (
            Date.now() - this.pauseDuration - this.replayStartTime >=
            this.timeLine[this.timeLineStep].t
          ) {
            const x = this.timeLine[this.timeLineStep].x * this.offsets.width;
            const y = this.timeLine[this.timeLineStep].y * this.offsets.height;
            // 时间轴开始循环调用
            switch (this.timeLine[this.timeLineStep].e) {
              case 's':
                this.isTouch = true;
                this.touchstart({
                  type: 'touchstart',
                  replay: true,
                  target: {
                    dataset: {
                      index: this.dataIndex,
                    },
                  },
                  targetTouches: [
                    {
                      clientX: this.position.x,
                      clientY: this.position.y,
                    },
                  ],
                  changedTouches: [
                    {
                      clientX: this.position.x,
                      clientY: this.position.y,
                    },
                  ],
                });
                this.timeLineStep++;
                break;
              case 'm':
                this.$emit('update:position', { ...this.position, x, y });

                this.bindtouchmove({
                  type: 'touchmove',
                  replay: true,
                  target: {
                    dataset: {
                      index: this.dataIndex,
                    },
                  },
                  targetTouches: [
                    {
                      clientX: x,
                      clientY: y,
                    },
                  ],
                  changedTouches: [
                    {
                      clientX: x,
                      clientY: y,
                    },
                  ],
                });
                this.timeLineStep++;
                break;
              case 'e':
                this.isTouch = false;
                this.touchend({
                  type: 'touchend',
                  replay: true,
                  target: {
                    dataset: {
                      index: this.dataIndex,
                    },
                  },
                  targetTouches: [
                    {
                      clientX: this.position.x,
                      clientY: this.position.y,
                    },
                  ],
                  changedTouches: [
                    {
                      clientX: this.position.x,
                      clientY: this.position.y,
                    },
                  ],
                });
                this.timeLineStep++;
                break;
              default:
                break;
            }
            // 回放结束
            if (this.timeLineStep === this.timeLine.length) {
              this.$emit('replay-finished', this.dataIndex, this.timeLine);
              return;
            }
          }

          this.timeLineEngine && this.timeLineEngine();
        }, 20);
      this.timeLineEngine();
    },
  },
};
</script>
