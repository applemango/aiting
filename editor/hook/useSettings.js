//@ts-check

import { useLocalStorageState } from "../../hook/useLocalStorageState.js";

/**
 * @typedef Settings
 * @property {{
 *    prompt: string,
 * }} recommendation
 * @property {import("./useFeatures.js").Feature} feature
 * @returns {[()=> Settings, (settings: Settings)=> void]}
 */
/**
 * ユーザー設定などすべてのモードに共通する設定
 */
export const useSettings = () => {
  /** @type Settings */
  const defaultSettings = {
    recommendation: {
      prompt: `あなたはユーザーから受け取った文章を基にその次に来る文章を考えユーザーにオートコンプリートとして渡します。下記のtitleとcontentを基にユーザーから渡されたテキストに補完する形で50語程度な適切な語を補ってください、その際言葉遣いなどは極力合わせてください。ただし繰り返しは不要です、いきなり次の語から始めてください、間違っても"僕は"で終わる文章のサジェストで"僕は..."などと始めないで"そのとき"などと後に続くように始めてください。\n`,
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
