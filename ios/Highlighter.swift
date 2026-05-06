import Foundation

#if os(iOS)
import UIKit
typealias PlatformFont = UIFont
typealias PlatformColor = UIColor
#elseif os(macOS)
import AppKit
typealias PlatformFont = NSFont
typealias PlatformColor = NSColor
#endif

#if os(iOS) || os(macOS)

enum HighlightLanguage: String {
  case plaintext, markdown, json, javascript, typescript, html
}

struct HighlightTheme {
  let foreground: PlatformColor
  let keyword: PlatformColor
  let string: PlatformColor
  let number: PlatformColor
  let comment: PlatformColor
  let constant: PlatformColor
  let typeName: PlatformColor
  let syntaxMarker: PlatformColor
  let heading: PlatformColor
  let code: PlatformColor

  static var system: HighlightTheme {
    #if os(iOS)
    return HighlightTheme(
      foreground: .label,
      keyword: .systemPurple,
      string: .systemGreen,
      number: .systemOrange,
      comment: .secondaryLabel,
      constant: .systemTeal,
      typeName: .systemBlue,
      syntaxMarker: .secondaryLabel,
      heading: .systemBlue,
      code: .systemPink
    )
    #else
    return HighlightTheme(
      foreground: .textColor,
      keyword: .systemPurple,
      string: .systemGreen,
      number: .systemOrange,
      comment: .secondaryLabelColor,
      constant: .systemTeal,
      typeName: .systemBlue,
      syntaxMarker: .secondaryLabelColor,
      heading: .systemBlue,
      code: .systemPink
    )
    #endif
  }
}

struct Highlighter {
  let language: HighlightLanguage
  let theme: HighlightTheme
  let baseFont: PlatformFont

  func apply(to attrString: NSMutableAttributedString) {
    let nsString = attrString.string as NSString
    let fullRange = NSRange(location: 0, length: nsString.length)

    attrString.addAttributes([
      .font: baseFont,
      .foregroundColor: theme.foreground,
    ], range: fullRange)

    switch language {
    case .plaintext:
      return
    case .markdown:
      applyMarkdown(to: attrString, in: fullRange)
    case .json:
      applyJSON(to: attrString, in: fullRange)
    case .javascript:
      applyJavaScript(to: attrString, in: fullRange, includeTSExtras: false)
    case .typescript:
      applyJavaScript(to: attrString, in: fullRange, includeTSExtras: true)
    case .html:
      applyHTML(to: attrString, in: fullRange)
    }
  }

  private func applyMarkdown(to attrString: NSMutableAttributedString, in range: NSRange) {
    let text = attrString.string

    apply("`[^`\\n]+`", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.code, range: match.range)
    }

    apply("\\*\\*([^*\\n]+)\\*\\*", in: text, range: range) { match in
      attrString.addAttribute(.font, value: PlatformFont.boldSystemFont(ofSize: baseFont.pointSize), range: match.range)
    }

    apply("(?<!\\*)\\*([^*\\n]+)\\*(?!\\*)", in: text, range: range) { match in
      attrString.addAttribute(.font, value: italicize(baseFont), range: match.range)
    }

    apply("^(#{1,6})\\s+(.+)$", in: text, range: range, options: [.anchorsMatchLines]) { match in
      let level = match.range(at: 1).length
      let pointSize = baseFont.pointSize + CGFloat(7 - level) * 1.5
      attrString.addAttribute(.font, value: PlatformFont.boldSystemFont(ofSize: pointSize), range: match.range)
      attrString.addAttribute(.foregroundColor, value: theme.heading, range: match.range)
    }

    apply("\\[([^\\]]+)\\]\\(([^)]+)\\)", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.typeName, range: match.range(at: 1))
      attrString.addAttribute(.foregroundColor, value: theme.syntaxMarker, range: match.range(at: 2))
    }
  }

  private func applyJSON(to attrString: NSMutableAttributedString, in range: NSRange) {
    let text = attrString.string

    apply("\\b-?\\d+(\\.\\d+)?([eE][+-]?\\d+)?\\b", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.number, range: match.range)
    }

    apply("\\b(true|false|null)\\b", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.constant, range: match.range)
    }

    apply("\"([^\"\\\\]|\\\\.)*\"(?!\\s*:)", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.string, range: match.range)
    }

    apply("\"([^\"\\\\]|\\\\.)*\"\\s*:", in: text, range: range) { match in
      let length = match.range.length
      let keyRange = NSRange(location: match.range.location, length: length)
      attrString.addAttribute(.foregroundColor, value: theme.typeName, range: keyRange)
    }
  }

  private func applyJavaScript(to attrString: NSMutableAttributedString, in range: NSRange, includeTSExtras: Bool) {
    let text = attrString.string

    apply("\\b-?\\d+(\\.\\d+)?([eE][+-]?\\d+)?\\b", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.number, range: match.range)
    }

    let baseKeywords = [
      "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
      "break", "continue", "class", "new", "this", "super", "import", "export", "from",
      "default", "async", "await", "try", "catch", "finally", "throw", "extends",
      "in", "of", "delete", "typeof", "instanceof", "void", "yield", "switch", "case",
    ]
    let tsKeywords = [
      "interface", "type", "enum", "as", "implements", "namespace", "abstract",
      "readonly", "private", "public", "protected", "static", "declare",
    ]
    let keywords = includeTSExtras ? baseKeywords + tsKeywords : baseKeywords
    apply("\\b(" + keywords.joined(separator: "|") + ")\\b", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.keyword, range: match.range)
    }

    apply("\\b(true|false|null|undefined)\\b", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.constant, range: match.range)
    }

    if includeTSExtras {
      apply("\\b(string|number|boolean|any|unknown|never|void|object)\\b", in: text, range: range) { match in
        attrString.addAttribute(.foregroundColor, value: theme.typeName, range: match.range)
      }
    }

    apply("\"([^\"\\\\\\n]|\\\\.)*\"", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.string, range: match.range)
    }
    apply("'([^'\\\\\\n]|\\\\.)*'", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.string, range: match.range)
    }
    apply("`([^`\\\\]|\\\\.)*`", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.string, range: match.range)
    }

    // Comments last so they win over keywords inside them.
    apply("/\\*[\\s\\S]*?\\*/", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.comment, range: match.range)
    }
    apply("//[^\\n]*", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.comment, range: match.range)
    }
  }

  private func applyHTML(to attrString: NSMutableAttributedString, in range: NSRange) {
    let text = attrString.string

    // 1) Apply CSS rules inside <style>...</style> blocks first, JS inside
    //    <script>...</script>. We do these BEFORE the generic HTML pass so
    //    the HTML pass can colour the surrounding tags on top of the inner
    //    languages.
    apply("<style[^>]*>([\\s\\S]*?)</style>", in: text, range: range) { match in
      applyCSS(to: attrString, in: match.range(at: 1))
    }
    apply("<script[^>]*>([\\s\\S]*?)</script>", in: text, range: range) { match in
      applyJavaScript(to: attrString, in: match.range(at: 1), includeTSExtras: false)
    }

    // 2) Comments win over everything they cover.
    apply("<!--[\\s\\S]*?-->", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.comment, range: match.range)
    }

    // 3) Doctype + tag names.
    apply("<!DOCTYPE[^>]*>", in: text, range: range, options: [.caseInsensitive]) { match in
      attrString.addAttribute(.foregroundColor, value: theme.keyword, range: match.range)
    }
    apply("</?([a-zA-Z][a-zA-Z0-9-]*)", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.keyword, range: match.range(at: 1))
    }

    // 4) Attribute names (`class=`, `id=`, `data-foo=` etc.) and their
    //    string values.
    apply("\\s([a-zA-Z][a-zA-Z0-9-]*)\\s*=", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.typeName, range: match.range(at: 1))
    }
    apply("=\\s*\"([^\"]*)\"", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.string, range: match.range(at: 1))
    }
    apply("=\\s*'([^']*)'", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.string, range: match.range(at: 1))
    }
  }

  private func applyCSS(to attrString: NSMutableAttributedString, in range: NSRange) {
    let text = attrString.string

    // Property names (`color:`, `font-family:`).
    apply("\\b([a-zA-Z-]+)\\s*:", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.typeName, range: match.range(at: 1))
    }

    // String values.
    apply("\"[^\"\\n]*\"", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.string, range: match.range)
    }
    apply("'[^'\\n]*'", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.string, range: match.range)
    }

    // Numbers + units.
    apply("\\b\\d+(\\.\\d+)?(px|em|rem|%|vh|vw|vmin|vmax|s|ms|deg|fr|ch)?\\b", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.number, range: match.range)
    }

    // Hex + named colours.
    apply("#[0-9a-fA-F]{3,8}\\b", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.constant, range: match.range)
    }

    // @rules (@media, @keyframes, @import).
    apply("@[a-zA-Z-]+", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.keyword, range: match.range)
    }

    // Comments win over the rest.
    apply("/\\*[\\s\\S]*?\\*/", in: text, range: range) { match in
      attrString.addAttribute(.foregroundColor, value: theme.comment, range: match.range)
    }
  }

  private func apply(
    _ pattern: String,
    in text: String,
    range: NSRange,
    options: NSRegularExpression.Options = [],
    handler: (NSTextCheckingResult) -> Void
  ) {
    guard let regex = try? NSRegularExpression(pattern: pattern, options: options) else { return }
    regex.enumerateMatches(in: text, options: [], range: range) { match, _, _ in
      guard let match = match else { return }
      handler(match)
    }
  }

  private func italicize(_ font: PlatformFont) -> PlatformFont {
    #if os(iOS)
    if let descriptor = font.fontDescriptor.withSymbolicTraits(.traitItalic) {
      return UIFont(descriptor: descriptor, size: font.pointSize)
    }
    return font
    #else
    let descriptor = font.fontDescriptor.withSymbolicTraits(.italic)
    return NSFont(descriptor: descriptor, size: font.pointSize) ?? font
    #endif
  }
}

#endif
