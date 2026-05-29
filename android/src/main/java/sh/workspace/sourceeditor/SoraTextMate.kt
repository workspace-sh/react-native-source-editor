package sh.workspace.sourceeditor

import android.content.Context
import android.content.res.Configuration
import io.github.rosemoe.sora.langs.textmate.TextMateColorScheme
import io.github.rosemoe.sora.langs.textmate.TextMateLanguage
import io.github.rosemoe.sora.langs.textmate.registry.FileProviderRegistry
import io.github.rosemoe.sora.langs.textmate.registry.GrammarRegistry
import io.github.rosemoe.sora.langs.textmate.registry.ThemeRegistry
import io.github.rosemoe.sora.langs.textmate.registry.model.ThemeModel
import io.github.rosemoe.sora.langs.textmate.registry.provider.AssetsFileResolver
import io.github.rosemoe.sora.lang.EmptyLanguage
import io.github.rosemoe.sora.lang.Language
import io.github.rosemoe.sora.widget.CodeEditor
import org.eclipse.tm4e.core.registry.IThemeSource

/**
 * One-shot Sora-Editor TextMate setup. Mirrors the iOS/macOS `Highlighter`
 * role on Apple platforms: bridge between the cross-platform `language`
 * and `theme` props and the Sora editor's grammar+theme registry.
 *
 * Lazily initialized on first `applyLanguage` / `applyTheme` call — no
 * overhead if the editor never uses TextMate.
 */
internal object SoraTextMate {
  // Both themes are taken verbatim from sora-editor's sample app — they
  // parse cleanly under Sora's strict-Gson `TMParserJSON`. VS Code's own
  // theme files are JSONC (trailing commas) and break that parser, so
  // they're not viable as drop-in assets.
  private data class BundledTheme(val name: String, val path: String, val isDark: Boolean)

  private val THEMES = mapOf(
    "dark" to BundledTheme("darcula", "textmate/themes/darcula.json", isDark = true),
    "light" to BundledTheme("quietlight", "textmate/themes/quietlight.json", isDark = false),
  )
  private const val LANGUAGES_MANIFEST = "textmate/languages.json"

  /**
   * Maps the JS-side `language` strings to TextMate scope names. Plaintext
   * maps to `null` — Sora's `EmptyLanguage` is used in that case.
   */
  private val SCOPE_BY_LANGUAGE = mapOf(
    "markdown" to "text.html.markdown",
    "json" to "source.json",
    "javascript" to "source.js",
    "typescript" to "source.ts",
    "html" to "text.html.basic",
  )

  @Volatile private var initialized = false

  private fun setupOnce(context: Context) {
    if (initialized) return
    synchronized(this) {
      if (initialized) return
      val appContext = context.applicationContext
      // Resolve grammar + theme paths against android/src/main/assets/.
      FileProviderRegistry.getInstance()
        .addFileProvider(AssetsFileResolver(appContext.assets))

      // Load both themes up front — switching at runtime is just a
      // `ThemeRegistry.setTheme(name)` call after this. Default active
      // theme follows the system appearance.
      THEMES.values.forEach { theme ->
        val stream = FileProviderRegistry.getInstance().tryGetInputStream(theme.path)
          ?: error("TextMate theme asset missing: ${theme.path}")
        val model = ThemeModel(
          IThemeSource.fromInputStream(stream, theme.path, null),
          theme.name
        ).apply { isDark = theme.isDark }
        ThemeRegistry.getInstance().loadTheme(model)
      }
      ThemeRegistry.getInstance().setTheme(resolveSystemTheme(appContext).name)

      // Grammars referenced by `languages.json` (asset-relative paths).
      GrammarRegistry.getInstance().loadGrammars(LANGUAGES_MANIFEST)

      initialized = true
    }
  }

  /**
   * Apply a `language` prop value to the editor. Idempotent — safe to call
   * on every prop update. Plaintext (or any unknown id) falls back to
   * `EmptyLanguage`, matching the iOS/macOS no-highlight behaviour.
   */
  fun applyLanguage(context: Context, editor: CodeEditor, language: String?) {
    setupOnce(context)
    ensureColorScheme(editor)
    val scope = SCOPE_BY_LANGUAGE[language]
    val nextLanguage: Language = if (scope != null) {
      TextMateLanguage.create(scope, /* autoCompleteEnabled = */ true)
    } else {
      EmptyLanguage()
    }
    editor.setEditorLanguage(nextLanguage)
  }

  /**
   * Apply a `theme` prop value ('light' / 'dark' / 'auto' / null). Switches
   * the active TextMate color scheme. Safe to call on every prop update.
   */
  fun applyTheme(context: Context, editor: CodeEditor, theme: String?) {
    setupOnce(context)
    val resolved = when (theme) {
      "light" -> THEMES.getValue("light")
      "dark" -> THEMES.getValue("dark")
      else -> resolveSystemTheme(context)
    }
    if (ThemeRegistry.getInstance().currentThemeModel?.name != resolved.name) {
      ThemeRegistry.getInstance().setTheme(resolved.name)
    }
    // Re-create the scheme bound to the (now-updated) registry so the
    // editor picks up the new colors. setColorScheme triggers a redraw.
    editor.colorScheme = TextMateColorScheme.create(ThemeRegistry.getInstance())
  }

  private fun ensureColorScheme(editor: CodeEditor) {
    if (editor.colorScheme !is TextMateColorScheme) {
      editor.colorScheme = TextMateColorScheme.create(ThemeRegistry.getInstance())
    }
  }

  private fun resolveSystemTheme(context: Context): BundledTheme {
    val night = context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
    return if (night == Configuration.UI_MODE_NIGHT_YES) {
      THEMES.getValue("dark")
    } else {
      THEMES.getValue("light")
    }
  }
}
