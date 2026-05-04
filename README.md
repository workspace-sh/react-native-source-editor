# react-native-source-editor

A native source editor component for React Native, built as an Expo Module wrapping [STTextView](https://github.com/krzyzanowskim/STTextView) on iOS and macOS.

## Status

**Early development — not yet usable.** Current scope is module scaffolding and platform targets. The native STTextView bridge, JS API, theming, and example app are tracked in the [issues](https://github.com/workspace-sh/react-native-source-editor/issues).

## Platform support

| Platform | Status |
| --- | --- |
| iOS | Planned ([#3](https://github.com/workspace-sh/react-native-source-editor/issues/3)) |
| macOS | Planned ([#4](https://github.com/workspace-sh/react-native-source-editor/issues/4)) |
| iPadOS | Roadmap |
| Android | Stub only |
| Windows | Roadmap |
| Linux | Roadmap |
| Web | Out of scope for v1 |

## Installation

Not yet published to npm. Consume via local path while v1 is in development:

```sh
npm install /path/to/react-native-source-editor
```

Once v1 ships, it will be published as `@workspace-sh/react-native-source-editor`.

## Roadmap

- **v1** — STTextView wrapper for iOS and macOS, basic text + selection + theming
- **v1.1** — Line numbers gutter, font customisation
- **Future** — iPadOS, Android (TextKit alternative), Windows, Linux, Web

## Development

```sh
npm install
npm run build      # expo-module build
npx tsc --noEmit   # typecheck
```

The full backlog and progress live on the [project board](https://github.com/orgs/workspace-sh/projects/2).

## License

[MIT](LICENSE). Built on top of [STTextView](https://github.com/krzyzanowskim/STTextView) (BSD-2-Clause).
