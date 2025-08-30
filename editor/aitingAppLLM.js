//@ts-check

import {
  getGeminiChatCompletion,
  getGeminiChatCompletionTextWrapper,
} from "../src/llm/gemini.js";
import {
  getGroqChatCompletion,
  getGroqChatCompletionTextWrapper,
} from "../src/llm/groq.js";

/**
 * @param {Array<string>} previous
 * @param {string} prompt
 * @returns Array<string>
 */
export const loadInfiniteGenerateItems = async (prompt, previous) => {
  /**@type string */
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
              text: prompt.concat(
                `\nこれまでに挙げられた候補: ${previous.join("\n")}`,
              ),
            },
          ],
        },
      ],
    }),
  );
  return gemini.split("\n").filter((v) => Boolean(v.trim()));
};

export const getFixSuggestions = async (text, context) => {
  const res = await getGeminiChatCompletionTextWrapper(
    getGeminiChatCompletion({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `ユーザーから渡されたテキストを添削してください。文法的に誤っているところ、語法のミス、一般的ではない表現を書き換え適切な表現に直してください。但し、descriptionのみ日本語で回答し、修正する位置が重複する ( 複数のcurrentに同じ単語が含まれる )指摘はしないでください 。誤りが一つもない場合は空の配列で構いません。\ncontext: ${context}\nformat: {level: 間違えの程度, title: 間違えの種類などを完結に, description: 間違えの詳細, position: {offset: 文章の何文字目から始まるか(1始まり), length: 誤っている部分の文字数}, current: 現在誤っているテキスト抜き出し, content: 修正案}`,
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: text,
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
  console.log(fixFixSuggestion(text, suggests));
  return fixFixSuggestion(text, suggests);
};

export const getRewritedText = async (text) => {
  return await getGroqChatCompletionTextWrapper(
    getGroqChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "ユーザーから渡されたテキストを適切な文章へ書き直してください。但し、結果のみを完結に返してください",
        },
        { role: "user", content: text },
      ],
      model: "openai/gpt-oss-120b",
    }),
  );
};
