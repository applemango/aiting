//@ts-check

import { Box, Icon, IfBox, Style, Text } from "../components/box.js";
import { TestVDOMRender } from "./test.js";

export const testBoxComponent = new TestVDOMRender()
  .describe("/components/box.js Box", (t) => {
    t.expect(Box({ class: "box" }, Text("hello"))).toBe(
      `<div class="box"><p>hello</p></div>`,
    );
    t.expect(Box({ class: "box" }, Text("hello"), Text("world"))).toBe(
      `<div class="box"><p>hello</p><p>world</p></div>`,
    );
  })
  .describe("/components/box.js ifBox", (t) => {
    t.expect(IfBox(false, {}, Text("hello"))).toBe("<div></div>");
    t.expect(IfBox(true, {}, Text("hello"))).toBe("<div><p>hello</p></div>");
  })
  .describe("/components/box.js Style", (t) => {
    t.expect(Style({ file: "/test.css" })).toBe(
      `<link rel="stylesheet" href="/test.css">`,
    );
  })
  .describe("/compoents/box.js Icon", (t) => {
    t.expect(Icon({ name: "pen" })).toBe(`<img src="/editor/icon/pen.svg">`);
  })
  .describe("/components/box.js Text", (t) => {
    t.expect(Text("hello")).toBe(`<p>hello</p>`);
  });
