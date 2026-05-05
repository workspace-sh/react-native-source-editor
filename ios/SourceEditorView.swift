import ExpoModulesCore

#if os(iOS)
import STTextView
import UIKit

class SourceEditorView: ExpoView {
  let textView = STTextView()
  let onChangeText = EventDispatcher()
  let onSelectionChange = EventDispatcher()

  private var textDelegate: TextDelegate?
  private var currentLanguage: HighlightLanguage = .plaintext
  private var isReHighlighting = false
  private var reHighlightScheduled = false

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true

    textView.isScrollEnabled = true
    textView.alwaysBounceVertical = true
    // We control insets explicitly via textContainerInset (set from JS via
    // the `contentInsets` prop). Disable UIScrollView's safe-area adjustment
    // so it doesn't compound with ours.
    textView.contentInsetAdjustmentBehavior = .never

    let delegate = TextDelegate(
      onChange: { [weak self] text in
        self?.onChangeText(["text": text])
      },
      onSelection: { [weak self] range in
        self?.onSelectionChange([
          "start": range.location,
          "end": range.location + range.length
        ])
      },
      onTextChanged: { [weak self] in
        self?.scheduleReHighlight()
      }
    )
    textDelegate = delegate
    textView.textDelegate = delegate
    addSubview(textView)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    textView.frame = bounds
  }

  func setText(_ value: String) {
    if textView.text != value {
      textView.text = value
    }
    // Always re-highlight: language/font may have changed in the same
    // prop update batch even if text didn't, and STTextView can lose
    // attributes across re-layout (rotation, resize).
    scheduleReHighlight()
  }

  func setEditable(_ value: Bool) {
    textView.isEditable = value
  }

  func focusEditor() {
    textView.becomeFirstResponder()
  }

  func blurEditor() {
    textView.resignFirstResponder()
  }

  func setFont(family: String?, size: Double?) {
    let resolvedSize = CGFloat(size ?? 14)
    if let family = family, let custom = UIFont(name: family, size: resolvedSize) {
      textView.font = custom
    } else {
      textView.font = .monospacedSystemFont(ofSize: resolvedSize, weight: .regular)
    }
    scheduleReHighlight()
  }

  func setTheme(_ theme: String) {
    switch theme {
    case "light":
      overrideUserInterfaceStyle = .light
    case "dark":
      overrideUserInterfaceStyle = .dark
    default:
      overrideUserInterfaceStyle = .unspecified
    }
    textView.backgroundColor = .systemBackground
    textView.textColor = .label
  }

  func setContentInsets(top: Double, bottom: Double, left: Double, right: Double) {
    textView.textContainerInset = UIEdgeInsets(
      top: CGFloat(top),
      left: CGFloat(left),
      bottom: CGFloat(bottom),
      right: CGFloat(right)
    )
  }

  func setLanguage(_ value: String) {
    currentLanguage = HighlightLanguage(rawValue: value) ?? .plaintext
    scheduleReHighlight()
  }

  // Coalesce reHighlight calls onto the next runloop tick so that a single
  // batch of prop updates (e.g. text + language together) results in one
  // highlight pass using the FINAL state of every prop, not whichever one
  // happened to be applied first.
  private func scheduleReHighlight() {
    if isReHighlighting || reHighlightScheduled { return }
    reHighlightScheduled = true
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      self.reHighlightScheduled = false
      self.performReHighlight()
    }
  }

  private func performReHighlight() {
    guard !isReHighlighting else { return }
    isReHighlighting = true
    defer { isReHighlighting = false }

    let text = textView.text ?? ""
    let attrString = NSMutableAttributedString(string: text)
    Highlighter(
      language: currentLanguage,
      theme: .system,
      baseFont: textView.font
    ).apply(to: attrString)

    let savedSelection = textView.textSelection
    textView.attributedText = attrString
    textView.textSelection = savedSelection
  }
}

private class TextDelegate: NSObject, STTextViewDelegate {
  let onChange: (String) -> Void
  let onSelection: (NSRange) -> Void
  let onTextChanged: () -> Void

  init(
    onChange: @escaping (String) -> Void,
    onSelection: @escaping (NSRange) -> Void,
    onTextChanged: @escaping () -> Void
  ) {
    self.onChange = onChange
    self.onSelection = onSelection
    self.onTextChanged = onTextChanged
  }

  func textViewDidChangeText(_ notification: Notification) {
    guard let textView = notification.object as? STTextView else { return }
    onChange(textView.text ?? "")
    onTextChanged()
  }

  func textViewDidChangeSelection(_ notification: Notification) {
    guard let textView = notification.object as? STTextView else { return }
    onSelection(textView.textSelection)
  }
}
#elseif os(macOS)
import STTextView
import AppKit

class SourceEditorView: ExpoView {
  let scrollView = NSScrollView()
  let textView = STTextView()
  let onChangeText = EventDispatcher()
  let onSelectionChange = EventDispatcher()

  private var textDelegate: TextDelegate?
  private var currentLanguage: HighlightLanguage = .plaintext
  private var isReHighlighting = false
  private var reHighlightScheduled = false

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    wantsLayer = true
    layer?.masksToBounds = true

    let delegate = TextDelegate(
      onChange: { [weak self] text in
        self?.onChangeText(["text": text])
      },
      onSelection: { [weak self] range in
        self?.onSelectionChange([
          "start": range.location,
          "end": range.location + range.length
        ])
      },
      onTextChanged: { [weak self] in
        self?.scheduleReHighlight()
      }
    )
    textDelegate = delegate
    textView.delegate = delegate

    scrollView.documentView = textView
    scrollView.hasVerticalScroller = true
    scrollView.hasHorizontalScroller = true
    addSubview(scrollView)
  }

  override func layout() {
    super.layout()
    scrollView.frame = bounds
  }

  func setText(_ value: String) {
    if textView.text != value {
      textView.text = value
    }
    scheduleReHighlight()
  }

  func setEditable(_ value: Bool) {
    textView.isEditable = value
  }

  func focusEditor() {
    window?.makeFirstResponder(textView)
  }

  func blurEditor() {
    if window?.firstResponder === textView {
      window?.makeFirstResponder(nil)
    }
  }

  func setFont(family: String?, size: Double?) {
    let resolvedSize = CGFloat(size ?? 14)
    if let family = family, let custom = NSFont(name: family, size: resolvedSize) {
      textView.font = custom
    } else {
      textView.font = .monospacedSystemFont(ofSize: resolvedSize, weight: .regular)
    }
    scheduleReHighlight()
  }

  func setTheme(_ theme: String) {
    switch theme {
    case "light":
      appearance = NSAppearance(named: .aqua)
    case "dark":
      appearance = NSAppearance(named: .darkAqua)
    default:
      appearance = nil
    }
    textView.backgroundColor = .textBackgroundColor
    textView.textColor = .textColor
  }

  func setContentInsets(top: Double, bottom: Double, left: Double, right: Double) {
    scrollView.contentInsets = NSEdgeInsets(
      top: CGFloat(top),
      left: CGFloat(left),
      bottom: CGFloat(bottom),
      right: CGFloat(right)
    )
  }

  func setLanguage(_ value: String) {
    currentLanguage = HighlightLanguage(rawValue: value) ?? .plaintext
    scheduleReHighlight()
  }

  // Coalesce reHighlight calls onto the next runloop tick so that a single
  // batch of prop updates (e.g. text + language together) results in one
  // highlight pass using the FINAL state of every prop, not whichever one
  // happened to be applied first.
  private func scheduleReHighlight() {
    if isReHighlighting || reHighlightScheduled { return }
    reHighlightScheduled = true
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      self.reHighlightScheduled = false
      self.performReHighlight()
    }
  }

  private func performReHighlight() {
    guard !isReHighlighting else { return }
    isReHighlighting = true
    defer { isReHighlighting = false }

    let text = textView.text ?? ""
    let attrString = NSMutableAttributedString(string: text)
    Highlighter(
      language: currentLanguage,
      theme: .system,
      baseFont: textView.font
    ).apply(to: attrString)

    let savedSelection = textView.textSelection
    textView.attributedText = attrString
    textView.textSelection = savedSelection
  }
}

private class TextDelegate: NSObject, STTextViewDelegate {
  let onChange: (String) -> Void
  let onSelection: (NSRange) -> Void
  let onTextChanged: () -> Void

  init(
    onChange: @escaping (String) -> Void,
    onSelection: @escaping (NSRange) -> Void,
    onTextChanged: @escaping () -> Void
  ) {
    self.onChange = onChange
    self.onSelection = onSelection
    self.onTextChanged = onTextChanged
  }

  func textViewDidChangeText(_ notification: Notification) {
    guard let textView = notification.object as? STTextView else { return }
    onChange(textView.text ?? "")
    onTextChanged()
  }

  func textViewDidChangeSelection(_ notification: Notification) {
    guard let textView = notification.object as? STTextView else { return }
    onSelection(textView.textSelection)
  }
}
#else
class SourceEditorView: ExpoView {
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
  }
}
#endif
