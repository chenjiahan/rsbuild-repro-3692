<template>
  <div class="star-wrap" :class="{ 'small-size': size === 'small' }">
    <img
      class="star"
      :style="{ marginRight: `${0.27 * marginRight}vw` }"
      v-for="i in starCount"
      :key="`yellow-${i}`"
      src="../assets/star_yellow.png"
    />
    <img
      class="star"
      :style="{ marginRight: `${0.27 * marginRight}vw` }"
      v-for="j in greyStarCount"
      :key="`grey-${j}`"
      src="../assets/star_gray.png"
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class StarCard extends Vue {
  @Prop() public starCount;
  @Prop({ default: 10 }) public marginRight;
  @Prop() public size;

  public get greyStarCount() {
    return Math.max(0, 3 - this.starCount);
  }
}
</script>

<style lang="scss" scoped>
.star-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.star {
  margin-right: 10px;
  width: 22px;
  height: 21px;
  will-change: transform;
}

.star:last-child {
  margin-right: 0;
}

.small-size .star {
  width: 15px;
  height: 15px;
  margin-right: 3px;
}
</style>
