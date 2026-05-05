import ExpoModulesCore

struct FontConfig: Record {
  @Field var family: String?
  @Field var size: Double?
}

struct ContentInsets: Record {
  @Field var top: Double = 0
  @Field var bottom: Double = 0
  @Field var left: Double = 0
  @Field var right: Double = 0
}

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

      Prop("font") { (view: SourceEditorView, value: FontConfig) in
        #if os(iOS) || os(macOS)
        view.setFont(family: value.family, size: value.size)
        #endif
      }

      Prop("theme") { (view: SourceEditorView, value: String) in
        #if os(iOS) || os(macOS)
        view.setTheme(value)
        #endif
      }

      Prop("contentInsets") { (view: SourceEditorView, value: ContentInsets) in
        #if os(iOS) || os(macOS)
        view.setContentInsets(
          top: value.top,
          bottom: value.bottom,
          left: value.left,
          right: value.right
        )
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
