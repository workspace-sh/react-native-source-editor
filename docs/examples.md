# Examples

Each example is a runnable React Native app under [`example/`](../example/).

| Platform | App | Toolchain | Issue | Status |
| --- | --- | --- | --- | --- |
| iOS | [`example/ios-app/`](../example/ios-app/) | Expo SDK 55 (CNG) | [#7](https://github.com/workspace-sh/react-native-source-editor/issues/7) | Shipping |
| macOS | [`example/macos-app/`](../example/macos-app/) | react-native-macos 0.81 (bare RN) | [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27) | Scaffolded — not yet runnable |

Each app demonstrates the editor in a split-pane layout with markdown on one side and TypeScript on the other, alongside standard RN components (`Switch`, `Button`, `SafeAreaView`) so the integration story is visible.

The two examples deliberately use different toolchains so the library is exercised through both the Expo CNG path (config plugin injects the Podfile mods) and the bare-RN path (hand-edited Podfile, manual `pod install`).

See each app's `README.md` for prerequisites and run instructions, or use the root-level scripts:

```sh
npm run ios:run        # iOS example via Expo
npm run macos:run      # macOS example (will fail until #27)
```
