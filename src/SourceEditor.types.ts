import type { StyleProp, ViewStyle } from 'react-native';

export type ChangeTextEventPayload = {
  text: string;
};

export type SelectionChangeEventPayload = {
  start: number;
  end: number;
};

export type SourceEditorViewProps = {
  text?: string;
  onChangeText?: (event: { nativeEvent: ChangeTextEventPayload }) => void;
  onSelectionChange?: (event: { nativeEvent: SelectionChangeEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
