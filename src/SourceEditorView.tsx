import * as React from 'react';
import type { NativeSyntheticEvent } from 'react-native';

import SourceEditorNativeView, {
  Commands,
  type ChangeTextEvent,
  type SelectionChangeEvent,
  type SourceEditorViewType,
} from './SourceEditorViewNativeComponent';
import type { SourceEditorViewProps } from './SourceEditor.types';

export type NativeSourceEditorRef = {
  focus: () => void;
  blur: () => void;
};

const SourceEditorView = React.forwardRef<NativeSourceEditorRef, SourceEditorViewProps>(
  (props, ref) => {
    const nativeRef = React.useRef<React.ElementRef<SourceEditorViewType>>(null);

    React.useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          if (nativeRef.current) Commands.focus(nativeRef.current);
        },
        blur: () => {
          if (nativeRef.current) Commands.blur(nativeRef.current);
        },
      }),
      []
    );

    const { onChangeText, onSelectionChange, ...rest } = props;

    return (
      <SourceEditorNativeView
        ref={nativeRef}
        {...rest}
        onChangeText={(event: NativeSyntheticEvent<ChangeTextEvent>) => {
          onChangeText?.(event);
        }}
        onSelectionChange={(event: NativeSyntheticEvent<SelectionChangeEvent>) => {
          onSelectionChange?.(event);
        }}
      />
    );
  }
);

SourceEditorView.displayName = 'SourceEditorView';

export default SourceEditorView;
