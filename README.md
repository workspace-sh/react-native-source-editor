# react-native-source-editor

A native source editor component for React Native, built as an Expo Module wrapping [STTextView](https://github.com/krzyzanowskim/STTextView) on iOS and macOS.

## Status

**Early development — not yet usable.** v1 scope is the iOS + macOS wrapper, JS API surface, and example apps. Tracking lives on the [project board](https://github.com/orgs/workspace-sh/projects/2).

## Platform support

| Platform | Status | Min version |
| --- | --- | --- |
| iOS | Done ([#3](https://github.com/workspace-sh/react-native-source-editor/issues/3)) | 16.0 |
| macOS | Done ([#4](https://github.com/workspace-sh/react-native-source-editor/issues/4)) | 14.0 |
| iPadOS | Roadmap | — |
| Android | Stub only | — |
| Windows | Roadmap | — |
| Linux | Roadmap | — |
| Web | Out of scope for v1 | — |

## Quick start

```sh
npm install /path/to/react-native-source-editor
gem install cocoapods-spm  # required: STTextView is SPM-only
```

```tsx
import SourceEditor from '@workspace-sh/react-native-source-editor';

<SourceEditor defaultValue="// hello" editable style={{ flex: 1 }} />
```

Full setup (Podfile snippet, deployment targets) → [docs/installation.md](docs/installation.md)
Full API (props + ref handle) → [docs/usage.md](docs/usage.md)
Runnable apps → [docs/examples.md](docs/examples.md)

## Roadmap

- **v1** — STTextView wrapper for iOS and macOS, basic text + selection + theming
- **v1.1** — Line numbers gutter ([#10](https://github.com/workspace-sh/react-native-source-editor/issues/10)), font customisation
- **Future** — iPadOS, Android (TextKit alternative), Windows, Linux, Web

## Development

```sh
npm install
npm run build       # expo-module build
npm run typecheck   # tsc --noEmit
```

### Running the iOS example

```sh
npm run ios:plugin           # one-time: gem install cocoapods-spm
cd example/ios-app && npm install && cd -    # one-time
npm run ios:run              # build + launch on iOS simulator
npm run ios:dev              # concurrently: clean Metro + run:ios
```

Other scripts: `ios:start`, `ios:clear`, `ios:run:device`, `ios:run:device:release`. Pod install is handled by `expo run:ios` (Expo CNG) — no separate `ios:pods`.

See [docs/installation.md](docs/installation.md) for why `cocoapods-spm` is required.

## License

[MIT](LICENSE). Built on top of [STTextView](https://github.com/krzyzanowskim/STTextView) (BSD-2-Clause).
