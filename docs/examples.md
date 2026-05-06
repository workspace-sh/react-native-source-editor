# Examples

Each example is a runnable app under [`example/`](../example/).

| Platform | App | Toolchain | Issue | Status |
| --- | --- | --- | --- | --- |
| iOS | [`example/ios-app/`](../example/ios-app/) | Expo SDK 55 (CNG) | [#7](https://github.com/workspace-sh/react-native-source-editor/issues/7) | Done |
| macOS | [`example/macos-app/`](../example/macos-app/) | `react-native-macos` 0.81 | [#17](https://github.com/workspace-sh/react-native-source-editor/issues/17) | Done |

Each app exercises the same library across its native target and demonstrates per-language syntax highlighting plus a preview pane (Markdown / HTML rendered, JS / TS console output captured).

See each app's `README.md` for prerequisites and run instructions. The two apps use deliberately different toolchains and idioms — iOS uses Expo CNG with `app.json` plugins; macOS uses plain RN with manual Podfile wiring — because that's how downstream consumers will actually build them.
