import Foundation

#if os(iOS)
import STTextView
import UIKit

@objc(RNSESourceEditorImpl)
public class SourceEditorImpl: UIView {
  let textView = STTextView()
  private var textDelegate: TextDelegate?
  private var currentLanguage: HighlightLanguage = .plaintext
  private var isReHighlighting = false
  private var reHighlightScheduled = false

  @objc public var onChange: ((String) -> Void)?
  @objc public var onSelection: ((Int, Int) -> Void)?

  override public init(frame: CGRect) {
    super.init(frame: frame)
    setupTextView()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupTextView()
  }

  private func setupTextView() {
    clipsToBounds = true

    textView.isScrollEnabled = true
    textView.alwaysBounceVertical = true
    textView.contentInsetAdjustmentBehavior = .never

    let delegate = TextDelegate(
      onChange: { [weak self] text in self?.onChange?(text) },
      onSelection: { [weak self] range in
        self?.onSelection?(range.location, range.location + range.length)
      },
      onTextChanged: { [weak self] in self?.scheduleReHighlight() }
    )
    textDelegate = delegate
    textView.textDelegate = delegate
    addSubview(textView)
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    textView.frame = bounds
  }

  @objc public func setText(_ value: String) {
    if textView.text != value {
      textView.text = value
    }
    scheduleReHighlight()
  }

  @objc public func setEditable(_ value: Bool) {
    textView.isEditable = value
  }

  @objc public func focusEditor() { textView.becomeFirstResponder() }

  @objc public func blurEditor() { textView.resignFirstResponder() }

  @objc public func setFont(family: String?, size: Double) {
    let resolvedSize = CGFloat(size > 0 ? size : 14)
    if let family = family, !family.isEmpty,
       let custom = UIFont(name: family, size: resolvedSize) {
      textView.font = custom
    } else {
      textView.font = .monospacedSystemFont(ofSize: resolvedSize, weight: .regular)
    }
    scheduleReHighlight()
  }

  @objc public func setTheme(_ theme: String) {
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

  @objc public func setContentInsets(top: Double, bottom: Double, left: Double, right: Double) {
    textView.textContainerInset = UIEdgeInsets(
      top: CGFloat(top),
      left: CGFloat(left),
      bottom: CGFloat(bottom),
      right: CGFloat(right)
    )
  }

  @objc public func setLanguage(_ value: String) {
    currentLanguage = HighlightLanguage(rawValue: value) ?? .plaintext
    scheduleReHighlight()
  }

  @objc public func setLineNumbers(_ value: Bool) {
    // STTextView (UIKit + AppKit) exposes the same `showsLineNumbers`
    // property; toggling at runtime adds/removes the gutter view in
    // place — no remount required.
    textView.showsLineNumbers = value
  }

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
    Highlighter(language: currentLanguage, theme: .system, baseFont: textView.font).apply(to: attrString)

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

@objc(RNSESourceEditorImpl)
public class SourceEditorImpl: NSView {
  let scrollView = NSScrollView()
  let textView = STTextView()
  private var textDelegate: TextDelegate?
  private var currentLanguage: HighlightLanguage = .plaintext
  private var isReHighlighting = false
  private var reHighlightScheduled = false

  @objc public var onChange: ((String) -> Void)?
  @objc public var onSelection: ((Int, Int) -> Void)?

  override public init(frame: CGRect) {
    super.init(frame: frame)
    setupTextView()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupTextView()
  }

  private func setupTextView() {
    wantsLayer = true
    layer?.masksToBounds = true

    let delegate = TextDelegate(
      onChange: { [weak self] text in self?.onChange?(text) },
      onSelection: { [weak self] range in
        self?.onSelection?(range.location, range.location + range.length)
      },
      onTextChanged: { [weak self] in self?.scheduleReHighlight() }
    )
    textDelegate = delegate
    textView.delegate = delegate

    scrollView.documentView = textView
    scrollView.hasVerticalScroller = true
    scrollView.hasHorizontalScroller = true
    addSubview(scrollView)
  }

  public override func layout() {
    super.layout()
    scrollView.frame = bounds
  }

  @objc public func setText(_ value: String) {
    if textView.text != value {
      textView.text = value
    }
    scheduleReHighlight()
  }

  @objc public func setEditable(_ value: Bool) {
    textView.isEditable = value
  }

  @objc public func focusEditor() { window?.makeFirstResponder(textView) }

  @objc public func blurEditor() {
    if window?.firstResponder === textView {
      window?.makeFirstResponder(nil)
    }
  }

  @objc public func setFont(family: String?, size: Double) {
    let resolvedSize = CGFloat(size > 0 ? size : 14)
    if let family = family, !family.isEmpty,
       let custom = NSFont(name: family, size: resolvedSize) {
      textView.font = custom
    } else {
      textView.font = .monospacedSystemFont(ofSize: resolvedSize, weight: .regular)
    }
    scheduleReHighlight()
  }

  @objc public func setTheme(_ theme: String) {
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

  @objc public func setContentInsets(top: Double, bottom: Double, left: Double, right: Double) {
    scrollView.contentInsets = NSEdgeInsets(
      top: CGFloat(top),
      left: CGFloat(left),
      bottom: CGFloat(bottom),
      right: CGFloat(right)
    )
  }

  @objc public func setLanguage(_ value: String) {
    currentLanguage = HighlightLanguage(rawValue: value) ?? .plaintext
    scheduleReHighlight()
  }

  @objc public func setLineNumbers(_ value: Bool) {
    // STTextView (UIKit + AppKit) exposes the same `showsLineNumbers`
    // property; toggling at runtime adds/removes the gutter view in
    // place — no remount required.
    textView.showsLineNumbers = value
  }

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
    Highlighter(language: currentLanguage, theme: .system, baseFont: textView.font).apply(to: attrString)

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
#endif
