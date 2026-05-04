import * as React from 'react';

import { SourceEditorViewProps } from './SourceEditor.types';

export default function SourceEditorView(props: SourceEditorViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
