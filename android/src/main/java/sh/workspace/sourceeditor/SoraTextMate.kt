package sh.workspace.sourceeditor

import android.content.Context
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
 * prop (plaintext / markdown / json / javascript / typescript / html) and
 * the Sora editor's grammar+theme registry.
 *
 * Lazily initialized on first `apply` call — no overhead if the prop is
 * never set.
 */
internal object SoraTextMate {
  private const val THEME_NAME = "dark_modern"
  private const val THEME_PATH = "textmate/themes/dark_modern.json"
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

      // Theme must be loaded before TextMateColorScheme.create — see
      // Sora's `ensureTextmateTheme` example. We ship VS Code's
      // `dark_modern.json` which approximates the iOS/macOS theme.
      val themeStream = FileProviderRegistry.getInstance().tryGetInputStream(THEME_PATH)
        ?: error("TextMate theme asset missing: $THEME_PATH")
      val themeModel = ThemeModel(
        IThemeSource.fromInputStream(themeStream, THEME_PATH, null),
        THEME_NAME
      ).apply { isDark = true }
      ThemeRegistry.getInstance().loadTheme(themeModel)
      ThemeRegistry.getInstance().setTheme(THEME_NAME)

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
  fun apply(context: Context, editor: CodeEditor, language: String?) {
    setupOnce(context)
    // Color scheme goes on first; applying a TextMate language against a
    // non-TextMate scheme is the most common cause of "no highlighting".
    if (editor.colorScheme !is TextMateColorScheme) {
      editor.colorScheme = TextMateColorScheme.create(ThemeRegistry.getInstance())
    }
    val scope = SCOPE_BY_LANGUAGE[language]
    val nextLanguage: Language = if (scope != null) {
      TextMateLanguage.create(scope, /* autoCompleteEnabled = */ true)
    } else {
      EmptyLanguage()
    }
    editor.setEditorLanguage(nextLanguage)
  }
}
