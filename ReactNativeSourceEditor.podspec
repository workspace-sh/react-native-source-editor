require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeSourceEditor"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => '16.0', :osx => '14.0' }
  s.source       = { :git => "https://github.com/workspace-sh/react-native-source-editor.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  # SourceEditor.h pulls in React-Fabric C++ headers through
  # RCTViewComponentView; surfacing it via the framework's umbrella
  # would break Swift's module-map bridging (processed in C, not C++).
  # Mark it private so it doesn't reach the umbrella; the .mm imports
  # it via quote include and stays in Obj-C++ land. ReactNativeSource
  # Editor.h (a deliberately-empty umbrella anchor) stays public.
  s.private_header_files = ["ios/SourceEditor.h"]

  s.swift_version = '5.9'
  # Build as a static framework so the Swift module map lands in
  # Build/Products where consumers expect it, AND set header_dir so
  # the umbrella's import paths resolve via the framework name.
  # Mirrors expo-modules-core's working setup (Swift + macOS + RN).
  s.static_framework = true
  s.header_dir = 'ReactNativeSourceEditor'

  # STTextView is SPM-only. Two integration paths, picked by ENV from the
  # consumer Podfile (NOT by `s.respond_to?` — the cocoapods-spm gem
  # monkey-patches Pod::Specification at gem load time whenever it's
  # installed, so `respond_to?` can't tell us whether it's actually wired
  # into this Podfile):
  #
  # 1. iOS via Expo CNG (default) — `app.plugin.js` injects the
  #    `cocoapods-spm` plugin into the iOS Podfile, which registers
  #    STTextView via `spm_pkg`. The library calls the plugin's
  #    `s.spm_dependency` to bind the package to this pod.
  #
  # 2. Bare RN (react-native-macos) — consumer Podfile sets
  #    `ENV['RNSE_USE_RN_SPM'] = '1'` and uses RN's first-party
  #    `spm_dependency` top-level helper from react_native_pods.rb. This
  #    bypasses cocoapods-spm entirely (it has an unfixed Xcode 26
  #    regression — issue #172). Consumers must also set
  #    `use_frameworks! :linkage => :dynamic` so the SwiftPackage product
  #    links cleanly into the Pods project.
  if ENV['RNSE_USE_RN_SPM'] == '1'
    spm_dependency s,
      url: 'https://github.com/krzyzanowskim/STTextView',
      requirement: { kind: 'upToNextMajorVersion', minimumVersion: '2.3.10' },
      products: ['STTextView']
  else
    s.spm_dependency 'STTextView/STTextView'
  end

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
  }

  install_modules_dependencies(s)
end
