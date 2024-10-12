<template>
  <div class="container" ref="container">
    <star-card :star-count="3"></star-card>
    <div class="star">star</div>
    <van-tag type="primary">标签</van-tag>
  </div>
</template>

<script>
import { StarCard } from '@repo/ui';

export default {
  components: {StarCard},
  mounted() {
    console.log(this.$refs.container);
  }
}
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
.star {
  width: 40px;
}
</style>
