# react-native-source-editor

A native source editor component for React Native. Fabric component wrapping [STTextView](https://github.com/krzyzanowskim/STTextView) on iOS and macOS, and [Sora-Editor](https://github.com/Rosemoe/sora-editor) on Android. Designed to drop into both Expo CNG apps (via the included config plugin) and bare React Native / react-native-macos hosts.

## Status

iOS, macOS, and Android all ship today on the New Architecture. iOS and Android target Expo CNG (with the bundled config plugin); macOS targets bare react-native-macos 0.81. Pre-1.0, expect the JS API to evolve.

Project tracking lives on the [project board](https://github.com/orgs/workspace-sh/projects/2).

## Platform support

| Platform | Status | Min version |
| --- | --- | --- |
| iOS | Shipping (Fabric / New Architecture) | 16.0 |
| macOS | Shipping (Fabric / New Architecture) | 14.0 |
| Android | Shipping (Fabric / New Architecture) | API 24 |
| iPadOS | Roadmap | — |
| Windows | Roadmap | — |
| Linux | Roadmap | — |
| Web | Out of scope for v1 | — |

iOS / macOS minimums are STTextView's floors, Android's is Sora-Editor's — not ours.

## Quick start

```sh
# Library is not yet on npm — install via local path while v1 is in flight
npm install /path/to/react-native-source-editor
gem install cocoapods-spm  # iOS only: STTextView is SPM-only on Apple platforms
```

(macOS and Android skip `cocoapods-spm` — macOS uses RN's first-party `spm_dependency` helper; Android pulls Sora-Editor from Maven Central.)

```tsx
import SourceEditor from '@workspace-sh/react-native-source-editor';

export default function Editor() {
  return (
    <SourceEditor
      defaultValue="// hello"
      editable
      language="typescript"
      style={{ flex: 1 }}
    />
  );
}
```

For Expo CNG apps, register the plugin in `app.json` so the iOS Podfile gets `cocoapods-spm` + the STTextView SPM package, and the Android `app/build.gradle` gets `coreLibraryDesugaring` (Sora-Editor's TextMate AAR requires it on minSdk < 26):

```json
{
  "plugins": [
    "@workspace-sh/react-native-source-editor",
    ["expo-build-properties", {
      "ios": { "deploymentTarget": "16.0", "useFrameworks": "static" },
      "android": { "minSdkVersion": 24, "newArchEnabled": true }
    }]
  ]
}
```

Bare-RN hosts: see [docs/installation.md](docs/installation.md) for the manual `Podfile` snippet.

- Full setup → [docs/installation.md](docs/installation.md)
- Full API (props + ref handle) → [docs/usage.md](docs/usage.md)
- Runnable example apps → [docs/examples.md](docs/examples.md)

## Roadmap

- **v0.x (now)** — bare RN Fabric library, iOS + macOS + Android shipping. JS API: text, selection, font, theme, language (markdown / json / js / ts / html), `lineNumbers` gutter toggle, `contentInsets`, imperative `focus`/`blur`.
- **v1.0** — expanded font customisation, npm publish under `@workspace-sh/react-native-source-editor`.
- **Post-1.0** — iPadOS polish, Windows, Linux, Web.

## Contributing

Contributions and bug reports are welcome.

### Repo layout

- `src/` — TypeScript surface. `SourceEditor.tsx` is the high-level wrapper; `SourceEditorView.tsx` exposes the lower-level codegen Fabric component.
- `ios/` — Native sources, shared across iOS + macOS. `SourceEditor.{h,mm}` is the Fabric Obj-C++ wrapper; `SourceEditorImpl.swift` and `Highlighter.swift` are the Swift impl (UIKit/AppKit branched via `#if os(iOS)` / `#elseif os(macOS)`). `ReactNativeSourceEditor.h` is the framework's umbrella anchor.
- `android/` — Kotlin Fabric component wrapping Sora-Editor. `SourceEditorPackage.kt` (autolinked entry), `SourceEditorViewManager.kt` (codegen-driven), `SourceEditorView.kt` (Sora `CodeEditor` host), `SoraTextMate.kt` (grammar + theme registry), `events/*.kt`. TextMate grammar JSONs and themes live under `src/main/assets/textmate/`.
- `example/expo-app/` — Expo SDK 55 host serving both iOS and Android. Uses Expo CNG, owned by `expo prebuild` — never run `pod install` (iOS) or hand-edit `android/` here manually.
- `example/macos-app/` — react-native-macos 0.81 host. Standard bare-RN toolchain (`pod install`, `react-native run-macos`). Wires STTextView via RN's first-party `spm_dependency` helper rather than the third-party `cocoapods-spm` plugin used on iOS; see the app's [README](example/macos-app/README.md).
- `app.plugin.js` — Expo config plugin. Injects `cocoapods-spm` + the `STTextView` SPM package into the iOS Podfile and `coreLibraryDesugaring` into the Android `app/build.gradle` during `expo prebuild`.
- `ReactNativeSourceEditor.podspec` — root podspec; bare RN libraries put it here so autolinking finds it.

### Development setup

```sh
npm install
npm run typecheck
```

### Running the iOS example

```sh
npm run ios:plugin           # one-time: gem install cocoapods-spm
npm run ios:install          # one-time: install example/expo-app deps
npm run ios:run              # build + launch on iOS simulator
npm run ios:dev              # concurrently: clean Metro + run:ios
```

Other scripts: `ios:start`, `ios:clear`, `ios:run:device`, `ios:run:device:release`, `ios:clean` (wipes generated `ios/`), `ios:prebuild`. Pod install is owned by `expo run:ios` — there is intentionally no `ios:pods` script.

### Running the Android example

Same Expo project as iOS — different `android:*` script set:

```sh
npm run android:install      # one-time: install example/expo-app deps
npm run android:run          # prebuild + gradle build + launch on emulator/device
npm run android:dev          # concurrently: clean Metro + run-android
```

Other scripts: `android:start`, `android:clear`, `android:run:device`, `android:clean` (wipes generated `android/`), `android:prebuild`. Requires JDK 17 + an Android SDK with API 35 + an emulator or device.

### Running the macOS example

```sh
npm run macos:install        # one-time: install example/macos-app deps
npm run macos:pods           # pod install (CocoaPods + RN's first-party SPM)
npm run macos:dev            # concurrently: clean Metro + run-macos
```

Other scripts: `macos:start`, `macos:clear`, `macos:run`, `macos:clean` (wipes `Pods/`, `Podfile.lock`, `build/`). Unlike iOS, **`pod install` is yours to run** — react-native-macos doesn't have an Expo-style prebuild step.

### Branching

- Branch off `develop`; PRs target `develop`. `main` mirrors the latest release.
- One PR per project-board issue. Reference the issue in the PR description.
- Squash-merge with the PR title as the commit subject.
- CI runs typecheck + iOS + Android + macOS builds via `.github/workflows/ci.yml`.

## License

[MIT](LICENSE) © Leslie Owusu-Appiah.

Built on top of [STTextView](https://github.com/krzyzanowskim/STTextView) by [Marcin Krzyzanowski](https://github.com/krzyzanowskim) (BSD-2-Clause) on Apple platforms, and [Sora-Editor](https://github.com/Rosemoe/sora-editor) by [Rosemoe](https://github.com/Rosemoe) (LGPL-2.1) on Android. Without them, this library would not exist.

The Sora-Editor dependency is consumed dynamically as a Gradle `implementation` AAR (no source modification, no static linking) — the standard pattern for LGPL compliance in MIT-licensed downstream apps. If you fork the AAR or relink statically, you take on the LGPL relinking obligations yourself.
