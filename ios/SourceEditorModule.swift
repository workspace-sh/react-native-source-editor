import ExpoModulesCore

public class SourceEditorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SourceEditor")

    View(SourceEditorView.self) {
      // Props and events land with the JS API in #5.
    }
  }
}
