# Examples

Each example is a runnable React Native app under [`example/`](../example/).

| Platform | App | Toolchain | Status |
| --- | --- | --- | --- |
| iOS | [`example/expo-app/`](../example/expo-app/) | Expo SDK 55 (CNG) | Shipping |
| Android | [`example/expo-app/`](../example/expo-app/) | Expo SDK 55 (CNG) | Shipping |
| macOS | [`example/macos-app/`](../example/macos-app/) | react-native-macos 0.81 (bare RN) | Shipping |

iOS and Android share the same Expo CNG project (`expo-app/`) — Expo prebuild generates `ios/` and `android/` from the same `App.tsx` / `App.android.tsx` pair. The macOS example lives in its own bare-RN-macos project because Expo doesn't support the platform.

Each app demonstrates the editor with a multi-language tab picker, syntax highlighting per language, and a Source/Preview toggle (Markdown / HTML / JS / TS) backed by an in-page WebView.

The two project layouts deliberately exercise different toolchains so the library is verified through both the Expo CNG path (config plugin injects the Podfile + Gradle mods) and the bare-RN path (hand-edited Podfile, manual `pod install`).

See each app's `README.md` for prerequisites and run instructions, or use the root-level scripts:

```sh
npm run ios:run        # iOS via Expo CNG
npm run android:run    # Android via Expo CNG (same project as iOS)
npm run macos:dev      # macOS via bare react-native-macos
```
