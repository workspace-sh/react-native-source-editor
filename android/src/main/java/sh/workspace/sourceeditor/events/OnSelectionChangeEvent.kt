package sh.workspace.sourceeditor.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/**
 * Fabric event for `onSelectionChange`. The codegen spec types `start`/`end`
 * as `Double` (JS-side numeric); we forward Sora-Editor's character offsets
 * verbatim.
 */
class OnSelectionChangeEvent(
  surfaceId: Int,
  viewTag: Int,
  private val start: Int,
  private val end: Int,
) : Event<OnSelectionChangeEvent>(surfaceId, viewTag) {
  override fun getEventName(): String = EVENT_NAME

  override fun getEventData(): WritableMap = Arguments.createMap().apply {
    putDouble("start", start.toDouble())
    putDouble("end", end.toDouble())
  }

  companion object {
    const val EVENT_NAME = "topSelectionChange"
  }
}
