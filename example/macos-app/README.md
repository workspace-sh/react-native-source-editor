# SourceEditor — macOS example

`react-native-macos` app demonstrating `<SourceEditor />` in a fixed split-pane layout — source code on the left, live preview on the right. macOS-only; the iOS example lives in `../ios-app/`.

## Prerequisites

- macOS 14+ (deployment target)
- Xcode 15+ (Xcode 17+ recommended for Swift 6.1 features used by react-native-macos)
- Node 20+
- CocoaPods + the [`cocoapods-spm`](https://github.com/trinhngocthuyen/cocoapods-spm) plugin (**required** — STTextView is SPM-only)

```sh
gem install cocoapods-spm
```

## Run

From the **repo root**:

```sh
npm run macos:plugin    # one-time: gem install cocoapods-spm (shared with iOS example)
npm run macos:install   # one-time: npm install --legacy-peer-deps in example/macos-app
npm run macos:pods      # pod install in example/macos-app/macos
npm run macos:run       # react-native run-macos
```

Or open `macos/MacosApp.xcworkspace` in Xcode and ⌘R.

`react-native run-macos` does **not** auto-install pods (unlike Expo's `expo run:ios`). You must run `macos:pods` after any native dep change.

Other root scripts:

- `macos:start` / `macos:clear` — Metro
- `macos:run` — build + launch
- `macos:dev` — `concurrently` clear + run
- `macos:pods` — pod install
- `macos:clean` — wipe `Pods/`, `Podfile.lock`, `build/` (next `pods` regenerates)

## Why no Expo CNG here

`react-native-macos` is its own toolchain — no `app.json` plugins, no `expo prebuild`. The `cocoapods-spm` Podfile mods (which our Expo config plugin injects automatically for iOS) live directly in `macos/Podfile`. If you re-run `react-native-macos-init` for any reason, the Podfile will be regenerated and you'll need to re-apply the patch.

## Why `--legacy-peer-deps`

`react-native-macos@0.81.7` declares `react@^19.1.4` as a peer, but `react-native@0.81.2` ships `react@19.1.0`. The mismatch is upstream; `--legacy-peer-deps` is the standard workaround.

## Layout

- Top: tab bar with Markdown / JSON / JavaScript / TypeScript / HTML
- Body (split-pane):
  - **Left** — `<SourceEditor>` with live syntax highlighting
  - **Right** — `<WebView>` with a per-language preview:
    - `markdown` → `marked` rendered HTML in a system-styled doc
    - `html` → the document itself
    - `javascript` / `typescript` → console output captured from running the script (TS types are stripped before execution; not a real type-checker)
    - `json` / `plaintext` → monospace dump
