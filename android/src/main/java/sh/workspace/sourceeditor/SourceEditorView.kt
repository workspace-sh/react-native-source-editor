package sh.workspace.sourceeditor

import android.content.Context
import android.graphics.Typeface
import android.util.TypedValue
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.UIManagerHelper
import io.github.rosemoe.sora.event.ContentChangeEvent
import io.github.rosemoe.sora.event.SelectionChangeEvent
import io.github.rosemoe.sora.widget.CodeEditor
import sh.workspace.sourceeditor.events.OnChangeTextEvent
import sh.workspace.sourceeditor.events.OnSelectionChangeEvent

/**
 * Fabric host view. A FrameLayout that owns a single child Sora-Editor
 * `CodeEditor`. Mirrors the iOS/macOS impl shape: simple wrapper that
 * forwards prop setters to the underlying editor and dispatches
 * Fabric events on text/selection changes.
 *
 * MVP surface: text, editable, onChangeText, onSelectionChange,
 * focus/blur. Future PRs add font, theme, language (TextMate
 * highlighting), lineNumbers, contentInsets.
 */
class SourceEditorView(context: Context) : FrameLayout(context) {

  internal val editor = CodeEditor(context).apply {
    layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
  }

  init {
    addView(editor)

    // Sora-Editor's event system (`subscribeEvent`) is the recommended
    // hook — `setOnTextChangeListener` is deprecated.
    editor.subscribeEvent(ContentChangeEvent::class.java) { _, _ ->
      dispatchEvent(OnChangeTextEvent(surfaceId(), id, editor.text.toString()))
    }
    editor.subscribeEvent(SelectionChangeEvent::class.java) { event, _ ->
      val start = event.left.index
      val end = event.right.index
      dispatchEvent(OnSelectionChangeEvent(surfaceId(), id, start, end))
    }
  }

  fun setText(value: String?) {
    val next = value ?: ""
    if (editor.text.toString() != next) {
      // Sora's `setText(CharSequence)` overload preserves the cursor
      // position; the (CharSequence, Bundle?) overload is for state
      // restoration. We don't need either second-arg here.
      editor.setText(next)
    }
  }

  fun setEditable(value: Boolean) {
    editor.isEditable = value
  }

  fun setLanguage(value: String?) {
    SoraTextMate.applyLanguage(context, editor, value)
  }

  fun setTheme(value: String?) {
    SoraTextMate.applyTheme(context, editor, value)
  }

  fun setFont(value: ReadableMap?) {
    val family = value?.takeIf { it.hasKey("family") }?.getString("family")
    val sizePt = value?.takeIf { it.hasKey("size") }?.getDouble("size") ?: 0.0
    // Match Apple's `monospacedSystemFont(ofSize: 14)` default when size
    // is missing or non-positive.
    val resolvedSize = if (sizePt > 0.0) sizePt.toFloat() else 14f
    val typeface = if (!family.isNullOrEmpty()) {
      // Best-effort match. `Typeface.create(family, NORMAL)` falls back
      // to the default sans-serif on miss; that mirrors UIKit's
      // behaviour when a custom UIFont(name:) returns nil and we use
      // the system mono.
      Typeface.create(family, Typeface.NORMAL)
    } else {
      Typeface.MONOSPACE
    }
    editor.typefaceText = typeface
    editor.setTextSize(resolvedSize)
  }

  fun setContentInsets(value: ReadableMap?) {
    val top = value?.takeIf { it.hasKey("top") }?.getDouble("top") ?: 0.0
    val bottom = value?.takeIf { it.hasKey("bottom") }?.getDouble("bottom") ?: 0.0
    val left = value?.takeIf { it.hasKey("left") }?.getDouble("left") ?: 0.0
    val right = value?.takeIf { it.hasKey("right") }?.getDouble("right") ?: 0.0
    // RN passes density-independent pixels (dp); Android View.setPadding
    // takes raw pixels. Convert via the display metrics.
    fun dp(value: Double): Int =
      TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        value.toFloat(),
        context.resources.displayMetrics
      ).toInt()
    editor.setPadding(dp(left), dp(top), dp(right), dp(bottom))
  }

  fun setLineNumbers(value: Boolean) {
    editor.isLineNumberEnabled = value
  }

  fun focusEditor() {
    editor.requestFocus()
  }

  fun blurEditor() {
    editor.clearFocus()
  }

  private fun surfaceId(): Int = UIManagerHelper.getSurfaceId(this)

  private fun <T : com.facebook.react.uimanager.events.Event<T>> dispatchEvent(event: T) {
    val reactContext = context as? ReactContext ?: return
    UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)?.dispatchEvent(event)
  }
}
