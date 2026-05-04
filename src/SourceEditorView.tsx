import { requireNativeView } from 'expo';
import * as React from 'react';

import { SourceEditorViewProps } from './SourceEditor.types';

const NativeView: React.ComponentType<SourceEditorViewProps> =
  requireNativeView('SourceEditor');

export default function SourceEditorView(props: SourceEditorViewProps) {
  return <NativeView {...props} />;
}
