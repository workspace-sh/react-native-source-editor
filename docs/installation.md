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
| macOS | 14.0 |

These are STTextView's floors. Bump your app's targets accordingly.

## Swift Package Manager bridging

STTextView is distributed only via SPM. The two supported toolchains use different bridges, picked by an env var the library podspec reads:

- **iOS via Expo CNG** uses the third-party [`cocoapods-spm`](https://github.com/trinhngocthuyen/cocoapods-spm) plugin (mature, handles iOS Pods cleanly).
- **macOS via bare react-native-macos** uses React Native's first-party `spm_dependency` helper from `react_native_pods.rb` (sidesteps a [cocoapods-spm × Xcode 26 regression](https://github.com/trinhngocthuyen/cocoapods-spm/issues/172)).

### Expo CNG — iOS (recommended)

```sh
gem install cocoapods-spm
```

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

### Bare react-native-macos

No third-party plugin or extra gem. Edit `macos/Podfile` so it sets `ENV['RNSE_USE_RN_SPM']` before the target block — that flips the library podspec to register STTextView via RN's first-party helper:

```ruby
require_relative '../node_modules/react-native-macos/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

# Tells @workspace-sh/react-native-source-editor's podspec to register
# STTextView via RN's first-party `spm_dependency` helper (in
# react_native_pods.rb above) instead of the third-party cocoapods-spm
# plugin. Sidesteps cocoapods-spm × Xcode 26 issue #172.
ENV['RNSE_USE_RN_SPM'] = '1'

target 'YourApp' do
  platform :macos, '14.0'
  use_native_modules!

  use_react_native!(
    :path => '../node_modules/react-native-macos',
    :fabric_enabled => true,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(installer)
  end
end
```

Then `pod install` as normal.

**Stay on static linkage** (RN macOS default — don't add `use_frameworks! :linkage => :dynamic`). The SPM helper warns about static linking, but switching to dynamic frameworks triggers a separate RN-macOS bug where React-Core's `RCTView.m` hardcodes a class ref to `RCTTextView` that doesn't resolve across dynamic-framework boundaries. Static is fine for this single-product STTextView dep.

If your toolchain is Xcode 26 / Apple Clang 17, you'll also want a small `post_install` patch scoping `FMT_USE_CONSTEVAL=0` to that compiler — see [`example/macos-app/macos/Podfile`](../example/macos-app/macos/Podfile) for the snippet.

### Bare React Native — iOS

Same shape as the Expo CNG path under the hood; you just add the cocoapods-spm wiring to `ios/Podfile` yourself instead of going through the config plugin:

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

## Working examples

- iOS (Expo CNG): [`example/ios-app/`](../example/ios-app/) — runnable with `npm run ios:run` from the repo root.
- macOS (bare RN-macos): [`example/macos-app/`](../example/macos-app/) — runnable with `npm run macos:dev` from the repo root.
