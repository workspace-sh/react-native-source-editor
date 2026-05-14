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
  Toggle,
} from '@expo/ui/swift-ui';
import {
  controlSize,
  glassEffect,
  labelsHidden,
  pickerStyle,
  tag,
  toggleStyle,
} from '@expo/ui/swift-ui/modifiers';
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
  const [lineNumbers, setLineNumbers] = useState(false);
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
          lineNumbers={lineNumbers}
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

              {!showPreview && (
                <Toggle
                  modifiers={[
                    toggleStyle('button'),
                    controlSize('large'),
                    labelsHidden(),
                    glassEffect({
                      shape: 'capsule',
                      glass: { variant: 'regular', interactive: true },
                    }),
                  ]}
                  isOn={lineNumbers}
                  systemImage="number"
                  onIsOnChange={setLineNumbers}
                />
              )}

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
