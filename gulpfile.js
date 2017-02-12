const gulp = require(`gulp`);
const tslint = require(`tslint`);
const gtslint = require(`gulp-tslint`);
const ts = require(`gulp-typescript`);
const mocha = require(`gulp-mocha`);
const sourcemaps = require(`gulp-sourcemaps`);
const plumber = require(`gulp-plumber`);
const transform = require(`gulp-transform`);
const typedoc = require(`gulp-typedoc`);
const rimraf = require(`rimraf`);
const merge = require(`merge2`);
const argv = require(`yargs`).argv;

const path = typeof argv.pkg === `string` ? `./packages/${argv.pkg}` : `.`;
const tsproj = {
  commonjs: ts.createProject(`./tsconfig.json`, {declaration: true}),
  module: ts.createProject(`./tsconfig.json`, {declaration: true, module: `es2015`}),
  tests: ts.createProject(`./tsconfig.json`, {rootDir: `${path}/`, noUnusedLocals: false})
};

/*
  Preprocessor Directives
  =======================

  // --- OMIT A SINGLE LINE ----------------------------------------------------

  log("This line will be excluded from the build"); // ## DEBUG ONLY

  // --- OMIT A WHOLE BLOCK ----------------------------------------------------

  // ## DEBUG START
  console.warn('This line will be excluded.');
  write('This line too.');
  // ## DEBUG END

  // --- USE A DIFFERENT VALUE IN PRODUCTION -----------------------------------

  var value = ⁄* ## DEBUG USE: *⁄ 3 ⁄* ## PRODUCTION USE: [[27]] *⁄;
  // The production build for the above line will render as:
  var value = 27;

  ⁄* ## DEBUG USE: *⁄
  trace.silent(status1);
  trace.silent(status2);
  ⁄* ## PRODUCTION USE: [[
  trace.verbose(status1);
  trace.verbose(status2);
  ]] *⁄

  // The production build for the above lines will render as:
  trace.verbose(status1);
  trace.verbose(status2);
*/

function preprocessSourceText(buffer) {
  const src = buffer.toString();
  return src
    .replace(/.*\/\/ ## DEBUG ONLY\s*(\n|$)/g, ``)
    .replace(/^.*\/\/ ## DEBUG START\s*(\n|$)[\s\S]*?\/\/ ## DEBUG END\s*(\n|$)/gm, ``)
    .replace(/\/\* ## DEBUG USE: \*\/*[\s\S]*?\/\* ## PRODUCTION USE: \[\[\n*([^\)]+?)\n*\]\] \*\//gm, `$1`)
    .replace(/\/\* ## DEBUG ONLY [[\s*\*\/*[\s\S]*?\/\*\s*?\]\] ## \*\//gm, ``)
    .replace(/^(\r\n){2,}/mg, `$1`);
}

function replace(a, b) {
  return function(buffer) {
    const src = buffer.toString();
    return src.replace(a, b);
  }
}

function compile() {
  const src = gulp.src(`${path}/.build/ts/**/*.ts`)
    .pipe(plumber())
    .pipe(sourcemaps.init());
  const ts_commonjs = src.pipe(tsproj.commonjs());
  const ts_module = src.pipe(tsproj.module());
  return merge([
    ts_commonjs.js
      .pipe(sourcemaps.write(`./`))
      .pipe(gulp.dest(`${path}/lib/commonjs`)),

    ts_module.js
      .pipe(sourcemaps.write(`./`))
      .pipe(gulp.dest(`${path}/lib/module`)),

    ts_module.dts
      .pipe(gulp.dest(`${path}/lib/typings`)),

    gulp.src(`${path}/.build/tests.ts/**/*.ts`)
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(tsproj.tests()).js
      .pipe(transform(replace(/\.\.\/ts/g, `../../lib/commonjs`)))
      .pipe(sourcemaps.write(`./`))
      .pipe(gulp.dest(`${path}/.build/tests`))
  ]);
}

function preprocess() {
  return merge([
    gulp.src(`${path}/src/**/*.ts`)
      .pipe(plumber())
      .pipe(transform(preprocessSourceText))
      .pipe(gulp.dest(`${path}/.build/ts`)),

    gulp.src(`${path}/tests/**/*.ts`)
      .pipe(plumber())
      .pipe(transform(preprocessSourceText))
      .pipe(transform(replace(/\.\.\/src/g, `../ts`)))
      .pipe(gulp.dest(`${path}/.build/tests.ts`)),
  ]);
}

function lint() {
  return gulp.src(`${path}/.build/ts/**/*.ts`)
    .pipe(plumber())
    .pipe(gtslint({formatter: "verbose"}))
    .pipe(gtslint.report());
}

function runTests() {
  require(`source-map-support`).install();
  return gulp
    .src([`${path}/.build/tests/**/*.js`], {read: false})
    .pipe(plumber())
    .pipe(mocha({timeout: 10000, ui: `tdd`}));
}

function clean() {
  const paths = [`${path}/lib`, `${path}/.build`];
  return function(cb) {
    const next = (i = 0) => rimraf(paths[i], done(i + 1));
    const done = i => err => err ? cb(err) : i === paths.length ? cb() : next(i);
    return next();
  }
}

gulp.task(`clean`, clean());
gulp.task(`preprocess`, preprocess);
gulp.task(`compile`, [`preprocess`], compile);
gulp.task(`watch`, () => gulp.watch([`${path}/src/**/*.ts`, `${path}/tests/**/*.ts`], [`build`]));
gulp.task(`test`, [`compile`, `lint`], runTests);
gulp.task(`lint`, [`preprocess`, `compile`], lint);
gulp.task(`build`, [`preprocess`, `compile`, `test`, `lint`]);
gulp.task(`dev`, [`build`, `watch`]);
gulp.task(`default`, [`build`]);