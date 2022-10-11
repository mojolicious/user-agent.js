import Path from '@mojojs/path';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: Path.currentFile().sibling('lib', 'browser.js').toString(),
  output: {
    entryFileNames: '[name].js',
    dir: Path.currentFile().sibling('dist').toString(),
    format: 'es',
    exports: 'named'
  },
  plugins: [resolve()]
};
