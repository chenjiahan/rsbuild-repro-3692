<template>
  <div class="container" ref="container">
    <star-card :star-count="3"></star-card>
  </div>
</template>

<script>
import StarCard from './Foo.vue';

export default {
  components: { StarCard },
};
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
