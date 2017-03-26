const fs = require('fs');
const fsp = require('fs-promise');
const Path = require('path');

const {getVersionFromNPM} = require('./npm');
const {versionOf, bumpVersion, compareVersions} = require('./version');

const rootDir = Path.join(__dirname, '../..');

function buildPackageMap() {
  const packagesDir = `${rootDir}/packages`;
  const packageDirs = fs.readdirSync(packagesDir)
    .map(name => `${packagesDir}/${name}`)
    .filter(dir => fs.statSync(dir).isDirectory());
  packageDirs.push(rootDir);
  const packages = {};
  packageDirs.forEach(dir => {
    const filename = `${dir}/package.json`;
    if(!fs.existsSync(filename)) return;
    const buffer = fs.readFileSync(filename);
    const json = buffer.toString();
    const manifest = JSON.parse(json);
    const config = manifest.collectable || {};
    packages[manifest.name] = {
      dir,
      name: manifest.name,
      version: manifest.version,
      path: filename,
      skip: !!config.skip,
      tag: config.tag || '????',
      deps: Object.keys(manifest.dependencies || {})
        .filter(key => key.startsWith('@collectable/'))
        .map(key => ({
          name: key,
          version: manifest.dependencies[key],
          selected: false,
          target: void 0,
          modified: false
        })),
      manifest
    }
  });

  Object.keys(packages).forEach(key => {
    const pkg = packages[key];
    pkg.deps.forEach(dep => dep.target = packages[dep.name]);
  });

  return packages;
}

function updatePackageVersion(pkg, sortedPackages = []) {
  if(pkg.processed) return pkg.version;
  pkg.processed = true;
  pkg.deps.forEach(dep => {
    const newVersion = updatePackageVersion(dep.target);
    const depVersion = dep.version.replace(/[0-9]+\.[0-9]+\.[0-9]+/, newVersion);
    if(depVersion !== dep.version) {
      console.log(`[${pkg.name}] ${dep.name}: ${dep.version} ==> ${depVersion} (${newVersion})`);
      dep.version = newVersion;
      pkg.manifest.dependencies[dep.name] = depVersion;
      pkg.modified = true;
    }
  });
  if(pkg.modified) {
    pkg.selected = true;
    if(!pkg.skip && 'npmVersion' in pkg && compareVersions(pkg.npmVersion, pkg.version) === 0) {
      pkg.version = bumpVersion('minor', pkg.version);
      pkg.manifest.version = pkg.version;
    }
  }
  sortedPackages.push(pkg);
  return pkg.version;
}

function writeManifestToDisk(pkg) {
  fs.writeFileSync(pkg.path, JSON.stringify(pkg.manifest, null, 2), {encoding: 'utf8'});
  pkg.modified = false;
}

function updatePackageDepVersions(map, sorted = []) {
  Object.keys(map).forEach(key => {
    pkg = map[key];
    updatePackageVersion(pkg, sorted);
  });
  Object.keys(map).forEach(key => {
    pkg = map[key];
    delete pkg.processed;
  });
}

function preparePackageList() {
  const map = buildPackageMap();
  const sorted = [];
  updatePackageDepVersions(map, sorted);
  return {map, sorted};
}

const cachePath = Path.join(`${rootDir}/scripts/.cache.json`);
function ensureCache(packages) {
  return fsp.ensureFile(cachePath)
    .then(() => fsp.readJson(cachePath).catch(() => ({})))
    .then(cache => {
      console.log('Loading metadata for packages...');
      return packages.sorted.reduce(ensurePackageCached, Promise.resolve({cache, modified: false}));
    })
    .then(({modified, cache}) => {
      if(!modified) return cache;
      console.log('Writing to build cache...');
      return modified ? writeCache(cache) : cache;
    })
    .then(cache => {
      console.log('Done.\n');
      return cache;
    });
}

function writeCache(cache) {
  return fsp.writeJson(cachePath, cache).then(() => cache)
}

let atLeastOneUpdatedFromNPM = false;
function ensurePackageCached(promise, pkg) {
  return promise
    .then(state => {
      if(pkg.name in state.cache) {
        pkg.npmVersion = state.cache[pkg.name].version;
        return state;
      }
      atLeastOneUpdatedFromNPM = true;
      return getVersionFromNPM(pkg.name)
        .then(version => {
          console.log(`${pkg.name} NPM version: ${version}`);
          pkg.npmVersion = version;
          state.cache[pkg.name] = {version};
          state.modified = true;
          return state;
        });
    })
    .then(state => {
      if(compareVersions(versionOf(state.cache[pkg.name]), pkg.version) !== 0) {
        pkg.selected = true;
      }
      return state;
    });
}

module.exports = {
  rootDir,
  preparePackageList,
  updatePackageDepVersions,
  ensureCache,
  writeManifestToDisk,
  writeCache
};