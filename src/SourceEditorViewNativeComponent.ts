import {
  codegenNativeCommands,
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';

type DirectEventHandler<T> = CodegenTypes.DirectEventHandler<T>;
type Double = CodegenTypes.Double;

export type ChangeTextEvent = Readonly<{
  text: string;
}>;

export type SelectionChangeEvent = Readonly<{
  start: Double;
  end: Double;
}>;

type FontConfig = Readonly<{
  family?: string;
  size?: Double;
}>;

type ContentInsets = Readonly<{
  top?: Double;
  bottom?: Double;
  left?: Double;
  right?: Double;
}>;

export interface NativeProps extends ViewProps {
  text?: string;
  editable?: boolean;
  font?: FontConfig;
  theme?: string;
  language?: string;
  contentInsets?: ContentInsets;

  onChangeText?: DirectEventHandler<ChangeTextEvent>;
  onSelectionChange?: DirectEventHandler<SelectionChangeEvent>;
}

export type SourceEditorViewType = HostComponent<NativeProps>;

interface NativeCommands {
  focus: (viewRef: React.ElementRef<SourceEditorViewType>) => void;
  blur: (viewRef: React.ElementRef<SourceEditorViewType>) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['focus', 'blur'],
});

export default codegenNativeComponent<NativeProps>(
  'SourceEditor'
) as SourceEditorViewType;
