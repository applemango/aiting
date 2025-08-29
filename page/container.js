//@ts-check
import { Box, Icon, Style, Text } from "../components/box.js";
import { useLocalStorageState } from "../hook/useLocalStorageState.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { component, h, page } from "../src/dom/virtualdom.js";
import { AitingApp } from "../editor/aiting.js";

export const AppContainer = component(() => {
  const [active, setActive] = useLocalStorageState("aitingApp", false);
  return Box(
    {
      style: s({
        display: "flex",
        justifyContent: "center",
        paddingTop: "32px",
      }),
    },
    Style({ file: "/page/container.css" }),
    Box(
      {
        style: s({
          width: "80%",
          maxWidth: "800px",
        }),
      },
      AitingApp({ init: (api) => {} }),
      Text("back", {
        style: s({
          fontSize: "14px",
          color: "#888",
          marginLeft: "4px",
          cursor: "pointer",
        }),
        onClick: () => setActive(false),
      }),
    ),
  );
});
