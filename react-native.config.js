/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      // ios + macos use the root podspec; nothing extra to declare.
      ios: {},
      // android/ houses a bare RN Fabric library wrapping Sora-Editor;
      // defaults pick up `SourceEditorPackage` via reflection.
      android: {},
    },
  },
};
