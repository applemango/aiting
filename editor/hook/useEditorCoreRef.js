//@ts-check

//TODO: dom操作を消す

/**
 * @typedef {import("./useEditorCore").Line} Line
 * @typedef {import("./useEditorCore").LineOptional} LineOptional
 */

export const useEditorCoreRef = () => {
  /**
   * @param {LineOptional & {id: string}} line
   */
  const getLineRefId = (line) => {
    return line.id;
  };

  /**
   * @param {LineOptional & {id: string}} line
   */
  const getLineRef = (line) => {
    return document.querySelector(`[id="${getLineRefId(line)}"]`);
  };

  return {
    getLineRefId,
    getLineRef,
  };
};
