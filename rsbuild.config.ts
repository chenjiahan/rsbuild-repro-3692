import { defineConfig } from '@rsbuild/core';
import { pluginVue2 } from '@rsbuild/plugin-vue2';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginCheckSyntax } from '@rsbuild/plugin-check-syntax';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';

const isDev = process.env.NODE_ENV === 'development';

const entry = {
  'test-page': './src/test-page/entry.js',
};

export default defineConfig({
  plugins: [pluginVue2(), pluginSass()],
});
