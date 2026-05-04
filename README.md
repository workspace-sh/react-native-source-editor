# react-native-source-editor

A native source editor component for React Native, built as an Expo Module wrapping [STTextView](https://github.com/krzyzanowskim/STTextView) on iOS and macOS.

## Status

**Early development — not yet usable.** Current scope is module scaffolding and platform targets. The native STTextView bridge, JS API, theming, and example app are tracked in the [issues](https://github.com/workspace-sh/react-native-source-editor/issues).

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

## Installation

Not yet published to npm. Consume via local path while v1 is in development:

```sh
npm install /path/to/react-native-source-editor
```

Once v1 ships, it will be published as `@workspace-sh/react-native-source-editor`.

### iOS / macOS — Swift Package Manager bridging

STTextView is distributed only via SPM, so consumer apps need the [`cocoapods-spm`](https://github.com/trinhngocthuyen/cocoapods-spm) plugin to pull it in during `pod install`:

```sh
gem install cocoapods-spm
```

Then in the consumer app's `ios/Podfile`, declare the SPM source:

```ruby
plugin 'cocoapods-spm'

spm_pkg 'STTextView',
  :url => 'https://github.com/krzyzanowskim/STTextView.git',
  :from => '2.3.10'
```

(This requirement goes away once CocoaPods or Expo Modules gain first-class SPM support.)

## Usage

```tsx
import { useRef } from 'react';
import SourceEditor, { type SourceEditorRef } from '@workspace-sh/react-native-source-editor';

export default function Editor() {
  const ref = useRef<SourceEditorRef>(null);

  return (
    <SourceEditor
      ref={ref}
      defaultValue="// hello"
      editable
      onChangeText={(text) => console.log(text)}
      onSelectionChange={(sel) => console.log(sel)}
      style={{ flex: 1 }}
    />
  );
}
```

Imperative API on the ref: `focus()`, `blur()`, `getSelection()`. Use `value` for controlled mode, `defaultValue` for uncontrolled.

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
