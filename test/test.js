//@ts-check

import { Page } from "../src/dom/virtualdom.js";

class Test {
  /**
   * @type {Object.<string, Array<{expect: any, toBe: any}>>}
   */
  #testCase = {};
  /**
   * @type {{name: string}}
   */
  #describeState;

  /**
   * @type {{expect: any}}
   */
  #expectState;

  constructor() {}

  /**
   * @param {string} name
   * @param {(t: this)=> void} fn
   * @returns this
   */
  describe(name, fn) {
    this.#testCase[name] = [];
    this.#describeState = { name };
    fn(this);
    return this;
  }
  /**
   * @param {any} something
   * @returns this
   */
  expect(something) {
    this.#expectState = { expect: something };
    return this;
  }
  /**
   * @param {any} something
   */
  toBe(something) {
    this.#testCase[this.#describeState.name].push({
      expect: this.#expectState.expect,
      toBe: something,
    });
  }
  equal(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length != b.length) return;
      return a.every((v, i) => v == b[i]);
    }
    return a == b;
  }
  /**
   * @returns { {
      total: number;
      pass: number;
      fail: number;
      errors: {
          test: {
              expect: any;
              toBe: any;
          };
          name: string;
      }[];
  }[]}
   */
  run() {
    const result = [];
    for (const key of Object.keys(this.#testCase)) {
      let errors = [];
      for (const test of this.#testCase[key]) {
        if (!this.equal(test.expect, test.toBe)) {
          errors.push({ test, name: key });
        }
      }
      result.push({
        name: key,
        total: this.#testCase[key].length,
        pass: this.#testCase[key].length - errors.length,
        fail: errors.length,
        errors,
      });
    }
    return result;
  }

  /**
   * 関数チェインが2以上じゃないとフォーマッターが変なフォーマットの仕方をするので
   * 2に届かないとき2以上にする用
   */
  none() {
    return this;
  }
}

export class TestFunction extends Test {}

export class TestVDOMRender extends Test {
  equal(vdom, html) {
    const root = document.createElement("body");
    const p = new Page(() => vdom, root);
    p.render();
    return root.innerHTML == html;
  }
}

export class TestVDOM extends Test {
  constructor(vdom) {
    super();
    this.root = document.createElement("body");
    this.page = new Page(null, this.root);
    this.page.render(vdom);
  }
  equal(vdom, html) {
    this.page.patch(vdom);
    return this.root.innerHTML == html;
  }
}
