//@ts-check
import { Box, Icon, IfBox, Text } from "../components/box.js";
import { useEffect } from "../hook/useEffect.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { component, h } from "../src/dom/virtualdom.js";
import {
  AitingAppLineGrammarSuggestions,
  handleHoverEvent,
  useLineState,
} from "./aitingAppLineGrammarCheck.js";

import { AitingAppLineSixdot } from "./aitingAppLineSixdotMenu.js";
import {
  mergeFixedText,
  parseFixSuggestions,
  updateFixSuggestions,
} from "./aitingAppLineUtils.js";
import { getFixSuggestions, getRewritedText } from "./aitingAppLLM.js";

/**
 * @type {typeof component<{}>}
 */
const AitingAppLineCompoent = component;
export const AitingAppLine = AitingAppLineCompoent(({ line, api, i }) => {
  const {
    fixSuggestions,
    setFixSuggestions,
    activeFixSuggestion,
    setActiveFixSuggestion,
    previousLineText,
    setPreviousLineText,
  } = useLineState(line);

  async function rewrite() {
    api.editor.writeLine({
      id: line.id,
      text: await getRewritedText(line.text),
    });
  }

  async function createFixSuggestion() {
    if (!api.feature.autoGrammarCheck) return;
    setFixSuggestions(
      await getFixSuggestions(line.text, api.editor.state().join("\n")),
    );
  }

  function updateFixSuggestion() {
    setFixSuggestions(
      updateFixSuggestions(fixSuggestions(), line.text, previousLineText()),
    );
  }

  function useFixSuggestion(suggestion) {
    api.editor.writeLine({
      ...line,
      text: mergeFixedText(line.text, suggestion, fixSuggestions()),
    });
    setFixSuggestions(fixSuggestions().filter((s) => s.id != suggestion.id));
    setActiveFixSuggestion("");
  }

  useEffect(
    line.id.concat("_fixSuggestionLineChangeEffect"),
    () => {
      updateFixSuggestion();
      setPreviousLineText(line.text);
      const prev = line.text;
      const timeout = setTimeout(async () => {
        if (prev == previousLineText()) {
          if (previousLineText().length > 20) {
            api.feature.autoGrammarCheck && createFixSuggestion();
          }
          return clearInterval(timeout);
        }
        return clearInterval(timeout);
      }, 1000 * 5);
    },
    [line.text],
  );

  return Box(
    { class: "lineContainer" },

    IfBox(
      true,
      { class: "lineSixdot" },
      AitingAppLineSixdot({
        id: line.id,
        menu: [
          {
            action: () => {
              setFixSuggestions([]);
              api.suggestion.clearSuggestion();
              rewrite();
            },
            icon: "pen_red",
            name: "RE WRITE",
          },
          {
            action: () => {
              createFixSuggestion();
            },
            icon: "pen_red",
            name: "CHECK GRAMMAR",
          },
        ],
      }),
    ),

    (function textarea() {
      const layer = [
        // 実際にユーザーが操作し入力処理などが行われるレイヤー
        Box(
          {
            ...api.dom.registerEvent(line, i),
            attr: {
              contenteditable: "",
              id: api.editor.getLineRefId(line),
              class: "textarea", //.concat(!i ? " bold" : ""),
            },
            onMouseMove: (e) => handleHoverEvent(line, e),
          },
          line.text,
        ),
        // 色をつけたりハイライトしたりただ色をつけるだけのレイヤー
        Box(
          {
            attr: { class: "textarea suggestion" },
            style: s({
              position: "absolute",
            }),
          },
          ...AitingAppLineGrammarSuggestions(
            line,
            line.text,
            parseFixSuggestions(fixSuggestions()),
            useFixSuggestion,
          ),
        ),

        // 補完を表示するレイヤー
        IfBox(
          // 将来のために残しておく
          true ||
            Boolean(
              api.suggestion.suggestion() &&
                i == api.suggestion.suggestion()?.info.focus &&
                api.suggestion.suggestion()?.suggestions.length,
            ),
          {
            attr: { class: "textarea suggestion" },
            style: s({
              zIndex: -1,
            }),
          },
          line.text.concat(
            i == api.suggestion.suggestion()?.info.focus
              ? api.suggestion.suggestion()?.suggestions[0] || ""
              : "",
          ),
        ),
      ];

      return Box({ attr: { class: "textareaContainer" } }, ...layer);
    })(),
  );
});
