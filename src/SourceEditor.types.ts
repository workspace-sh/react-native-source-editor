import type { StyleProp, ViewStyle } from 'react-native';

export type Selection = {
  start: number;
  end: number;
};

export type ChangeTextEventPayload = {
  text: string;
};

export type SelectionChangeEventPayload = Selection;

export type FontConfig = {
  family?: string;
  size?: number;
};

export type Theme = 'light' | 'dark' | 'auto';

export type Language =
  | 'plaintext'
  | 'markdown'
  | 'json'
  | 'javascript'
  | 'typescript';

export type ContentInsets = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type SourceEditorViewProps = {
  text?: string;
  editable?: boolean;
  font?: FontConfig;
  theme?: Theme;
  language?: Language;
  contentInsets?: ContentInsets;
  onChangeText?: (event: { nativeEvent: ChangeTextEventPayload }) => void;
  onSelectionChange?: (event: { nativeEvent: SelectionChangeEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

export type SourceEditorProps = {
  value?: string;
  defaultValue?: string;
  editable?: boolean;
  font?: FontConfig;
  theme?: Theme;
  language?: Language;
  contentInsets?: ContentInsets;
  onChangeText?: (text: string) => void;
  onSelectionChange?: (selection: Selection) => void;
  style?: StyleProp<ViewStyle>;
};

export type SourceEditorRef = {
  focus: () => void;
  blur: () => void;
  getSelection: () => Selection;
};
