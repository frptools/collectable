const fs = require('fs');
const execa = require('execa');
const gulp = require(`gulp`);
const tslint = require(`tslint`);
const gtslint = require(`gulp-tslint`);
const ts = require(`gulp-typescript`);
const mocha = require(`gulp-mocha`);
const sourcemaps = require(`gulp-sourcemaps`);
const plumber = require(`gulp-plumber`);
const transform = require(`gulp-transform`);
const rimraf = require(`rimraf`);
const merge = require(`merge2`);
const {preprocess} = require(`tiny-preprocessor`);
const {stripScopeName} = require('./util');

function createGulpEnv(pkgname) {
  const path = pkgname ? `./packages/${pkgname}` : `.`;

  const tsproj = {
    commonjs: ts.createProject(`./tsconfig.json`, {declaration: true}),
    module: ts.createProject(`./tsconfig.json`, {declaration: true, module: `es2015`}),
    tests: ts.createProject(`./tsconfig.json`, {rootDir: `${path}/`, noUnusedLocals: false})
  };

  function preprocessBuffer(buffer) {
    return preprocess(buffer.toString());
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

  function runPreprocessor() {
    return merge([
      gulp.src(`${path}/src/**/*.ts`)
        .pipe(plumber())
        .pipe(transform(preprocessBuffer))
        .pipe(gulp.dest(`${path}/.build/ts`)),

      gulp.src(`${path}/tests/**/*.ts`)
        .pipe(plumber())
        .pipe(transform(preprocessBuffer))
        .pipe(transform(replace(/\.\.\/src/g, `../ts`)))
        .pipe(gulp.dest(`${path}/.build/tests.ts`)),
    ]);
  }

  function lint() {
    return gulp.src([`${path}/src/**/*.ts`, `${path}/tests/**/*.ts`])
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

  function buildPackageMap() {
    const packagesDir = `${__dirname}/packages`;
    const packageDirs = fs.readdirSync(packagesDir)
      .map(name => `${packagesDir}/${name}`)
      .filter(dir => fs.statSync(dir).isDirectory());
    packageDirs.push(__dirname);
    const packages = {};
    packageDirs.forEach(dir => {
      const filename = `${dir}/package.json`;
      if(!fs.existsSync(filename)) return;
      const buffer = fs.readFileSync(filename);
      const json = buffer.toString();
      const manifest = JSON.parse(json);
      packages[manifest.name] = {
        name: manifest.name,
        version: manifest.version,
        path: filename,
        deps: Object.keys(manifest.dependencies || {})
          .filter(key => key.startsWith('@collectable/'))
          .map(key => ({
            name: key,
            version: manifest.dependencies[key],
            target: void 0
          })),
        manifest,
        processed: false,
        modified: false
      }
    });

    Object.keys(packages).forEach(key => {
      const pkg = packages[key];
      pkg.deps.forEach(dep => dep.target = packages[dep.name]);
    });

    return packages;
  }

  function bumpVersion(part, version) {
    const parts = version.split('.').map(v => parseInt(v));
    switch(part) {
      case 'major':
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
      case 'minor':
        parts[1]++;
        parts[2] = 0;
        break;
      case 'patch':
        parts[2]++;
        break;
    }
    return parts.join('.');
  }

  function updatePackageVersion(pkg) {
    if(pkg.processed) return pkg.version;
    pkg.processed = true;
    pkg.deps.forEach(dep => {
      const newVersion = updatePackageVersion(dep.target);
      const depVersion = dep.version.replace(/[0-9]+\.[0-9]+\.[0-9]+/, newVersion);
      if(depVersion !== dep.version) {
        console.log(`[${pkg.name}] ${dep.name}: ${dep.version} ==> ${depVersion}`);
        dep.version = depVersion;
        pkg.manifest.dependencies[dep.name] = depVersion;
        pkg.modified = true;
      }
    });
    if(pkg.modified) {
      console.log(`[${pkg.name}] ${pkg.version} ==> ${bumpVersion('minor', pkg.version)}`);
      pkg.version = bumpVersion('minor', pkg.version);
      pkg.manifest.version = pkg.version;
    }
    return pkg.version;
  }

  function updateVersionRefs() {
    const map = buildPackageMap();
    Object.keys(map).forEach(key => {
      pkg = map[key];
      updatePackageVersion(pkg);
      if(pkg.modified) {
        fs.writeFileSync(pkg.path, JSON.stringify(pkg.manifest, null, 2), {encoding: 'utf8'});
      }
    });
  }

  return {
    path,
    clean,
    runPreprocessor,
    compile,
    runTests,
    lint
  };
}

function rebuild(packageName) {
  const args = ['build'];
  if(packageName.startsWith('@')) {
    args.push('--pkg', stripScopeName(packageName));
  }
  return execa('gulp', args, {stdio: 'inherit'});
}

module.exports = {
  rebuild,
  createGulpEnv
};