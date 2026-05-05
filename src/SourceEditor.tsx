import * as React from 'react';

import SourceEditorView, { NativeSourceEditorRef } from './SourceEditorView';
import {
  Selection,
  SourceEditorProps,
  SourceEditorRef,
} from './SourceEditor.types';

const SourceEditor = React.forwardRef<SourceEditorRef, SourceEditorProps>(
  (
    {
      value,
      defaultValue,
      editable = true,
      font,
      theme = 'auto',
      contentInsets,
      onChangeText,
      onSelectionChange,
      style,
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [uncontrolledText, setUncontrolledText] = React.useState(
      defaultValue ?? ''
    );
    const selectionRef = React.useRef<Selection>({ start: 0, end: 0 });
    const nativeRef = React.useRef<NativeSourceEditorRef>(null);

    const text = isControlled ? value : uncontrolledText;

    React.useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          nativeRef.current?.focus();
        },
        blur: () => {
          nativeRef.current?.blur();
        },
        getSelection: () => selectionRef.current,
      }),
      []
    );

    return (
      <SourceEditorView
        ref={nativeRef}
        text={text}
        editable={editable}
        font={font}
        theme={theme}
        contentInsets={contentInsets}
        style={style}
        onChangeText={(event) => {
          const next = event.nativeEvent.text;
          if (!isControlled) {
            setUncontrolledText(next);
          }
          onChangeText?.(next);
        }}
        onSelectionChange={(event) => {
          selectionRef.current = {
            start: event.nativeEvent.start,
            end: event.nativeEvent.end,
          };
          onSelectionChange?.(selectionRef.current);
        }}
      />
    );
  }
);

export default SourceEditor;
