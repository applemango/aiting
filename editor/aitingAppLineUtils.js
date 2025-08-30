//@ts-check
import { quickSort } from "../src/utils/sort.js";

export function updateFixSuggestions(suggestions, text, previous) {
  let res = suggestions;

  /**
   * @param {string} previous
   * @param {string} current
   */
  function detectChange(previous, current) {
    /**
     * @param {string} previous
     * @param {string} current
     */
    function detectChangeHelper(previous, current) {
      const differPosition = previous
        .split("")
        .reduce(
          (acc, v, i) =>
            Boolean(acc == -1 && v != current.split("")[i]) ? i : acc,
          -1,
        );
      if (differPosition == -1) return null;

      return {
        position: {
          offset: differPosition,
          length: Math.abs(previous.length - current.length),
        },
        type:
          previous.length == current.length
            ? "change"
            : previous.length > current.length
              ? "remove"
              : "add",
      };
    }

    const change = detectChangeHelper(previous, current);
    if (!change) return;
    if (change.type == "change") return;

    const inEditiong = suggestions.filter(
      (s) =>
        s.position.offset <= change.position.offset &&
        s.position.offset + s.position.length >=
          change.position.offset + change.position.length,
    );
    if (inEditiong.length) {
      res = res.filter((s) => !inEditiong.some((i) => i.id == s.id));
    }

    if (change.type == "remove") {
      const affectSuggestion = res.filter(
        (s) => s.position.offset > change.position.offset,
      );
      if (affectSuggestion.length) {
        res = affectSuggestion.map((s) => {
          s.position.offset = s.position.offset - change.position.length;
          return s;
        });
      }
    }

    if (change.type == "add") {
      const affectSuggestion = res.filter(
        (s) => s.position.offset > change.position.offset,
      );
      if (affectSuggestion.length) {
        res = affectSuggestion.map((s) => {
          s.position.offset = s.position.offset + change.position.length;
          return s;
        });
      }
    }

    return;
  }
  detectChange(previous, text);

  function deleteGhostSuggestion() {
    res = res.filter((s) => {
      const matches = Array.from(text.matchAll(new RegExp(s.current, "g")));
      return Boolean(matches.length);
    });
  }
  deleteGhostSuggestion();

  return res;
}

export function parseFixSuggestions(suggestions) {
  const sortedFixSuggestions = quickSort(
    suggestions,
    (a, b) => a.position.offset < b.position.offset,
  );
  /**
   * @param {Array<fixSuggestion & {childrens: sorted}>} sorted
   */
  const structfy = (sorted) => {
    if (sorted.length == 1) return sorted;
    const structed = [];
    for (const item of sorted) {
      if (!structed.length) {
        structed.push(item);
        continue;
      }
      const lastestItem = structed[structed.length - 1];
      if (
        lastestItem.childrens.some(
          (i) => i.position == item.position && i.current == item.current,
        )
      ) {
        continue;
      }
      const lastCharPosition =
        lastestItem.position.offset + lastestItem.position.length;
      if (lastCharPosition > item.position.offset) {
        const filteredSorted = sorted.filter(
          (o) =>
            o.position.offset >= lastestItem.position.offset &&
            o.position.offset < lastCharPosition,
        );

        const lastFilteredSorted = filteredSorted[filteredSorted.length - 1];
        if (
          lastCharPosition <
          lastFilteredSorted.position.offset +
            lastFilteredSorted.position.length
        ) {
          lastestItem.position.length =
            lastFilteredSorted.position.offset +
            lastFilteredSorted.position.length -
            lastestItem.position.offset;
        }
        lastestItem.childrens = lastestItem.childrens.concat(
          structfy(filteredSorted),
        );
        continue;
      }
      structed.push(item);
    }
    return structed;
  };

  // 稀にLLMが修正不能なやつを投げてくる
  try {
    const structedFixSuggestions = structfy(
      sortedFixSuggestions.map((s) => ({ ...s, childrens: [] })),
    );

    return structedFixSuggestions;
  } catch {
    return [];
  }
}

export const mergeFixedText = (text, suggestion, suggestions) => {
  // suggestion.position.offsetはレンダリングの関係で改変されているので正しい値が出てこない
  const fixSuggestion = suggestions.filter((s) => s.id == suggestion.id)[0];
  const newText =
    text.slice(0, fixSuggestion.position.offset - 1) +
    fixSuggestion.content +
    text.slice(
      fixSuggestion.position.offset + fixSuggestion.current.length - 1,
    );
  return newText;
};
