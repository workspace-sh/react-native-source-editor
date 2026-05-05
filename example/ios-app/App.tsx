import { useMemo, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  GlassView,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Button, Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
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
  javascript: `import SourceEditor from '@workspace-sh/react-native-source-editor';

// Render the editor in a controlled component.
function Editor({ initial }) {
  const [text, setText] = useState(initial);

  return (
    <SourceEditor
      value={text}
      editable
      language="markdown"
      onChangeText={setText}
    />
  );
}

const VERSION = 1.0;
`,
  typescript: `import SourceEditor, {
  type SourceEditorProps,
  type SourceEditorRef,
  type Language,
} from '@workspace-sh/react-native-source-editor';

interface EditorProps extends SourceEditorProps {
  initial: string;
}

const VERSION: number = 1.0;
const ENABLED: boolean = true;
const LANGUAGES: Language[] = ['markdown', 'json', 'javascript'];
`,
};

const LANGUAGE_LABEL: Record<DemoLanguage, string> = {
  markdown: 'MD',
  json: 'JSON',
  javascript: 'JS',
  typescript: 'TS',
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
  const editorRef = useRef<SourceEditorRef>(null);
  const insets = useSafeAreaInsets();
  const glassAvailable = isLiquidGlassAvailable();

  const isMarkdown = language === 'markdown';
  const showPreview = isMarkdown && viewMode === 'preview';

  const html = useMemo(() => {
    if (!showPreview) return '';
    const body = marked.parse(content, { async: false }) as string;
    return wrapMarkdownHTML(body, insets.top, bottomBarHeight);
  }, [showPreview, content, insets.top, bottomBarHeight]);

  const onLanguageChange = (lang: DemoLanguage) => {
    setLanguage(lang);
    setContent(SAMPLES[lang]);
    if (lang !== 'markdown') {
      setViewMode('source');
    }
  };

  const onBottomLayout = (e: LayoutChangeEvent) => {
    setBottomBarHeight(e.nativeEvent.layout.height);
  };

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
            bottom: bottomBarHeight + 16,
            left: Math.max(8, insets.left),
            right: Math.max(8, insets.right),
          }}
          onChangeText={setContent}
          style={styles.editor}
        />
      )}

      <View
        style={[
          styles.bottomRow,
          {
            paddingBottom: insets.bottom + 8,
            paddingLeft: Math.max(16, insets.left),
            paddingRight: Math.max(16, insets.right),
          },
        ]}
        onLayout={onBottomLayout}
        pointerEvents="box-none"
      >
        <Pill glassAvailable={glassAvailable}>
          <Host matchContents>
            <Picker
              modifiers={[pickerStyle('menu')]}
              label={LANGUAGE_LABEL[language]}
              systemImage="chevron.up.chevron.down"
              selection={language}
              onSelectionChange={(value) => onLanguageChange(value as DemoLanguage)}
            >
              <Text modifiers={[tag('markdown')]}>Markdown</Text>
              <Text modifiers={[tag('json')]}>JSON</Text>
              <Text modifiers={[tag('javascript')]}>JavaScript</Text>
              <Text modifiers={[tag('typescript')]}>TypeScript</Text>
            </Picker>
          </Host>
        </Pill>

        {isMarkdown && (
          <Pill glassAvailable={glassAvailable} stretch>
            <Host matchContents={{ vertical: true }} style={styles.fillWidth}>
              <Picker
                modifiers={[pickerStyle('segmented')]}
                selection={viewMode}
                onSelectionChange={(value) => setViewMode(value as ViewMode)}
              >
                <Text modifiers={[tag('source')]}>Source</Text>
                <Text modifiers={[tag('preview')]}>Preview</Text>
              </Picker>
            </Host>
          </Pill>
        )}

        {!showPreview && (
          <Pill glassAvailable={glassAvailable}>
            <Host matchContents>
              <Button
                label="Focus"
                systemImage="cursorarrow"
                onPress={() => editorRef.current?.focus()}
              />
            </Host>
          </Pill>
        )}
      </View>
    </View>
  );
}

function Pill({
  glassAvailable,
  stretch = false,
  children,
}: {
  glassAvailable: boolean;
  stretch?: boolean;
  children: React.ReactNode;
}) {
  const sizing = stretch ? styles.pillStretch : styles.pillIntrinsic;

  if (glassAvailable) {
    return (
      <GlassView style={[styles.pill, sizing]} glassEffectStyle="regular">
        {children}
      </GlassView>
    );
  }
  return <View style={[styles.pill, sizing, styles.pillFallback]}>{children}</View>;
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

const PILL_HEIGHT = 44;

const styles = StyleSheet.create({
  container: { flex: 1 },
  editor: { flex: 1 },
  preview: { flex: 1, backgroundColor: 'transparent' },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  pill: {
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'hidden',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  pillIntrinsic: {
    minWidth: PILL_HEIGHT,
  },
  pillStretch: {
    flex: 1,
    paddingHorizontal: 6,
  },
  pillFallback: {
    backgroundColor: 'rgba(127,127,127,0.18)',
  },
  fillWidth: {
    width: '100%',
  },
});
