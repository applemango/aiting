//@ts-check
import { Box, Icon, IfBox, Style, Text } from "../components/box.js";
import { Infinite } from "../components/infinite.js";
import { useAccount } from "./hook/useAccount.js";
import { useEditor } from "./hook/useEditor.js";
import { useDynamicRouting } from "../hook/useDynamicRouting.js";
import { useEffect } from "../hook/useEffect.js";
import { useLocalStorageState } from "../hook/useLocalStorageState.js";
import { useState } from "../hook/useState.js";
import { s } from "../src/dom/style.js";
import { component, h, page } from "../src/dom/virtualdom.js";
import {
  getGeminiChatCompletion,
  getGeminiChatCompletionTextWrapper,
} from "../src/llm/gemini.js";
import {
  getGroqChatCompletion,
  getGroqChatCompletionTextWrapper,
} from "../src/llm/groq.js";
import { getGroqChatCompletionStreamWrapper } from "../src/llm/stream.js";
import { quickSort } from "./sort.js";

//https://materialui.co/colors

/**
 * @typedef {{
     autoGenerate?: boolean;
     autoGrammarCheck?: boolean;
     autoCompleting?: boolean;

     // 未実装
     autoCorrect?: boolean;
     autoRewrite?: boolean;
     autoWritingSuggest?: boolean;
     autoCriticize?: boolean;

     copy?: boolean;
 }} Feature
 */

/**
 * @typedef WrittingMode
 * @property {{
 *   title: string,
 *   description: string,
 *   icon: string,
 * }} ui
 * @property {{
 *   recommendationAdaptor: {
 *     prompt: string,
 *     context: string,
 *   },
 *   feature: Feature,
 * }} config
 * @property {number} id
 */

const useWrittingMode = () => {
  /**
   * @type {typeof useState<number>}
   */
  const useWrittingModeState = useState;
  const [mode, setMode] = useWrittingModeState("mode", -1);

  /** @type {Array<WrittingMode>} */
  const modes = [
    {
      ui: {
        title: "徒然なるままに",
        description: "思いついたままに文章を書くモード",
        icon: "pen_red",
      },
      config: {
        recommendationAdaptor: {
          prompt: "",
          context: "",
        },
        feature: {
          autoCompleting: true,
          autoGrammarCheck: false,
          autoGenerate: false,
        },
      },
      id: 0,
    },
    {
      ui: {
        title: "English",
        description: "英語学習に最適です",
        icon: "lang_red",
      },
      config: {
        recommendationAdaptor: {
          prompt: "",
          context: "",
        },
        feature: {
          autoCompleting: false,
          autoGrammarCheck: true,
          autoGenerate: false,
        },
      },
      id: 1,
    },
    /*{
      ui: {
        title: "X",
        description: "文字数制限をつけます",
        icon: "x_red",
      },
      config: {
        recommendationAdaptor: {
          prompt: "",
          context: "",
        },
        feature: {

        }
      },
      id: 2,
    },*/
  ];

  return {
    modes,
    mode,
    setMode,
    currentMode: () => {
      if (mode() == -1) return modes[0];
      return modes[mode()];
    },
  };
};

/**
 * @typedef Settings
 * @property {{
 *    prompt: string
 * }} recommendation
 * @property {Feature} feature
 * @returns {[()=> Settings, (settings: Settings)=> void]}
 */
const useSettings = () => {
  /** @type Settings */
  const defaultSettings = {
    recommendation: {
      prompt: `あなたはユーザーから受け取った文章を基にその次に来る文章を考えユーザーにオートコンプリートとして渡します。下記のtitleとcontentを基にユーザーから渡されたテキストに補完する形で50語程度な適切な語を補ってください、その際言葉遣いなどは極力合わせてください。ただし繰り返しは不要です、いきなり次の語から始めてください、間違っても"僕は"で終わる文章のサジェストで"僕は..."などと始めないでください。\n`,
    },
    feature: {
      copy: true,
    },
  };
  const [settings, setSettings] = useLocalStorageState(
    "settings",
    defaultSettings,
  );
  return [
    settings,
    (settings) => {
      setSettings(settings);
    },
  ];
};

/**
 * @param {{
 *    settings: Settings,
 *    mode: WrittingMode
 * }} api
 * @returns Feature
 */
const useFeatures = (api) => {
  return Object.assign(api.settings.feature, api.mode.config.feature);
};

export const AitingApp = component(({ init }) => {
  const [account, setAccount] = useAccount();
  const [settings, setSettings] = useSettings();
  const { mode, modes, setMode, currentMode } = useWrittingMode();

  const feature = useFeatures({ settings: settings(), mode: currentMode() });

  const { copy, registerEvent, state, suggestion, getLineRefId, api } =
    useEditor({ settings: settings(), feature });

  const [infiniteMode, setInfiniteMode] = useState("infiniteMode", false);

  const { go } = useDynamicRouting();

  const limit = {
    ai: {
      upperClass: null,
      middleClass: null,
      lowerClass: null,
    },
  };

  useEffect("text", () => console.log(suggestion()), [suggestion()]);
  useEffect(
    "init",
    () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      /*wait(300).then(() => {
        api.editor.writeLine({
          ...api.editor.state()[0],
          text: "hello world",
        });
        api.dom.onCreateLine(
          api.editor.createLineData({
            text: "It's a beautiful day. The sun is shining, birds are singing, and a gentle breeze is blowing. Perfect weather for a walk in the park, or perhaps a picnic with friends. What are your plans for today?",
            //text: "These days, In school, Teacher is likely being too kind as they teach students everything",
          }),
        );
        api.dom.onCreateLine();
      });*/
      wait(300).then(() => {
        init(api);
      });
    },
    [],
  );

  return Box(
    { class: "AitingAppContainer" },
    Style({ file: "/editor/aiting.css" }),

    Box(
      { class: "AitingAppModeSelectorContainer" },
      (function list() {
        return Box(
          {
            style: s({
              display: "flex",
              gap: "16px",
              marginBottom: "32px",
              width: "max( 100%, 600px ) ",
              marginLeft: "32px",
              ...(mode() == -1
                ? {
                    opacity: 1,
                    transform: "translateX(0px) translateY(0px)",
                  }
                : {}),
            }),
            class: "modeSelector",
          },
          modes.map((m) =>
            Box(
              {
                onClick: () => {
                  setMode(m.id);
                  console.log(m.id);
                },
                style: s({
                  padding: "8px",
                  boxShadow:
                    "rgba(240, 46, 170, 0.4) 5px 5px, rgba(240, 46, 170, 0.3) 10px 10px, rgba(240, 46, 170, 0.2) 15px 15px, rgba(240, 46, 170, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px;",
                  borderRadius: "4px",
                  background: "#ffffff00",
                  border: "1px solid #E91E63",
                  //"backdrop-filter": "blur(4px)",
                  cursor: "pointer",
                  position: "relative",
                  ...(mode() == m.id
                    ? {
                        transform: "translateX(8px) translateY(8px)",
                      }
                    : {}),
                }),
                class: "modeSelectorButton",
              },
              Box(
                {
                  style: s({
                    display: "flex",
                    gap: "8px",
                  }),
                },
                Icon({
                  name: m.ui.icon,
                  style: s({
                    width: "18px",
                    position: "relative",
                    zIndex: 2,
                    stroke: "#EC407A",
                  }),
                }),
                Text(m.ui.title, {
                  style: s({
                    fontSize: "14px",
                    margin: "0",
                    position: "relative",
                    zIndex: 2,
                    color: "#F50057",
                  }),
                }),
              ),
              Text(m.ui.description, {
                style: s({
                  margin: "0",
                  fontSize: "12px",
                  position: "relative",
                  zIndex: 2,
                  color: "#EC407A",
                }),
              }),
            ),
          ),
        );
      })(),
    ),

    Box(
      { class: "AitingAppBodyContainer" },
      Infinite({
        load: async () => {
          /** @type string */
          const gemini = await getGeminiChatCompletionTextWrapper(
            getGeminiChatCompletion({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: "ユーザーから渡された情報を元に10個程度のものを羅列してください、但しいきなり始めてください。箇条書きなどにせずにプレーンテキストで一つ毎に改行のみしてください",
                    },
                    {
                      text: api.editor
                        .getTitle()
                        .concat(
                          `\nこれまでに挙げられた候補: ${api.editor.getContent().replace(api.editor.state()[0].text, "")}`,
                        ),
                    },
                  ],
                },
              ],
            }),
          );
          gemini.split("\n").map((v) => {
            if (!v) return;
            api.editor.createLine({
              text: v,
              meta: {
                aigenerated: true,
              },
            });
          });
          return;
        },
        loadMore: infiniteMode,
        interval: 1000,
        children: Box(
          {},
          state().map((line, i) => {
            /**
             * @typedef  {{title: string, content: string}} changeSuggestion
             * @type {typeof useState<Array<changeSuggestion>>}
             */
            const useChangeSuggestionsState = useState;
            const [changeSuggestions, setChangeSuggestions] =
              useChangeSuggestionsState("", []);

            /**
             * @typedef {{type: string, title: string, description: string, position: {offset: number, length: number}, current: string, content: string, id: string}} fixSuggestion
             * @type {typeof useState<Array<fixSuggestion>>}
             */
            const useFixSuggestionState = useState;
            const [fixSuggestions, setFixSuggestions] = useFixSuggestionState(
              line.id.concat("_fixSuggestions"),
              [],
            );

            const [activeFixSuggestion, setActiveFixSuggestion] = useState(
              line.id.concat("_activefixSuggestions"),
              "",
            );

            const [previousLineText, setPreviousLineText] = useState(
              line.id.concat("_previousLineTextEffect"),
              line.text,
            );

            async function rewrite() {
              api.editor.writeLine({
                id: line.id,
                text: "",
              });
              let res = "";
              getGroqChatCompletionStreamWrapper(
                getGroqChatCompletion({
                  messages: [
                    {
                      role: "system",
                      content:
                        "ユーザーから渡されたテキストを適切な文章へ書き直してください。但し、結果のみを完結に返してください",
                    },
                    { role: "user", content: line.text },
                  ],
                  model: "openai/gpt-oss-120b",
                  stream: true,
                }),
                (parsed) => {
                  res += parsed;
                  api.editor.writeLine({
                    id: line.id,
                    text: res,
                  });
                },
              );
            }

            async function createFixSuggestion() {
              if (!feature.autoGrammarCheck) return;
              const res = await getGeminiChatCompletionTextWrapper(
                getGeminiChatCompletion({
                  contents: [
                    {
                      role: "user",
                      parts: [
                        {
                          text: `ユーザーから渡されたテキストを添削してください。文法的に誤っているところ、語法のミス、一般的ではない表現を書き換え適切な表現に直してください。但し、descriptionのみ日本語で回答し、修正する位置が重複する ( 複数のcurrentに同じ単語が含まれる )指摘はしないでください 。誤りが一つもない場合は空の配列で構いません。\ncontext: ${api.editor.state().join("\n")}\nformat: {level: 間違えの程度, title: 間違えの種類などを完結に, description: 間違えの詳細, position: {offset: 文章の何文字目から始まるか(1始まり), length: 誤っている部分の文字数}, current: 現在誤っているテキスト抜き出し, content: 修正案}`,
                        },
                      ],
                    },
                    {
                      role: "user",
                      parts: [
                        {
                          text: line.text,
                        },
                      ],
                    },
                  ],
                  generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          level: {
                            type: "STRING",
                            enum: ["critical", "high", "medium", "low"],
                          },
                          title: { type: "STRING" },
                          description: { type: "STRING" },
                          position: {
                            type: "OBJECT",
                            properties: {
                              offset: { type: "INTEGER" },
                              length: { type: "INTEGER" },
                            },
                            propertyOrdering: ["offset", "length"],
                            required: ["offset", "length"],
                          },
                          current: { type: "STRING" },
                          content: { type: "STRING" },
                        },
                        propertyOrdering: [
                          "level",
                          "title",
                          "description",
                          "position",
                          "current",
                          "content",
                        ],
                        required: [
                          "level",
                          "title",
                          "description",
                          "position",
                          "current",
                          "content",
                        ],
                      },
                    },
                  },
                }),
              );

              /**
               * @type Array<fixSuggestion>
               */
              const suggests = JSON.parse(res).map((s) => ({
                ...s,
                id: crypto.randomUUID(),
                type: s.level,
              }));

              /**
               * @param {string} text
               * @param {Array<fixSuggestion>} suggestions
               * @returns {Array<fixSuggestion>}
               */
              function fixFixSuggestion(text, suggestions) {
                /**
                 * @param {string} text
                 * @param {fixSuggestion} suggestion
                 * @returns {fixSuggestion | null}
                 */
                function fixFixSuggestionOffset(text, suggestion) {
                  const matches = Array.from(
                    text.matchAll(new RegExp(suggestion.current, "g")),
                  );
                  if (matches.length != 1) return null;
                  return {
                    ...suggestion,
                    position: {
                      offset: matches[0].index + 1,
                      length: suggestion.current.length,
                    },
                  };
                }
                return suggestions
                  .map((s) => fixFixSuggestionOffset(text, s))
                  .filter((s) => Boolean(s));
              }

              setFixSuggestions(fixFixSuggestion(line.text, suggests));
            }

            function updateFixSuggestion() {
              /**
               * @param {string} previous
               * @param {string} current
               */
              function detectChange(previous, current) {
                /**
                 * @param {string} previous
                 * @param {string} current
                 */
                function detectChangeHelper(previous, current) {
                  const differPosition = previous
                    .split("")
                    .reduce(
                      (acc, v, i) =>
                        Boolean(acc == -1 && v != current.split("")[i])
                          ? i
                          : acc,
                      -1,
                    );
                  if (differPosition == -1) return null;

                  return {
                    position: {
                      offset: differPosition,
                      length: Math.abs(previous.length - current.length),
                    },
                    type:
                      previous.length == current.length
                        ? "change"
                        : previous.length > current.length
                          ? "remove"
                          : "add",
                  };
                }

                const change = detectChangeHelper(previous, current);
                if (!change) return;
                if (change.type == "change") return;

                const inEditiong = fixSuggestions().filter(
                  (s) =>
                    s.position.offset <= change.position.offset &&
                    s.position.offset + s.position.length >=
                      change.position.offset + change.position.length,
                );
                if (inEditiong.length) {
                  setFixSuggestions(
                    fixSuggestions().filter(
                      (s) => !inEditiong.some((i) => i.id == s.id),
                    ),
                  );
                }

                if (change.type == "remove") {
                  const affectSuggestion = fixSuggestions().filter(
                    (s) => s.position.offset > change.position.offset,
                  );
                  if (affectSuggestion.length) {
                    setFixSuggestions(
                      affectSuggestion.map((s) => {
                        s.position.offset =
                          s.position.offset - change.position.length;
                        return s;
                      }),
                    );
                  }
                }

                if (change.type == "add") {
                  const affectSuggestion = fixSuggestions().filter(
                    (s) => s.position.offset > change.position.offset,
                  );
                  if (affectSuggestion.length) {
                    setFixSuggestions(
                      affectSuggestion.map((s) => {
                        s.position.offset =
                          s.position.offset + change.position.length;
                        return s;
                      }),
                    );
                  }
                }

                return;
              }
              detectChange(previousLineText(), line.text);

              function deleteGhostSuggestion() {
                setFixSuggestions(
                  fixSuggestions().filter((s) => {
                    const matches = Array.from(
                      line.text.matchAll(new RegExp(s.current, "g")),
                    );
                    return Boolean(matches.length);
                  }),
                );
              }
              deleteGhostSuggestion();
            }

            useEffect(
              line.id.concat("_fixSuggestionLineChangeEffect"),
              () => {
                updateFixSuggestion();
                setPreviousLineText(line.text);

                const prev = line.text;

                const timeout = setTimeout(async () => {
                  if (prev == previousLineText()) {
                    console.log("execute");
                    if (previousLineText().length > 20) {
                      feature.autoGrammarCheck && createFixSuggestion();
                    }
                    return clearInterval(timeout);
                  }
                  console.log("expired");
                  return clearInterval(timeout);
                }, 1000 * 5);
              },
              [line.text],
            );

            /**
             * @param {fixSuggestion} _fixSuggestion
             */
            const useFixSuggestion = (_fixSuggestion) => {
              const fixSuggestion = fixSuggestions().filter(
                (s) => s.id == _fixSuggestion.id,
              )[0]; // _fixSuggestionはposition.offsetはレンダリングの関係で改変されているので正しい値が出てこない
              const newText =
                line.text.slice(0, fixSuggestion.position.offset - 1) +
                fixSuggestion.content +
                line.text.slice(
                  fixSuggestion.position.offset +
                    fixSuggestion.current.length -
                    1,
                );
              api.editor.writeLine({
                ...line,
                text: newText,
              });
              setFixSuggestions(
                fixSuggestions().filter((s) => s.id != fixSuggestion.id),
              );
              setActiveFixSuggestion("");
            };

            return Box(
              { class: "lineContainer" },

              IfBox(
                true,
                { class: "lineSixdot" },
                (function sixDotDropdoun() {
                  /**
                   * @type {Array<{action: (e: any)=> void, icon: string, name: string}>}
                   */
                  const menu = [
                    {
                      action: () => {
                        setOpen(false);
                        setFixSuggestions([]);
                        api.suggestion.clearSuggestion();
                        rewrite();
                      },
                      icon: "pen_red",
                      name: "RE WRITE",
                    },
                    {
                      action: () => {
                        setOpen(false);
                        createFixSuggestion();
                      },
                      icon: "pen_red",
                      name: "CHECK GRAMMAR",
                    },
                  ];

                  const [open, setOpen] = useState(
                    line.id.concat("_sixDropDownOpen"),
                    false,
                  );

                  useEffect(line.id.concat("_sixDropDownOpenEffect"), () => {
                    window.addEventListener("mousedown", (e) => {
                      if (!e.target) return;
                      const el = document
                        .getElementsByClassName(
                          line.id.concat("_sixDotDropDownClass"),
                        )
                        .item(0);
                      if (el && !el.contains(e.target)) setOpen(false);
                    });
                  });

                  return Box(
                    {
                      attr: { class: line.id.concat("_sixDotDropDownClass") },
                    },
                    Icon({ name: "sixdot", onClick: () => setOpen(true) }),
                    IfBox(
                      open(),
                      { attr: { class: "dropdown" } },
                      menu.map((m) =>
                        Box(
                          {
                            attr: { class: "dropdownMenuItem" },
                            onClick: m.action,
                          },
                          Icon({ name: m.icon }),
                          Text(m.name, {
                            style: s({
                              fontSize: "14px",
                              margin: "0",
                              color: "#EC407A",
                            }),
                          }),
                        ),
                      ),
                    ),
                  );
                })(),
              ),

              (function textarea() {
                const fixSuggestionColor = {
                  critical: "#880E4F",
                  high: "#C2185B",
                  medium: "#D81B60",
                  low: "#E91E63",
                };

                /**
                 * @param {fixSuggestion} fixSuggestion
                 */
                function toolTip(fixSuggestion) {
                  const isActive = activeFixSuggestion() == fixSuggestion.id;
                  return Box(
                    {
                      onMouseLeave: () => {
                        setActiveFixSuggestion("");
                      },
                      onClick: () => useFixSuggestion(fixSuggestion),
                      class: "suggestionToolTip",
                      style: s({
                        display: isActive ? "inline" : "none",
                        position: "absolute",
                        color: "#222",
                        borderRadius: "4px",
                        zIndex: 2,
                        boxShadow:
                          "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;",
                        padding: "4px 8px",
                        top: "32px",
                        marginTop: "16px",
                        cursor: "pointer",
                        pointerEvents: "all",
                        border: "1px solid #E91E63",
                        "backdrop-filter": "blur(4px)",
                        background: "#ffffffcc",
                      }),
                    },
                    Text(fixSuggestion.title, {
                      style: s({
                        fontSize: "16px",
                        margin: "0",
                        color: "#E91E63",
                      }),
                    }),
                    Text(fixSuggestion.description, {
                      style: s({ fontSize: "14px", margin: "0" }),
                    }),
                  );
                }

                function parseFixSuggestions() {
                  const sortedFixSuggestions = quickSort(
                    fixSuggestions(),
                    (a, b) => a.position.offset < b.position.offset,
                  );
                  /**
                   * @param {Array<fixSuggestion & {childrens: sorted}>} sorted
                   */
                  const structfy = (sorted) => {
                    if (sorted.length == 1) return sorted;
                    const structed = [];
                    for (const item of sorted) {
                      if (!structed.length) {
                        structed.push(item);
                        continue;
                      }
                      const lastestItem = structed[structed.length - 1];
                      if (
                        lastestItem.childrens.some(
                          (i) =>
                            i.position == item.position &&
                            i.current == item.current,
                        )
                      ) {
                        continue;
                      }
                      const lastCharPosition =
                        lastestItem.position.offset +
                        lastestItem.position.length;
                      if (lastCharPosition > item.position.offset) {
                        const filteredSorted = sorted.filter(
                          (o) =>
                            o.position.offset >= lastestItem.position.offset &&
                            o.position.offset < lastCharPosition,
                        );

                        const lastFilteredSorted =
                          filteredSorted[filteredSorted.length - 1];
                        if (
                          lastCharPosition <
                          lastFilteredSorted.position.offset +
                            lastFilteredSorted.position.length
                        ) {
                          lastestItem.position.length =
                            lastFilteredSorted.position.offset +
                            lastFilteredSorted.position.length -
                            lastestItem.position.offset;
                        }
                        lastestItem.childrens = lastestItem.childrens.concat(
                          structfy(filteredSorted),
                        );
                        continue;
                      }
                      structed.push(item);
                    }
                    return structed;
                  };

                  const structedFixSuggestions = structfy(
                    sortedFixSuggestions.map((s) => ({ ...s, childrens: [] })),
                  );

                  /**
                   * @param {string} text
                   * @param {Array<fixSuggestion & {childrens: structed}>} structed
                   * @returns {Array<string | import("../src/dom/virtualdom.js").VNode>}
                   */
                  function render(text, structed) {
                    if (!structed.length) return [h("span", {}, text)];
                    const lastestItem = structed[0];
                    const firstStructedOffset = lastestItem.position.offset;
                    const firstStructedLastChar =
                      firstStructedOffset + lastestItem.position.length;
                    const el = [
                      h("span", {}, text.slice(0, firstStructedOffset - 1)),
                      h(
                        "span",
                        {
                          style: s({
                            background:
                              fixSuggestionColor[lastestItem.type] || "#E91E63",
                            color: "#fff",
                            outline: `2px solid ${fixSuggestionColor[lastestItem.type] || "#E91E63"}`,
                            borderRadius: "2px",
                          }),
                        },
                        toolTip(lastestItem),
                        h(
                          "span",
                          {
                            class: "fixSuggestionCurrent",
                            attr: { id: lastestItem.id },
                          },
                          lastestItem.current,
                        ),
                        ...render(
                          text.slice(
                            firstStructedOffset + lastestItem.current.length,
                            firstStructedLastChar,
                          ),
                          lastestItem.childrens,
                        ),
                      ),
                      ...render(
                        text.slice(firstStructedLastChar - 1), // whay -1?
                        structed.slice(1).map((s) => {
                          return {
                            ...s,
                            position: {
                              offset:
                                s.position.offset - firstStructedLastChar + 1, // whay +1?
                              length: s.position.length,
                            },
                          };
                        }),
                      ),
                    ];
                    return el;
                  }
                  return render(line.text, structedFixSuggestions);
                }

                const layer = [
                  // 実際にユーザーが操作し入力処理などが行われるレイヤー
                  Box(
                    {
                      ...registerEvent(line, i),
                      attr: {
                        contenteditable: "",
                        id: getLineRefId(line),
                        class: "textarea", //.concat(!i ? " bold" : ""),
                      },
                      onMouseMove: (e) => {
                        /**
                         * @param {Element | null} el
                         * @param {number} padding
                         */
                        function inTouch(el, padding) {
                          const rect = el?.getBoundingClientRect();
                          if (!rect) return false;
                          return (
                            rect &&
                            e.clientX >= rect.left &&
                            e.clientX <= rect.right &&
                            e.clientY + padding >= rect.top &&
                            e.clientY <= rect.bottom
                          );
                        }

                        const active = activeFixSuggestion();
                        if (
                          active &&
                          inTouch(
                            document.querySelector(
                              `span:has(span[id=\"${activeFixSuggestion()}"\]) .suggestionToolTip`,
                            ),
                            32,
                          )
                        ) {
                          // todo: 次のやつにもinしてたらそっち優先
                          /*const next = document.querySelector(
                          `span:has(span[id=\"${activeFixSuggestion()}"\])+span+span`,
                        );
                        console.log(next);
                        if (next && inTouch(next, 0)) {
                          setActiveFixSuggestion(next.id);
                        }*/
                          return;
                        }
                        const tooltips = Array.from(
                          document.querySelectorAll(
                            `.textarea[id=\"${getLineRefId(line)}\"]+.suggestion .fixSuggestionCurrent`,
                          ),
                        );
                        for (let i = 0; i < tooltips.length; i++) {
                          const tip = tooltips[i];
                          if (active == tip.id) continue;
                          if (inTouch(tip, 0)) {
                            setActiveFixSuggestion(tip.id);
                            return;
                          }
                        }
                        if (!active) return;
                        setActiveFixSuggestion("");
                      },
                    },
                    line.text,
                  ),
                  // 色をつけたりハイライトしたりただ色をつけるだけのレイヤー
                  Box(
                    {
                      attr: { class: "textarea suggestion" },
                      style: s({
                        position: "absolute",
                      }),
                    },
                    ...parseFixSuggestions(),
                  ),

                  // 補完を表示するレイヤー
                  IfBox(
                    // 将来のために残しておく
                    true ||
                      Boolean(
                        suggestion() &&
                          i == suggestion()?.info.focus &&
                          suggestion()?.suggestions.length,
                      ),
                    {
                      attr: { class: "textarea suggestion" },
                      style: s({
                        zIndex: -1,
                      }),
                    },
                    line.text.concat(
                      i == suggestion()?.info.focus
                        ? suggestion()?.suggestions[0] || ""
                        : "",
                    ),
                  ),
                ];

                return Box({ attr: { class: "textareaContainer" } }, ...layer);
              })(),
            );
          }),
        ),
      }),
    ),

    IfBox(
      Boolean(state().length < 3 && Boolean(state()[0].text)) &&
        Boolean(feature.autoGenerate),
      {},
      (function list() {
        return Box(
          {
            style: s(
              infiniteMode()
                ? {
                    transform: "translateY(60px)",
                  }
                : {
                    transform: "translateY(0px)",
                  },
            ),
            class: "cometContainer",
          },
          Box(
            {
              style: s({
                width: "100%",
                position: "relative",
                height: "1px",
                background: "#222",
                display: "flex",
                alignItems: "center",
                justifyContent: "right",
                paddingRight: "16px",
              }),
            },
            h(
              "p",
              {
                style: s({
                  fontSize: "9px",
                  background: "#fff",
                  color: "#222",
                }),
              },
              "複数のアイデアを列挙するのを手伝います!",
            ),
          ),
          Icon({
            name: "comet",
            style: s(
              infiniteMode()
                ? {
                    opacity: 1,
                    animation: "shaking 0.2s infinite ease",
                    filter: "contrast(1)",
                  }
                : {
                    opacity: 1,
                  },
            ),
            attr: {
              class: "comet",
            },
            onClick: () => setInfiniteMode(!infiniteMode()),
          }),
        );
      })(),
    ),

    (function copybutton() {
      return IfBox(
        Boolean(feature.copy),
        {
          attr: { class: "copyButton" },
          onClick: () => copy().then(() => alert("copied!")),
        },
        Icon({ name: "clipboard" }),
      );
    })(),
  );
});
