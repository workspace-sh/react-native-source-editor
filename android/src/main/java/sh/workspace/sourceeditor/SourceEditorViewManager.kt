package sh.workspace.sourceeditor

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.SourceEditorManagerDelegate
import com.facebook.react.viewmanagers.SourceEditorManagerInterface

/**
 * Codegen-driven Fabric ViewManager. Implements the generated
 * `SourceEditorManagerInterface` (props + commands from
 * `src/SourceEditorViewNativeComponent.ts`) by delegating to
 * `SourceEditorView`. Future PRs implement the prop setters left as
 * no-ops below (font/theme/language/lineNumbers/contentInsets).
 */
@ReactModule(name = SourceEditorViewManager.NAME)
class SourceEditorViewManager :
  ViewGroupManager<SourceEditorView>(),
  SourceEditorManagerInterface<SourceEditorView> {

  private val mDelegate = SourceEditorManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<SourceEditorView> = mDelegate

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): SourceEditorView =
    SourceEditorView(context)

  // --- MVP props ---

  override fun setText(view: SourceEditorView, value: String?) {
    view.setText(value)
  }

  override fun setEditable(view: SourceEditorView, value: Boolean) {
    view.setEditable(value)
  }

  // --- Future props (no-op for MVP; signatures must satisfy the codegen
  //     interface or the class won't compile). ---

  override fun setFont(view: SourceEditorView, value: ReadableMap?) {
    // TODO(#32): wire to Sora's typeface API.
  }

  override fun setTheme(view: SourceEditorView, value: String?) {
    // TODO(#32): map light/dark/auto → Sora color schemes.
  }

  override fun setLanguage(view: SourceEditorView, value: String?) {
    view.setLanguage(value)
  }

  override fun setLineNumbers(view: SourceEditorView, value: Boolean) {
    // TODO(#32): toggle Sora's line-number gutter.
  }

  override fun setContentInsets(view: SourceEditorView, value: ReadableMap?) {
    // TODO(#32): wire to editor padding.
  }

  // --- Commands ---

  override fun focus(view: SourceEditorView) {
    view.focusEditor()
  }

  override fun blur(view: SourceEditorView) {
    view.blurEditor()
  }

  // The codegen Delegate dispatches commands by name; this signature
  // satisfies the legacy Bridge-mode dispatcher path and is harmless
  // under Fabric.
  override fun receiveCommand(view: SourceEditorView, commandId: String?, args: ReadableArray?) {
    when (commandId) {
      "focus" -> focus(view)
      "blur" -> blur(view)
      else -> super.receiveCommand(view, commandId, args)
    }
  }

  companion object {
    const val NAME = "SourceEditor"
  }
}
