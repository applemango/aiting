//@ts-check

import { useState } from "../../hook/useState.js";
import {
  ArrayInsert,
  ArrayUpdate,
  ArrayDelete,
} from "../../src/utils/array.js";

/**
 * @template T
 * @param {Array<T>} init
 * @returns {[()=> T[], {
 *  add: (value: T, index?: number) => void,
 *  remove: (index: number) => void,
 *  update: (index: number, value: T) => void,
 * }]}
 */
export const useEditorCoreArrayController = (init) => {
  const [state, setState] = useState("useEditorCoreArrayControllerState", init);
  const add = (value, index = -1) => {
    setState(ArrayInsert(state(), value, index));
  };
  const remove = (index) => {
    setState(ArrayDelete(state(), index));
  };
  const update = (index, value) => {
    setState(ArrayUpdate(state(), value, index));
  };
  return [state, { add, remove, update }];
};
