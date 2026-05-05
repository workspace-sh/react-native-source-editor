import { useMemo, useRef, useState } from 'react';
import {
  type ColorSchemeName,
  type LayoutChangeEvent,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  GlassView,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import {
  Button,
  HStack,
  Host,
  Picker,
  Spacer,
  Text,
} from '@expo/ui/swift-ui';
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
  const [topBarHeight, setTopBarHeight] = useState(0);
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const editorRef = useRef<SourceEditorRef>(null);
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const glassAvailable = isLiquidGlassAvailable();

  const isMarkdown = language === 'markdown';
  const showPreview = isMarkdown && viewMode === 'preview';

  const html = useMemo(() => {
    if (!showPreview) return '';
    const body = marked.parse(content, { async: false }) as string;
    return wrapMarkdownHTML(body, scheme === 'dark', topBarHeight, bottomBarHeight);
  }, [showPreview, content, scheme, topBarHeight, bottomBarHeight]);

  const onLanguageChange = (lang: DemoLanguage) => {
    setLanguage(lang);
    setContent(SAMPLES[lang]);
    if (lang !== 'markdown') {
      setViewMode('source');
    }
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
          contentInsets={{ top: topBarHeight + 8, bottom: bottomBarHeight + 8 }}
          onChangeText={setContent}
          style={styles.editor}
        />
      )}

      <FloatingBar
        position="top"
        insets={insets}
        glassAvailable={glassAvailable}
        scheme={scheme}
        onLayout={(e) => setTopBarHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.toggleRow}>
          <Host matchContents>
            <Picker
              modifiers={[pickerStyle('segmented')]}
              selection={language}
              onSelectionChange={(value) => onLanguageChange(value as DemoLanguage)}
            >
              <Text modifiers={[tag('markdown')]}>MD</Text>
              <Text modifiers={[tag('json')]}>JSON</Text>
              <Text modifiers={[tag('javascript')]}>JS</Text>
              <Text modifiers={[tag('typescript')]}>TS</Text>
            </Picker>
          </Host>
        </View>
      </FloatingBar>

      <FloatingBar
        position="bottom"
        insets={insets}
        glassAvailable={glassAvailable}
        scheme={scheme}
        onLayout={(e) => setBottomBarHeight(e.nativeEvent.layout.height)}
      >
        <Host matchContents={{ vertical: true }} style={styles.fillWidth}>
          <HStack spacing={12}>
            {isMarkdown ? (
              <Button
                label={viewMode === 'source' ? 'Preview' : 'Source'}
                systemImage={viewMode === 'source' ? 'eye' : 'pencil'}
                onPress={() =>
                  setViewMode(viewMode === 'source' ? 'preview' : 'source')
                }
              />
            ) : (
              <Text>{`${content.length} chars · ${language}`}</Text>
            )}
            <Spacer />
            {!showPreview && (
              <Button
                label="Focus"
                systemImage="cursorarrow"
                onPress={() => editorRef.current?.focus()}
              />
            )}
          </HStack>
        </Host>
      </FloatingBar>
    </View>
  );
}

type Insets = { top: number; bottom: number; left: number; right: number };

function FloatingBar({
  position,
  insets,
  glassAvailable,
  scheme,
  onLayout,
  children,
}: {
  position: 'top' | 'bottom';
  insets: Insets;
  glassAvailable: boolean;
  scheme: ColorSchemeName;
  onLayout?: (event: LayoutChangeEvent) => void;
  children: React.ReactNode;
}) {
  const padding = {
    paddingTop: position === 'top' ? insets.top + 8 : 12,
    paddingBottom: position === 'bottom' ? insets.bottom + 8 : 12,
    paddingLeft: Math.max(16, insets.left),
    paddingRight: Math.max(16, insets.right),
  };
  const positional =
    position === 'top'
      ? { top: 0, left: 0, right: 0 }
      : { bottom: 0, left: 0, right: 0 };

  if (glassAvailable) {
    return (
      <GlassView
        style={[styles.bar, positional, padding]}
        glassEffectStyle="regular"
        onLayout={onLayout}
      >
        {children}
      </GlassView>
    );
  }
  return (
    <View
      style={[
        styles.bar,
        positional,
        padding,
        scheme === 'dark' ? styles.barFallbackDark : styles.barFallbackLight,
      ]}
      onLayout={onLayout}
    >
      {children}
    </View>
  );
}

function wrapMarkdownHTML(
  body: string,
  isDark: boolean,
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
    font: -apple-system-body;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
    line-height: 1.55;
    padding: ${topInset + 16}px 20px ${bottomInset + 16}px;
    background: ${isDark ? '#000' : '#fff'};
    color: ${isDark ? '#fff' : '#000'};
    -webkit-text-size-adjust: 100%;
  }
  h1, h2, h3, h4 { color: ${isDark ? '#0a84ff' : '#007aff'}; margin-top: 1.4em; }
  h1 { font-size: 1.7em; }
  h2 { font-size: 1.35em; }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: ${isDark ? '#1c1c1e' : '#f0f0f3'};
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: ${isDark ? '#1c1c1e' : '#f5f5f7'};
    padding: 14px;
    border-radius: 8px;
    overflow-x: auto;
  }
  pre code { background: transparent; padding: 0; }
  a { color: ${isDark ? '#0a84ff' : '#007aff'}; text-decoration: none; }
  ul, ol { padding-left: 1.4em; }
  blockquote {
    border-left: 3px solid ${isDark ? '#3a3a3c' : '#d1d1d6'};
    padding-left: 12px;
    margin-left: 0;
    color: ${isDark ? '#a1a1a6' : '#6e6e73'};
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
  bar: {
    position: 'absolute',
  },
  barFallbackLight: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  barFallbackDark: {
    backgroundColor: 'rgba(20,20,20,0.85)',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fillWidth: {
    width: '100%',
  },
});
