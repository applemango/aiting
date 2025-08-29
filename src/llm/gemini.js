const Obj = "AI".concat("zaSyApX0ZTpWKKkRZmMEIw2i2YTNEZTk_uuvI");

const getGeminiChatCompletion = async (body) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${Obj}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  return res;
};

/**
 * @param {Response | Promise<Response>} res
 * @returns string
 */
const getGeminiChatCompletionTextWrapper = async (res) => {
  const json = await (await res).json();
  /**
   * 一番最初の回答を取り出して返す
   */
  return json.candidates[0].content.parts.map((p) => p.text).join("");
};

export { getGeminiChatCompletion, getGeminiChatCompletionTextWrapper };
