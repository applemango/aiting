//@ts-check
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

import { useState } from "../../hook/useState.js";

export const useWrittingMode = () => {
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
