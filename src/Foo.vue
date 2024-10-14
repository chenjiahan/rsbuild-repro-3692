<template>
  <div>Foo</div>
</template>

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
