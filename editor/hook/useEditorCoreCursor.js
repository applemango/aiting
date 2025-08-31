//@ts-check

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @typedef {import("./useEditorCore").Line} Line
 *
 * @typedef useEditorCursorApi
 * @property {(line: Line, offset: number)=> Promise<boolean>} setCursorPosition
 * @property {(line: Line, offset?: number)=> Promise<boolean>} focus
 */

/**
 * @param {{
 *  editor: import("./useEditorCore").useEditorCoreApi
 * }} api
 */
export const useEditorCoreCursor = (api) => {
  /**
   * カーソルを指定のLineの指定の文字数に移動させる
   *
   * @param {Line} line
   * @param {number} offset
   * @returns {Promise<Boolean>}
   */
  const setCursorPosition = (line, offset) => {
    return new Promise((resolve, reject) => {
      wait(50).then(() => {
        const ref = api.editor.getLineRef(line);
        if (ref) {
          const range = document.createRange();
          const sel = window.getSelection();
          if (ref.nodeName == "#text") {
            range.setStart(ref, offset);
          } else {
            range.setStart(ref, Math.min(1, offset));
          }
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
          return resolve(true);
        }
        resolve(false);
      });
    });
  };
  /**
   * 指定の行をアクティブ ( 入力待機状態 )にする
   *
   * @param {Line} line
   * @param {number} [offset]
   * @returns {Promise<boolean>}
   */
  const focus = async (line, offset = line?.text?.length) => {
    if (!line) return false;
    return await setCursorPosition(line, offset);
  };
  return {
    setCursorPosition,
    focus,
  };
};
