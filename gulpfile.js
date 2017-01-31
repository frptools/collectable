const gulp = require('gulp');
const tslint = require('tslint');
const gtslint = require('gulp-tslint');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const transform = require('gulp-transform');
const typedoc = require('gulp-typedoc');
const rimraf = require('rimraf');
const merge = require('merge2');

const tsproj = {
  js: ts.createProject('./tsconfig.json', {target: 'es5'}),
  es2015: ts.createProject('./tsconfig.json', {target: 'es6', 'declaration': true}),
  tests: ts.createProject('./tsconfig.json', {target: 'es6', rootDir: './', noUnusedLocals: false})
};

function removeDebugLines(buffer) {
  const src = buffer.toString();
  return src
    .replace(/.*\/\/ ## DEBUG ONLY\s*(\n|$)/g, '')
    .replace(/^.*\/\/ ## DEBUG START\s*(\n|$)[\s\S]*?\/\/ ## DEBUG END\s*(\n|$)/gm, '')
    .replace(/^(\r\n){2,}/mg, '$1');
}

function replaceSourcePaths(buffer) {
  const src = buffer.toString();
  return src.replace(/..\/src\//g, '../es2015/');
}

function compile() {
  const src = gulp.src('./lib/ts/**/*.ts')
    .pipe(plumber())
    .pipe(sourcemaps.init());
  const ts_es5 = src.pipe(tsproj.js());
  const ts_es6 = src.pipe(tsproj.es2015());
  const tests = gulp.src('./tests/**/*.ts')
    .pipe(plumber())
    .pipe(sourcemaps.init());
  const ts_tests = tests.pipe(tsproj.tests());
  return merge([
    ts_es5.js
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./lib/es5')),
    ts_es6.js
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./lib/es2015')),
    ts_es6.dts
      .pipe(gulp.dest('./lib/es2015')),
    ts_tests.js
      .pipe(transform(replaceSourcePaths))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./lib/tests'))
  ]);
}

function preprocess() {
  const program = tslint.Linter.createProgram('./tsconfig.json');
  return gulp.src('./src/**/*.ts')
    .pipe(plumber())
    .pipe(transform(removeDebugLines))
    .pipe(gulp.dest('./lib/ts'));
}

function lint() {
  return gulp.src('./lib/ts/**/*.ts')
    .pipe(plumber())
    .pipe(gtslint({formatter: "verbose"}))
    .pipe(gtslint.report());
}

function runTests() {
  require('source-map-support').install();
  return gulp
    .src(['./lib/tests/**/*.js'], {read: false})
    .pipe(plumber())
    .pipe(mocha({timeout: 10000, ui: 'tdd'}));
}

function buildDocs() {
  return gulp
    .src([
      './src/**/index.ts',
      './src/map/map.ts',
      './src/list/list.ts',
      './src/set/set.ts',
    ])
    .pipe(typedoc({
      module: 'commonjs',
      target: 'es6',
      out: './docs',
      json: './docs/docs.json',
      name: 'Collectable.js',
      theme: 'default',
      ignoreCompilerErrors: false,
      excludeExternals: true,
    }));
}

gulp.task('typedoc', buildDocs);
gulp.task('clean', cb => rimraf('./lib', cb));
gulp.task('preprocess', preprocess);
gulp.task('compile', ['preprocess'], compile);
gulp.task('watch', () => gulp.watch(['./src/**/*.ts', './tests/**/*.ts', './README.md'], ['build']));
gulp.task('test', ['compile', 'lint'], runTests);
gulp.task('lint', ['preprocess', 'compile'], lint);
gulp.task('build', ['preprocess', 'compile', 'test', 'lint']);
gulp.task('dev', ['build', 'watch']);
gulp.task('dev:docs', ['typedoc'], () => gulp.watch(['./lib/src/**/*.ts', './README.md'], ['typedoc']));
gulp.task('default', ['compile']);