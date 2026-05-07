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
  # ReactNativeSourceEditor.h is a deliberately-empty umbrella header
  # that anchors the framework module (required because we ship Swift
  # sources). Every other header pulls in React-Fabric C++ via
  # RCTViewComponentView, which can't appear in the umbrella — Swift's
  # module-map step processes it in C, not C++ context, and breaks
  # at <atomic>. Marking those headers private keeps them out of the
  # umbrella; .mm files import them via quote includes and stay in
  # Obj-C++ land.
  s.public_header_files = "ios/ReactNativeSourceEditor.h"
  s.private_header_files = ["ios/SourceEditor.h"]

  s.swift_version = '5.9'
  # Build as a static framework (not bare static library) so the
  # framework's module map ends up in Build/Products where Xcode
  # expects it. Required because our pod ships Swift sources, and Swift
  # compiles into a module that consumers must import. Pure Obj-C++
  # pods (e.g. react-native-enriched-markdown) get away with the
  # default static-library + private-headers setup; we don't.
  s.static_framework = true

  s.spm_dependency 'STTextView/STTextView'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
  }

  install_modules_dependencies(s)
end
