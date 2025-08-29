//@ts-check
import { Box, Icon, Style, Text } from "../components/box.js";
import { useLocalStorageState } from "../hook/useLocalStorageState.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { component, h, page } from "../src/dom/virtualdom.js";
import { AitingApp } from "../editor/aiting.js";

export const Introduction = component(() => {
  const [active, setActive] = useLocalStorageState("aitingApp", false);
  return Box(
    {},
    Box({}, Style({ file: "/page/introduction.css" })),
    Box(
      {
        style: s({
          padding: "0 128px",
          paddingBottom: "128px",
        }),
      },
      Box(
        {
          style: s({
            display: "flex",
            alignItems: "center",
            height: "600px",
            width: "100%",
            gap: "24px",
            justifyContent: "center",
          }),
          class: "header",
        },
        Box(
          {},
          Text("Write Faster\nThink Deeper", {
            style: s({
              fontSize: "48px",
              wordBreak: "keep-all",
              whiteSpace: "nowrap",
            }),
          }),
          Text("文章はきっともっと速く書ける"),
        ),
        Box(
          {
            style: s({
              scale: 1,
              border: "1px solid #eee",
              padding: "32px 0",
              borderRadius: "16px",
              maxWidth: "640px",
              maxHeight: "480px",
              position: "relative",
            }),
            class: "aitingContainer",
          },
          AitingApp({
            init: (api) => {
              /**
               * ここから下は基本的に黒魔術です。
               * 紹介ページのために、わざわざ色々な箇所を変更するよりは
               * 無理やり内部の変数をいじくり回した方が早いからね、仕方ないね
               */

              api.editor.writeLine({
                ...api.editor.state()[0],
                text: "These days, In school, Teacher is likely being too kind as they teach students everything",
              });

              const [suggestion, setSuggestion] = useState(
                "useEditorSuggestionSuggestion",
                null,
              );
              setSuggestion({
                info: {
                  text: "",
                  cursor: -1,
                  focus: 0,
                  id: api.editor.state()[0].id,
                },
                suggestions: [" and helping them with personal issues."],
              });

              const [fixSuggestions, setFixSuggestions] = useState(
                api.editor.state()[0].id.concat("_fixSuggestions"),
                [],
              );
              setFixSuggestions([
                {
                  level: "high",
                  title: "冠詞と主語の不一致",
                  description:
                    "「Teacher」は複数形である必要があるため、冠詞を「a」から「Teachers」に変更します。また、文全体をより自然で正確な表現に修正します。",
                  position: {
                    offset: 24,
                    length: 7,
                  },
                  current: "Teacher",
                  content: "Teachers",
                },
                {
                  level: "medium",
                  title: "時制の一貫性",
                  description:
                    "現在形と現在進行形が混在しているため、時制を統一します。ここでは現在形が適切です。",
                  position: {
                    offset: 32,
                    length: 24,
                  },
                  current: "is likely being too kind",
                  content: "are likely too kind",
                },
              ]);
            },
          }),
          Box(
            {
              style: s({
                height: "64px",
                width: "64px",
                borderRadius: "100%",
                background: "#EC407A",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                right: "16px",
                bottom: "16px",
                cursor: "pointer",
              }),
              onClick: () => setActive(true),
            },
            Icon({ name: "arrow-right" }),
          ),
        ),
      ),
      Box(
        {
          style: s({
            display: "flex",
            background: "#FCE4EC",
            borderRadius: "8px",
            padding: "32px",
            gap: "16px",
            border: "2px solid #F48FB1",
            position: "relative",
            marginBottom: "16px",
          }),
        },
        Box(
          {},
          Text("文法ミスも楽々修正", { style: s({ fontSize: "32px" }) }),
          Text(
            "AIが自動で文法ミスを見つけ出して、適切な修正を施すので、苦手なライティングもすぐに克服",
            { style: s({ fontSize: "18px" }) },
          ),
        ),
        Box(
          {
            style: s({
              padding: "16px 0",
              borderRadius: "8px",
              background: "white",
            }),
          },
          h("img", {
            attr: { src: "./page/assets/grammar.png" },
            style: s({ width: "100%" }),
          }),
        ),
        Box({
          style: s({
            position: "absolute",
            width: "100%",
            height: "100%",
            top: "0",
            left: "0",
            borderRadius: "8px",
            background:
              "linear-gradient(to bottom, transparent 70%, #FCE4EC 85%, #F8BBD0 100%)",
          }),
        }),
      ),
      Box(
        { style: s({ display: "flex" }) },
        Box(
          {
            style: s({
              display: "block",
              background: "#FFF3E0",
              borderRadius: "8px",
              padding: "32px",
              gap: "16px",
              border: "2px solid #FFE0B2",
              position: "relative",
              marginBottom: "16px",
              width: "40%",
              marginRight: "16px",
            }),
            class: "FeatureRewrite",
          },
          Box(
            {},
            Text("書き直し?", { style: s({ fontSize: "32px" }) }),
            Text("大丈夫!。なんでもワンクリックで書き直し", {
              style: s({ fontSize: "18px" }),
            }),
          ),
          Box(
            {
              style: s({
                padding: "16px 0",
                borderRadius: "8px",
                background: "white",
              }),
            },
            h("img", {
              attr: { src: "./page/assets/grammar.png" },
              style: s({ width: "100%" }),
            }),
          ),
          Box({
            style: s({
              position: "absolute",
              width: "100%",
              height: "100%",
              top: "0",
              left: "0",
              borderRadius: "8px",
              background:
                "linear-gradient(to bottom, transparent 70%, #FFF3E0 85%, #FFE0B2 100%)",
            }),
          }),
        ),
        Box(
          {
            style: s({
              display: "flex",
              background: "#FFF3E0",
              borderRadius: "8px",
              padding: "32px",
              gap: "16px",
              border: "2px solid #FFE0B2",
              position: "relative",
              marginBottom: "16px",
            }),
          },
          Box(
            {},
            Text("明日までに100個?", { style: s({ fontSize: "32px" }) }),
            Text(
              "アイデア出しからクイズの問題まで、欲しいものを欲しいだけ生成",
              {
                style: s({ fontSize: "18px" }),
              },
            ),
          ),
          Box(
            {
              style: s({
                padding: "16px 0",
                borderRadius: "8px",
                background: "white",
              }),
            },
            h("img", {
              attr: { src: "./page/assets/grammar.png" },
              style: s({ width: "100%" }),
            }),
          ),
          Box({
            style: s({
              position: "absolute",
              width: "100%",
              height: "100%",
              top: "0",
              left: "0",
              borderRadius: "8px",
              background:
                "linear-gradient(to bottom, transparent 70%, #FFF3E0 85%, #FFE0B2 100%)",
            }),
          }),
        ),
      ),
      Box(
        { style: s({ display: "flex", gap: "16px" }) },
        Box(
          {
            style: s({
              display: "flex",
              background: "#F1F8E9",
              borderRadius: "8px",
              padding: "32px",
              gap: "16px",
              border: "2px solid #F0F4C3",
              position: "relative",
            }),
          },
          Box(
            {},
            Text("あとは任せて", {
              style: s({ fontSize: "32px" }),
            }),
            Text("AIが文意を読み取ってあなたに変わって続きを書いてくれます", {
              style: s({ fontSize: "18px" }),
            }),
          ),
          Box(
            {
              style: s({
                padding: "16px 0",
                borderRadius: "8px",
                background: "white",
              }),
            },
            h("img", {
              attr: { src: "./page/assets/grammar.png" },
              style: s({ width: "100%" }),
            }),
          ),
          Box({
            style: s({
              position: "absolute",
              width: "100%",
              height: "100%",
              top: "0",
              left: "0",
              borderRadius: "8px",
              background:
                "linear-gradient(to bottom, transparent 70%, #F1F8E9 85%, #F0F4C3 100%)",
            }),
          }),
        ),
      ),
      Box(
        {
          style: s({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "32px",
          }),
        },
        Text("Are you ready?", { style: s({ fontSize: "6dvw" }) }),
        Box(
          {
            style: s({
              height: "192px",
              width: "192px",
              borderRadius: "100%",
              background: "#fff",
              border: "1px solid #222",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }),
            onClick: () => setActive(true),
          },
          Icon({ name: "arrow-right2" }),
        ),
      ),
    ),
  );
});
