import { requireNativeView } from 'expo';
import * as React from 'react';

import { SourceEditorViewProps } from './SourceEditor.types';

export type NativeSourceEditorRef = {
  focus: () => Promise<void>;
  blur: () => Promise<void>;
};

const NativeView: React.ComponentType<
  SourceEditorViewProps & React.RefAttributes<NativeSourceEditorRef>
> = requireNativeView('SourceEditor');

const SourceEditorView = React.forwardRef<NativeSourceEditorRef, SourceEditorViewProps>(
  (props, ref) => <NativeView {...props} ref={ref} />
);

export default SourceEditorView;
