<template>
  <div class="container game" ref="webapp">
    <slot></slot>
  </div>
</template>

<script>
import useStore from '@/stores/index';
import { mapStores } from 'pinia';
import { debounce } from 'lodash-es';
import {
  getConfig,
  getReport,
} from '@/services';
import '@vant/touch-emulator';

export default {
  props: {
    getReportFunction: {
      type: Function,
      default: getReport,
    },
  },
  data() {
    return {
      needResizeHandler: true,
    };
  },
  computed: {
    ...mapStores(useStore),
  },
  async created() {
    this.$logger.writeAndSend('webapp_created');
    const [config, report] = await Promise.all([
      this.getConfigByPrefix(this.$query.configResourcePrefix),
      this.getReportFunction(),
    ]);
    console.log('queryString', this.$query);
    this.$emit('loaded', config, report);
  },
  async mounted() {
    this.windowResizeHandler();
  },
  methods: {
    windowResizeHandler() {
      this.windowWidth = document.documentElement.clientWidth;
      this.windowHeight = document.documentElement.clientHeight;
      this.$logger.writeAndSend('get_window_size', {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        documentWidth: document.documentElement.clientWidth,
        documentHeight: document.documentElement.clientHeight,
      });
      window.addEventListener('resize', debounce(this.updateQuestion, 100));
    },
    updateQuestion() {
      if (
        this.needResizeHandler &&
        (this.windowWidth !== document.documentElement.clientWidth ||
          this.windowHeight !== document.documentElement.clientHeight)
      ) {
        this.$logger.writeAndSend('get_window_resize', {
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          documentWidth: document.documentElement.clientWidth,
          documentHeight: document.documentElement.clientHeight,
        });
        this.windowWidth = document.documentElement.clientWidth;
        this.windowHeight = document.documentElement.clientHeight;
        this.$emit('resize');
      }
      this.needResizeHandler = true;
    },
    async getConfigByPrefix(configResourcePrefix = '') {
      const config = await getConfig(
        configResourcePrefix + (configResourcePrefix.includes('.json') ? '' : 'config.json')
      );
      this.$logger.writeAndSend('webapp_get_config', {
        stepNum: config.content?.length,
      });
      return config;
    },
  },
};
</script>
