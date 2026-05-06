import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  GlassEffectContainer,
  HStack,
  Host,
  Picker,
  Text,
} from '@expo/ui/swift-ui';
import {
  controlSize,
  glassEffect,
  pickerStyle,
  tag,
} from '@expo/ui/swift-ui/modifiers';
import { WebView } from 'react-native-webview';
import { marked } from 'marked';
import SourceEditor, {
  type Language,
  type SourceEditorRef,
} from '@workspace-sh/react-native-source-editor';

type DemoLanguage = Exclude<Language, 'plaintext'>;
type ViewMode = 'source' | 'preview';

const SAMPLES: Record<DemoLanguage, string> = {
  markdown: `# SourceEditor

Native source editor for **React Native**, wrapping [STTextView](https://github.com/krzyzanowskim/STTextView).

- iOS via *UIKit*
- macOS via *AppKit*

Inline \`code\` looks like this. Switch to **Preview** to see the rendered Markdown.

## Tokens

- Headings (\`#\`, \`##\`, …)
- **Bold**, *italic*
- Inline \`code\`
- [Links](https://example.com)
`,
  json: `{
  "name": "@workspace-sh/react-native-source-editor",
  "version": "0.0.1",
  "private": true,
  "platforms": ["ios", "macos"],
  "ios": {
    "deploymentTarget": 16.0,
    "useFrameworks": "static"
  },
  "experimental": null,
  "stable": true,
  "downloads": 0
}
`,
  javascript: `// Switch to Preview to run this and see console output.
const name = 'SourceEditor';
const features = ['markdown', 'json', 'js', 'ts', 'html'];

console.log('Hello from', name);
console.log('Supported:', features);
console.info('console.info works too');
console.warn('and console.warn');

try {
  JSON.parse('not json');
} catch (e) {
  console.error('Caught:', e.message);
}
`,
  typescript: `// Types are stripped before execution; the rest runs as plain JS.
type Greeting = 'hello' | 'hi' | 'hey';

interface Person {
  name: string;
  greeting: Greeting;
}

const people: Person[] = [
  { name: 'Alice', greeting: 'hello' },
  { name: 'Bob', greeting: 'hey' },
];

people.forEach((p) => {
  console.log(\`\${p.greeting}, \${p.name}!\`);
});

const counter: number = 42;
console.log('Counter:', counter);
`,
  html: `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { color-scheme: light dark; }
  body {
    font-family: -apple-system, system-ui;
    padding: 24px;
    background: light-dark(#fff, #000);
    color: light-dark(#000, #fff);
  }
  h1 { color: light-dark(#007aff, #0a84ff); }
  .badge {
    display: inline-block;
    background: rgba(0, 122, 255, 0.15);
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.75em;
    vertical-align: middle;
  }
  button {
    margin-top: 12px;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    background: light-dark(#007aff, #0a84ff);
    color: white;
    font-weight: 600;
  }
</style>
</head>
<body>
  <h1>SourceEditor <span class="badge">demo</span></h1>
  <p>HTML, CSS and JS — all highlighted in source, all rendered in preview.</p>
  <button id="hello">Tap me</button>
  <script>
    document.getElementById('hello').addEventListener('click', () => {
      alert('Hello from the HTML preview!');
    });
  </script>
</body>
</html>
`,
};

const LANGUAGE_LABEL: Record<DemoLanguage, string> = {
  markdown: 'Markdown',
  json: 'JSON',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html: 'HTML',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <Demo />
    </SafeAreaProvider>
  );
}

function Demo() {
  const [language, setLanguage] = useState<DemoLanguage>('markdown');
  const [viewMode, setViewMode] = useState<ViewMode>('source');
  const [content, setContent] = useState(SAMPLES.markdown);
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const editorRef = useRef<SourceEditorRef>(null);
  const insets = useSafeAreaInsets();

  const isPreviewable =
    language === 'markdown' ||
    language === 'html' ||
    language === 'javascript' ||
    language === 'typescript';
  const showPreview = isPreviewable && viewMode === 'preview';

  const html = useMemo(() => {
    if (!showPreview) return '';
    if (language === 'html') return content;
    if (language === 'markdown') {
      const body = marked.parse(content, { async: false }) as string;
      return wrapMarkdownHTML(body, insets.top, bottomBarHeight);
    }
    // javascript / typescript — execute and capture console output
    const js = language === 'typescript' ? stripTSTypes(content) : content;
    return wrapJSConsoleHTML(js, insets.top, bottomBarHeight);
  }, [showPreview, language, content, insets.top, bottomBarHeight]);

  const onLanguageChange = (lang: DemoLanguage) => {
    setLanguage(lang);
    setContent(SAMPLES[lang]);
  };

  // Auto-focus the editor (and surface the keyboard) in source mode.
  // Explicitly blur when switching to preview so the keyboard goes away.
  useEffect(() => {
    if (showPreview) {
      editorRef.current?.blur();
      Keyboard.dismiss();
      return;
    }
    const t = setTimeout(() => editorRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [showPreview, language]);

  // Lift the toolbar above the keyboard so Source/Preview is always reachable.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {showPreview ? (
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          style={styles.preview}
          contentInsetAdjustmentBehavior="never"
          scrollEnabled
        />
      ) : (
        <SourceEditor
          ref={editorRef}
          value={content}
          editable
          language={language}
          font={{ size: 13 }}
          theme="auto"
          contentInsets={{
            top: insets.top + 12,
            bottom: bottomBarHeight + keyboardHeight + 16,
            left: Math.max(8, insets.left),
            right: Math.max(8, insets.right),
          }}
          onChangeText={setContent}
          style={styles.editor}
        />
      )}

      <View
        style={[
          styles.toolbarPositioner,
          {
            bottom: keyboardHeight,
            paddingBottom: keyboardHeight > 0 ? 8 : insets.bottom + 8,
            paddingLeft: Math.max(16, insets.left),
            paddingRight: Math.max(16, insets.right),
          },
        ]}
        pointerEvents="box-none"
      >
        <Host
          matchContents={{ vertical: true }}
          style={styles.toolbarHost}
          onLayoutContent={(e) => setBottomBarHeight(e.nativeEvent.height)}
        >
          <GlassEffectContainer spacing={8}>
            <HStack spacing={8}>
              <Picker
                modifiers={[
                  pickerStyle('menu'),
                  controlSize('large'),
                  glassEffect({
                    shape: 'capsule',
                    glass: { variant: 'regular', interactive: true },
                  }),
                ]}
                selection={language}
                onSelectionChange={(value) =>
                  onLanguageChange(value as DemoLanguage)
                }
              >
                <Text modifiers={[tag('markdown')]}>
                  {LANGUAGE_LABEL.markdown}
                </Text>
                <Text modifiers={[tag('json')]}>{LANGUAGE_LABEL.json}</Text>
                <Text modifiers={[tag('javascript')]}>
                  {LANGUAGE_LABEL.javascript}
                </Text>
                <Text modifiers={[tag('typescript')]}>
                  {LANGUAGE_LABEL.typescript}
                </Text>
                <Text modifiers={[tag('html')]}>{LANGUAGE_LABEL.html}</Text>
              </Picker>

              {isPreviewable && (
                <Picker
                  modifiers={[
                    pickerStyle('segmented'),
                    controlSize('large'),
                  ]}
                  selection={viewMode}
                  onSelectionChange={(value) => setViewMode(value as ViewMode)}
                >
                  <Text modifiers={[tag('source')]}>Source</Text>
                  <Text modifiers={[tag('preview')]}>Preview</Text>
                </Picker>
              )}
            </HStack>
          </GlassEffectContainer>
        </Host>
      </View>
    </View>
  );
}

// Tiny TS-to-JS strip — handles the common shapes we ship in samples
// (interface/type declarations, simple `: Type` annotations, `as Type`
// casts, `import type {...}`). Not a real type-checker; good enough for
// the example's playground purpose.
//
// The annotation strip is intentionally conservative: it only removes
// `: Type` where Type looks like an actual type (uppercase identifier or
// known primitive, optionally with generics / array suffix / unions).
// That keeps it from chewing through object-literal values like
// `name: 'Alice'`.
function stripTSTypes(ts: string): string {
  let s = ts;
  // `import type { ... } from '...'`
  s = s.replace(
    /^\s*import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm,
    ''
  );
  // `interface Foo (extends Bar) { ... }` — assumes closing brace at start of line.
  s = s.replace(
    /^\s*interface\s+\w+(?:\s+extends\s+[^{]+)?\s*\{[\s\S]*?^\}\s*$/gm,
    ''
  );
  // `type Foo = ...;`
  s = s.replace(/^\s*type\s+\w+\s*=\s*[^;\n]+;?\s*$/gm, '');
  // `: Type` annotations. Type = (Uppercase\w* | primitive) optionally
  // generic / array / union with same.
  const PRIM = 'string|number|boolean|void|any|unknown|never|object|null|undefined|bigint|symbol';
  const TYPE = `(?:[A-Z]\\w*|${PRIM})(?:<[^>]*>)?(?:\\[\\])*`;
  const UNION = `${TYPE}(?:\\s*[|&]\\s*${TYPE})*`;
  s = s.replace(
    new RegExp(`(\\w+\\s*\\??)\\s*:\\s*${UNION}(?=\\s*[=,)\\{\\n;])`, 'g'),
    '$1'
  );
  // `as Type` casts
  s = s.replace(/\s+as\s+[\w<>\[\]]+/g, '');
  return s;
}

function wrapJSConsoleHTML(
  source: string,
  topInset: number,
  bottomInset: number
): string {
  // Inject the user's source as JSON so we can parse + run it inside the
  // wrapper without escape-string gymnastics.
  const sourceJson = JSON.stringify(source);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { color-scheme: light dark; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
    line-height: 1.5;
    padding: ${topInset + 16}px 16px ${bottomInset + 16}px;
    background: light-dark(#fff, #000);
    color: light-dark(#1d1d1f, #f2f2f7);
  }
  .line { padding: 4px 8px; border-radius: 4px; white-space: pre-wrap; word-break: break-word; }
  .line + .line { margin-top: 2px; }
  .line.warn { color: light-dark(#995700, #ffd60a); background: light-dark(#fff8e1, #2a2200); }
  .line.error { color: light-dark(#c00, #ff453a); background: light-dark(#ffeaea, #2a0000); }
  .line.info { color: light-dark(#0064cc, #64d2ff); }
  .line.debug { opacity: 0.65; }
  .line .marker { opacity: 0.5; margin-right: 8px; }
  .empty { opacity: 0.5; padding: 8px; }
</style>
</head>
<body>
<div id="console"></div>
<script>
(function () {
  var out = document.getElementById('console');
  var entries = 0;

  function fmt(v) {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'string') return v;
    if (typeof v === 'function') return 'ƒ ' + (v.name || 'anonymous');
    if (v instanceof Error) {
      var head = (v.name || 'Error') + ': ' + (v.message || '<no message>');
      return v.stack ? head + '\\n' + v.stack : head;
    }
    try { return JSON.stringify(v, null, 2); } catch (e) { return String(v); }
  }

  function append(level, args) {
    entries++;
    var line = document.createElement('div');
    line.className = 'line ' + level;
    var marker = document.createElement('span');
    marker.className = 'marker';
    marker.textContent = level === 'log' ? '›' : level.toUpperCase();
    line.appendChild(marker);
    line.appendChild(document.createTextNode(args.map(fmt).join(' ')));
    out.appendChild(line);
  }

  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (level) {
    var orig = console[level];
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      append(level, args);
      if (orig) orig.apply(console, args);
    };
  });

  window.addEventListener('error', function (e) {
    append('error', [e.error || e.message]);
  });
  window.addEventListener('unhandledrejection', function (e) {
    append('error', ['Unhandled rejection:', e.reason]);
  });

  try {
    new Function(${sourceJson})();
  } catch (e) {
    append('error', [e]);
  }

  if (entries === 0) {
    var empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '(no console output)';
    out.appendChild(empty);
  }
})();
</script>
</body>
</html>`;
}

function wrapMarkdownHTML(
  body: string,
  topInset: number,
  bottomInset: number
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { color-scheme: light dark; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
    line-height: 1.55;
    padding: ${topInset + 16}px 20px ${bottomInset + 16}px;
    background: light-dark(#fff, #000);
    color: light-dark(#000, #fff);
    -webkit-text-size-adjust: 100%;
  }
  h1, h2, h3, h4 { color: light-dark(#007aff, #0a84ff); margin-top: 1.4em; }
  h1 { font-size: 1.7em; }
  h2 { font-size: 1.35em; }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: light-dark(#f0f0f3, #1c1c1e);
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: light-dark(#f5f5f7, #1c1c1e);
    padding: 14px;
    border-radius: 8px;
    overflow-x: auto;
  }
  pre code { background: transparent; padding: 0; }
  a { color: light-dark(#007aff, #0a84ff); text-decoration: none; }
  ul, ol { padding-left: 1.4em; }
  blockquote {
    border-left: 3px solid light-dark(#d1d1d6, #3a3a3c);
    padding-left: 12px;
    margin-left: 0;
    color: light-dark(#6e6e73, #a1a1a6);
  }
</style>
</head>
<body>${body}</body>
</html>`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  editor: { flex: 1 },
  preview: { flex: 1, backgroundColor: 'transparent' },
  toolbarPositioner: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 8,
  },
  toolbarHost: {
    width: '100%',
  },
});
