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
 }} Feature
 */

/**
 * @param {{
 *    settings: Settings,
 *    mode: WrittingMode
 * }} api
 * @returns Feature
 */
export const useFeatures = (api) => {
  return Object.assign(api.settings.feature, api.mode.config.feature);
};
