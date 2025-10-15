const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const exampleDir = path.join(rootDir, 'example');
const nodeModulesDir = path.join(exampleDir, 'node_modules');
const packageDir = path.join(nodeModulesDir, 'react-native-owl');
const distSource = path.join(rootDir, 'dist');
const packageJsonSource = path.join(rootDir, 'package.json');
const packageJsonTarget = path.join(packageDir, 'package.json');
const distTarget = path.join(packageDir, 'dist');

if (!fs.existsSync(nodeModulesDir)) {
  console.warn(
    '[react-native-owl] Skipping local link: example/node_modules not found.'
  );
  process.exit(0);
}

fs.mkdirSync(packageDir, { recursive: true });

// Copy package.json so Node can resolve the package metadata.
fs.copyFileSync(packageJsonSource, packageJsonTarget);

try {
  fs.rmSync(distTarget, { recursive: true, force: true });
} catch (err) {
  if (err.code !== 'ENOENT') {
    throw err;
  }
}

const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
fs.symlinkSync(distSource, distTarget, symlinkType);

console.log(
  `[react-native-owl] Linked ${distSource} -> ${distTarget} for local development.`
);
