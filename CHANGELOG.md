# Changelog

All notable changes to `@workspace-sh/react-native-source-editor` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Pre-1.0, the JS API may evolve between minor versions. See the README's roadmap.

## [Unreleased]

## [0.1.0] — 2026-05-10

First milestone tag. Both target platforms shipping; library not yet on npm (install via local path until v1.0).

### Added

- **macOS support.** Bare react-native-macos 0.81 + Xcode 26 + Fabric. Wires STTextView via React Native's first-party `spm_dependency` helper from `react_native_pods.rb`, sidestepping a [cocoapods-spm × Xcode 26 regression](https://github.com/trinhngocthuyen/cocoapods-spm/issues/172) that was the actual blocker for macOS. ([#30](https://github.com/workspace-sh/react-native-source-editor/pull/30), closes [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27))
- **`lineNumbers` prop.** Runtime-toggleable STTextView gutter on both iOS and macOS — flipping the prop adds/removes the gutter view in place without remounting. ([#29](https://github.com/workspace-sh/react-native-source-editor/pull/29), closes [#10](https://github.com/workspace-sh/react-native-source-editor/issues/10))
- **Syntax highlighting + Markdown WebView preview.** Plaintext, Markdown, JSON, JavaScript, TypeScript, HTML languages with system-themed token colours. ([#24](https://github.com/workspace-sh/react-native-source-editor/pull/24), closes [#23](https://github.com/workspace-sh/react-native-source-editor/issues/23))
- **Expo config plugin.** `app.plugin.js` injects `cocoapods-spm` + the `STTextView` SPM package into the Expo CNG-generated Podfile during `expo prebuild`, so consumers don't hand-edit the Podfile. ([#22](https://github.com/workspace-sh/react-native-source-editor/pull/22), closes [#21](https://github.com/workspace-sh/react-native-source-editor/issues/21))
- **Font + theme props.** `font: { family, size }`, `theme: 'light' | 'dark' | 'auto'`. ([#16](https://github.com/workspace-sh/react-native-source-editor/pull/16))
- **`contentInsets` prop.** Padding inside the editor's text container.
- **JS API surface.** Controlled/uncontrolled `value` / `defaultValue`, `editable`, `onChangeText`, `onSelectionChange`, imperative `focus()` / `blur()` / `getSelection()` ref handle. ([#15](https://github.com/workspace-sh/react-native-source-editor/pull/15))
- **iOS native impl.** STTextView via UIKit. ([#13](https://github.com/workspace-sh/react-native-source-editor/pull/13))
- **macOS native impl.** STTextView via AppKit. ([#14](https://github.com/workspace-sh/react-native-source-editor/pull/14))
- **CI.** GitHub Actions workflow runs typecheck + iOS build on PRs targeting `develop`. ([#19](https://github.com/workspace-sh/react-native-source-editor/pull/19))
- **Example apps.** `example/ios-app/` (Expo SDK 55 CNG, runnable via `npm run ios:run`) and `example/macos-app/` (bare RN-macos, runnable via `npm run macos:dev`). ([#18](https://github.com/workspace-sh/react-native-source-editor/pull/18))

### Changed

- **Refactored from create-expo-module scaffold to a bare RN Fabric library.** Library now publishes its own podspec at the root and uses RN codegen directly (`codegenNativeComponent` / `codegenNativeCommands`); Expo CNG consumes it as a regular RN dependency rather than as an Expo Module. ([#26](https://github.com/workspace-sh/react-native-source-editor/pull/26))

[Unreleased]: https://github.com/workspace-sh/react-native-source-editor/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/workspace-sh/react-native-source-editor/releases/tag/v0.1.0
