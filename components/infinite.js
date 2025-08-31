//@ts-check

import { useEffect } from "../hook/useEffect.js";
import { useState } from "../hook/useState.js";
import { component, h } from "../src/dom/virtualdom.js";
import { Box } from "./box.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * intervalはms
 * 子要素の下が見えてるときにloadイベントが発火する
 *
 * @type {typeof component<{
 *  load: (i: number)=> Promise<any>,
 *  children: import("../src/dom/virtualdom").VNode,
 *  interval?: number,
 *  padding?: number,
 *  loadMore?: ()=> boolean
 * }>}
 */
const InfiniteScrollComponent = component;
export const Infinite = InfiniteScrollComponent(
  ({
    children,
    load,
    interval = 1000,
    padding = window.innerHeight / 2,
    loadMore,
  }) => {
    const [lastLoad, setLastLoad] = useState(
      "InifiniteScrollComponent",
      Date.now(),
    );
    const [nowLoading, setNowLoading] = useState(
      "InfiniteScrollComponentNowLoading",
      false,
    );

    useEffect(
      "InfiniteScrollComponentEffect",
      function InfiniteScrollComponentEffect() {
        const container = document.querySelector(".infiniteScrollContainer");
        if (!container)
          return wait(100).then(() => InfiniteScrollComponentEffect());
        const check = async () => {
          if ((loadMore && loadMore() === false) || nowLoading()) return;
          const rect = container.getBoundingClientRect();

          if (rect.bottom < window.innerHeight + padding) {
            if (Date.now() - lastLoad() < interval) return;
            setNowLoading(true);
            const _ = await load(container.children.length);
            setNowLoading(false);
            setLastLoad(Date.now());
          }
        };
        window.addEventListener("scroll", check);
        // スクロールイベントが発火する前 ( 最初とかそもそもスクロールするほどの量がないときとか用  )
        setInterval(check, interval);
      },
      [],
    );

    // Refの代わりにClassを使ってるので一つのページに複数個のInfiniteScrollComponentがあったらバグる
    // どうせuseStateとEffectも同一idだったらバグるけど
    return Box({ attr: { class: "infiniteScrollContainer" } }, children);
  },
);
