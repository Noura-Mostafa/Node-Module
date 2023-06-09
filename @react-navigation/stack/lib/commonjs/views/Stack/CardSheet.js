"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// This component will render a page which overflows the screen
// if the container fills the body by comparing the size
// This lets the document.body handle scrolling of the content
// It's necessary for mobile browsers to be able to hide address bar on scroll
var _default = /*#__PURE__*/React.forwardRef(function CardSheet(_ref, ref) {
  let {
    enabled,
    layout,
    style,
    ...rest
  } = _ref;
  const [fill, setFill] = React.useState(false);
  // To avoid triggering a rerender in Card during animation we had to move
  // the state to CardSheet. The `setPointerEvents` is then hoisted back to the Card.
  const [pointerEvents, setPointerEvents] = React.useState('auto');
  React.useImperativeHandle(ref, () => {
    return {
      setPointerEvents
    };
  });
  React.useEffect(() => {
    if (typeof document === 'undefined' || !document.body) {
      // Only run when DOM is available
      return;
    }
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;
    setFill(width === layout.width && height === layout.height);
  }, [layout.height, layout.width]);
  return /*#__PURE__*/React.createElement(_reactNative.View, _extends({}, rest, {
    pointerEvents: pointerEvents,
    style: [enabled && fill ? styles.page : styles.card, style]
  }));
});
exports.default = _default;
const styles = _reactNative.StyleSheet.create({
  page: {
    minHeight: '100%'
  },
  card: {
    flex: 1,
    overflow: 'hidden'
  }
});
//# sourceMappingURL=CardSheet.js.map