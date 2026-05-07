#import "SourceEditor.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/RNSourceEditorSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNSourceEditorSpec/EventEmitters.h>
#import <react/renderer/components/RNSourceEditorSpec/Props.h>
#import <react/renderer/components/RNSourceEditorSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

#import <ReactNativeSourceEditor/ReactNativeSourceEditor-Swift.h>

using namespace facebook::react;

@interface SourceEditor () <RCTSourceEditorViewProtocol>
@end

@implementation SourceEditor {
  RNSESourceEditorImpl *_impl;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<SourceEditorComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const SourceEditorProps>();
    _props = defaultProps;

    _impl = [[RNSESourceEditorImpl alloc] initWithFrame:frame];

    __weak __typeof(self) weakSelf = self;
    _impl.onChange = ^(NSString *text) {
      __typeof(weakSelf) strongSelf = weakSelf;
      if (!strongSelf || !strongSelf->_eventEmitter) return;
      auto emitter = std::static_pointer_cast<const SourceEditorEventEmitter>(
        strongSelf->_eventEmitter);
      emitter->onChangeText({.text = std::string([text UTF8String] ?: "")});
    };
    _impl.onSelection = ^(NSInteger start, NSInteger end) {
      __typeof(weakSelf) strongSelf = weakSelf;
      if (!strongSelf || !strongSelf->_eventEmitter) return;
      auto emitter = std::static_pointer_cast<const SourceEditorEventEmitter>(
        strongSelf->_eventEmitter);
      emitter->onSelectionChange(
        {.start = static_cast<double>(start), .end = static_cast<double>(end)});
    };

    self.contentView = _impl;
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<const SourceEditorProps>(_props);
  const auto &newViewProps = *std::static_pointer_cast<const SourceEditorProps>(props);

  if (oldViewProps.text != newViewProps.text) {
    [_impl setText:RCTNSStringFromString(newViewProps.text)];
  }
  if (oldViewProps.editable != newViewProps.editable) {
    [_impl setEditable:newViewProps.editable];
  }
  if (oldViewProps.theme != newViewProps.theme) {
    [_impl setTheme:RCTNSStringFromString(newViewProps.theme)];
  }
  if (oldViewProps.language != newViewProps.language) {
    [_impl setLanguage:RCTNSStringFromString(newViewProps.language)];
  }
  if (!(oldViewProps.font == newViewProps.font)) {
    NSString *family = newViewProps.font.family.empty()
      ? nil
      : RCTNSStringFromString(newViewProps.font.family);
    [_impl setFontWithFamily:family size:newViewProps.font.size];
  }
  if (!(oldViewProps.contentInsets == newViewProps.contentInsets)) {
    [_impl setContentInsetsWithTop:newViewProps.contentInsets.top
                            bottom:newViewProps.contentInsets.bottom
                              left:newViewProps.contentInsets.left
                             right:newViewProps.contentInsets.right];
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  static const auto defaultProps = std::make_shared<const SourceEditorProps>();
  _props = defaultProps;
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  RCTSourceEditorHandleCommand(self, commandName, args);
}

- (void)focus
{
  [_impl focusEditor];
}

- (void)blur
{
  [_impl blurEditor];
}

@end

Class<RCTComponentViewProtocol> SourceEditorCls(void)
{
  return SourceEditor.class;
}
