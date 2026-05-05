# SourceEditor — iOS example

Runnable Expo SDK 55 app demonstrating `<SourceEditor />` with floating Liquid Glass overlays (`@expo/ui` segmented Picker, native Button) and a Source/Preview toggle.

## Prerequisites

- Xcode 15+ (Xcode 17+ recommended for Swift 6.1 features used by `expo-modules-core`)
- Node 20+
- CocoaPods + the [`cocoapods-spm`](https://github.com/trinhngocthuyen/cocoapods-spm) plugin (**required** — STTextView is SPM-only)

```sh
gem install cocoapods-spm
```

## Run

From the **repo root**:

```sh
npm run ios:plugin    # one-time: gem install cocoapods-spm
cd example/ios-app && npm install && cd -    # one-time
npm run ios:run       # prebuild + pod install + build + launch
```

`expo run:ios` runs `expo prebuild` (CNG) when `ios/` is missing and runs `pod install` when it sees pod-affecting changes — the entire native side regenerates from `app.json` + plugins.

Scripts (mirroring the Workspace `mobile:*` pattern):

- `ios:start` / `ios:clear` — Metro dev server
- `ios:run` / `ios:run:device` / `ios:run:device:release` — build + launch variants
- `ios:dev` — `concurrently` Metro + run:ios
- `ios:prebuild` — explicit `expo prebuild --platform ios` (rarely needed; `ios:run` does it)
- `ios:clean` — `rm -rf example/ios-app/ios` (forces full regen on next `ios:run`)
- `ios:plugin` — one-time `gem install cocoapods-spm`

## How it consumes the local module

Two wires:

- **JS / TS** — `metro.config.js` maps the package name to the parent dir via `extraNodeModules`, with `watchFolders` and a `blockList` for the parent's `react` / `react-native` (canonical Expo Module example pattern).
- **Native autolinking + config plugin** — `package.json` declares `"@workspace-sh/react-native-source-editor": "file:../.."` so `node_modules` symlinks the repo root. Expo's plugin loader then finds our `app.plugin.js` (referenced from `app.json` plugins), which during `expo prebuild` injects the `cocoapods-spm` plugin declaration and the `spm_pkg 'STTextView'` block into the generated `Podfile`. The result: zero hand-edited Podfiles.

## Notes

- iOS deployment target pinned to 16.0 via `expo-build-properties` (STTextView's floor); `useFrameworks: 'static'` enabled (cocoapods-spm requires it)
- `ios/` is intentionally git-ignored — it's CNG output, regenerated on demand
- macOS example lives in `example/macos-app/` (tracked in #17)
