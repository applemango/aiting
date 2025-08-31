//@ts-check

import { useEditorCore } from "./useEditorCore.js";
import { useEditorCoreDomEvents } from "./useEditorCoreDomEvents.js";
import { useEditorUtils } from "./useEditorUtils.js";
import { useEditorCoreCursor } from "./useEditorCoreCursor.js";

import { useEffect } from "../../hook/useEffect.js";
import { useEditorSuggestion } from "./useEditorSuggestion.js";

/**
 * @typedef {{
 *  editor: import("./useEditorCore.js").useEditorCoreApi,
 *  utils: import("./useEditorUtils.js").useEditorUtilsApi,
 *  suggestion: import("./useEditorSuggestion.js").useEditorSuggestionApi,
 * }} useEditorApi
 */

/**
 * editorの状態管理に必要なものすべて
 * grammerCheckCoreに関してはレイヤーが上の方に行ってしまったので
 * 今はaitingAppLineGrammarCheck.jsにある
 *
 * @param {{
 *    settings: import("./useSettings.js").Settings,
 *    feature: import("./useFeatures.js").Feature
 * }} api
 */
export const useEditor = (api) => {
  /**
   * Lineの操作関連
   */
  const editorCore = useEditorCore();
  const {
    state,
    getIndex,
    pushLine,
    updateLine,
    deleteLine,
    createLineData,
    createLineRef,
    getLineRef,
    writeLine,
    getTitle,
    getContent,
    getLineRefId,
  } = editorCore;

  /**
   * 独立した小さな機能
   */
  const utilsCore = useEditorUtils({ editor: editorCore });
  const { copy } = utilsCore;

  /**
   * カーソル関連
   */
  const cursorCore = useEditorCoreCursor({ editor: editorCore });
  const { setCursorPosition, focus } = cursorCore;

  /**
   * サジェスト関連 ( どっちかって言うと保管に近い )
   */
  const suggestionCore = useEditorSuggestion({
    editor: editorCore,
    settings: api.settings,
    feature: api.feature,
  });
  const { suggestion, useSuggestion, createSuggestion, clearSuggestion } =
    suggestionCore;

  /**
   *
   */
  const grammerCheckCore = undefined;

  /**
   * DOMイベント関連
   */
  const domEventsCore = useEditorCoreDomEvents({
    editor: editorCore,
    suggestion: suggestionCore,
    cursor: cursorCore,
  });
  const { registerEvent, onCreateLine, onDeleteLine } = domEventsCore;

  /**
   * 最初Lineの配列が空なのでこっちでLineを作成して入力操作を行えるようにする
   */
  useEffect(
    "initEditor",
    function init() {
      onCreateLine();
    },
    [],
  );

  return {
    state,
    suggestion,
    registerEvent,
    getLineRefId,
    copy,
    api: {
      editor: editorCore,
      utils: utilsCore,
      suggestion: suggestionCore,
      cursor: cursorCore,
      dom: domEventsCore,
    },
  };
};
