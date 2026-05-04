import { useRef, useState } from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import SourceEditor, {
  type SourceEditorRef,
} from '@workspace-sh/react-native-source-editor';

const INITIAL_MARKDOWN = `# SourceEditor demo

Edit me. The pane on the right is plaintext.

- [x] iOS wrapper (#3)
- [x] macOS wrapper (#4)
- [x] JS API (#5)
- [x] Font + theme (#6)
- [ ] CI (#8)
`;

const INITIAL_PLAINTEXT = `Plain old text on this side.
Try focussing each pane with the buttons below.
Selection events log to the console.`;

export default function App() {
  const [editable, setEditable] = useState(true);
  const leftRef = useRef<SourceEditorRef>(null);
  const rightRef = useRef<SourceEditorRef>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SourceEditor</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Editable</Text>
          <Switch value={editable} onValueChange={setEditable} />
        </View>
      </View>

      <View style={styles.splitPane}>
        <Pane label="markdown.md">
          <SourceEditor
            ref={leftRef}
            defaultValue={INITIAL_MARKDOWN}
            editable={editable}
            theme="auto"
            font={{ size: 13 }}
            onChangeText={(text) => console.log('[left]', text.length, 'chars')}
            onSelectionChange={(sel) => console.log('[left selection]', sel)}
            style={styles.editor}
          />
        </Pane>
        <View style={styles.divider} />
        <Pane label="notes.txt">
          <SourceEditor
            ref={rightRef}
            defaultValue={INITIAL_PLAINTEXT}
            editable={editable}
            theme="auto"
            font={{ size: 13 }}
            onChangeText={(text) => console.log('[right]', text.length, 'chars')}
            onSelectionChange={(sel) => console.log('[right selection]', sel)}
            style={styles.editor}
          />
        </Pane>
      </View>

      <View style={styles.footer}>
        <Button title="Focus left" onPress={() => leftRef.current?.focus()} />
        <Button title="Focus right" onPress={() => rightRef.current?.focus()} />
        <Button
          title="Log selections"
          onPress={() => {
            console.log('left:', leftRef.current?.getSelection());
            console.log('right:', rightRef.current?.getSelection());
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function Pane({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.pane}>
      <Text style={styles.paneLabel}>{label}</Text>
      <View style={styles.editorWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#999',
  },
  title: { fontSize: 18, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 14 },
  splitPane: { flex: 1, flexDirection: 'row' },
  pane: { flex: 1 },
  paneLabel: {
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 6,
    opacity: 0.6,
  },
  editorWrap: { flex: 1 },
  editor: { flex: 1 },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: '#999' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#999',
  },
});
