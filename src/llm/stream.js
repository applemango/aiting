/**
 * chunk format:
 * data: {"id":"XXXXXXXXXXXXXX","object":"chat.completion.chunk","created":1700000000,"model":"gpt-3.5-turbo-0613","choices":[{"index":0,"delta":{"content":"\n\n"},"finish_reason":null}],"usage":{"prompt_tokens":0,"completion_tokens":0,"total_tokens":0}}
 *
 * 上記の様に帰ってくるので、それをテキストにして返す。良い方法が見つからなかったので適当に
 */
/**
 *
 * @param {string} chunk
 * @returns
 */
const parseChunk = (chunk) =>
  chunk
    .split("data: ")
    .map((text) => text.replaceAll("\n", ""))
    .filter((text) => text.startsWith('{"id":'))
    .filter((text) => text.endsWith("}"))
    .map((text) => JSON.parse(text))
    .map((json) => json.choices[0].delta.content)
    .join("");

/**
 *
 * @param {Response | Promise<Response>} res
 * @param {(parsedText: string)=> void} event
 * @returns {Promise<string>}
 */
const getGroqChatCompletionStreamWrapper = async (res, event) => {
  const reader = (await res).body.getReader();
  const decoder = new TextDecoder("utf-8");

  /**
   * @type {string}
   */
  let content;

  while (true) {
    const { done, value } = await reader.read();
    const chunk = decoder.decode(value, { stream: true });

    const parsed = parseChunk(chunk);
    event(parsed);

    content += parsed;
    if (done) break;
  }
  return content;
};

export { getGroqChatCompletionStreamWrapper };
