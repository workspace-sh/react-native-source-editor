# SourceEditor — iOS example

Runnable Expo SDK 55 app demonstrating `<SourceEditor />` in a split-pane layout alongside React Native components (`Switch`, `Button`, `SafeAreaView`).

## Prerequisites

- Xcode 15+
- Node 20+
- CocoaPods + the [`cocoapods-spm`](https://github.com/trinhngocthuyen/cocoapods-spm) plugin (**required** — STTextView is SPM-only)

```sh
gem install cocoapods-spm
```

> Without the plugin gem installed locally, `pod install` will fail with `undefined method 'spm_pkg'` even though the Podfile declares `plugin 'cocoapods-spm'`. CocoaPods registers the plugin name but can't load the DSL methods.

## Run

From the **repo root**:

```sh
npm run ios:plugin    # one-time: gem install cocoapods-spm
cd example/ios-app && npm install && cd -    # one-time
npm run ios:run       # builds, pods, and launches on the iOS simulator
```

`expo run:ios` handles `pod install` automatically — we lean on Expo's CNG and don't ship a separate pods script.

Other scripts (mirroring the Workspace `mobile:*` pattern):

- `ios:start` / `ios:clear` — Metro dev server (clear = watchman wipe + `--clear`)
- `ios:run` / `ios:run:device` / `ios:run:device:release` — build + launch variants
- `ios:dev` — `concurrently` Metro + run:ios
- `ios:plugin` — one-time `gem install cocoapods-spm` (only ours; required because STTextView is SPM-only)

## How it consumes the local module

There's no `file:..` dependency. Module resolution is wired through:

- `package.json` → `expo.autolinking.nativeModulesDir: '../..'` (native autolinking)
- `metro.config.js` → `extraNodeModules`, `watchFolders`, and a `blockList` for the parent's `react` / `react-native` (JS bundling)

This is the same pattern `create-expo-module`'s `createExampleApp.ts` uses, adjusted for the two-level depth (`example/ios-app/` instead of `example/`).

## Notes

- iOS deployment target is pinned to 16.0 via `expo-build-properties` (STTextView's floor)
- Re-running `npx expo prebuild` will regenerate `ios/` — but the Podfile patch (`plugin 'cocoapods-spm'` + `spm_pkg`) needs to be re-applied
- macOS example lives in `example/macos-app/` (tracked in #17)
