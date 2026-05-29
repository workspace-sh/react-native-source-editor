const { withPodfile, withAppBuildGradle } = require('@expo/config-plugins');

const STTEXTVIEW_URL = 'https://github.com/krzyzanowskim/STTextView.git';
const STTEXTVIEW_VERSION = '2.3.10';
const STTEXTVIEW_PRODUCT = 'STTextView';

const PLUGIN_DECLARATION = `plugin 'cocoapods-spm'`;
const SPM_PKG_MARKER = `spm_pkg '${STTEXTVIEW_PRODUCT}'`;

const SPM_PKG_BLOCK = [
  `  spm_pkg '${STTEXTVIEW_PRODUCT}',`,
  `    :url => '${STTEXTVIEW_URL}',`,
  `    :version => '${STTEXTVIEW_VERSION}',`,
  `    :products => ['${STTEXTVIEW_PRODUCT}']`,
].join('\n');

function injectPluginDeclaration(contents) {
  if (contents.includes(PLUGIN_DECLARATION)) return contents;

  // Insert after the trailing `require File.join(...)` lines at the top of
  // the Expo-generated Podfile. If those aren't present (custom Podfile),
  // fall back to the very first line.
  const requireBlock = contents.match(/^(require File\.join.*\n)+/m);
  if (requireBlock) {
    const insertAt = requireBlock.index + requireBlock[0].length;
    return (
      contents.slice(0, insertAt) +
      `\n${PLUGIN_DECLARATION}\n` +
      contents.slice(insertAt)
    );
  }
  return `${PLUGIN_DECLARATION}\n\n${contents}`;
}

function injectSpmPkg(contents) {
  if (contents.includes(SPM_PKG_MARKER)) return contents;

  // Drop the spm_pkg block right after `use_expo_modules!` inside the main
  // target. This matches the cocoapods-spm convention (per-target).
  const anchor = /(\n\s*use_expo_modules!\s*\n)/;
  if (!anchor.test(contents)) {
    throw new Error(
      "[react-native-source-editor] Could not find `use_expo_modules!` in the Podfile to anchor the spm_pkg block. Custom Podfile? Add `spm_pkg 'STTextView', :url => '" +
        STTEXTVIEW_URL +
        "', :version => '" +
        STTEXTVIEW_VERSION +
        "', :products => ['" +
        STTEXTVIEW_PRODUCT +
        "']` inside your app target manually."
    );
  }
  return contents.replace(anchor, (match) => `${match}\n${SPM_PKG_BLOCK}\n`);
}

// Sora-Editor's `language-textmate` AAR declares it requires core library
// desugaring (it pulls in joni, which uses java.time on minSdk < 26).
// The consuming app must enable it; we inject the Gradle setting + dep
// here so consumers don't have to hand-edit android/app/build.gradle.
const DESUGAR_DEP =
  "coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.1.5'";
const DESUGAR_MARKER = 'desugar_jdk_libs';

function injectCoreLibraryDesugaring(contents) {
  if (contents.includes(DESUGAR_MARKER)) return contents;

  // Add `coreLibraryDesugaringEnabled true` to the existing
  // `compileOptions { ... }` block, or create the block if absent.
  const compileOptionsMatch = contents.match(
    /compileOptions\s*\{([\s\S]*?)\n\s*\}/
  );
  if (compileOptionsMatch) {
    const inner = compileOptionsMatch[1];
    if (!inner.includes('coreLibraryDesugaringEnabled')) {
      contents = contents.replace(
        compileOptionsMatch[0],
        compileOptionsMatch[0].replace(
          inner,
          `${inner}\n        coreLibraryDesugaringEnabled true`
        )
      );
    }
  } else {
    // No compileOptions block — drop one in just after the `android {` line.
    contents = contents.replace(
      /android\s*\{/,
      `android {\n    compileOptions {\n        coreLibraryDesugaringEnabled true\n    }`
    );
  }

  // Append the desugar_jdk_libs dep to the existing top-level
  // `dependencies { ... }` block.
  const depsMatch = contents.match(/\ndependencies\s*\{([\s\S]*?)\n\}/);
  if (!depsMatch) {
    throw new Error(
      "[react-native-source-editor] Could not find `dependencies { ... }` in app/build.gradle to anchor the desugar_jdk_libs dep."
    );
  }
  return contents.replace(
    depsMatch[0],
    depsMatch[0].replace(/\n\}$/, `\n    ${DESUGAR_DEP}\n}`)
  );
}

const withSourceEditor = (config) => {
  config = withPodfile(config, (config) => {
    let contents = config.modResults.contents;
    contents = injectPluginDeclaration(contents);
    contents = injectSpmPkg(contents);
    config.modResults.contents = contents;
    return config;
  });
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') return config;
    config.modResults.contents = injectCoreLibraryDesugaring(
      config.modResults.contents
    );
    return config;
  });
  return config;
};

module.exports = withSourceEditor;
module.exports.default = withSourceEditor;
