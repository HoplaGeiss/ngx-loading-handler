import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular({ tsconfig: 'projects/ngx-loading-handler/tsconfig.spec.json' })],
  resolve: {
    dedupe: ['@angular/core', '@angular/common', '@angular/compiler', '@angular/platform-browser'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    include: ['projects/ngx-loading-handler/**/*.spec.ts'],
  },
});
