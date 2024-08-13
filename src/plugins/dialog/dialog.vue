<template>
  <div class="zebra-dialog">
    <div
      class="zebra-dialog__mask"
      v-for="(item, index) in dialogs"
      :key="`dialog_${index}`"
      @touchmove.prevent
    >
      <div class="zebra-dialog__main">
        <div class="zebra-dialog__content">
          <div class="zebra-dialog__title">
            {{ title }}
          </div>
          <div v-if="subTitle" class="zebra-dialog__sub-title">
            {{ subTitle }}
          </div>
        </div>
        <div class="zebra-dialog__btns">
          <div
            v-if="!isAlert"
            :style="{
              color: leftColor,
            }"
            class="zebra-dialog__btn zebra-dialog__btn-l"
            @click="onLeftBtnTap"
          >
            {{ leftText || $t('confirm.cancel') }}
          </div>
          <div class="zebra-dialog__btn zebra-dialog__btn-r" @click="onRightBtnTap">
            {{ mainText || $t('alert.confirm') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @file 对话框
 * @author zhaiwanli
 */

export default {
  props: {
    title: {
      default: '提示',
      type: String,
    },
    subTitle: {
      default: '',
      type: String,
    },
    // 隐藏左侧按钮，即alert模式
    isAlert: {
      default: false,
      type: Boolean,
    },
    leftColor: {
      default: '#666',
      type: String,
    },
    leftText: {
      default: '',
      type: String,
    },
    mainText: {
      default: '',
      type: String,
    },
  },
  data() {
    return {
      dialogs: [],
      promise: null,
      resolveHandler: null,
    };
  },
  methods: {
    // 添加一个dialog
    add(options) {
      this.dialogs.push(options);

      return (this.promise = new Promise(resolve => {
        this.resolveHandler = resolve;
      }));
    },
    // 移除dialog
    remove() {
      setTimeout(() => {
        this.dialogs = [];
      }, 150);
    },
    onLeftBtnTap() {
      this.resolveHandler(0);
      this.remove();
    },
    onRightBtnTap() {
      this.resolveHandler(1);
      this.remove();
    },
  },
};
</script>

<style lang="scss" scoped>
.zebra-dialog__mask {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.zebra-dialog__main {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  background: #fff;
  color: #333;
  overflow: hidden;
  min-width: 300px;
  max-width: 350px;
  z-index: 999;
}

.zebra-dialog__content {
  padding: 20px;
  text-align: center;
  line-height: 1.5;
  word-break: break-word;
  border-bottom: 1px solid #e7e7e7;
}

.zebra-dialog__title {
  font-size: 17px;
}

.zebra-dialog__sub-title {
  margin-top: 10px;
  font-size: 13px;
}

.zebra-dialog__btns {
  display: flex;
}

.zebra-dialog__btn {
  flex: 1;
  width: 0;
  padding: 14px;
  color: #60c15b;
  text-align: center;
  font-size: 17px;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .zebra-dialog:active {
    background-color: mix(#fff, #ccc);
  }
}
.zebra-dialog__btn-l {
  color: #666;
  border-right: 1px solid #e7e7e7;
}
</style>
