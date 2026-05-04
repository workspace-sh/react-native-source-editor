import { useRef, useState } from 'react';
import {
  type ColorSchemeName,
  Pressable,
  StyleSheet,
  Text,
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
import SourceEditor, {
  type SourceEditorRef,
} from '@workspace-sh/react-native-source-editor';

const INITIAL = `# SourceEditor demo

Edit on the left, preview on the right.

- [x] iOS wrapper (#3)
- [x] macOS wrapper (#4)
- [x] JS API (#5)
- [x] Font + theme (#6)
- [x] iOS example (#7)
- [ ] CI (#8)
`;

type Mode = 'source' | 'preview';

export default function App() {
  return (
    <SafeAreaProvider>
      <Demo />
    </SafeAreaProvider>
  );
}

function Demo() {
  const [mode, setMode] = useState<Mode>('source');
  const [content, setContent] = useState(INITIAL);
  const editorRef = useRef<SourceEditorRef>(null);
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const glassAvailable = isLiquidGlassAvailable();

  const isPreview = mode === 'preview';

  return (
    <View style={styles.container}>
      <SourceEditor
        ref={editorRef}
        value={content}
        editable={!isPreview}
        font={{ size: isPreview ? 16 : 13 }}
        theme={isPreview ? 'light' : 'auto'}
        onChangeText={setContent}
        style={styles.editor}
      />

      <FloatingBar position="top" inset={insets.top} glassAvailable={glassAvailable} scheme={scheme}>
        <View style={styles.segmented}>
          <SegTab label="Source" active={!isPreview} onPress={() => setMode('source')} />
          <SegTab label="Preview" active={isPreview} onPress={() => setMode('preview')} />
        </View>
      </FloatingBar>

      <FloatingBar position="bottom" inset={insets.bottom} glassAvailable={glassAvailable} scheme={scheme}>
        <View style={styles.footerRow}>
          <Text style={styles.meta}>{content.length} chars · {mode}</Text>
          <Pressable onPress={() => editorRef.current?.focus()} hitSlop={8}>
            <Text style={styles.action}>Focus</Text>
          </Pressable>
        </View>
      </FloatingBar>
    </View>
  );
}

function FloatingBar({
  position,
  inset,
  glassAvailable,
  scheme,
  children,
}: {
  position: 'top' | 'bottom';
  inset: number;
  glassAvailable: boolean;
  scheme: ColorSchemeName;
  children: React.ReactNode;
}) {
  const padding = {
    paddingTop: position === 'top' ? inset + 8 : 12,
    paddingBottom: position === 'bottom' ? inset + 8 : 12,
  };
  const positional = position === 'top'
    ? { top: 0, left: 0, right: 0 }
    : { bottom: 0, left: 0, right: 0 };

  if (glassAvailable) {
    return (
      <GlassView style={[styles.bar, positional, padding]} glassEffectStyle="regular">
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
        styles.barFallback,
        scheme === 'dark' ? styles.barFallbackDark : styles.barFallbackLight,
      ]}
    >
      {children}
    </View>
  );
}

function SegTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  editor: { flex: 1 },
  bar: {
    position: 'absolute',
    paddingHorizontal: 16,
  },
  barFallback: {
    borderColor: 'rgba(127,127,127,0.25)',
  },
  barFallbackLight: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barFallbackDark: {
    backgroundColor: 'rgba(20,20,20,0.85)',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  segmented: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(127,127,127,0.18)',
    borderRadius: 999,
    padding: 3,
    gap: 2,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(127,127,127,1)',
  },
  tabTextActive: {
    color: '#000',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
  },
});
