/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 */
const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const workspaceRoot = path.resolve(__dirname, '..');
const defaultConfig = getDefaultConfig(__dirname);

// As the example project uses `link:../` for react-native-owl, which creates a symlink, we
// need to manually map the project so Metro resolves bundled code from the workspace.
const extraNodeModules = {
  'react-native-owl': workspaceRoot,
};

const config = {
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        name in target
          ? target[name]
          : path.join(process.cwd(), `node_modules/${name}`),
    }),
  },
  watchFolders: [
    ...defaultConfig.watchFolders,
    path.resolve(workspaceRoot, 'dist'),
  ],
};

module.exports = mergeConfig(defaultConfig, config);
