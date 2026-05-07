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
  # Keep our headers out of the framework's umbrella. They pull in
  # React-Fabric C++ headers (e.g. <atomic> via EventBeat.h); Swift
  # tries to bridge them and fails because module map context is C, not
  # C++. Private headers = umbrella stays Swift-only, .mm sees them
  # directly through quote includes.
  s.private_header_files = "ios/**/*.h"

  s.swift_version = '5.9'
  s.spm_dependency 'STTextView/STTextView'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
  }

  install_modules_dependencies(s)
end
