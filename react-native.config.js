/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      // ios + macos use the root podspec; nothing extra to declare.
      ios: {},
      android: null,
    },
  },
};
