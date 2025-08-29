//@ts-check

import { useEditorCore } from "./useEditorCore.js";
import { useEditorCoreDomEvents } from "./useEditorCoreDomEvents.js";
import { useEditorUtils } from "./useEditorUtils.js";
import { useEditorCoreCursor } from "./useEditorCoreCursor.js";

import { useEffect } from "../../hook/useEffect.js";
import { useEditorSuggestion } from "./useEditorSuggestion.js";

/**
 *
 * @param {{
 *    settings: import("../aiting.js").Settings,
 *    feature: import("../aiting.js").Feature
 * }} api
 * @returns
 */
export const useEditor = (api) => {
  /**
   *
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
   *
   */
  const utilsCore = useEditorUtils({ editor: editorCore });
  const { copy } = utilsCore;

  /**
   *
   */
  const cursorCore = useEditorCoreCursor({ editor: editorCore });
  const { setCursorPosition, focus } = cursorCore;

  /**
   *
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
   *
   */
  const domEventsCore = useEditorCoreDomEvents({
    editor: editorCore,
    suggestion: suggestionCore,
    cursor: cursorCore,
  });
  const { registerEvent, onCreateLine, onDeleteLine } = domEventsCore;

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
