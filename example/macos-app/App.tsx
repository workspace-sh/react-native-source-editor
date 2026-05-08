import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { marked } from 'marked';
import SourceEditor, {
  type Language,
  type SourceEditorRef,
} from '@workspace-sh/react-native-source-editor';

type DemoLanguage = Exclude<Language, 'plaintext'>;

const SAMPLES: Record<DemoLanguage, string> = {
  markdown: `# SourceEditor — macOS

Native source editor for **React Native**, wrapping [STTextView](https://github.com/krzyzanowskim/STTextView).

- iOS via *UIKit*
- macOS via *AppKit*

Inline \`code\` looks like this. The pane on the right renders this Markdown live.

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
  "macos": {
    "deploymentTarget": 14.0
  }
}
`,
  javascript: `const name = 'SourceEditor';
const features = ['markdown', 'json', 'js', 'ts', 'html'];

console.log('Hello from', name);
console.log('Supported:', features);
console.info('console.info works');
console.warn('and console.warn');

try {
  JSON.parse('not json');
} catch (e) {
  console.error('Caught:', e.message);
}
`,
  typescript: `type Greeting = 'hello' | 'hi' | 'hey';

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
`,
  html: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system; padding: 24px; background: light-dark(#fff, #000); color: light-dark(#000, #fff); }
  h1 { color: light-dark(#007aff, #0a84ff); }
  .badge { display: inline-block; background: rgba(0, 122, 255, 0.15); padding: 4px 10px; border-radius: 999px; font-size: 0.75em; }
</style>
</head>
<body>
  <h1>SourceEditor <span class="badge">macOS</span></h1>
  <p>HTML, CSS and JS — highlighted on the left, rendered on the right.</p>
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

const LANGUAGES: DemoLanguage[] = [
  'markdown',
  'json',
  'javascript',
  'typescript',
  'html',
];

export default function App() {
  const [language, setLanguage] = useState<DemoLanguage>('markdown');
  const [content, setContent] = useState(SAMPLES.markdown);
  const editorRef = useRef<SourceEditorRef>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const previewHTML = useMemo(() => {
    if (language === 'html') return content;
    if (language === 'markdown') {
      const body = marked.parse(content, { async: false }) as string;
      return wrapMarkdownHTML(body, isDark);
    }
    if (language === 'javascript' || language === 'typescript') {
      const js = language === 'typescript' ? stripTSTypes(content) : content;
      return wrapJSConsoleHTML(js, isDark);
    }
    return wrapPlainHTML(content, isDark);
  }, [language, content, isDark]);

  const onLanguageChange = (lang: DemoLanguage) => {
    setLanguage(lang);
    setContent(SAMPLES[lang]);
  };

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View
        style={[styles.toolbar, isDark ? styles.toolbarDark : styles.toolbarLight]}
      >
        {LANGUAGES.map((lang) => {
          const active = lang === language;
          return (
            <Pressable
              key={lang}
              onPress={() => onLanguageChange(lang)}
              style={[
                styles.tab,
                active && (isDark ? styles.tabActiveDark : styles.tabActiveLight),
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isDark ? styles.tabLabelDark : styles.tabLabelLight,
                  active && styles.tabLabelActive,
                ]}
              >
                {LANGUAGE_LABEL[lang]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.split}>
        <View style={styles.pane}>
          <SourceEditor
            ref={editorRef}
            value={content}
            editable
            language={language}
            font={{ size: 13 }}
            theme="auto"
            onChangeText={setContent}
            style={styles.editor}
          />
        </View>
        <View
          style={[
            styles.divider,
            isDark ? styles.dividerDark : styles.dividerLight,
          ]}
        />
        <View style={styles.pane}>
          <WebView
            originWhitelist={['*']}
            source={{ html: previewHTML }}
            style={styles.preview}
            scrollEnabled
          />
        </View>
      </View>
    </View>
  );
}

function stripTSTypes(ts: string): string {
  let s = ts;
  s = s.replace(
    /^\s*import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm,
    ''
  );
  s = s.replace(
    /^\s*interface\s+\w+(?:\s+extends\s+[^{]+)?\s*\{[\s\S]*?^\}\s*$/gm,
    ''
  );
  s = s.replace(/^\s*type\s+\w+\s*=\s*[^;\n]+;?\s*$/gm, '');
  const PRIM =
    'string|number|boolean|void|any|unknown|never|object|null|undefined|bigint|symbol';
  const TYPE = `(?:[A-Z]\\w*|${PRIM})(?:<[^>]*>)?(?:\\[\\])*`;
  const UNION = `${TYPE}(?:\\s*[|&]\\s*${TYPE})*`;
  s = s.replace(
    new RegExp(`(\\w+\\s*\\??)\\s*:\\s*${UNION}(?=\\s*[=,)\\{\\n;])`, 'g'),
    '$1'
  );
  s = s.replace(/\s+as\s+[\w<>\[\]]+/g, '');
  return s;
}

function wrapMarkdownHTML(body: string, isDark: boolean): string {
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { color-scheme: light dark; }
  html, body { margin: 0; padding: 0; }
  body { font-family: -apple-system, system-ui; line-height: 1.55; padding: 24px;
    background: ${isDark ? '#000' : '#fff'}; color: ${isDark ? '#f2f2f7' : '#1d1d1f'}; }
  h1, h2, h3 { color: ${isDark ? '#0a84ff' : '#007aff'}; margin-top: 1.4em; }
  code { font-family: ui-monospace, Menlo, monospace;
    background: ${isDark ? '#1c1c1e' : '#f0f0f3'}; padding: 2px 5px; border-radius: 4px; }
  pre { background: ${isDark ? '#1c1c1e' : '#f5f5f7'}; padding: 14px; border-radius: 8px; overflow-x: auto; }
  pre code { background: transparent; padding: 0; }
  a { color: ${isDark ? '#0a84ff' : '#007aff'}; text-decoration: none; }
</style>
</head><body>${body}</body></html>`;
}

function wrapPlainHTML(text: string, isDark: boolean): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html><head><style>
  body { font-family: ui-monospace, Menlo, monospace; font-size: 13px; padding: 16px;
    background: ${isDark ? '#000' : '#fff'}; color: ${isDark ? '#f2f2f7' : '#1d1d1f'}; white-space: pre-wrap; }
</style></head><body>${escaped}</body></html>`;
}

function wrapJSConsoleHTML(source: string, isDark: boolean): string {
  const sourceJson = JSON.stringify(source);
  return `<!DOCTYPE html>
<html><head><style>
  body { font-family: ui-monospace, Menlo, monospace; font-size: 13px; line-height: 1.5;
    padding: 16px; margin: 0;
    background: ${isDark ? '#000' : '#fff'}; color: ${isDark ? '#f2f2f7' : '#1d1d1f'}; }
  .line { padding: 4px 8px; border-radius: 4px; white-space: pre-wrap; word-break: break-word; }
  .line + .line { margin-top: 2px; }
  .line.warn { color: ${isDark ? '#ffd60a' : '#995700'}; background: ${isDark ? '#2a2200' : '#fff8e1'}; }
  .line.error { color: ${isDark ? '#ff453a' : '#c00'}; background: ${isDark ? '#2a0000' : '#ffeaea'}; }
  .line.info { color: ${isDark ? '#64d2ff' : '#0064cc'}; }
  .line .marker { opacity: 0.5; margin-right: 8px; }
  .empty { opacity: 0.5; padding: 8px; }
</style></head><body>
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
  window.addEventListener('error', function (e) { append('error', [e.error || e.message]); });
  window.addEventListener('unhandledrejection', function (e) {
    append('error', ['Unhandled rejection:', e.reason]);
  });
  try { new Function(${sourceJson})(); } catch (e) { append('error', [e]); }
  if (entries === 0) {
    var empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '(no console output)';
    out.appendChild(empty);
  }
})();
</script>
</body></html>`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: '#f5f5f7' },
  containerDark: { backgroundColor: '#000' },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarLight: { backgroundColor: '#fff', borderBottomColor: '#d1d1d6' },
  toolbarDark: { backgroundColor: '#1c1c1e', borderBottomColor: '#3a3a3c' },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  tabActiveLight: { backgroundColor: 'rgba(0, 122, 255, 0.12)' },
  tabActiveDark: { backgroundColor: 'rgba(10, 132, 255, 0.22)' },
  tabLabel: { fontSize: 13, fontWeight: '500' },
  tabLabelLight: { color: '#1d1d1f' },
  tabLabelDark: { color: '#f2f2f7' },
  tabLabelActive: { color: '#0a84ff' },
  split: { flex: 1, flexDirection: 'row' },
  pane: { flex: 1 },
  editor: { flex: 1 },
  preview: { flex: 1, backgroundColor: 'transparent' },
  divider: { width: StyleSheet.hairlineWidth },
  dividerLight: { backgroundColor: '#d1d1d6' },
  dividerDark: { backgroundColor: '#3a3a3c' },
});
