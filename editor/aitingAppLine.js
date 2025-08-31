//@ts-check
import { Box, Icon, IfBox, Text } from "../components/box.js";
import { useEffect } from "../hook/useEffect.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { component, h } from "../src/dom/virtualdom.js";
import {
  AitingAppLineGrammarSuggestions,
  handleHoverEvent,
} from "./aitingAppLineGrammarCheck.js";

import { AitingAppLineSixdot } from "./aitingAppLineSixdotMenu.js";
import {
  mergeFixedText,
  parseFixSuggestions,
  updateFixSuggestions,
} from "./aitingAppLineUtils.js";
import { getFixSuggestions, getRewritedText } from "./aitingAppLLM.js";

/**
 * @typedef {{type: string, title: string, description: string, position: {offset: number, length: number}, current: string, content: string, id: string}} FixSuggestion
 */

export const useLineState = (line) => {
  /**
   * @type {typeof useState<Array<FixSuggestion>>}
   */
  const useFixSuggestionState = useState;
  const [fixSuggestions, setFixSuggestions] = useFixSuggestionState(
    line.id.concat("_fixSuggestions"),
    [],
  );

  const [activeFixSuggestion, setActiveFixSuggestion] = useState(
    line.id.concat("_activefixSuggestions"),
    "",
  );

  const [previousLineText, setPreviousLineText] = useState(
    line.id.concat("_previousLineTextEffect"),
    line.text,
  );

  return {
    fixSuggestions,
    setFixSuggestions,
    activeFixSuggestion,
    setActiveFixSuggestion,
    previousLineText,
    setPreviousLineText,
  };
};

/**
 * @type {typeof component<{line: import("./hook/useEditorCore.js").Line, api: import("./hook/useEditor.js").useEditorApi & any, i: number}>}
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

  /**
   * 軽微なLine変更に対してサジェストを追随させる
   * ( 少し書き足したくらいのときにサジェストを全変更するのは大げさすぎる )
   */
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

  /**
   * Lineが変更されて5秒間変更がなければ文法などをチェックする
   */
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
              // titleを大きく表示するときはbold classをつける
              class: "textarea", //.concat(!i && api.feature.title ? " bold" : ""),
            },
            onMouseMove: (e) => handleHoverEvent(line, e),
          },
          line.text,
        ),
        // 色をつけたりハイライトしたりただ色をつけるだけのレイヤー
        Box(
          {
            attr: {
              class: "textarea suggestion",
            },
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
        Box(
          {
            attr: {
              class: "textarea suggestion",
            },
            style: s({
              zIndex: -1,
            }),
          },
          line.text.concat(
            i == api.suggestion.suggestion()?.info.focus
              ? api.suggestion.suggestion()?.suggestions[0] || ""
              : !i && api.feature.title && !line.text
                ? "title ( タイトルを書いたら次の行で文章を続けてね! )"
                : "",
          ),
        ),
      ];

      return Box({ attr: { class: "textareaContainer" } }, ...layer);
    })(),
  );
});
