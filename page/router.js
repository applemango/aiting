//@ts-check
import { AitingApp } from "../editor/aiting.js";
import { page } from "../src/dom/virtualdom.js";
import { Introduction } from "./introduction.js";
import { useState } from "../hook/useState.js";
import { useEffect } from "../hook/useEffect.js";
import { useLocalStorageState } from "../hook/useLocalStorageState.js";
import { AppContainer } from "./container.js";
import { SorryPage } from "./sorry.js";

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState("useWindowSizeState", [
    window.innerWidth,
    window.innerHeight,
  ]);
  useEffect(
    "useWindowSizeEffect",
    function useWindowSizeEffect() {
      window.addEventListener("resize", () => {
        setWindowSize([window.innerWidth, window.innerHeight]);
      });
    },
    [],
  );
  return windowSize();
};

export const App = page(() => {
  const [active, setActive] = useLocalStorageState("aitingApp", false);

  const [windowWidth, windowHeight] = useWindowSize();

  // ページ間移動時にいらない状態を消す
  useEffect(
    "removeAllState",
    () => {
      console.log("remove");
      const metas = Array.from(document.querySelectorAll("meta[state_id]"));
      for (const meta of metas) {
        if (
          !["aitingApp", "removeAllState"].includes(
            meta.attributes.state_id.value,
          )
        ) {
          meta.remove();
        }
      }
      console.log(Array.from(document.querySelectorAll("meta[state_id]")));
    },
    [active()],
  );

  if (windowWidth < 800) return SorryPage({});

  if (!active()) return Introduction({});
  return AppContainer({});
});
