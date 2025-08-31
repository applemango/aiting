//@ts-check
import { s } from "../src/dom/style.js";
import { h } from "../src/dom/virtualdom.js";
import { TestFunction, TestVDOM, TestVDOMRender } from "./test.js";

export const testStyle = new TestFunction()
  .describe("src/dom/style.js", (t) => {
    t.expect(
      s({
        margin: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }),
    ).toBe(
      "margin: 8px;display: flex;align-items: center;justify-content: center",
    );
    t.expect(s({ "custom-number": 30, "custom-string": "hello" })).toBe(
      "custom-number: 30;custom-string: hello",
    );
  })
  .none();

export const testVDOMRender = new TestVDOMRender()
  .describe("src/dom/virtualdom.js render", (t) => {
    t.expect(h("div", {})).toBe("<div></div>");
    t.expect(h("div", {}, h("p", {}, "hello, world!"))).toBe(
      "<div><p>hello, world!</p></div>",
    );
    t.expect(
      h(
        "div",
        { style: s({ padding: "8px" }) },
        h("img", { attr: { src: "/page/assets/grammar.png" } }),
      ),
    ).toBe(
      `<div style="padding: 8px;"><img src="/page/assets/grammar.png"></div>`,
    );
    t.expect(
      h("div", {}, h("div", {}, "1"), h("div", {}, h("p", {}, "hello"))),
    ).toBe("<div><div>1</div><div><p>hello</p></div></div>");
  })
  .none();

export const testVDOM = new TestVDOM(h("div", {}, ""))
  .describe("src/dom/virtualdom.js patch", (t) => {
    t.expect(h("div", {}, "hello")).toBe("<div>hello</div>");
    t.expect(h("div", {}, h("div", {}, "1"), h("div", {}, "2"))).toBe(
      "<div><div>1</div><div>2</div></div>",
    );
    t.expect(
      h("div", {}, h("div", {}, "1"), h("div", {}, h("p", {}, "hello"))),
    ).toBe("<div><div>1</div><div><p>hello</p></div></div>");
    t.expect(h("div", {}, h("div", {}, "1"), h("div", {}, "2"))).toBe(
      "<div><div>1</div><div>2</div></div>",
    );
  })
  .none();
