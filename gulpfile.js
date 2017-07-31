'use strict';

const gulp = require(`gulp`);
const argv = require(`yargs`).argv;
const createGulpEnv = require('./scripts/lib/gulp').createGulpEnv;

const env = createGulpEnv(argv.pkg);

gulp.task(`clean`, env.clean());
gulp.task(`preprocess`, [`lint`], env.runPreprocessor);
gulp.task(`compile`, [`lint`, `preprocess`], env.compile);
gulp.task(`watch`, () => gulp.watch([`${env.path}/src/**/*.ts`, `${env.path}/tests/**/*.ts`], [`build`]));
gulp.task(`test`, [`compile`], env.runTests);
gulp.task(`lint`, env.lint);
gulp.task(`build`, [`preprocess`, `compile`, `test`, `lint`]);
gulp.task(`dev`, [`build`, `watch`]);
gulp.task(`default`, [`build`]);