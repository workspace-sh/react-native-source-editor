/**
 * Android demo. Mirrors `App.tsx`'s functionality (multi-language tabs,
 * Source/Preview toggle, WebView-rendered markdown / HTML / JS / TS
 * preview) using only RN-core primitives. The shared `App.tsx` uses
 * `@expo/ui/swift-ui` for its toolbar (iOS/macOS-only); the Android
 * counterpart `@expo/ui/jetpack-compose` exposes a different component
 * vocabulary (Switch / SegmentedButton / Chip rather than Toggle /
 * Picker / GlassEffect), so true UI sharing isn't possible without a
 * thicker abstraction layer.
 *
 * Skipped vs iOS: the `lineNumbers`, `font`, `theme`, and `contentInsets`
 * props are still no-ops on the Android ViewManager — toolbar UI for
 * those will land alongside the respective property PRs in #32.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { marked } from 'marked';
import SourceEditor, {
  type Language,
  type SourceEditorRef,
} from '@workspace-sh/react-native-source-editor';
import {
  stripTSTypes,
  wrapJSConsoleHTML,
  wrapMarkdownHTML,
} from './previewHelpers';

type DemoLanguage = Exclude<Language, 'plaintext'>;
type ViewMode = 'source' | 'preview';

const LANGUAGES: Language[] = [
  'plaintext',
  'markdown',
  'json',
  'javascript',
  'typescript',
  'html',
];

const SAMPLES: Record<Language, string> = {
  plaintext: `SourceEditor — Android MVP

Backed by Sora-Editor (Java/Kotlin) on Android, mirroring the iOS / macOS
STTextView wrapper. Plaintext tab shows the editor without any grammar
applied — switch tabs to see TextMate highlighting.
`,
  markdown: `# SourceEditor

Native source editor for **React Native**.

- iOS / macOS via *STTextView*
- Android via *Sora-Editor*

Inline \`code\` looks like this. Switch to **Preview** to see the rendered Markdown.

## Tokens

- Headings (\`#\`, \`##\`, …)
- **Bold**, *italic*
- Inline \`code\`
- [Links](https://example.com)
`,
  json: `{
  "name": "@workspace-sh/react-native-source-editor",
  "version": "0.1.0",
  "private": true,
  "platforms": ["ios", "macos", "android"],
  "android": {
    "minSdkVersion": 24,
    "newArchEnabled": true
  }
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
`,
  html: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; padding: 24px; }
  h1 { color: #0a84ff; }
</style>
</head>
<body>
  <h1>SourceEditor</h1>
  <p>HTML highlighted by TextMate via Sora-Editor.</p>
</body>
</html>
`,
};

function Demo() {
  const insets = useSafeAreaInsets();
  const editorRef = useRef<SourceEditorRef>(null);
  const [language, setLanguage] = useState<Language>('javascript');
  const [text, setText] = useState(SAMPLES.javascript);
  const [viewMode, setViewMode] = useState<ViewMode>('source');
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const isPreviewable =
    language === 'markdown' ||
    language === 'html' ||
    language === 'javascript' ||
    language === 'typescript';
  const showPreview = isPreviewable && viewMode === 'preview';

  const html = useMemo(() => {
    if (!showPreview) return '';
    if (language === 'html') return text;
    if (language === 'markdown') {
      const body = marked.parse(text, { async: false }) as string;
      return wrapMarkdownHTML(body, 0, 0);
    }
    const js = language === 'typescript' ? stripTSTypes(text) : text;
    return wrapJSConsoleHTML(js, 0, 0);
  }, [showPreview, language, text]);

  const onLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setText(SAMPLES[lang]);
    // Source/preview only valid for the previewable languages — drop back
    // to source view when switching to a non-previewable language.
    if (
      lang !== 'markdown' &&
      lang !== 'html' &&
      lang !== 'javascript' &&
      lang !== 'typescript'
    ) {
      setViewMode('source');
    }
  };

  // Blur the editor when switching to preview so the keyboard goes away.
  useEffect(() => {
    if (showPreview) {
      editorRef.current?.blur();
    }
  }, [showPreview]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.toolbar}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            onPress={() => onLanguageChange(lang)}
            style={[
              styles.langChip,
              language === lang && styles.langChipActive,
            ]}
          >
            <Text
              style={[
                styles.langText,
                language === lang && styles.langTextActive,
              ]}
            >
              {lang}
            </Text>
          </Pressable>
        ))}
      </View>

      {showPreview ? (
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          style={styles.preview}
          scrollEnabled
        />
      ) : (
        <SourceEditor
          ref={editorRef}
          value={text}
          editable
          language={language}
          onChangeText={setText}
          onSelectionChange={setSelection}
          style={styles.editor}
        />
      )}

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {language} · {text.length} chars · sel {selection.start}–{selection.end}
        </Text>
        {isPreviewable && (
          <View style={styles.segmented}>
            {(['source', 'preview'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setViewMode(mode)}
                style={[
                  styles.segmentedButton,
                  viewMode === mode && styles.segmentedButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentedText,
                    viewMode === mode && styles.segmentedTextActive,
                  ]}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        {!showPreview && (
          <>
            <Pressable
              onPress={() => editorRef.current?.focus()}
              style={styles.statusButton}
            >
              <Text style={styles.statusButtonText}>focus</Text>
            </Pressable>
            <Pressable
              onPress={() => editorRef.current?.blur()}
              style={styles.statusButton}
            >
              <Text style={styles.statusButtonText}>blur</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Demo />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 8,
    backgroundColor: '#111',
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#222',
  },
  langChipActive: { backgroundColor: '#0a84ff' },
  langText: { color: '#888', fontSize: 12 },
  langTextActive: { color: '#fff' },
  editor: { flex: 1 },
  preview: { flex: 1, backgroundColor: 'transparent' },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#111',
  },
  statusText: { color: '#aaa', fontSize: 12, flex: 1 },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  statusButtonText: { color: '#fff', fontSize: 12 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentedButton: { paddingHorizontal: 12, paddingVertical: 4 },
  segmentedButtonActive: { backgroundColor: '#0a84ff' },
  segmentedText: { color: '#888', fontSize: 12 },
  segmentedTextActive: { color: '#fff' },
});
