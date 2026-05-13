const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const moduleRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Cross-platform Expo CNG example (iOS + Android). macos-app is a separate
// project on a different toolchain.
config.resolver.platforms = ['ios', 'android', 'native'];

config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  new RegExp(path.resolve(moduleRoot, 'node_modules', 'react').replace(/\\/g, '\\\\')),
  new RegExp(path.resolve(moduleRoot, 'node_modules', 'react-native').replace(/\\/g, '\\\\')),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(moduleRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  '@workspace-sh/react-native-source-editor': moduleRoot,
};

config.watchFolders = [moduleRoot];

module.exports = config;
