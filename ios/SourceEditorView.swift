import ExpoModulesCore

#if os(iOS)
import STTextView
import UIKit

class SourceEditorView: ExpoView {
  let textView = STTextView()
  let onChangeText = EventDispatcher()
  let onSelectionChange = EventDispatcher()

  private var textDelegate: TextDelegate?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true

    let delegate = TextDelegate(
      onChange: { [weak self] text in
        self?.onChangeText(["text": text])
      },
      onSelection: { [weak self] range in
        self?.onSelectionChange([
          "start": range.location,
          "end": range.location + range.length
        ])
      }
    )
    textDelegate = delegate
    textView.delegate = delegate
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
  }
}

private class TextDelegate: NSObject, STTextViewDelegate {
  let onChange: (String) -> Void
  let onSelection: (NSRange) -> Void

  init(onChange: @escaping (String) -> Void, onSelection: @escaping (NSRange) -> Void) {
    self.onChange = onChange
    self.onSelection = onSelection
  }

  func textViewDidChangeText(_ notification: Notification) {
    guard let textView = notification.object as? STTextView else { return }
    onChange(textView.text ?? "")
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
  }
}

private class TextDelegate: NSObject, STTextViewDelegate {
  let onChange: (String) -> Void
  let onSelection: (NSRange) -> Void

  init(onChange: @escaping (String) -> Void, onSelection: @escaping (NSRange) -> Void) {
    self.onChange = onChange
    self.onSelection = onSelection
  }

  func textViewDidChangeText(_ notification: Notification) {
    guard let textView = notification.object as? STTextView else { return }
    onChange(textView.text ?? "")
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
