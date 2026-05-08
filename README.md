# react-native-source-editor

A native source editor component for React Native, built as a Fabric component wrapping [STTextView](https://github.com/krzyzanowskim/STTextView) on iOS and macOS. Designed to drop into both Expo CNG apps (via the included config plugin) and bare React Native / react-native-macos hosts.

## Status

iOS works end-to-end on the New Architecture today. macOS is scaffolded but not yet runnable — the underlying STTextView/Swift sources need an Obj-C++ port before they can ship on react-native-macos. Tracked in [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27); roadmap below. Pre-1.0, expect the JS API to evolve until the macOS path lands.

Project tracking lives on the [project board](https://github.com/orgs/workspace-sh/projects/2).

## Platform support

| Platform | Status | Min version |
| --- | --- | --- |
| iOS | Shipping (Fabric / New Architecture) | 16.0 |
| macOS | Scaffolded, pending [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27) | 14.0 (target) |
| iPadOS | Roadmap | — |
| Android | Stub only | — |
| Windows | Roadmap | — |
| Linux | Roadmap | — |
| Web | Out of scope for v1 | — |

iOS / macOS minimums are STTextView's floors, not ours.

## Quick start

```sh
# Library is not yet on npm — install via local path while v1 is in flight
npm install /path/to/react-native-source-editor
gem install cocoapods-spm  # required: STTextView is SPM-only
```

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

For Expo CNG apps, register the plugin in `app.json` so `cocoapods-spm` + the STTextView SPM package get injected into the Podfile during `expo prebuild`:

```json
{
  "plugins": [
    "@workspace-sh/react-native-source-editor",
    ["expo-build-properties", {
      "ios": { "deploymentTarget": "16.0", "useFrameworks": "static" }
    }]
  ]
}
```

Bare-RN hosts: see [docs/installation.md](docs/installation.md) for the manual `Podfile` snippet.

- Full setup → [docs/installation.md](docs/installation.md)
- Full API (props + ref handle) → [docs/usage.md](docs/usage.md)
- Runnable example apps → [docs/examples.md](docs/examples.md)

## Roadmap

- **v0.x (now)** — bare RN Fabric library, iOS shipping. JS API: text, selection, font, theme, language (markdown / json / js / ts / html), `lineNumbers` gutter toggle, `contentInsets`, imperative `focus`/`blur`.
- **v0.x next** — macOS via Obj-C++ port ([#27](https://github.com/workspace-sh/react-native-source-editor/issues/27)). Unblocks the `example/macos-app/` target and re-adds `:osx` to the podspec.
- **v1.0** — expanded font customisation, npm publish under `@workspace-sh/react-native-source-editor`.
- **Post-1.0** — iPadOS polish, Android (TextKit alternative), Windows, Linux, Web.

## Contributing

Contributions and bug reports are welcome.

### Repo layout

- `src/` — TypeScript surface. `SourceEditor.tsx` is the high-level wrapper; `SourceEditorView.tsx` exposes the lower-level codegen Fabric component.
- `ios/` — Native sources. `SourceEditor.{h,mm}` is the Fabric Obj-C++ wrapper; `SourceEditorImpl.swift` and `Highlighter.swift` are the Swift impl (slated for Obj-C++ port in [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27)). `ReactNativeSourceEditor.h` is the framework's umbrella anchor.
- `example/ios-app/` — Expo SDK 55 host. Uses Expo CNG, owned by `expo prebuild` — never run `pod install` here manually.
- `example/macos-app/` — react-native-macos 0.81 host. Standard bare-RN toolchain (`pod install`, `react-native run-macos`). Currently not runnable; see [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27).
- `app.plugin.js` — Expo config plugin. Injects `cocoapods-spm` + the `STTextView` SPM package into the consumer's `Podfile` during `expo prebuild`.
- `ReactNativeSourceEditor.podspec` — root podspec; bare RN libraries put it here so autolinking finds it.

### Development setup

```sh
npm install
npm run typecheck
```

### Running the iOS example

```sh
npm run ios:plugin           # one-time: gem install cocoapods-spm
npm run ios:install          # one-time: install example/ios-app deps
npm run ios:run              # build + launch on iOS simulator
npm run ios:dev              # concurrently: clean Metro + run:ios
```

Other scripts: `ios:start`, `ios:clear`, `ios:run:device`, `ios:run:device:release`, `ios:clean` (wipes generated `ios/`), `ios:prebuild`. Pod install is owned by `expo run:ios` — there is intentionally no `ios:pods` script.

### Running the macOS example

Tracked in [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27); the scripts (`macos:install`, `macos:pods`, `macos:run`, `macos:dev`) exist but the build will fail until the Swift sources are ported to Obj-C++.

### Branching

- Branch off `develop`; PRs target `develop`. `main` mirrors the latest release.
- One PR per project-board issue. Reference the issue in the PR description.
- Squash-merge with the PR title as the commit subject.
- CI runs typecheck + iOS build via `.github/workflows/ci.yml`.

## License

[MIT](LICENSE) © Leslie Owusu-Appiah.

Built on top of [STTextView](https://github.com/krzyzanowskim/STTextView) by [Marcin Krzyzanowski](https://github.com/krzyzanowskim) (BSD-2-Clause). Without it, this library would not exist.
