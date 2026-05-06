# Usage

## Quick start

```tsx
import { useRef } from 'react';
import SourceEditor, {
  type SourceEditorRef,
} from '@workspace-sh/react-native-source-editor';

export default function Editor() {
  const ref = useRef<SourceEditorRef>(null);

  return (
    <SourceEditor
      ref={ref}
      defaultValue="// hello"
      editable
      theme="auto"
      font={{ size: 14 }}
      onChangeText={(text) => console.log(text)}
      onSelectionChange={(sel) => console.log(sel)}
      style={{ flex: 1 }}
    />
  );
}
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | — | Controlled mode. When set, the editor mirrors this value on every render. |
| `defaultValue` | `string` | `''` | Uncontrolled initial text. Ignored if `value` is provided. |
| `editable` | `boolean` | `true` | Disables editing when `false`. |
| `font` | `{ family?: string; size?: number }` | system mono @ 14 | Falls back to monospaced system font if `family` is missing or unresolvable. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | `auto` follows system appearance. |
| `language` | `'plaintext' \| 'markdown' \| 'json' \| 'javascript' \| 'typescript' \| 'html'` | `'plaintext'` | Syntax highlighting via attributed text. `html` highlights nested CSS (in `<style>`) and JS (in `<script>`). Colours respect `theme` and adapt to system semantic colours. |
| `contentInsets` | `{ top?, bottom?, left?, right? }` (numbers) | `0` | Padding inside the text container. Use to keep first/last lines clear of floating UI like translucent headers/footers. |
| `onChangeText` | `(text: string) => void` | — | Fires on every text change. |
| `onSelectionChange` | `(selection: { start: number; end: number }) => void` | — | Fires on selection updates. |
| `style` | `StyleProp<ViewStyle>` | — | Standard RN style. |

## Imperative ref API

```ts
type SourceEditorRef = {
  focus: () => void;
  blur: () => void;
  getSelection: () => { start: number; end: number };
};
```

`getSelection()` returns the last selection seen via `onSelectionChange` — no extra native round-trip.

## Lower-level surface

If you need raw native props/events without the controlled-mode wrapper, import `SourceEditorView` directly:

```tsx
import { SourceEditorView } from '@workspace-sh/react-native-source-editor';
```

It accepts `text` (set-only), `editable`, `font`, `theme`, plus `onChangeText` / `onSelectionChange` callbacks that receive `{ nativeEvent: ... }` objects.
