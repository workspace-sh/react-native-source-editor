# macOS example app

> **Status:** scaffolded but not yet runnable — pending [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27).

This directory holds a [react-native-macos](https://github.com/microsoft/react-native-macos) 0.81 host that we plan to use for verifying `@workspace-sh/react-native-source-editor` on macOS, alongside the iOS Expo CNG example in `example/ios-app/`.

It is **not currently buildable** because the library still ships Swift sources (`ios/Highlighter.swift`, `ios/SourceEditorImpl.swift`). On RN-macos 0.81, a Swift-bearing CocoaPods pod fails with `module map file 'ReactNativeSourceEditor.modulemap' not found` at consumer link time — the modulemap CocoaPods generates for the Swift module never lands in `${PODS_CONFIGURATION_BUILD_DIR}/<framework>/` where the consumer's import path resolves. iOS works fine because Expo CNG's prebuild orchestrates the pod install differently.

The plan to unblock this is tracked in [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27): port the two Swift files to Obj-C++ so the pod has zero Swift sources, eliminating the modulemap pathway entirely.

Once that lands, this example will follow react-native-macos's normal idioms (`pod install`, `npm run macos`) — distinct from the iOS example which is owned by Expo CNG and must never be `pod install`-ed manually.
