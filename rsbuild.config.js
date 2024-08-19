import { defineConfig } from '@rsbuild/core';
import { pluginVue2 } from '@rsbuild/plugin-vue2';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginCheckSyntax } from '@rsbuild/plugin-check-syntax';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';

import { browserslist } from './package.json';

const isDev = process.env.NODE_ENV === 'development';

const entry = {};
const htmls = {};

['record-portrait', 'record-replay'].forEach(chapterType => {
  entry[chapterType] = `./src/pages/${chapterType}/main.js`;
});

export default defineConfig({
  plugins: [
    pluginVue2(),
    pluginSass(),
    pluginCheckSyntax({
      targets: browserslist,
      ecmaVersion: 5,
    }),
  ],
  tools: {
    rspack: {
      plugins: [
        // 仅在 RSDOCTOR 为 true 时注册插件，因为插件会增加构建耗时
        process.env.RSDOCTOR && new RsdoctorRspackPlugin(),
      ].filter(Boolean),
      output: {
        asyncChunks: false,
      },
    },
    htmlPlugin(config, { entryName }) {
      Object.assign(config, htmls[entryName]);
    },
    postcss: opts => {
      // apply cssnano in production build
      if (!isDev) {
        opts.postcssOptions?.plugins?.push(require('cssnano'));
      }
    },
  },
  source: {
    entry,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    include: [
      /node_modules[\\/]pinia[\\/]/,
      /node_modules[\\/]uuid[\\/]/,
      /node_modules[\\/]@vue[\\/]devtools-api[\\/]/,
    ],
    alias: {
      '@': './src',
    },
  },
  html: {
    mountId: 'app',
    template: './public/index.html',
  },
  output: {
    filenameHash: false,
    injectStyles: true,
    polyfill: 'entry',
    dataUriLimit: 102400,
    legalComments: 'none',
    sourceMap: {
      js: isDev
        ? // 开发模式使用性能更好的 source map 格式
        'cheap-module-source-map'
        : // 生产模式使用高质量的 source map 格式
        'source-map',
    },
  },
  performance: {
    chunkSplit: {
      strategy: isDev ? 'split-by-experience' : 'all-in-one',
    },
  },
});
