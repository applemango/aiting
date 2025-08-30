//@ts-check
import { Box, Icon, Text } from "../components/box.js";
import { Infinite } from "../components/infinite.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { component, h } from "../src/dom/virtualdom.js";
import { loadInfiniteGenerateItems } from "./aitingAppLLM.js";

/**
 * @type {typeof component<{}>}
 */
const AitingAppInfiniteGenerateActivateButtonComponent = component;
export const AitingAppInfiniteGenerateActivateButton =
  AitingAppInfiniteGenerateActivateButtonComponent(() => {
    const [infiniteMode, setInfiniteMode] = useState("infiniteMode", false);
    return Box(
      {
        style: s(
          infiniteMode()
            ? {
                transform: "translateY(60px)",
              }
            : {
                transform: "translateY(0px)",
              },
        ),
        class: "cometContainer",
      },
      Box(
        {
          style: s({
            width: "100%",
            position: "relative",
            height: "1px",
            background: "#222",
            display: "flex",
            alignItems: "center",
            justifyContent: "right",
            paddingRight: "16px",
          }),
        },
        h(
          "p",
          {
            style: s({
              fontSize: "9px",
              background: "#fff",
              color: "#222",
            }),
          },
          "複数のアイデアを列挙するのを手伝います!",
        ),
      ),
      Icon({
        name: "comet",
        style: s(
          infiniteMode()
            ? {
                opacity: 1,
                animation: "shaking 0.2s infinite ease",
                filter: "contrast(1)",
              }
            : {
                opacity: 1,
              },
        ),
        attr: {
          class: "comet",
        },
        onClick: () => setInfiniteMode(!infiniteMode()),
      }),
    );
  });

/**
 * @type {typeof component<VNodeChildren>}
 */
const AitingAppInfiniteGenerateWrapperComponent = component;
export const AitingAppInfiniteGenerateWrapper =
  AitingAppInfiniteGenerateWrapperComponent(({ api, children }) => {
    const [infiniteMode, setInfiniteMode] = useState("infiniteMode", false);
    return Infinite({
      load: async () => {
        for (const item of await loadInfiniteGenerateItems(
          api.editor.getTitle(),
          api.editor
            .state()
            .slice(1)
            .map((l) => l.text),
        )) {
          api.editor.createLine({
            text: item,
            meta: {
              aigenerated: true,
            },
          });
        }
      },
      loadMore: infiniteMode,
      interval: 1000,
      children: children,
    });
  });
