//@ts-check

import { Box, Text } from "../components/box.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { h } from "../src/dom/virtualdom.js";

export const useLineState = (line) => {
  /**
   * @typedef {{type: string, title: string, description: string, position: {offset: number, length: number}, current: string, content: string, id: string}} fixSuggestion
   * @type {typeof useState<Array<fixSuggestion>>}
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

export function handleHoverEvent(line, e) {
  const { activeFixSuggestion, setActiveFixSuggestion } = useLineState(line);

  /**
   * @param {Element | null} el
   * @param {number} padding
   */
  function inTouch(el, padding) {
    const rect = el?.getBoundingClientRect();
    if (!rect) return false;
    return (
      rect &&
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY + padding >= rect.top &&
      e.clientY <= rect.bottom
    );
  }

  const active = activeFixSuggestion();
  if (
    active &&
    inTouch(
      document.querySelector(
        `span:has(span[id=\"${activeFixSuggestion()}"\]) .suggestionToolTip`,
      ),
      32,
    )
  ) {
    return;
  }
  const tooltips = Array.from(
    document.querySelectorAll(
      `.textarea[id=\"${line.id}\"]+.suggestion .fixSuggestionCurrent`,
    ),
  );
  for (let i = 0; i < tooltips.length; i++) {
    const tip = tooltips[i];
    if (active == tip.id) continue;
    if (inTouch(tip, 0)) {
      setActiveFixSuggestion(tip.id);
      return;
    }
  }
  if (!active) return;
  setActiveFixSuggestion("");
}

/**
 * @param {fixSuggestion} fixSuggestion
 */
function toolTip(fixSuggestion, line, useFixSuggestion) {
  const {
    fixSuggestions,
    setFixSuggestions,
    activeFixSuggestion,
    setActiveFixSuggestion,
    previousLineText,
    setPreviousLineText,
  } = useLineState(line);
  const isActive = activeFixSuggestion() == fixSuggestion.id;
  return Box(
    {
      onMouseLeave: () => {
        setActiveFixSuggestion("");
      },
      onClick: () => useFixSuggestion(fixSuggestion),
      class: "suggestionToolTip",
      style: s({
        display: isActive ? "inline" : "none",
        position: "absolute",
        color: "#222",
        borderRadius: "4px",
        zIndex: 2,
        boxShadow:
          "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;",
        padding: "4px 8px",
        top: "32px",
        marginTop: "16px",
        cursor: "pointer",
        pointerEvents: "all",
        border: "1px solid #E91E63",
        "backdrop-filter": "blur(4px)",
        background: "#ffffffcc",
      }),
    },
    Text(fixSuggestion.title, {
      style: s({
        fontSize: "16px",
        margin: "0",
        color: "#E91E63",
      }),
    }),
    Text(fixSuggestion.description, {
      style: s({ fontSize: "14px", margin: "0" }),
    }),
  );
}

/**
 * @param {string} text
 * @param {Array<fixSuggestion & {childrens: structed}>} structed
 * @returns {Array<string | import("../src/dom/virtualdom.js").VNode>}
 */
export function AitingAppLineGrammarSuggestions(
  line,
  text,
  structed,
  useFixSuggestion,
) {
  const fixSuggestionColor = {
    critical: "#880E4F",
    high: "#C2185B",
    medium: "#D81B60",
    low: "#E91E63",
  };

  if (!structed.length) return [h("span", {}, text)];
  const lastestItem = structed[0];
  const firstStructedOffset = lastestItem.position.offset;
  const firstStructedLastChar =
    firstStructedOffset + lastestItem.position.length;
  const el = [
    h("span", {}, text.slice(0, firstStructedOffset - 1)),
    h(
      "span",
      {
        style: s({
          background: fixSuggestionColor[lastestItem.type] || "#E91E63",
          color: "#fff",
          outline: `2px solid ${fixSuggestionColor[lastestItem.type] || "#E91E63"}`,
          borderRadius: "2px",
        }),
      },
      toolTip(lastestItem, line, useFixSuggestion),
      h(
        "span",
        {
          class: "fixSuggestionCurrent",
          attr: { id: lastestItem.id },
        },
        lastestItem.current,
      ),
      ...AitingAppLineGrammarSuggestions(
        line,
        text.slice(
          firstStructedOffset + lastestItem.current.length,
          firstStructedLastChar,
        ),
        lastestItem.childrens,
        useFixSuggestion,
      ),
    ),
    ...AitingAppLineGrammarSuggestions(
      line,
      text.slice(firstStructedLastChar - 1), // whay -1?
      structed.slice(1).map((s) => {
        return {
          ...s,
          position: {
            offset: s.position.offset - firstStructedLastChar + 1, // whay +1?
            length: s.position.length,
          },
        };
      }),
      useFixSuggestion,
    ),
  ];
  return el;
}
