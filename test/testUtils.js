import {
  ArrayDelete,
  ArrayInsert,
  ArrayToFlat,
  ArrayUpdate,
} from "../src/utils/array.js";
import { quickSort } from "../src/utils/sort.js";
import { TestFunction } from "./test.js";

export const failTest = new TestFunction()
  .describe("fail", (t) => {
    t.expect(false).toBe(true);
    t.expect(100).toBe(1);
    t.expect("hello").toBe("hello");
  })
  .none();

export const testUtils = new TestFunction()
  .describe("src/utils/sort.js", (t) => {
    t.expect(quickSort([3, 6, 9, 2])).toBe([2, 3, 6, 9]);
    t.expect(
      ArrayToFlat(
        quickSort(
          [
            [true, false],
            ["a", "b", "c", "d"],
            [1, 2, 3],
          ],
          (a, b) => a.length >= b.length,
        ),
      ),
    ).toBe(
      ArrayToFlat([
        ["a", "b", "c", "d"],
        [1, 2, 3],
        [true, false],
      ]),
    );
  })
  .describe("src/utils/array.js", (t) => {
    t.expect(ArrayInsert([1, 2, 3], 4, -1)).toBe([1, 2, 3, 4]);
    t.expect(ArrayInsert([1, 2, 3], 4, 2)).toBe([1, 2, 4, 3]);
    t.expect(ArrayUpdate([1, 2, 3], 2, 0)).toBe([2, 2, 3]);
    t.expect(ArrayDelete([1, 2, 3], 1)).toBe([1, 3]);
    t.expect(ArrayToFlat([1, 2, [3, 4, 5], [6, 7, 8, 9]])).expect([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });
