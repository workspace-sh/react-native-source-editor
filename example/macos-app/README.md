# macOS example app

A [react-native-macos](https://github.com/microsoft/react-native-macos) 0.81 host for verifying `@workspace-sh/react-native-source-editor` on macOS, alongside the iOS Expo CNG example in `example/ios-app/`.

## Run it

From the repo root:

```sh
npm run macos:install   # install JS deps
npm run macos:pods      # pod install (CocoaPods + RN's first-party SPM)
npm run macos:dev       # metro + xcodebuild + launch
```

`macos:dev` is `concurrently "macos:clear" "macos:run"` — same shape as the iOS workflow, but driven by RN's bare `react-native run-macos` (no Expo CNG here).

## Toolchain notes

- **react-native-macos 0.81 + Xcode 26 + New Architecture (Fabric)**.
- **STTextView is wired through React Native's first-party `spm_dependency` helper** (lives in `react_native_pods.rb`). The library podspec's SPM declaration is gated on `ENV['RNSE_USE_RN_SPM']`, which this app's Podfile sets — so the third-party `cocoapods-spm` plugin stays out of the chain on macOS. (It has an unfixed Xcode 26 regression, [issue #172](https://github.com/trinhngocthuyen/cocoapods-spm/issues/172), and the RN community is migrating off it.)
- **Static linkage** (RN's macOS default). The SPM helper warns about static linking, but switching to `use_frameworks! :linkage => :dynamic` triggers a separate RN-macOS bug where React-Core's `RCTView.m` hardcodes a class ref to `RCTTextView` that doesn't resolve across dynamic-framework boundaries. Static is fine for our single-product STTextView dep.
- **fmt + Apple Clang 17**: a small post-install patch in `macos/Podfile` scopes `FMT_USE_CONSTEVAL=0` to Apple Clang 17+ (Xcode 26 ships a broken consteval implementation).

## What's distinct from the iOS example

The iOS example (`example/ios-app/`) is owned by Expo CNG — never `pod install` it manually. This macOS example is bare RN macos and uses pod install + xcodebuild directly, the standard react-native-macos workflow.
