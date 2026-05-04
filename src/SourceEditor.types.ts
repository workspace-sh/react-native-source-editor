import type { StyleProp, ViewStyle } from 'react-native';

export type Selection = {
  start: number;
  end: number;
};

export type ChangeTextEventPayload = {
  text: string;
};

export type SelectionChangeEventPayload = Selection;

export type SourceEditorViewProps = {
  text?: string;
  editable?: boolean;
  onChangeText?: (event: { nativeEvent: ChangeTextEventPayload }) => void;
  onSelectionChange?: (event: { nativeEvent: SelectionChangeEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

export type SourceEditorProps = {
  value?: string;
  defaultValue?: string;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  onSelectionChange?: (selection: Selection) => void;
  style?: StyleProp<ViewStyle>;
};

export type SourceEditorRef = {
  focus: () => void;
  blur: () => void;
  getSelection: () => Selection;
};
