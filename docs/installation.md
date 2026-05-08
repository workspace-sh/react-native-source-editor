# Installation

Not yet published to npm. Consume via local path while v1 is in development:

```sh
npm install /path/to/react-native-source-editor
```

Once v1 ships, it will be published as `@workspace-sh/react-native-source-editor`.

## Platform deployment targets

| Platform | Minimum |
| --- | --- |
| iOS | 16.0 |
| macOS | 14.0 (target — pending [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27)) |

These are STTextView's floors. Bump your app's targets accordingly.

## Swift Package Manager bridging

STTextView is distributed only via SPM, so consumer apps need the [`cocoapods-spm`](https://github.com/trinhngocthuyen/cocoapods-spm) plugin during `pod install`:

```sh
gem install cocoapods-spm
```

How it gets wired into the `Podfile` depends on which toolchain you use.

### Expo CNG (recommended)

Register this library as a config plugin in `app.json`. The plugin injects `plugin 'cocoapods-spm'` and the `spm_pkg 'STTextView'` block into the generated `Podfile` during `expo prebuild` — you don't hand-edit anything:

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

`useFrameworks: "static"` is required — `cocoapods-spm` needs `use_frameworks!`.

Build with `expo run:ios`. **Do not run `pod install` manually**: Expo CNG owns the pod lifecycle and a manual install will desync against the generated project.

### Bare React Native / react-native-macos

Edit `ios/Podfile` (or `macos/Podfile`) by hand:

```ruby
plugin 'cocoapods-spm'

target 'YourApp' do
  config = use_native_modules!
  use_frameworks! :linkage => :static

  spm_pkg 'STTextView',
    :url => 'https://github.com/krzyzanowskim/STTextView.git',
    :version => '2.3.10',
    :products => ['STTextView']

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => true,
  )
end
```

Then `pod install` as normal.

> **Note on macOS:** the library currently ships Swift sources, which collide with how react-native-macos 0.81 resolves Swift module maps in CocoaPods. The `:osx` platform is intentionally not declared in the podspec until [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27) ports the Swift impl to Obj-C++. `example/macos-app/` is scaffolded for future use but does not build today.

## Working examples

- iOS (Expo CNG): [`example/ios-app/`](../example/ios-app/) — runnable with `npm run ios:run` from the repo root.
- macOS (bare RN-macos): [`example/macos-app/`](../example/macos-app/) — scaffolded, pending [#27](https://github.com/workspace-sh/react-native-source-editor/issues/27).
