/**
 * Android demo. The shared `App.tsx` uses `@expo/ui/swift-ui` for the
 * toolbar (Picker / Toggle / glass effect) which is iOS/macOS-only — on
 * Android we render a minimal RN-core UI instead. The library's MVP
 * Android props (text, editable, onChangeText, onSelectionChange,
 * focus/blur) are exercised here.
 */
import { useRef, useState } from 'react';
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
import SourceEditor, {
  type Language,
  type SourceEditorRef,
} from '@workspace-sh/react-native-source-editor';

const LANGUAGES: Language[] = [
  'plaintext',
  'markdown',
  'json',
  'javascript',
  'typescript',
  'html',
];

// Per-language samples so switching tabs visibly re-highlights — a JS
// blob viewed under the markdown grammar (etc.) tokenises as plain
// paragraph text, which looks like "lost highlighting" but is correct.
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

Inline \`code\` looks like this. Switch tabs to see other grammars.

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
  javascript: `const name = 'SourceEditor';
const features = ['markdown', 'json', 'js', 'ts', 'html'];

console.log('Hello from', name);
console.log('Supported:', features);

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
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const onLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setText(SAMPLES[lang]);
  };

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

      <SourceEditor
        ref={editorRef}
        value={text}
        editable
        language={language}
        onChangeText={setText}
        onSelectionChange={setSelection}
        style={styles.editor}
      />

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {language} · {text.length} chars · sel {selection.start}–{selection.end}
        </Text>
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
});
