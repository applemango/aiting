import { Box } from "../components/box.js";
import { useEffect } from "../hook/useEffect.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { h, page } from "../src/dom/virtualdom.js";
import { ArrayToFlat } from "../src/utils/array.js";
import { testBoxComponent } from "./testComponent.js";
import { testStyle, testVDOM, testVDOMRender } from "./testDom.js";
import { failTest, testUtils } from "./testUtils.js";

export const App = page(() => {
  const [result, setResult] = useState("testResult", []);
  useEffect("runTest", () => {
    const tests = [
      failTest,
      testUtils,
      testVDOMRender,
      testVDOM,
      testBoxComponent,
      testStyle,
    ];
    const results = tests.map((t) => t.run());
    setResult(ArrayToFlat(results));
  });
  return Box(
    {},
    h(
      "table",
      {},
      h(
        "thead",
        {},
        h(
          "tr",
          {},
          h("th", { attr: { scope: "col" } }, "name"),
          h("th", { attr: { scope: "col" } }, "pass"),
          h("th", { attr: { scope: "col" } }, "fail"),
          h("th", { attr: { scope: "col" } }, "raw"),
        ),
      ),
    ),
    h(
      "tbody",
      {},
      result().map((res) => {
        console.log(res);
        return h(
          "tr",
          {
            style: s({
              background: res.fail ? "#F8BBD0" : "#C8E6C9",
            }),
          },
          h("th", { attr: { scope: "row" } }, res.name),
          h("td", {}, `pass: ${res.pass}/${res.total}`),
          h("td", {}, `fail: ${res.fail}/${res.total}`),
          h(
            "td",
            {},
            h(
              "pre",
              { style: s({ maxHeight: "100px", overflowY: "auto" }) },
              h("code", {}, JSON.stringify(res, null, 2)),
            ),
          ),
        );
      }),
    ),
  );
});
