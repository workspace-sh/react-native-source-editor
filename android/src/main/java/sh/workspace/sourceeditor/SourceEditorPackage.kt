package sh.workspace.sourceeditor

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

/**
 * Autolinked entry point. RN's autolinking scans for `ReactPackage`
 * subclasses; this returns the `SourceEditorViewManager` so the Fabric
 * `SourceEditor` component is registered with the host. We have no
 * TurboModules in this library — only a Fabric view — so the module info
 * provider is empty.
 */
class SourceEditorPackage : TurboReactPackage() {
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    listOf(SourceEditorViewManager())

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? = null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
    ReactModuleInfoProvider { emptyMap() }
}
