import { findNodeHandle } from "react-native";

export function scrollInputIntoView(scrollRef: any, node: any, additionalOffset = 180) {
  if (!scrollRef?.current || !node) {
    return;
  }

  requestAnimationFrame(() => {
    setTimeout(() => {
      const responder =
        scrollRef.current?.getScrollResponder?.() ?? scrollRef.current;
      const handle = typeof node === "number" ? node : findNodeHandle(node);

      if (!handle || !responder?.scrollResponderScrollNativeHandleToKeyboard) {
        scrollRef.current?.scrollToEnd?.({ animated: true });
        return;
      }

      responder.scrollResponderScrollNativeHandleToKeyboard(handle, additionalOffset, true);
    }, 80);
  });
}
