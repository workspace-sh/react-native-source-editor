package sh.workspace.sourceeditor.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/**
 * Fabric event for `onChangeText`. Codegen names the bubbling event
 * `topChangeText` (drops the `on` prefix, prepends `top`); JS receives it
 * as `onChangeText` via the Direct event mapping in the codegen spec.
 */
class OnChangeTextEvent(
  surfaceId: Int,
  viewTag: Int,
  private val text: String,
) : Event<OnChangeTextEvent>(surfaceId, viewTag) {
  override fun getEventName(): String = EVENT_NAME

  override fun getEventData(): WritableMap = Arguments.createMap().apply {
    putString("text", text)
  }

  companion object {
    const val EVENT_NAME = "topChangeText"
  }
}
