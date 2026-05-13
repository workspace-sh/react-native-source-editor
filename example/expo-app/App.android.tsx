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

const SAMPLE = `// SourceEditor — Android MVP
//
// MVP wires text, editable, onChangeText, onSelectionChange,
// focus/blur. font / theme / language highlighting / lineNumbers /
// contentInsets land in follow-up PRs (tracked in #32).

function greet(name) {
  return \`hello, \${name}\`;
}
`;

function Demo() {
  const insets = useSafeAreaInsets();
  const editorRef = useRef<SourceEditorRef>(null);
  const [text, setText] = useState(SAMPLE);
  const [language, setLanguage] = useState<Language>('javascript');
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.toolbar}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            onPress={() => setLanguage(lang)}
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
