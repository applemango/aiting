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
 * ユーザーがLineに対してなにか操作をするとここにイベントとして入ってくる
 * ただ直接的な操作はブラウザがやるので、受け取ったイベントを処理して
 * いい感じに統合性を保ったままuseEditorSuggestionとかに渡す処理が主
 * ブラウザができないLineの削除やコピペなどはここで処理する
 *
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
        /**
         * なにか入力が発生したときにレコメンデーションを中止する
         * 但し一部のキーは関係ないので中止しない
         */
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

    /**
     * デフォルトの動作が厄介なやつはデフォルトの動作を打ち消す
     */
    if ([KeyCode.tab].includes(e.keyCode)) {
      e.preventDefault();
    }

    /**
     * サジェストの使用
     */
    if (e.keyCode == KeyCode.tab) {
      const suggest = api.suggestion.suggestion();
      if (suggest) {
        insertText(line, line.text.length, suggest.suggestions[0].trim());
        api.suggestion.clearSuggestion();
      }
    }

    /**
     * 改行の処理
     */
    if (e.keyCode == KeyCode.enter && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      return;
    }

    /**
     * 新しい行の作成
     */
    if (
      e.keyCode == KeyCode.enter &&
      getCursorPosition() === line.text.length &&
      !e.shiftKey
    ) {
      e.preventDefault();
      onCreateLine(undefined, index + 1);
    }

    /**
     * 行に何も入力されてなくて削除キーが押されたときは行を削除
     */
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

    /**
     * キーボードで行間移動をできるようにする
     */
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
