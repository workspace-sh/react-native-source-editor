const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const moduleRoot = path.resolve(projectRoot, '../..');

const baseConfig = getDefaultConfig(projectRoot);

const config = {
  resolver: {
    blockList: [
      ...Array.from(baseConfig.resolver.blockList ?? []),
      new RegExp(path.resolve(moduleRoot, 'node_modules', 'react').replace(/\\/g, '\\\\')),
      new RegExp(path.resolve(moduleRoot, 'node_modules', 'react-native').replace(/\\/g, '\\\\')),
    ],
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(moduleRoot, 'node_modules'),
    ],
    extraNodeModules: {
      '@workspace-sh/react-native-source-editor': moduleRoot,
    },
    platforms: ['macos', 'ios', 'native'],
    // Match the `source` exports condition so we don't need to build `lib/`
    // for local development — metro reads `src/index.ts` directly. Expo's
    // metro config sets these for the iOS example automatically;
    // @react-native/metro-config does not, so we set them explicitly here.
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['source', 'react-native', 'require', 'default'],
  },
  watchFolders: [moduleRoot],
};

module.exports = mergeConfig(baseConfig, config);
