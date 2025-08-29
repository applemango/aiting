//@ts-check

import { useEffect } from "../../hook/useEffect.js";
import { useState } from "../../hook/useState.js";

import {
  getGroqChatCompletion,
  getGroqChatCompletionTextWrapper,
} from "../../src/llm/groq.js";
import {
  getGeminiChatCompletion,
  getGeminiChatCompletionTextWrapper,
} from "../../src/llm/gemini.js";

/**
 * @typedef {import("./useEditorCore").Line} Line
 *
 * @typedef Suggestion
 * @property {{
 *   text: string,
 *   cursor: number,
 *   focus: number,
 *   id: string
 * }} info
 * @property {Array<string>} suggestions
 *
 * @typedef useEditorSuggestionApi
 * @property {()=> Suggestion | null} suggestion
 * @property {(line: Line, suggestion: string)=> void} useSuggestion
 * @property {(line: Line, cursor: number)=> void} createSuggestion
 * @property {()=> void} clearSuggestion
 */

/**
 * @param {{
 *  editor: import("./useEditorCore").useEditorCoreApi,
 *  settings: import("../../app/app.js").Settings
 * }} api
 * @returns
 */
export const useEditorSuggestion = (api) => {
  /**
   * 何らかのサジェストを更新する必要なデータ変更があったときにこれを書き換える
   * イベントが発火したときにサジェストの作成に必要な情報をSuggestion.infoにいれる
   * それの変更を検出して、500msさらなる変更が加えられなければgenmmaに渡しSuggestion.suggestionsに挿入する
   */
  /** @type {typeof useState<Suggestion | null>} */
  const useSuggestionState = useState;
  const [suggestion, setSuggestion] = useSuggestionState(
    "useEditorSuggestionSuggestion",
    null,
  );

  /**
   * @param {{
   *   title: string,
   *   context: string
   * }} info
   * @returns {string}
   */
  const getPrompt = (info) => {
    return `${api.settings.recommendation.prompt}`.concat(
      `title: ${info.title}\ncontext:\n${info.context}`,
    );
  };

  /**
   * @param {Line} line
   * @param {string} suggestion
   */
  const useSuggestion = (line, suggestion) => {
    api.editor.updateLine({
      id: line.id,
      text: api.editor
        .state()
        [api.editor.getIndex(line)].text.concat(suggestion),
      isEditing: true,
    });
    clearSuggestion();
  };

  /**
   * @param {()=> Promise<any>} fn
   * @param {number} interval
   */
  const autoComplete = (fn, interval) => {
    const suggestionId = suggestion()?.info.id;
    const timeout = setTimeout(async () => {
      const newSuggestionId = suggestion()?.info.id;
      if (newSuggestionId && suggestionId && newSuggestionId == suggestionId) {
        console.log("execute", suggestionId, newSuggestionId);
        const suggest = await fn();
        const s = suggestion();
        if (s) {
          console.log({ info: s.info, suggestions: [suggest] });
          setSuggestion({ info: s.info, suggestions: [suggest] });
        }
        return clearInterval(timeout);
      }
      console.log("expire", suggestionId, newSuggestionId);
      clearInterval(timeout);
    }, interval);
  };

  /**
   * @param {Line} line
   * @param {number} cursor
   */
  const createSuggestion = (line, cursor) => {
    if (api.editor.getIndex(line) > 0) {
      setSuggestion({
        info: {
          text: line.text,
          cursor: cursor,
          focus: api.editor.getIndex(line),
          id: crypto.randomUUID(),
        },
        suggestions: [],
      });
    }
  };

  const clearSuggestion = () => setSuggestion(null);

  useEffect(
    "useEditorSuggestionEffect",
    () => {
      const suggest = suggestion();
      if (!suggest) return;

      const { text, cursor, focus } = suggest.info;

      console.log(text, cursor, focus);
      if (cursor != text.length) {
        return;
      }

      const baseText = getPrompt({
        title: api.editor.getTitle(),
        context: api.editor.getContent(),
      });

      const groq = autoComplete(
        async () =>
          await getGroqChatCompletionTextWrapper(
            getGroqChatCompletion({
              messages: [
                { role: "system", content: baseText },
                { role: "user", content: text },
              ],
            }),
          ),
        250,
      );

      const gemini = autoComplete(
        async () =>
          await getGeminiChatCompletionTextWrapper(
            getGeminiChatCompletion({
              contents: [
                {
                  role: "user",
                  parts: [{ text: baseText }, { text }],
                },
              ],
            }),
          ),
        1000,
      );
    },
    [suggestion()?.info],
  );
  return {
    suggestion,
    useSuggestion,
    createSuggestion,
    clearSuggestion,
  };
};
