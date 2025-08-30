//@ts-check
import { Box, Icon, Text } from "../components/box.js";
import { component } from "../src/dom/virtualdom.js";

/**
 * @type {typeof component<{onClick: (e: any)=> void}>}
 */
const AitingAppCopyButtonComponent = component;
export const AitingAppCopyButton = AitingAppCopyButtonComponent(
  ({ onClick }) => {
    return Box(
      {
        attr: { class: "copyButton" },
        onClick,
      },
      Icon({ name: "clipboard" }),
    );
  },
);
