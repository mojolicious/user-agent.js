import Path from '@mojojs/path';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: Path.currentFile().sibling('lib', 'browser.js').toString(),
  output: {
    entryFileNames: '[name].js',
    dir: Path.currentFile().sibling('dist').toString()
  },
  plugins: [resolve(), terser()]
};
