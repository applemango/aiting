//@ts-check
import { Box, Icon, Style, Text } from "../components/box.js";
import { useLocalStorageState } from "../hook/useLocalStorageState.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { component, h, page } from "../src/dom/virtualdom.js";
import { AitingApp } from "../editor/aiting.js";

export const SorryPage = component(() => {
  const [active, setActive] = useLocalStorageState("aitingApp", false);
  return Box(
    {
      style: s({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }),
    },
    Box(
      {},
      Text("Sorry...", {
        style: s({
          fontSize: "96px",
          fontWeight: "bold",
          color: "#222",
          marginBottom: "0px",
        }),
      }),
      Text(
        "このサイトは現在お使いのウィンドウサイズ、モバイル端末\n環境には対応しておりません。\nお手数ですがデスクトップ環境でお使いください",
        { style: s({ color: "#222" }) },
      ),
    ),
  );
});
