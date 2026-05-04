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

      Prop("editable") { (view: SourceEditorView, value: Bool) in
        #if os(iOS) || os(macOS)
        view.setEditable(value)
        #endif
      }

      AsyncFunction("focus") { (view: SourceEditorView) in
        #if os(iOS) || os(macOS)
        view.focusEditor()
        #endif
      }

      AsyncFunction("blur") { (view: SourceEditorView) in
        #if os(iOS) || os(macOS)
        view.blurEditor()
        #endif
      }
    }
  }
}
