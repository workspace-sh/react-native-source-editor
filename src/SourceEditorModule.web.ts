import { registerWebModule, NativeModule } from 'expo';

import { SourceEditorModuleEvents } from './SourceEditor.types';

class SourceEditorModule extends NativeModule<SourceEditorModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(SourceEditorModule, 'SourceEditorModule');
