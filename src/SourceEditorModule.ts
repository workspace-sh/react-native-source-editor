import { NativeModule, requireNativeModule } from 'expo';

import { SourceEditorModuleEvents } from './SourceEditor.types';

declare class SourceEditorModule extends NativeModule<SourceEditorModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<SourceEditorModule>('SourceEditor');
