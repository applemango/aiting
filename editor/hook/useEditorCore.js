//@ts-check

import { useEditorCoreArrayController } from "./useEditorCoreArrayController.js";
import { useEditorCoreRef } from "./useEditorCoreRef.js";

/**
 * @typedef {HTMLDivElement} InputElement
 */

/**
 * @typedef Line
 * @property {string} id
 * @property {string} text
 * @property {boolean} isEditing
 * @property {any} ref
 * @property {object} meta
 */

/**
 * @typedef LineOptional
 * @property {string} [id]
 * @property {string} [text]
 * @property {boolean} [isEditing]
 * @property {any} [ref]
 * @property {object} [meta]
 */

/**
 * @typedef useEditorCoreApi
 * @property {()=> Line[]} state
 * @property {(line: {id: string})=> number} getIndex
 * @property {(line: Line, index?: number)=> void} pushLine
 * @property {(line: LineOptional & {id: string})=> void} updateLine
 * @property {(line: LineOptional & {id: string})=> void} deleteLine
 * @property {(line: Line, index?: number)=> Line} createLineData
 * @property {(line: LineOptional & {id: string})=> void} createLineRef
 * @property {(line?: LineOptional, index?: number)=> Line} createLine
 * @property {(line: Line)=> Element | null} getLineRef
 * @property {(line: Line)=> string} getLineRefId
 * @property {(line: LineOptional & {id: string})=> void} writeLine
 * @property {()=> string} getTitle
 * @property {()=> string} getContent
 */

/**
 * LineのCRUDに必要なものすべて。
 * CUDの操作はすべてこれを通じて行われる
 * Rはstateを直で読むときが例外としてある
 */
export const useEditorCore = () => {
  /** @type {typeof useEditorCoreArrayController<Line>} */
  const _useEditorCoreArrayController = useEditorCoreArrayController;
  const [state, { add, remove, update }] = _useEditorCoreArrayController([]);

  const { getLineRef, getLineRefId } = useEditorCoreRef();

  const refs = undefined;

  /**
   * @param {{id: string}} line
   * @returns { number }
   */
  const getIndex = (line) => {
    return state().findIndex((l) => l.id === line.id);
  };

  /**
   * @param {Line} line
   * @param {number} [index]
   */
  const pushLine = (line, index = -1) => {
    add(line, index);
  };

  /** @param {{id: string} & LineOptional} line */
  const updateLine = (line) => {
    update(getIndex(line), { ...state[getIndex(line)], ...line });
  };

  /** @param {{id: string} & LineOptional} line */
  const writeLine = (line) => {
    console.log("write");
    const ref = getLineRef(line);
    if (ref) {
      ref.innerHTML = line.text || "";
      updateLine(line);
    }
  };

  /** @param {{id: string} & LineOptional} line */
  const deleteLine = (line) => {
    remove(getIndex(line));
  };

  /** @param {{id: string} & LineOptional} line */
  const createLineRef = (line) => "";

  /**
   * @param {LineOptional} [line]
   * @param {number} [index]
   */
  const createLineData = (line, index = -1) => {
    const id = crypto.randomUUID();
    return {
      id: id,
      text: line?.text || "",
      isEditing: false,
      ref: createLineRef({ id: id }),
      meta: line?.meta || {},
    };
  };

  /**
   * @param {LineOptional} [line]
   * @param {number} [index]
   */
  const createLine = (line, index = -1) => {
    const newLine = createLineData(line || undefined, index);
    pushLine(newLine, index);
    return newLine;
  };

  const getTitle = () => state()[0].text;
  const getContent = () =>
    state()
      .slice(1)
      .map((line) => line.text)
      .join("\n");

  return {
    state,
    getIndex,
    pushLine,
    updateLine,
    deleteLine,
    createLineData,
    createLineRef,
    createLine,
    getLineRef,
    writeLine,
    getTitle,
    getContent,
    getLineRefId,
  };
};
