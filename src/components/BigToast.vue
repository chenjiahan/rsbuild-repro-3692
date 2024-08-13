<template>
  <div class="toast">
    {{ msg }}
  </div>
</template>

<script>
export default {
  name: 'Toast',
};
</script>

<style lang="scss" scoped>
@import '@/common/variable.scss';
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 5rem;
  max-width: 11.2rem;
  padding: 0.4rem;
  border-radius: 0.2rem;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 0.56rem;
  line-height: 0.8rem;
  text-align: center;
  white-space: pre-wrap;
  z-index: $zIndexToast;
}
</style>
