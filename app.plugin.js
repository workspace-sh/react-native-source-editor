const { withPodfile } = require('@expo/config-plugins');

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

const withSourceEditor = (config) => {
  return withPodfile(config, (config) => {
    let contents = config.modResults.contents;
    contents = injectPluginDeclaration(contents);
    contents = injectSpmPkg(contents);
    config.modResults.contents = contents;
    return config;
  });
};

module.exports = withSourceEditor;
module.exports.default = withSourceEditor;
