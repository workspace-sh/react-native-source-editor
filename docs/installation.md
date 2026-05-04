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
    ["expo-build-properties", { "ios": { "deploymentTarget": "16.0" } }]
  ]
}
```

## Swift Package Manager bridging

STTextView is distributed only via SPM, so consumer apps need the [`cocoapods-spm`](https://github.com/trinhngocthuyen/cocoapods-spm) plugin during `pod install`:

```sh
gem install cocoapods-spm
```

In the consumer app's `ios/Podfile`, add the plugin and the SPM package source near the top:

```ruby
plugin 'cocoapods-spm'

spm_pkg 'STTextView',
  :url => 'https://github.com/krzyzanowskim/STTextView.git',
  :from => '2.3.10'
```

Then `cd ios && pod install` as usual.

This requirement goes away once CocoaPods or Expo Modules gain first-class SPM support.

## Working example

See [`example/ios-app/`](../example/ios-app/) for a complete working setup.
