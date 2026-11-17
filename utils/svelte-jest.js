import { compile, compileModule } from 'svelte/compiler';

// Jest transformer: compiles .svelte components and .svelte.js rune modules
// to browser JavaScript, the same output Vite produces in development.
export default {
  process(source, filename) {
    const { js } = filename.endsWith('.svelte')
      ? compile(source, { filename, dev: true, css: 'injected' })
      : compileModule(source, { filename, dev: true });
    return { code: js.code, map: js.map };
  },
};
