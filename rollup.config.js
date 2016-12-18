import typescript from 'typescript'
import ts from 'rollup-plugin-typescript'

export default {
 entry: 'src/collectable/index.ts',
 dest: 'dist/collectable.js',
 format: 'umd',
 moduleName: 'collectable',
 plugins: [
  ts({ typescript, target: 'es5' })
 ]
}
