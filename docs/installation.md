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

These are STTextView's floors. Bump your app's targets accordingly. For Expo apps use [`expo-build-properties`](https://docs.expo.dev/versions/latest/sdk/build-properties/):

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

`useFrameworks: "static"` is required because `cocoapods-spm` (used to bridge STTextView's SPM-only distribution) needs `use_frameworks!`.

## Swift Package Manager bridging

STTextView is distributed only via SPM, so consumer apps need the [`cocoapods-spm`](https://github.com/trinhngocthuyen/cocoapods-spm) plugin during `pod install`:

```sh
gem install cocoapods-spm
```

The Podfile mods it requires (`plugin 'cocoapods-spm'` plus the `spm_pkg 'STTextView'` block) are injected automatically by our config plugin during `expo prebuild` — you don't hand-edit `Podfile`. Just add the package to `app.json` plugins as shown above.

> If you're not using Expo CNG (i.e. you manage `ios/` directly), add the snippets manually:
>
> ```ruby
> plugin 'cocoapods-spm'
>
> # …
>
> target 'YourApp' do
>   use_expo_modules!
>
>   spm_pkg 'STTextView',
>     :url => 'https://github.com/krzyzanowskim/STTextView.git',
>     :version => '2.3.10',
>     :products => ['STTextView']
>
>   # …
> end
> ```

## Working example

See [`example/ios-app/`](../example/ios-app/) for a complete working Expo SDK 55 setup.
