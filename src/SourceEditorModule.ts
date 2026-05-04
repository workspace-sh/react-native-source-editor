import { NativeModule, requireNativeModule } from 'expo';

declare class SourceEditorModule extends NativeModule {}

export default requireNativeModule<SourceEditorModule>('SourceEditor');
