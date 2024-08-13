<template>
  <div class="toast-container">
    <div class="toast">
      {{ msg }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Toast',
};
</script>

<style lang="scss" scoped>
@import '@/common/variable.scss';
.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toast {
  min-width: 2rem;
  max-width: 6.08rem;
  padding: 0.34rem 0.41rem;
  border-radius: 0.2rem;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 0.32rem;
  line-height: 0.44rem;
  text-align: center;
  white-space: pre-wrap;
  z-index: $zIndexToast;
}
</style>
