// Reexport the native module. On web, it will be resolved to SourceEditorModule.web.ts
// and on native platforms to SourceEditorModule.ts
export { default } from './SourceEditorModule';
export { default as SourceEditorView } from './SourceEditorView';
export * from  './SourceEditor.types';
