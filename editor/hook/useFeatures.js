//@ts-check
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
     title?: boolean;
 }} Feature
 */

/**
 * 有効化されている機能を管理する
 *
 * @param {{
 *    settings: import("./useSettings").Settings
 *    mode: import("./useWrittingMode").WrittingMode
 * }} api
 * @returns Feature
 */
export const useFeatures = (api) => {
  return Object.assign(api.settings.feature, api.mode.config.feature);
};
