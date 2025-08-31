//@ts-check

import { Page } from "../src/dom/virtualdom.js";

/**
 * @typedef {{
    total: number;
    pass: number;
    fail: number;
    errors: {
        test: {
            expect: any;
            toBe: any;
        };
        name: string;
    }[]
 * }} TestResult
 */

/**
 * テストを実行しやすくする
 * ただしテストするものが多様なのでできるだけ普遍的に拡張できるように定義する
 * parseExpectなどは拡張前提
 */
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
   * @returns
   */
  parseExpect(something) {
    return something;
  }

  /**
   * @param {any} someting
   * @returns
   */
  parseToBe(someting) {
    return someting;
  }

  /**
   * @param {any} something
   * @returns this
   */
  expect(something) {
    this.#expectState = { expect: this.parseExpect(something) };
    return this;
  }
  /**
   * @param {any} something
   */
  toBe(something) {
    this.#testCase[this.#describeState.name].push({
      expect: this.#expectState.expect,
      toBe: this.parseToBe(something),
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
   * @returns { TestResult[]}
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

/**
 * 普通の関数のテスト用。特に手を加える必要はない
 */
export class TestFunction extends Test {}

/**
 * 毎回最初からレンダリングするテスト。
 * 普通のコンポーネントに対してはこっちのほうが早いのでこれを使う
 */
export class TestVDOMRender extends Test {
  parseExpect(vdom) {
    const root = document.createElement("body");
    const p = new Page(() => vdom, root);
    p.render();
    return root.innerHTML;
  }
}

/**
 * すべてのテストケースで共有のrootを使用する
 * DOMの変更が追随するか見る
 */
export class TestVDOM extends Test {
  constructor(vdom) {
    super();
    this.root = document.createElement("body");
    this.page = new Page(null, this.root);
    this.page.render(vdom);
  }
  parseExpect(vdom) {
    this.page.patch(vdom);
    return this.root.innerHTML;
  }
}
