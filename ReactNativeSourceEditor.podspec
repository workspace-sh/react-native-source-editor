require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeSourceEditor"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => '16.0' }
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

  s.spm_dependency 'STTextView/STTextView'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
  }

  install_modules_dependencies(s)
end
