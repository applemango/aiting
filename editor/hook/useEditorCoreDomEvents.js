//@ts-check

const getCursorPosition = () => {
  return window.getSelection()?.getRangeAt(0).startOffset;
};

/**
 * @enum {number}
 */
export const KeyCode = {
  enter: 13,
  delete: 8,
  backspace: 46,
  arrowUp: 38,
  arrowDown: 40,
  tab: 9,
  escape: 27,
  space: 32,
  semicolon: 186,
  equal: 187,
  comma: 188,
  dash: 189,
  period: 190,
  slash: 191,
  backtick: 192,
  bracketOpen: 219,
  backslash: 220,
  bracketClose: 221,
  quote: 222,
};

const appendDefaultEvent = (events) => {
  return Object.keys(events).reduce((acc, event) => {
    if (event == "_") return acc;
    acc[event] = (e) => {
      events._(e);
      events[event](e);
    };
    return acc;
  }, Object());
};

/**
 * @typedef {import("./useEditorCore.js").Line} Line
 */

/**
 * @param {{
 *  editor: import("./useEditorCore.js").useEditorCoreApi,
 *  suggestion: import("./useEditorSuggestion.js").useEditorSuggestionApi,
 *  cursor: import("./useEditorCoreCursor.js").useEditorCursorApi,
 * }} api
 * @returns
 */
export const useEditorCoreDomEvents = (api) => {
  /**
   *
   * @param {Line} line
   * @param {number} index
   * @returns
   */
  const registerEvent = (line, index) => {
    return appendDefaultEvent({
      onKeyDown: (e) => onKeyDownEvent(e, index),
      onInput: (e) => onInputEvent(e, index),
      onPaste: (e) => onPasteEvent(e, index),
      _: (e) => {
        //console.log(e.keyCode)
        if (e.keyCode == KeyCode.tab || e.keyCode == 91 || e.keyCode == 0)
          return;
        api.suggestion.clearSuggestion();
      },
    });
  };

  /**
   * @param {Line} line
   * @param {number} position
   * @param {string} text
   */
  const insertText = (line, position, text) => {
    const after = line.text
      .slice(0, position)
      .concat(text)
      .concat(line.text.slice(position));
    api.editor.writeLine({
      id: line.id,
      text: after,
    });
    api.cursor.setCursorPosition(line, position + text.length);
    api.suggestion.createSuggestion(
      { ...line, text: after },
      position + text.length,
    );
  };

  /**
   * @param {any} e
   * @param {number} index
   */
  const onPasteEvent = (e, index) => {
    const line = api.editor.state()[index];
    e.preventDefault();

    const text = e.clipboardData.getData("text/plain").trim();
    const ref = api.editor.getLineRef(line);
    if (!ref) return;

    const cursorPosition = getCursorPosition() || 0;

    insertText(line, cursorPosition, text);
  };

  /**
   * @param {any} e
   * @param {number} index
   * @returns
   */
  const onKeyDownEvent = (e, index) => {
    const line = api.editor.state()[index];
    if ([KeyCode.tab].includes(e.keyCode)) {
      e.preventDefault();
    }

    if (e.keyCode == KeyCode.tab) {
      //console.log("tab", api.suggestion.suggestion())
      const suggest = api.suggestion.suggestion();
      if (suggest) {
        insertText(line, line.text.length, suggest.suggestions[0].trim());
        api.suggestion.clearSuggestion();
      }
    }

    if (e.keyCode == KeyCode.enter && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      return;
    }

    if (
      e.keyCode == KeyCode.enter &&
      getCursorPosition() === line.text.length &&
      !e.shiftKey
    ) {
      e.preventDefault();
      onCreateLine(undefined, index + 1);
    }

    if (
      e.keyCode == KeyCode.delete &&
      (!line.text.length || line.text == "\n")
    ) {
      onDeleteLine(line);
      return;
    }
    if (e.keyCode == KeyCode.delete && !line.text.trim().length) {
      api.editor.updateLine({
        id: line.id,
        text: line.text.trim(),
        isEditing: true,
      });
      e.preventDefault();
      return;
    }

    if (
      e.keyCode == KeyCode.arrowUp &&
      getCursorPosition() === 0 &&
      api.editor.getIndex(line) > 0
    ) {
      api.cursor.focus(api.editor.state()[index - 1]);
    }
    if (
      e.keyCode == KeyCode.arrowDown &&
      getCursorPosition() === line.text.length &&
      api.editor.getIndex(line) < api.editor.state().length - 1
    ) {
      api.cursor.focus(api.editor.state()[index + 1], 0);
    }
  };

  /**
   * @param {any} e
   * @param {number} index
   */
  const onInputEvent = (e, index) => {
    const line = api.editor.state()[index];
    if (api.editor.getIndex(line) > 0) {
      const position = window.getSelection()?.getRangeAt(0).startOffset;
      api.suggestion.createSuggestion(
        { ...line, text: e.target.innerText },
        position || 0,
      );
    }

    api.editor.updateLine({
      id: line.id,
      text: e.target.innerText,
      isEditing: true,
    });
  };

  /**
   *
   * @param {import("./useEditorCore.js").LineOptional} [line]
   * @param {number} [index]
   */
  const onCreateLine = (line, index = -1) => {
    const newLine = api.editor.createLine(line, index);
    api.cursor.focus(newLine);
  };

  /**
   * @param {Line} line
   */
  const onDeleteLine = (line) => {
    if (api.editor.state().length === 1) return;

    const index = api.editor.getIndex(line);
    api.editor.deleteLine(line);
    api.cursor.focus(api.editor.state()[index - 1]);
  };

  return {
    registerEvent,
    onCreateLine,
    onDeleteLine,
  };
};
