import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next', 'next/navigation'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.banner = {
      js: '"use client";',
    }
  }
}) 