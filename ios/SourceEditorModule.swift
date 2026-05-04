import ExpoModulesCore

public class SourceEditorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SourceEditor")

    View(SourceEditorView.self) {
      Events("onChangeText", "onSelectionChange")

      Prop("text") { (view: SourceEditorView, value: String) in
        #if os(iOS) || os(macOS)
        view.setText(value)
        #endif
      }
    }
  }
}
