import { useRef, useState } from 'react';
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
import SourceEditor, {
  type SourceEditorRef,
} from '@workspace-sh/react-native-source-editor';

const INITIAL = `# SourceEditor demo

Edit on Source, switch to Preview to see read-only mode + larger font + light theme.

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
  const [topBarHeight, setTopBarHeight] = useState(0);
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
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
        contentInsets={{ top: topBarHeight + 8, bottom: bottomBarHeight + 8 }}
        onChangeText={setContent}
        style={styles.editor}
      />

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
              selection={mode}
              onSelectionChange={(value) => setMode(value as Mode)}
            >
              <Text modifiers={[tag('source')]}>Source</Text>
              <Text modifiers={[tag('preview')]}>Preview</Text>
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
            <Text>{`${content.length} chars · ${mode}`}</Text>
            <Spacer />
            <Button
              label="Focus"
              systemImage="cursorarrow"
              onPress={() => editorRef.current?.focus()}
            />
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
  // Honour all four safe-area edges so landscape (notch on side) and
  // portrait (notch on top) both keep content clear of the cutout.
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  editor: { flex: 1 },
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
