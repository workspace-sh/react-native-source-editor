const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const moduleRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// This is the iOS-only example app; don't waste cycles bundling for macOS / web.
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
