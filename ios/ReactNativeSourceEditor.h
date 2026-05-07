// Public umbrella header for the ReactNativeSourceEditor framework.
//
// CocoaPods generates a module map from the public headers; with our
// other headers (SourceEditor.h, Highlighter etc.) marked private to
// keep React-Fabric C++ headers out of the umbrella, we need at least
// one minimal public header to anchor the framework module — without
// it, Swift sources in the pod can't compile (no module to build into)
// and the consumer hits "module map file not found" errors at link.
//
// This header is intentionally empty: nothing public is exposed via
// the framework's module interface. .mm files import other library
// headers directly with quote includes; Swift never imports our
// C++-tainted headers at all.

#import <Foundation/Foundation.h>

FOUNDATION_EXPORT double ReactNativeSourceEditorVersionNumber;
FOUNDATION_EXPORT const unsigned char ReactNativeSourceEditorVersionString[];
